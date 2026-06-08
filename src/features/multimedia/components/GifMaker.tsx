import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faFilm,
    faImage,
    faCirclePlus,
    faArrowUp,
    faArrowDown,
    faXmark,
    faWandMagicSparkles,
    faTriangleExclamation,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
// @ts-expect-error - gif.js has no types
import GIF from "gif.js";
// @ts-expect-error - gifuct-js has no first-class types
import { parseGIF, decompressFrames } from "gifuct-js";
import { fetchFile } from "@ffmpeg/util";
import { useFfmpegEngine } from "@/features/multimedia/hooks/useFfmpegEngine";
import CustomModal from "@/components/modals/CustomModal";

/**
 * GIF Maker
 *
 * Build a GIF from a list of segments. Each segment is either:
 *   - a video clip with its own in/out trim points, or
 *   - a static image shown for a user-chosen duration.
 *
 * The flow is a three-step pipeline:
 *   1. Prepare — FFmpeg concatenates all segments into one MP4 in its
 *      virtual filesystem. The user can preview the result before
 *      committing to the (slow) GIF encode.
 *   2. Convert — gif.js extracts frames from the prepared MP4 and
 *      encodes them into a GIF. FPS and max-width are user-controlled.
 *   3. Compress (optional) — gifuct-js + gif.js shrink the GIF by
 *      re-encoding at lower resolution / fewer frames / lower quality.
 *
 * Two downloads are offered: the original GIF (always) and the
 * compressed GIF (only after the Compress step). The user can keep
 * one or both.
 *
 * Why a "prepare" intermediate? A single FFmpeg command could go
 * straight from segments → GIF, but we lose the preview step. Letting
 * the user see the concatenated MP4 first means the slow GIF encode
 * is always intentional, never a surprise.
 */

/* ────────────────────────────────────────────────────────────────── */
/* Types                                                              */
/* ────────────────────────────────────────────────────────────────── */

type Status =
    | "idle"
    | "preparing"
    | "ready"
    | "converting"
    | "compressed"
    | "error";

/** A source item in the segment list. */
type Segment =
    | {
          id: string;
          kind: "video";
          file: File;
          /** Blob URL for the source video; revoked when removed. */
          url: string;
          meta: { name: string; size: number; duration: number; width: number; height: number };
          /** Trim window in seconds; defaults to [0, full duration]. */
          trim: { start: number; end: number };
      }
    | {
          id: string;
          kind: "image";
          file: File;
          url: string;
          meta: { name: string; size: number; width: number; height: number };
          /** How long the image is shown for, in seconds. */
          duration: number;
      };

/** Holds a file the user just picked but hasn't been committed yet
 *  (because we're showing a "previous result will be lost" prompt). */
interface PendingFile {
    file: File;
    objectUrl: string;
}

/* ────────────────────────────────────────────────────────────────── */
/* Main component                                                     */
/* ────────────────────────────────────────────────────────────────── */

const GifMaker = () => {
    /* FFmpeg engine — shared with VideoSplitter / AudioVideoMerger. */
    const { ffmpeg, status: ffmpegStatus } = useFfmpegEngine();

    /* Segment list. */
    const [segments, setSegments] = useState<Segment[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    /* FFmpeg prep output. */
    const [preparedUrl, setPreparedUrl] = useState<string | null>(null);
    const [preparedSize, setPreparedSize] = useState(0);
    const [preparedDuration, setPreparedDuration] = useState(0);

    /* Convert output. */
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [gifSize, setGifSize] = useState(0);

    /* Compress output. */
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [compressedSize, setCompressedSize] = useState(0);

    /* Operation state. */
    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    /* User options for Convert. */
    const [fps, setFps] = useState(10);
    const [maxWidth, setMaxWidth] = useState(480);

    /* User options for Compress. */
    const [compressScale, setCompressScale] = useState(75);
    const [compressFrameSkip, setCompressFrameSkip] = useState(1);
    const [compressQuality, setCompressQuality] = useState(10);

    /* The "previous result will be lost" warning modal. The pending
     * file is held in a ref so the input change handler can read it
     * from a callback that fires before any state update we set here
     * is visible to the modal. */
    const [showResetWarning, setShowResetWarning] = useState(false);
    const pendingFileRef = useRef<PendingFile | null>(null);

    /* Hidden file inputs (one for video, one for image). */
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    /* Refs for the hidden HTML elements used during convert. */
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    /* Refs for the hidden elements used during compress. */
    const decodeCacheRef = useRef<{
        frames?: { patch: Uint8ClampedArray; dims: { width: number; height: number; top: number; left: number }; delay: number; disposalType: number }[];
        width?: number;
        height?: number;
    }>({});

    /** Wire the per-component progress event from the shared FFmpeg
     *  instance. The event is fired by the singleton, so the listener
     *  persists across remounts — that's OK, the setState in a
     *  defunct component is a no-op. See the same pattern in
     *  VideoSplitter / AudioVideoMerger for the full discussion. */
    useEffect(() => {
        if (!ffmpeg) return;
        const handler = ({ progress: p }: { progress: number }) => {
            const pct = Math.round(p * 100);
            setProgress(pct);
        };
        ffmpeg.on("progress", handler);
    }, [ffmpeg]);

    /* ────────────────────────────────────────────────────────────────── */
    /* File pick handlers                                                */
    /* ────────────────────────────────────────────────────────────────── */

    /**
     * Probe a video file to get its duration + dimensions, then add
     * it as a new segment. If there's a previous GIF on screen,
     * stash the file in a ref and show the warning modal so the
     * user can decide what to do.
     */
    const handleAddVideo = (file: File) => {
        if (pendingFileRef.current) {
            URL.revokeObjectURL(pendingFileRef.current.objectUrl);
            pendingFileRef.current = null;
        }
        const url = URL.createObjectURL(file);
        const hasPreviousResult = !!gifUrl;
        if (hasPreviousResult) {
            pendingFileRef.current = { file, objectUrl: url };
            setShowResetWarning(true);
            return;
        }
        commitAddVideo(file, url);
    };

    const commitAddVideo = async (file: File, url: string) => {
        // Use a one-shot video element to probe metadata
        const v = document.createElement("video");
        v.preload = "metadata";
        v.src = url;
        await new Promise<void>((res) => {
            v.onloadedmetadata = () => res();
            v.onerror = () => res();
        });
        const id = crypto.randomUUID();
        const newSeg: Segment = {
            id,
            kind: "video",
            file,
            url,
            meta: {
                name: file.name,
                size: file.size,
                duration: v.duration || 0,
                width: v.videoWidth || 0,
                height: v.videoHeight || 0,
            },
            trim: { start: 0, end: v.duration || 0 },
        };
        setSegments((s) => [...s, newSeg]);
        setSelectedId(id);
    };

    const handleAddImage = (file: File) => {
        if (pendingFileRef.current) {
            URL.revokeObjectURL(pendingFileRef.current.objectUrl);
            pendingFileRef.current = null;
        }
        const url = URL.createObjectURL(file);
        const hasPreviousResult = !!gifUrl;
        if (hasPreviousResult) {
            pendingFileRef.current = { file, objectUrl: url };
            setShowResetWarning(true);
            return;
        }
        commitAddImage(file, url);
    };

    const commitAddImage = async (file: File, url: string) => {
        // Probe image dimensions
        const img = new Image();
        img.src = url;
        await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
        });
        const id = crypto.randomUUID();
        const newSeg: Segment = {
            id,
            kind: "image",
            file,
            url,
            meta: {
                name: file.name,
                size: file.size,
                width: img.naturalWidth || 0,
                height: img.naturalHeight || 0,
            },
            duration: 3,
        };
        setSegments((s) => [...s, newSeg]);
        setSelectedId(id);
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Segment list operations                                            */
    /* ────────────────────────────────────────────────────────────────── */

    const handleRemove = (id: string) => {
        setSegments((s) => {
            const next = s.filter((seg) => seg.id !== id);
            // Revoke the segment's URL — the file is gone from the list.
            const removed = s.find((seg) => seg.id === id);
            if (removed) URL.revokeObjectURL(removed.url);
            return next;
        });
        if (selectedId === id) setSelectedId(null);
    };

    const handleMoveUp = (id: string) => {
        setSegments((s) => {
            const idx = s.findIndex((seg) => seg.id === id);
            if (idx <= 0) return s;
            const next = [...s];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
    };

    const handleMoveDown = (id: string) => {
        setSegments((s) => {
            const idx = s.findIndex((seg) => seg.id === id);
            if (idx < 0 || idx >= s.length - 1) return s;
            const next = [...s];
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
            return next;
        });
    };

    const handleUpdateVideoTrim = (id: string, field: "start" | "end", value: number) => {
        setSegments((s) =>
            s.map((seg) => {
                if (seg.id !== id || seg.kind !== "video") return seg;
                const newTrim = { ...seg.trim, [field]: value };
                // Clamp: start must be ≥ 0, end must be ≤ duration, start < end
                if (newTrim.start < 0) newTrim.start = 0;
                if (newTrim.end > seg.meta.duration) newTrim.end = seg.meta.duration;
                if (newTrim.start >= newTrim.end) {
                    if (field === "start") newTrim.start = newTrim.end - 0.1;
                    else newTrim.end = newTrim.start + 0.1;
                }
                return { ...seg, trim: newTrim };
            }),
        );
    };

    const handleUpdateImageDuration = (id: string, value: number) => {
        setSegments((s) =>
            s.map((seg) => {
                if (seg.id !== id || seg.kind !== "image") return seg;
                return { ...seg, duration: Math.max(0.1, value) };
            }),
        );
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Clear / reset                                                      */
    /* ────────────────────────────────────────────────────────────────── */

    /** Full reset: segments + prepared + GIF + compressed. Revokes
     *  every outstanding blob URL. */
    const handleClear = () => {
        segments.forEach((seg) => URL.revokeObjectURL(seg.url));
        setSegments([]);
        setSelectedId(null);
        if (preparedUrl) URL.revokeObjectURL(preparedUrl);
        setPreparedUrl(null);
        setPreparedSize(0);
        setPreparedDuration(0);
        if (gifUrl) URL.revokeObjectURL(gifUrl);
        setGifUrl(null);
        setGifSize(0);
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        setCompressedUrl(null);
        setCompressedSize(0);
        setStatus("idle");
        setError(null);
        setProgress(0);
        decodeCacheRef.current = {};
        if (videoInputRef.current) videoInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    /* No unmount cleanup needed: blob URL revocation is handled
     * explicitly by the reset paths above (handleClear, the remove
     * buttons, the warning modal cancel path). The browser reclaims
     * any orphaned blob URLs on page unload anyway. Adding a
     * useEffect-with-cleanup here would be a footgun: it would
     * run on every StrictMode double-mount and revoke URLs that
     * are still in use. */

    /* ────────────────────────────────────────────────────────────────── */
    /* Step 1: Prepare (FFmpeg concat)                                    */
    /* ────────────────────────────────────────────────────────────────── */

    const handlePrepare = async () => {
        if (!ffmpeg) {
            setError("Engine not ready yet. If this persists, try refreshing the page.");
            return;
        }
        if (segments.length === 0) {
            setError("Add at least one video or image first.");
            return;
        }
        setError(null);
        setStatus("preparing");
        setProgress(0);

        // Revoke any previous prepared URL up front.
        if (preparedUrl) URL.revokeObjectURL(preparedUrl);
        setPreparedUrl(null);
        setPreparedSize(0);
        setPreparedDuration(0);

        try {
            // Write all input files to the virtual FS. We give them
            // stable names: seg0.mp4, seg1.mp4, … for videos and
            // seg2.png, … for images. The filter_complex graph
            // references them by these names.
            //
            // Note: the file extension in the virtual FS is for
            // ffmpeg's format detection. The actual content can be
            // anything — ffmpeg sniffs the magic bytes.
            const inputs: { index: number; name: string }[] = [];
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if (seg.kind === "video") {
                    const name = `seg${i}.mp4`;
                    await ffmpeg.writeFile(name, await fetchFile(seg.file));
                    inputs.push({ index: i, name });
                } else {
                    const ext = seg.file.name.split(".").pop()?.toLowerCase() || "png";
                    const name = `seg${i}.${ext}`;
                    await ffmpeg.writeFile(name, await fetchFile(seg.file));
                    inputs.push({ index: i, name });
                }
                setProgress(Math.round(((i + 1) / segments.length) * 30));
            }

            // Build the filter_complex. Each input is normalized to a
            // 30fps 640px-wide video (height auto via -2), then fed
            // into the `concat` filter which joins them.
            //
            // For video segments, we use `-ss/-t` to seek + trim
            // BEFORE the input reaches the filter graph (faster than
            // re-encoding the whole clip and trimming after).
            //
            // For image segments, we use `-loop 1 -t N` so the image
            // is shown for the user-chosen duration.
            const filterParts: string[] = [];
            const argParts: string[] = [];

            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                const input = inputs[i];
                if (seg.kind === "video") {
                    argParts.push("-ss", String(seg.trim.start));
                    argParts.push("-t", String(seg.trim.end - seg.trim.start));
                    argParts.push("-i", input.name);
                    filterParts.push(
                        `[${i}:v]scale=${maxWidth}:-2,fps=30,setpts=PTS-STARTPTS[v${i}]`,
                    );
                } else {
                    argParts.push("-loop", "1", "-t", String(seg.duration), "-i", input.name);
                    filterParts.push(
                        `[${i}:v]scale=${maxWidth}:-2,fps=30,setpts=PTS-STARTPTS[v${i}]`,
                    );
                }
            }

            const concatInputLabels = segments.map((_, i) => `[v${i}]`).join("");
            filterParts.push(
                `${concatInputLabels}concat=n=${segments.length}:v=1:a=0[outv]`,
            );

            const outputName = "prepared.mp4";
            argParts.push(
                "-filter_complex",
                filterParts.join(";"),
                "-map",
                "[outv]",
                "-c:v",
                "libx264",
                "-preset",
                "ultrafast",
                "-crf",
                "23",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                outputName,
            );

            await ffmpeg.exec(argParts);

            // Read the result back and create a blob URL for the
            // preview <video> element. The virtual FS entry is left
            // in place — we'll need it for the Convert step (or
            // until the user clicks Clear).
            const data = await ffmpeg.readFile(outputName);
            // data is a Uint8Array (the WASM layer type) — wrap as
            // a Blob so createObjectURL works.
            const blob = new Blob([data as Uint8Array], { type: "video/mp4" });
            const url = URL.createObjectURL(blob);
            setPreparedUrl(url);
            setPreparedSize(blob.size);
            // Probe duration from a hidden <video>
            const v = document.createElement("video");
            v.preload = "metadata";
            v.src = url;
            await new Promise<void>((res) => {
                v.onloadedmetadata = () => res();
                v.onerror = () => res();
            });
            setPreparedDuration(v.duration || 0);
            setStatus("ready");
            setProgress(100);
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setError(`Prepare failed: ${msg}. Check that your inputs are valid and try again.`);
            setStatus("error");
        }
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Step 2: Convert (gif.js frame extraction)                         */
    /* ────────────────────────────────────────────────────────────────── */

    /**
     * Seek the prepared MP4 through its timeline, drawing each
     * frame onto a canvas, then feed the captured ImageData into
     * gif.js for encoding. Same approach as VideoToGif.
     */
    const seekTo = (time: number): Promise<void> =>
        new Promise((res) => {
            const v = videoRef.current!;
            const onSeeked = () => {
                v.removeEventListener("seeked", onSeeked);
                res();
            };
            v.addEventListener("seeked", onSeeked);
            v.currentTime = Math.max(0, Math.min(time, v.duration));
            // Safety: if seek fails for any reason, resolve after 1s
            // so the encode can at least attempt to continue.
            setTimeout(() => {
                v.removeEventListener("seeked", onSeeked);
                res();
            }, 1000);
        });

    const handleConvert = async () => {
        if (!preparedUrl) {
            setError("Prepare the segment list first.");
            return;
        }
        setError(null);
        setStatus("converting");
        setProgress(0);
        // Revoke any previous GIF so re-converting with different
        // settings doesn't leak the old blob.
        if (gifUrl) URL.revokeObjectURL(gifUrl);
        setGifUrl(null);
        setGifSize(0);
        // Compress result is invalid once the source GIF changes.
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        setCompressedUrl(null);
        setCompressedSize(0);

        try {
            // The video element is already mounted (it owns the
            // preparedUrl). Wait for it to be ready if needed.
            const v = videoRef.current!;
            const c = canvasRef.current!;
            if (preparedDuration <= 0) {
                throw new Error("Prepared video has zero duration — something went wrong.");
            }
            // The output dimensions: scale to maxWidth, height
            // derived. We don't know the exact prepared resolution
            // without re-probing; we approximate from the duration
            // and the maxWidth slider (the prepared video is already
            // maxWidth wide). For a more accurate result we could
            // read v.videoWidth here.
            const outputW = maxWidth;
            const aspect = v.videoWidth && v.videoHeight ? v.videoHeight / v.videoWidth : 9 / 16;
            const outputH = Math.round(outputW * aspect);
            c.width = outputW;
            c.height = outputH;
            const ctx = c.getContext("2d")!;
            const frameDelayMs = 1000 / fps;

            const totalFrames = Math.max(1, Math.floor(preparedDuration * fps));
            const frames: { data: Uint8ClampedArray; delay: number }[] = [];

            for (let i = 0; i < totalFrames; i++) {
                const t = i / fps;
                await seekTo(t);
                ctx.drawImage(v, 0, 0, outputW, outputH);
                const imageData = ctx.getImageData(0, 0, outputW, outputH);
                frames.push({ data: imageData.data, delay: frameDelayMs });
                setProgress(Math.round(((i + 1) / totalFrames) * 50));
            }

            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: outputW,
                height: outputH,
                workerScript: "/gif.worker.js",
            });
            frames.forEach((f) => {
                const imgData = new ImageData(new Uint8ClampedArray(f.data), outputW, outputH);
                gif.addFrame(imgData, { delay: f.delay });
            });
            gif.on("progress", (p: number) => setProgress(50 + Math.round(p * 50)));
            gif.on("finished", (blob: Blob) => {
                setGifUrl(URL.createObjectURL(blob));
                setGifSize(blob.size);
                setProgress(100);
                setStatus("compressed");
            });
            gif.render();
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setError(`Convert failed: ${msg}.`);
            setStatus("error");
        }
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Step 3: Compress (gifuct-js + gif.js re-encode)                   */
    /* ────────────────────────────────────────────────────────────────── */

    const handleCompress = async () => {
        if (!gifUrl) {
            setError("Convert the prepared video to a GIF first.");
            return;
        }
        setError(null);
        setProgress(0);
        setStatus("converting");
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        setCompressedUrl(null);
        setCompressedSize(0);

        try {
            // Fetch the GIF blob and decode its frames.
            const resp = await fetch(gifUrl);
            const buf = await resp.arrayBuffer();
            const gif = parseGIF(buf);
            // gifuct-js's TS types lie here: with `true` the runtime
            // includes `patch`, but the type doesn't. Cast through
            // `unknown` rather than papering over with `any`.
            const frames = decompressFrames(gif, true) as unknown as {
                dims: { width: number; height: number; top: number; left: number };
                patch: Uint8ClampedArray;
                delay: number;
                disposalType: number;
            }[];
            if (frames.length === 0) {
                throw new Error("GIF parsed but contained no frames.");
            }
            const width = gif.lsd.width;
            const height = gif.lsd.height;
            decodeCacheRef.current = { frames, width, height };

            const outputW = Math.max(1, Math.round(width * (compressScale / 100)));
            const outputH = Math.max(1, Math.round(height * (compressScale / 100)));
            const keptFrames = frames.filter((_, i) => i % compressFrameSkip === 0);

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;
            const scaleCanvas = document.createElement("canvas");
            scaleCanvas.width = outputW;
            scaleCanvas.height = outputH;
            const scaleCtx = scaleCanvas.getContext("2d")!;

            const out = new GIF({
                workers: 2,
                quality: compressQuality,
                width: outputW,
                height: outputH,
                workerScript: "/gif.worker.js",
            });

            for (let i = 0; i < keptFrames.length; i++) {
                const f = keptFrames[i];
                if (f.disposalType === 2) {
                    ctx.clearRect(0, 0, width, height);
                }
                const patch = f.patch;
                const dim = f.dims;
                const imageData = ctx.createImageData(dim.width, dim.height);
                imageData.data.set(patch);
                ctx.putImageData(imageData, dim.left, dim.top);
                scaleCtx.fillStyle = "#000";
                scaleCtx.fillRect(0, 0, outputW, outputH);
                scaleCtx.drawImage(canvas, 0, 0, outputW, outputH);
                const finalImage = scaleCtx.getImageData(0, 0, outputW, outputH);
                out.addFrame(finalImage, { delay: f.delay || 100 });
                setProgress(Math.round(((i + 1) / keptFrames.length) * 50));
            }

            out.on("progress", (p: number) => setProgress(50 + Math.round(p * 50)));
            out.on("finished", (blob: Blob) => {
                setCompressedUrl(URL.createObjectURL(blob));
                setCompressedSize(blob.size);
                setProgress(100);
                setStatus("compressed");
            });
            out.render();
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            setError(`Compress failed: ${msg}.`);
            setStatus("error");
        }
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Download helpers                                                   */
    /* ────────────────────────────────────────────────────────────────── */

    const downloadBlob = (url: string, filename: string) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDownloadOriginal = () => {
        if (gifUrl) downloadBlob(gifUrl, "output.gif");
    };
    const handleDownloadCompressed = () => {
        if (compressedUrl) downloadBlob(compressedUrl, "output-compressed.gif");
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Warning modal handlers                                             */
    /* ────────────────────────────────────────────────────────────────── */

    /** "Download previous" in the warning modal: trigger a browser
     *  download of the existing GIF, then load the new file. The
     *  GIF is NOT cleared here — the user just downloaded it, so
     *  removing it from the UI would be wrong. The new segment
     *  is added to the list and the user can build a new GIF
     *  alongside the old one. */
    const handleDownloadPreviousAndContinue = () => {
        if (gifUrl) downloadBlob(gifUrl, "output.gif");
        applyPendingFile();
    };
    /** "Discard" in the warning modal: load the new file AND clear
     *  the existing result. The user explicitly said "throw it
     *  away" — leaving the old GIF in the UI would be confusing
     *  (they could click Download on something they said to
     *  discard). The compressed GIF (if any) is also cleared
     *  because it was derived from the now-discarded original. */
    const handleDiscardPreviousAndContinue = () => {
        if (gifUrl) URL.revokeObjectURL(gifUrl);
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        setGifUrl(null);
        setGifSize(0);
        setCompressedUrl(null);
        setCompressedSize(0);
        // The prepared video is also derived from the old segment
        // list — clear it too so the user isn't confused about
        // which "Convert" will run against.
        if (preparedUrl) URL.revokeObjectURL(preparedUrl);
        setPreparedUrl(null);
        setPreparedSize(0);
        setPreparedDuration(0);
        setStatus("idle");
        setError(null);
        setProgress(0);
        applyPendingFile();
    };

    const applyPendingFile = () => {
        const pending = pendingFileRef.current;
        if (!pending) return;
        pendingFileRef.current = null;
        // Inspect the MIME type to decide video vs image.
        if (pending.file.type.startsWith("video/")) {
            commitAddVideo(pending.file, pending.objectUrl);
        } else if (pending.file.type.startsWith("image/")) {
            commitAddImage(pending.file, pending.objectUrl);
        } else {
            URL.revokeObjectURL(pending.objectUrl);
        }
    };

    const closeModalAndDropPending = () => {
        if (pendingFileRef.current) {
            URL.revokeObjectURL(pendingFileRef.current.objectUrl);
            pendingFileRef.current = null;
        }
        if (videoInputRef.current) videoInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
        setShowResetWarning(false);
    };

    /* ────────────────────────────────────────────────────────────────── */
    /* Format helpers                                                     */
    /* ────────────────────────────────────────────────────────────────── */

    const formatBytes = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    const compressRatio = gifSize && compressedSize ? ((compressedSize / gifSize) * 100).toFixed(0) : null;

    /* ────────────────────────────────────────────────────────────────── */
    /* Render                                                             */
    /* ────────────────────────────────────────────────────────────────── */

    const totalDuration = segments.reduce((acc, s) => {
        if (s.kind === "video") return acc + Math.max(0, s.trim.end - s.trim.start);
        return acc + s.duration;
    }, 0);

    return (
        <div className="h-full overflow-y-auto p-4 text-orange-300 font-fira-code">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">GIF Maker</h2>
                {segments.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-orange-300 px-3 py-1.5 rounded text-sm border border-gray-600"
                        title="Clear all segments and results"
                    >
                        <FontAwesomeIcon icon={faXmark} /> Clear all
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-400 mb-4">
                Build a GIF from a mix of trimmed video clips and static images. Runs entirely in your browser.
            </p>

            {/* Hidden file inputs. Accept video/* on one and image/* on
                the other so the OS file picker is filtered. */}
            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAddVideo(f);
                }}
            />
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAddImage(f);
                }}
            />

            {/* Soft-yellow notice: engine still loading. The exact
                wording matters — see the memory note about not
                surfacing implementation details (COOP/COEP, SharedArrayBuffer)
                in user-visible text. */}
            {ffmpegStatus === "loading" && (
                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-3 rounded mb-4 text-sm">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
                    Loading the video engine. The Prepare button will work once it's ready.
                </div>
            )}

            {/* Add segment buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => videoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                >
                    <FontAwesomeIcon icon={faCirclePlus} /> Add video
                </button>
                <button
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                >
                    <FontAwesomeIcon icon={faCirclePlus} /> Add image
                </button>
            </div>

            {/* Empty state */}
            {segments.length === 0 && (
                <div className="border-2 border-dashed border-gray-700 rounded p-12 text-center">
                    <FontAwesomeIcon icon={faWandMagicSparkles} size="3x" className="text-gray-500 mb-3" />
                    <p className="text-gray-400">
                        Add one or more videos or images to build your segment list.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Total duration: 0.0s
                    </p>
                </div>
            )}

            {/* Segment list */}
            {segments.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-orange-400">
                            Segments ({segments.length}) — total {totalDuration.toFixed(1)}s
                        </h3>
                    </div>
                    {segments.map((seg, idx) => {
                        // Only the selected segment shows its edit controls
                        // (the trim sliders for videos, the duration
                        // slider for images). Other segments stay in
                        // "compact" mode showing just a one-line summary
                        // of their current trim/duration, so the list
                        // stays scannable as the segment count grows.
                        // A newly-added segment is auto-selected so the
                        // user can immediately tweak it.
                        const isSelected = selectedId === seg.id;
                        return (
                        <div
                            key={seg.id}
                            onClick={() => setSelectedId(seg.id)}
                            className={`bg-gray-800 border rounded p-3 cursor-pointer transition-colors ${
                                isSelected ? "border-orange-500" : "border-gray-700 hover:border-gray-600"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500 w-6 text-right">{idx + 1}.</div>
                                <div className="flex-shrink-0">
                                    {seg.kind === "video" ? (
                                        <FontAwesomeIcon icon={faFilm} className="text-orange-400" />
                                    ) : (
                                        <FontAwesomeIcon icon={faImage} className="text-orange-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{seg.meta.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {seg.kind === "video" ? (
                                            <>
                                                {seg.meta.width}×{seg.meta.height} •{" "}
                                                {(seg.meta.duration || 0).toFixed(1)}s • {formatBytes(seg.meta.size)}
                                            </>
                                        ) : (
                                            <>
                                                {seg.meta.width}×{seg.meta.height} • {formatBytes(seg.meta.size)}
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleMoveUp(seg.id)}
                                        disabled={idx === 0}
                                        className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded"
                                        title="Move up"
                                    >
                                        <FontAwesomeIcon icon={faArrowUp} size="sm" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(seg.id)}
                                        disabled={idx === segments.length - 1}
                                        className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded"
                                        title="Move down"
                                    >
                                        <FontAwesomeIcon icon={faArrowDown} size="sm" />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(seg.id)}
                                        className="w-7 h-7 flex items-center justify-center bg-red-700 hover:bg-red-600 rounded"
                                        title="Remove"
                                    >
                                        <FontAwesomeIcon icon={faXmark} size="sm" />
                                    </button>
                                </div>
                            </div>

                            {/* Compact summary (always visible): tells the
                                user what the current trim/duration is
                                without expanding the edit controls. */}
                            <div className="mt-2 text-xs text-gray-400">
                                {seg.kind === "video" ? (
                                    <>
                                        <span className="text-orange-300">
                                            {seg.trim.start.toFixed(2)}s
                                        </span>
                                        {" → "}
                                        <span className="text-orange-300">
                                            {seg.trim.end.toFixed(2)}s
                                        </span>
                                        <span className="text-gray-600">
                                            {" "}({(seg.trim.end - seg.trim.start).toFixed(2)}s clip)
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Shown for{" "}
                                        <span className="text-orange-300">
                                            {seg.duration.toFixed(1)}s
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Edit controls — only visible when this
                                segment is the active selection. The
                                whole row is clickable to change
                                selection; the per-row buttons stop
                                propagation so they don't fire the
                                row's onClick. */}
                            {isSelected && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {seg.kind === "video" ? (
                                        <>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">
                                                    Start: {seg.trim.start.toFixed(2)}s
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={seg.meta.duration || 0}
                                                    step="0.1"
                                                    value={seg.trim.start}
                                                    onChange={(e) => handleUpdateVideoTrim(seg.id, "start", Number(e.target.value))}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">
                                                    End: {seg.trim.end.toFixed(2)}s
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={seg.meta.duration || 0}
                                                    step="0.1"
                                                    value={seg.trim.end}
                                                    onChange={(e) => handleUpdateVideoTrim(seg.id, "end", Number(e.target.value))}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs text-gray-400 mb-1">
                                                Show for: {seg.duration.toFixed(1)}s
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="10"
                                                step="0.5"
                                                value={seg.duration}
                                                onChange={(e) => handleUpdateImageDuration(seg.id, Number(e.target.value))}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Step 1: Prepare */}
            {segments.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold text-orange-400">Step 1 — Prepare</h3>
                    <p className="text-xs text-gray-500">
                        Join all segments into one video. You'll be able to preview it before converting to a GIF.
                    </p>
                    {status === "preparing" && (
                        <div>
                            <div className="flex justify-between text-sm text-orange-400 mb-1">
                                <span>Preparing…</span>
                                <span>{progress > 0 ? `${progress}%` : ""}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden relative">
                                {progress > 0 ? (
                                    <div
                                        className="h-full bg-orange-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-orange-500/70 animate-indeterminate rounded" />
                                )}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handlePrepare}
                        disabled={status === "preparing" || status === "converting" || ffmpegStatus !== "loaded"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {status === "preparing" ? "Preparing…" : "Prepare"}
                    </button>
                </div>
            )}

            {/* Step 2: Preview + Convert */}
            {preparedUrl && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold text-orange-400">Step 2 — Preview &amp; Convert</h3>
                    <p className="text-xs text-gray-500">
                        Preview the prepared video below. If it looks right, convert it to a GIF.
                    </p>
                    <video
                        ref={videoRef}
                        src={preparedUrl}
                        controls
                        className="w-full max-h-72 bg-black rounded border border-gray-700"
                    />
                    <p className="text-xs text-gray-500">
                        Prepared: {formatBytes(preparedSize)} • {preparedDuration.toFixed(1)}s
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm mb-1">Frames per second: {fps}</label>
                            <input
                                type="range"
                                min="1"
                                max="24"
                                value={fps}
                                onChange={(e) => setFps(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Max width: {maxWidth}px</label>
                            <input
                                type="range"
                                min="120"
                                max="960"
                                step="20"
                                value={maxWidth}
                                onChange={(e) => setMaxWidth(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </div>
                    {status === "converting" && (
                        <div>
                            <div className="flex justify-between text-sm text-orange-400 mb-1">
                                <span>Converting…</span>
                                <span>{progress > 0 ? `${progress}%` : ""}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden relative">
                                {progress > 0 ? (
                                    <div
                                        className="h-full bg-orange-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-orange-500/70 animate-indeterminate rounded" />
                                )}
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleConvert}
                        disabled={status === "converting" || status === "preparing"}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {status === "converting" ? "Converting…" : "Convert to GIF"}
                    </button>
                </div>
            )}

            {/* Step 3: Result + Compress */}
            {gifUrl && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-sm font-bold text-orange-400">Step 3 — Result</h3>
                    <div className="border border-gray-700 rounded p-2 bg-gray-800">
                        <img src={gifUrl} alt="Result GIF" className="max-w-full mx-auto" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleDownloadOriginal}
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            <FontAwesomeIcon icon={faDownload} /> Download GIF
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded space-y-3">
                        <h4 className="text-sm font-bold text-orange-400">Compress (optional)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm mb-1">Scale: {compressScale}%</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={compressScale}
                                    onChange={(e) => setCompressScale(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Frame skip: 1 in {compressFrameSkip}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    value={compressFrameSkip}
                                    onChange={(e) => setCompressFrameSkip(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Quality: {compressQuality}</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={compressQuality}
                                    onChange={(e) => setCompressQuality(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCompress}
                            disabled={status === "converting"}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === "converting" ? "Compressing…" : "Compress"}
                        </button>
                        {compressedUrl && (
                            <div className="space-y-2">
                                <p className="text-sm text-green-400">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mr-1" />
                                    Compressed: {formatBytes(compressedSize)} ({compressRatio}% of original)
                                </p>
                                <div className="border border-gray-700 rounded p-2 bg-gray-900">
                                    <img src={compressedUrl} alt="Compressed GIF" className="max-w-full mx-auto" />
                                </div>
                                <button
                                    onClick={handleDownloadCompressed}
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Download compressed GIF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden canvas used for the Convert step. */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Warning modal: shown when the user picks a new file
                while a previous GIF is on screen. Same pattern as
                VideoToGif and GifCompressor — see those files for
                the full rationale. */}
            <CustomModal
                isOpen={showResetWarning}
                onRequestClose={closeModalAndDropPending}
                title="Replace current result?"
                type="warning"
                actions={[
                    {
                        label: "Cancel",
                        className: "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 transition-colors duration-200",
                        onClick: () => {
                            if (pendingFileRef.current) {
                                URL.revokeObjectURL(pendingFileRef.current.objectUrl);
                                pendingFileRef.current = null;
                            }
                            if (videoInputRef.current) videoInputRef.current.value = "";
                            if (imageInputRef.current) imageInputRef.current.value = "";
                        },
                    },
                    {
                        label: "Discard & continue",
                        className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition-colors duration-200",
                        onClick: handleDiscardPreviousAndContinue,
                    },
                    {
                        label: "Download previous",
                        className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 transition-colors duration-200",
                        onClick: handleDownloadPreviousAndContinue,
                    },
                ]}
            >
                <div className="space-y-3">
                    <p>
                        You have a converted GIF that hasn't been downloaded yet. If you continue, that
                        result will be lost from this page.
                    </p>
                    {gifUrl && gifSize > 0 && (
                        <div className="bg-gray-800 border border-gray-700 rounded p-3 text-sm">
                            <div className="flex items-center gap-2 text-orange-400 font-bold mb-1">
                                <FontAwesomeIcon icon={faFilm} />
                                Current result
                            </div>
                            <div className="text-gray-300">output.gif</div>
                            <div className="text-gray-400">Size: {formatBytes(gifSize)}</div>
                        </div>
                    )}
                    <p className="text-gray-400 text-sm">
                        Choose <span className="text-green-400 font-bold">Download previous</span> to save
                        the current GIF first, <span className="text-red-400 font-bold">Discard &amp; continue</span>{" "}
                        to throw it away, or <span className="text-white font-bold">Cancel</span> to keep everything as-is.
                    </p>
                </div>
            </CustomModal>
        </div>
    );
};

export default GifMaker;
