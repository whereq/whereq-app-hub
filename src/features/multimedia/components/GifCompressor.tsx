import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faDownload, faImage } from "@fortawesome/free-solid-svg-icons";
// @ts-expect-error - gif.js has no types
import GIF from "gif.js";
// @ts-expect-error - gifuct-js has no first-class types
import { parseGIF, decompressFrames } from "gifuct-js";

/**
 * GIF Compressor
 *
 * Decodes every frame of an input GIF with gifuct-js (a pure-JS LZW
 * decoder), then re-encodes with gif.js at a lower color quality /
 * smaller dimensions. Three knobs:
 *   - Scale: downsample the GIF (linear scaling).
 *   - Frame skip: drop every Nth frame (e.g., 2 = keep half the frames).
 *   - Quality: gif.js quality parameter (1 = best, 20 = worst, default 10).
 *
 * Output size is unpredictable, but typically halves for scale=50 or
 * frameSkip=2, and halves again for quality=20.
 */
const GifCompressor = () => {
    const [originalMeta, setOriginalMeta] = useState<{ name: string; size: number; width: number; height: number; frameCount: number } | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [resultSize, setResultSize] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    const [status, setStatus] = useState<"idle" | "decoding" | "encoding" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(100);
    const [frameSkip, setFrameSkip] = useState<number>(1);
    const [quality, setQuality] = useState<number>(10);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFile = async (file: File) => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
        setError(null);
        setProgress(0);
        setStatus("decoding");
        setOriginalMeta({ name: file.name, size: file.size, width: 0, height: 0, frameCount: 0 });

        try {
            const buf = await file.arrayBuffer();
            const gif = parseGIF(buf);
            const frames = decompressFrames(gif, true);
            setOriginalMeta({ name: file.name, size: file.size, width: gif.lsd.width, height: gif.lsd.height, frameCount: frames.length });
            setStatus("idle"); // ready
            // Hold the frames in module scope for the encode step
            decodeCache.frames = frames;
            decodeCache.width = gif.lsd.width;
            decodeCache.height = gif.lsd.height;
        } catch (e) {
            console.error(e);
            setError("Could not parse the GIF. Make sure it's a valid GIF file.");
            setStatus("error");
        }
    };

    const decodeCache: { frames?: ReturnType<typeof decompressFrames>; width?: number; height?: number } = {};

    const handleCompress = async () => {
        if (!decodeCache.frames || !decodeCache.width || !decodeCache.height) {
            setError("No decoded frames. Upload a GIF first.");
            return;
        }
        setError(null);
        setStatus("encoding");
        setProgress(0);

        try {
            const outputW = Math.max(1, Math.round(decodeCache.width * (scale / 100)));
            const outputH = Math.max(1, Math.round(decodeCache.height * (scale / 100)));

            // Apply disposal: each frame's `disposalType` tells us how to
            // combine it with the canvas. The simplest portable approach:
            // maintain a working canvas, draw frame on top, add to gif.js.
            const canvas = document.createElement("canvas");
            canvas.width = decodeCache.width;
            canvas.height = decodeCache.height;
            const ctx = canvas.getContext("2d")!;

            const keptFrames = decodeCache.frames.filter((_: unknown, i: number) => i % frameSkip === 0);

            const gif = new GIF({
                workers: 2,
                quality,
                width: outputW,
                height: outputH,
                workerScript: "/gif.worker.js",
            });

            // Scale to output via a temp canvas
            const scaleCanvas = document.createElement("canvas");
            scaleCanvas.width = outputW;
            scaleCanvas.height = outputH;
            const scaleCtx = scaleCanvas.getContext("2d")!;

            for (let i = 0; i < keptFrames.length; i++) {
                const f = keptFrames[i] as { dims: { width: number; height: number; top: number; left: number }; patch: Uint8ClampedArray; delay: number; disposalType: number };
                // Handle disposal
                if (f.disposalType === 2) {
                    ctx.clearRect(0, 0, decodeCache.width, decodeCache.height);
                }
                // Apply frame patch to the working canvas
                const patch = f.patch;
                const dim = f.dims;
                const imageData = ctx.createImageData(dim.width, dim.height);
                imageData.data.set(patch);
                ctx.putImageData(imageData, dim.left, dim.top);
                // Scale down
                scaleCtx.fillStyle = "#000";
                scaleCtx.fillRect(0, 0, outputW, outputH);
                scaleCtx.drawImage(canvas, 0, 0, outputW, outputH);
                const finalImage = scaleCtx.getImageData(0, 0, outputW, outputH);
                gif.addFrame(finalImage, { delay: f.delay || 100 });
                setProgress(Math.round(((i + 1) / keptFrames.length) * 50));
            }

            gif.on("progress", (p: number) => setProgress(50 + Math.round(p * 50)));
            gif.on("finished", (blob: Blob) => {
                setResultUrl(URL.createObjectURL(blob));
                setResultSize(blob.size);
                setProgress(100);
                setStatus("done");
            });
            gif.render();
        } catch (e) {
            console.error(e);
            setError("Compression failed: " + (e as Error).message);
            setStatus("error");
        }
    };

    const reset = () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
        setOriginalMeta(null);
        setStatus("idle");
        setError(null);
        setProgress(0);
        decodeCache.frames = undefined;
        decodeCache.width = undefined;
        decodeCache.height = undefined;
        if (inputRef.current) inputRef.current.value = "";
    };

    const formatBytes = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    const ratio = originalMeta && resultSize ? ((resultSize / originalMeta.size) * 100).toFixed(0) : null;

    return (
        <div className="h-full overflow-y-auto p-4 text-orange-300 font-fira-code">
            <h2 className="text-2xl font-bold mb-2">GIF Compressor</h2>
            <p className="text-sm text-gray-400 mb-4">
                Shrinks an animated GIF by reducing resolution, dropping frames, or lowering color quality. Decoded with gifuct-js, re-encoded with gif.js in a Web Worker.
            </p>

            <input
                ref={inputRef}
                type="file"
                accept="image/gif"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                }}
            />

            {!originalMeta && (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded p-12 text-center cursor-pointer hover:border-orange-500 transition"
                >
                    <FontAwesomeIcon icon={faUpload} size="3x" className="text-gray-500 mb-3" />
                    <p className="text-gray-400">Click to upload a GIF</p>
                </div>
            )}

            {originalMeta && (
                <div className="space-y-4">
                    <div className="bg-gray-800 border border-gray-700 rounded p-3">
                        <p className="text-sm">
                            <FontAwesomeIcon icon={faImage} className="mr-1" />
                            {originalMeta.name} • {originalMeta.width}×{originalMeta.height} • {originalMeta.frameCount} frames • {formatBytes(originalMeta.size)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm mb-1">Scale: {scale}%</label>
                            <input type="range" min="10" max="100" step="5" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Frame skip: keep 1 in {frameSkip}</label>
                            <input type="range" min="1" max="8" value={frameSkip} onChange={(e) => setFrameSkip(Number(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Quality: {quality} (lower = smaller)</label>
                            <input type="range" min="1" max="20" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                        </div>
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

                    <div className="flex gap-2">
                        <button
                            onClick={handleCompress}
                            disabled={status === "encoding"}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {status === "encoding" ? "Compressing…" : "Compress"}
                        </button>
                        <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                            Clear
                        </button>
                    </div>

                    {resultUrl && (
                        <div className="mt-4">
                            <h3 className="font-bold text-orange-400 mb-2">
                                Result: {formatBytes(resultSize)} ({ratio}% of original)
                            </h3>
                            <div className="border border-gray-700 rounded p-2 bg-gray-800">
                                <img src={resultUrl} alt="Compressed GIF" className="max-w-full mx-auto" />
                            </div>
                            <a
                                href={resultUrl}
                                download="compressed.gif"
                                className="mt-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                <FontAwesomeIcon icon={faDownload} /> Download compressed GIF
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GifCompressor;
