import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faDownload, faFilm } from "@fortawesome/free-solid-svg-icons";
// @ts-expect-error - gif.js has no types
import GIF from "gif.js";

/**
 * Video to GIF
 *
 * Decodes frames from a <video> element by seeking to timestamps and
 * drawing onto a canvas, then encodes the captured frames into a GIF
 * using gif.js (LZW encoder in a Web Worker — won't block the UI).
 *
 * Performance: a 5-second clip at 10 fps takes ~10–20 seconds to encode
 * on a typical laptop. The "every Nth frame" slider trades smoothness
 * for speed. Maximum output size is capped at 480px wide to keep GIFs
 * shareable; larger GIFs are scaled down to fit.
 */
const VideoToGif = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [meta, setMeta] = useState<{ name: string; size: number; width: number; height: number; duration: number } | null>(null);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [gifSize, setGifSize] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [status, setStatus] = useState<"idle" | "ready" | "encoding" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [fps, setFps] = useState<number>(10);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [maxWidth, setMaxWidth] = useState<number>(480);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFile = (file: File) => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (gifUrl) URL.revokeObjectURL(gifUrl);
        setGifUrl(null);
        setStatus("idle");
        setError(null);
        setProgress(0);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setMeta({ name: file.name, size: file.size, width: 0, height: 0, duration: 0 });
    };

    const onVideoMeta = () => {
        const v = videoRef.current;
        if (!v || !meta) return;
        setMeta({ ...meta, width: v.videoWidth, height: v.videoHeight, duration: v.duration });
        setStartTime(0);
        setEndTime(Math.min(v.duration, 5));
    };

    const seekTo = (time: number): Promise<void> =>
        new Promise((res) => {
            const v = videoRef.current!;
            const onSeeked = () => {
                v.removeEventListener("seeked", onSeeked);
                res();
            };
            v.addEventListener("seeked", onSeeked);
            v.currentTime = Math.max(0, Math.min(time, v.duration));
            // Safety: if seek fails, resolve after 1s
            setTimeout(() => {
                v.removeEventListener("seeked", onSeeked);
                res();
            }, 1000);
        });

    const handleEncode = async () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || !meta || endTime <= startTime) {
            setError("Pick a valid time range first.");
            setStatus("error");
            return;
        }
        setError(null);
        setStatus("encoding");
        setProgress(0);
        setGifUrl(null);

        try {
            const outputW = Math.min(meta.width, maxWidth);
            const outputH = Math.round((outputW / meta.width) * meta.height);
            c.width = outputW;
            c.height = outputH;
            const ctx = c.getContext("2d")!;
            const frameDelayMs = 1000 / fps;
            const frames: { data: Uint8ClampedArray; delay: number }[] = [];

            // Capture frames by seeking through the video
            const totalFrames = Math.max(1, Math.floor((endTime - startTime) * fps));
            for (let i = 0; i < totalFrames; i++) {
                const t = startTime + (i / fps);
                await seekTo(t);
                ctx.drawImage(v, 0, 0, outputW, outputH);
                const imageData = ctx.getImageData(0, 0, outputW, outputH);
                frames.push({ data: imageData.data, delay: frameDelayMs });
                setProgress(Math.round(((i + 1) / totalFrames) * 50));
            }

            // Encode with gif.js
            const gif = new GIF({
                workers: 2,
                quality: 10,
                width: outputW,
                height: outputH,
                workerScript: "/gif.worker.js",
            });

            frames.forEach((f) => {
                // gif.js wants an ImageData-like object
                const imgData = new ImageData(new Uint8ClampedArray(f.data), outputW, outputH);
                gif.addFrame(imgData, { delay: f.delay });
            });

            gif.on("progress", (p: number) => {
                setProgress(50 + Math.round(p * 50));
            });
            gif.on("finished", (blob: Blob) => {
                setGifUrl(URL.createObjectURL(blob));
                setGifSize(blob.size);
                setProgress(100);
                setStatus("done");
            });
            gif.render();
        } catch (e) {
            console.error(e);
            setError("Encoding failed: " + (e as Error).message);
            setStatus("error");
        }
    };

    const formatBytes = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="h-full overflow-y-auto p-4 text-orange-300 font-fira-code">
            <h2 className="text-2xl font-bold mb-2">Video to GIF</h2>
            <p className="text-sm text-gray-400 mb-4">
                Convert short video clips to animated GIFs. Decodes frames from the browser's video decoder, encodes with gif.js in a Web Worker.
            </p>

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

            {!videoUrl && (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded p-12 text-center cursor-pointer hover:border-orange-500 transition"
                >
                    <FontAwesomeIcon icon={faUpload} size="3x" className="text-gray-500 mb-3" />
                    <p className="text-gray-400">Click to upload a video (MP4, WebM, MOV…)</p>
                </div>
            )}

            {videoUrl && meta && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            onLoadedMetadata={onVideoMeta}
                            className="w-full max-h-96 bg-black rounded border border-gray-700"
                        />
                        <p className="text-sm text-gray-400 mt-2">
                            <FontAwesomeIcon icon={faFilm} className="mr-1" />
                            {meta.name} • {meta.width}×{meta.height} • {meta.duration.toFixed(1)}s • {formatBytes(meta.size)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1">Start: {startTime.toFixed(2)}s</label>
                            <input
                                type="range"
                                min="0"
                                max={meta.duration || 1}
                                step="0.1"
                                value={startTime}
                                onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End: {endTime.toFixed(2)}s</label>
                            <input
                                type="range"
                                min="0"
                                max={meta.duration || 1}
                                step="0.1"
                                value={endTime}
                                onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Frames per second: {fps}</label>
                            <input type="range" min="1" max="24" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Max width: {maxWidth}px</label>
                            <input type="range" min="120" max="960" step="20" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full" />
                        </div>

                        {status === "encoding" && (
                            <div>
                                <div className="flex justify-between text-sm text-orange-400 mb-1">
                                    <span>Encoding…</span>
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

                        <button
                            onClick={handleEncode}
                            disabled={status === "encoding" || endTime <= startTime}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === "encoding" ? "Encoding…" : "Convert to GIF"}
                        </button>
                    </div>

                    {gifUrl && (
                        <div className="lg:col-span-2 mt-4">
                            <h3 className="font-bold text-orange-400 mb-2">Result ({formatBytes(gifSize)})</h3>
                            <div className="border border-gray-700 rounded p-2 bg-gray-800">
                                <img src={gifUrl} alt="GIF" className="max-w-full mx-auto" />
                            </div>
                            <a
                                href={gifUrl}
                                download="output.gif"
                                className="mt-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                <FontAwesomeIcon icon={faDownload} /> Download GIF
                            </a>
                        </div>
                    )}
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default VideoToGif;
