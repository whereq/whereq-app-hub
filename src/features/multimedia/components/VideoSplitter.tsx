import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faDownload, faScissors, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
// @ts-expect-error - @ffmpeg/ffmpeg has no first-class types
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

/**
 * Video Splitter / Cutter
 *
 * Uses FFmpeg.wasm (full FFmpeg compiled to WebAssembly). Supports any
 * format FFmpeg supports: MP4, WebM, MKV, MOV, AVI, FLV, WMV, etc.
 * The cut is performed with `-c copy` (stream copy) so it's a literal
 * byte-precise trim — no quality loss, near-instantaneous regardless of
 * video length.
 *
 * Caveat: ffmpeg.wasm requires SharedArrayBuffer, which requires the
 * page to be served with:
 *   Cross-Origin-Opener-Policy: same-origin
 *   Cross-Origin-Embedder-Policy: require-corp
 * Vite's dev server sets these by default if you set the dev.headers
 * config. For production, your hosting (flowdesk.top / whereq.com) needs
 * to send those headers — see https://web.dev/articles/coop-coep.
 *
 * The 30 MB FFmpeg core is fetched on first use from unpkg.com (and
 * cached by the browser), unless you copy the core files into
 * /public/ffmpeg-core/. The other 5 tools in this feature group are
 * 100% local; this is the only one that pulls from a CDN.
 */
const VideoSplitter = () => {
    const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const [ffmpegProgress, setFfmpegProgress] = useState(0);
    const [ffmpegError, setFfmpegError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [meta, setMeta] = useState<{ name: string; size: number; duration: number } | null>(null);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [status, setStatus] = useState<"idle" | "cutting" | "done" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outputUrl, setOutputUrl] = useState<string | null>(null);
    const [outputSize, setOutputSize] = useState(0);
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Probe the video for duration via a hidden <video> element
    const probeRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const loadFFmpeg = async () => {
            try {
                if (!ffmpegRef.current) {
                    const inst = new FFmpeg();
                    inst.on("log", () => { /* noisy, swallow */ });
                    inst.on("progress", ({ progress: p }: { progress: number }) => {
                        setFfmpegProgress(Math.round(p * 100));
                    });
                    ffmpegRef.current = inst;
                }
                const inst = ffmpegRef.current;
                // Load core from unpkg (cached after first run).
                // To host locally: download
                //   @ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.js
                //   @ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.wasm
                // into /public/ffmpeg-core/ and swap the URLs to '/ffmpeg-core/...'.
                await inst.load({
                    coreURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.js", "text/javascript"),
                    wasmURL: await toBlobURL("https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd/ffmpeg-core.wasm", "application/wasm"),
                });
                setFfmpeg(inst);
                setFfmpegLoaded(true);
            } catch (e) {
                console.error(e);
                setFfmpegError("FFmpeg failed to load. This tool requires SharedArrayBuffer, which means the page must be served with COOP/COEP headers. See the note below.");
            }
        };
        loadFFmpeg();
    }, []);

    const handleFile = (f: File) => {
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(null);
        setError(null);
        setProgress(0);
        setFile(f);
        setMeta({ name: f.name, size: f.size, duration: 0 });
        // Probe duration
        const url = URL.createObjectURL(f);
        const v = document.createElement("video");
        v.preload = "metadata";
        v.src = url;
        v.onloadedmetadata = () => {
            setMeta({ name: f.name, size: f.size, duration: v.duration });
            setStartTime(0);
            setEndTime(v.duration);
        };
    };

    const handleCut = async () => {
        if (!file || !ffmpeg || endTime <= startTime) {
            setError("Pick a valid time range first.");
            return;
        }
        setError(null);
        setStatus("cutting");
        setProgress(0);
        try {
            const inputName = "input" + (file.name.match(/\.\w+$/)?.[0] ?? ".mp4");
            const outputName = "output.mp4";
            await ffmpeg.writeFile(inputName, await fetchFile(file));
            // -ss before -i for fast seek, -c copy for stream copy (no re-encode)
            await ffmpeg.exec([
                "-ss", String(startTime),
                "-i", inputName,
                "-to", String(endTime - startTime),
                "-c", "copy",
                outputName,
            ]);
            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data as Uint8Array], { type: "video/mp4" });
            setOutputUrl(URL.createObjectURL(blob));
            setOutputSize(blob.size);
            setStatus("done");
            setProgress(100);
            // Clean up the in-memory files
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch (e) {
            console.error(e);
            const msg = (e as Error).message || String(e);
            if (msg.includes("stream copy") || msg.includes("copy")) {
                setError("Stream copy failed on this format. The cut may still have worked — try downloading and checking the output.");
            } else {
                setError("Cut failed: " + msg);
            }
            setStatus("error");
        }
    };

    const reset = () => {
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setFile(null);
        setMeta(null);
        setStartTime(0);
        setEndTime(0);
        setOutputUrl(null);
        setStatus("idle");
        setError(null);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
    };

    const formatBytes = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const r = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${r}`;
    };

    return (
        <div className="h-full overflow-y-auto p-4 text-orange-300 font-fira-code">
            <h2 className="text-2xl font-bold mb-2">Video Splitter / Cutter</h2>
            <p className="text-sm text-gray-400 mb-4">
                Trim a video by start and end timestamps. Uses FFmpeg in WebAssembly with stream copy (no re-encoding) — instant cuts, no quality loss.
            </p>

            {!ffmpegLoaded && !ffmpegError && (
                <div className="bg-blue-900 border border-blue-700 text-blue-200 p-3 rounded mb-4 text-sm">
                    Loading FFmpeg core (~30 MB, first time only — cached after that)… {ffmpegProgress}%
                </div>
            )}

            {ffmpegError && (
                <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded mb-4 text-sm">
                    <FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
                    {ffmpegError}
                </div>
            )}

            <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 p-3 rounded mb-4 text-sm">
                <strong>Hosting note:</strong> FFmpeg.wasm uses SharedArrayBuffer, which requires the page to be served with
                <code className="mx-1 bg-yellow-800 px-1 rounded">Cross-Origin-Opener-Policy: same-origin</code>
                and
                <code className="mx-1 bg-yellow-800 px-1 rounded">Cross-Origin-Embedder-Policy: require-corp</code>
                response headers. Vite dev server does this automatically; production deploy needs those headers set.
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                }}
            />

            {!file && (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded p-12 text-center cursor-pointer hover:border-orange-500 transition"
                >
                    <FontAwesomeIcon icon={faUpload} size="3x" className="text-gray-500 mb-3" />
                    <p className="text-gray-400">Click to upload a video</p>
                </div>
            )}

            {file && meta && (
                <div className="space-y-4">
                    <div className="bg-gray-800 border border-gray-700 rounded p-3">
                        <p className="text-sm">
                            <FontAwesomeIcon icon={faScissors} className="mr-1" />
                            {meta.name} • {meta.duration.toFixed(1)}s • {formatBytes(meta.size)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Start: {formatTime(startTime)}</label>
                        <input type="range" min="0" max={meta.duration || 1} step="0.1" value={startTime} onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime))} className="w-full" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">End: {formatTime(endTime)}</label>
                        <input type="range" min="0" max={meta.duration || 1} step="0.1" value={endTime} onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime))} className="w-full" />
                    </div>

                    <div className="text-sm text-gray-400">
                        Cut length: <span className="text-orange-400">{formatTime(endTime - startTime)}</span>
                    </div>

                    {status === "cutting" && (
                        <div>
                            <div className="flex justify-between text-sm text-orange-400 mb-1">
                                <span>Cutting…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                                <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded text-sm">{error}</div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleCut}
                            disabled={!ffmpegLoaded || status === "cutting" || endTime <= startTime}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === "cutting" ? "Cutting…" : "Cut video"}
                        </button>
                        <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                            Clear
                        </button>
                    </div>

                    {outputUrl && (
                        <div className="mt-4">
                            <h3 className="font-bold text-orange-400 mb-2">Result ({formatBytes(outputSize)})</h3>
                            <video src={outputUrl} controls className="w-full max-h-96 bg-black rounded border border-gray-700" />
                            <a
                                href={outputUrl}
                                download="cut.mp4"
                                className="mt-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                <FontAwesomeIcon icon={faDownload} /> Download cut video
                            </a>
                        </div>
                    )}
                </div>
            )}

            <video ref={probeRef} className="hidden" />
        </div>
    );
};

export default VideoSplitter;
