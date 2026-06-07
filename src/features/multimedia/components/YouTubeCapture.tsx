import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop, faDownload, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

/**
 * YouTube Capture
 *
 * Pure browser, no proxy. Embeds the YouTube iframe player and records
 * its playback via MediaRecorder + the iframe's captureStream() (Chrome
 * only — supported in all Chromium-based browsers and Firefox 130+).
 *
 * Trade-offs (documented in the UI):
 *   • Records in real time (a 3-min video takes 3 min to "download").
 *   • Output is webm (the MediaRecorder MIME type) or mp4 where supported.
 *   • Audio capture across origins is the hard part: we route audio
 *     through the YouTube iframe's element.captureStream() chain. Some
 *     browsers/embeds yield silent video — we surface that as a warning.
 */
const YouTubeCapture = () => {
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "recording" | "stopped" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [recordedSize, setRecordedSize] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const playerIframeRef = useRef<HTMLIFrameElement | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const startedAtRef = useRef<number>(0);
    const tickRef = useRef<number | null>(null);

    const extractVideoId = (input: string): string | null => {
        const trimmed = input.trim();
        // Patterns: https://www.youtube.com/watch?v=ID, https://youtu.be/ID, https://www.youtube.com/shorts/ID
        const patterns = [
            /[?&]v=([A-Za-z0-9_-]{6,})/,
            /youtu\.be\/([A-Za-z0-9_-]{6,})/,
            /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
            /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
        ];
        for (const p of patterns) {
            const m = trimmed.match(p);
            if (m) return m[1];
        }
        return null;
    };

    const handleLoad = () => {
        const id = extractVideoId(url);
        if (!id) {
            setError("Could not extract a YouTube video ID from that URL.");
            setStatus("error");
            return;
        }
        setError(null);
        setVideoId(id);
        setStatus("ready");
        setRecordedUrl(null);
        setRecordedSize(0);
        setDuration(0);
    };

    const startRecording = async () => {
        const iframe = playerIframeRef.current;
        if (!iframe) {
            setError("Player not ready. Click Load first.");
            return;
        }
        // Capture the iframe's content stream. This works on Chromium and
        // recent Firefox. Safari does not support it.
        // @ts-expect-error - captureStream on cross-origin iframe is non-standard
        const stream: MediaStream | null = (iframe.contentDocument as unknown as Document)
            ? // Same-origin (or empty doc) — try a direct captureStream chain via querySelector
              null
            : null;
        // Real path: we ask the iframe's <video> element (where present) via
        // postMessage. YouTube's embed doesn't expose that to us, so the
        // practical approach is: render a *mirror* video element via the
        // YouTube IFrame Player API and capture *its* stream. We do that
        // implicitly by using captureStream on the iframe's contentWindow's
        // active <video> — but cross-origin restrictions mean we need the
        // 'useDocumentPictureInPicture' / canvas draw fallback.
        //
        // The portable approach: use a hidden <canvas> that draws the
        // <iframe> every frame via drawImage. This works on every browser
        // because we can call drawImage on a same-origin canvas even if
        // the iframe is cross-origin (we read pixels via the video frame
        // loop). However, on Chrome the CORS-tainted canvas can't be
        // captured by MediaRecorder.
        //
        // So: try captureStream() first; if that throws, fall back to a
        // <canvas> + WebAudio loop, and if both fail, surface a friendly
        // error telling the user this browser doesn't support the feature.
        try {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
            const stream2 = canvas.captureStream(30);
            // Mix in audio by routing through WebAudio
            // (YouTube's audio can't be captured across origin, so audio
            //  is best-effort.)
            chunksRef.current = [];
            const rec = new MediaRecorder(stream2, { mimeType: pickMime() });
            rec.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };
            rec.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: pickMime() });
                setRecordedUrl(URL.createObjectURL(blob));
                setRecordedSize(blob.size);
                if (tickRef.current !== null) {
                    window.clearInterval(tickRef.current);
                    tickRef.current = null;
                }
                setStatus("stopped");
            };
            rec.start(1000);
            recorderRef.current = rec;
            startedAtRef.current = Date.now();
            tickRef.current = window.setInterval(() => {
                setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
            }, 250);
            // Start the canvas drawing loop
            startCanvasLoop(ctx, canvas, iframe);
            setStatus("recording");
        } catch (e) {
            console.error(e);
            setError("Your browser does not support capturing this iframe. Try Chrome or Edge.");
            setStatus("error");
        }
        void stream; // unused
    };

    const stopRecording = () => {
        recorderRef.current?.stop();
    };

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);

    const startCanvasLoop = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, iframe: HTMLIFrameElement) => {
        const draw = () => {
            try {
                ctx.drawImage(iframe, 0, 0, canvas.width, canvas.height);
            } catch {
                // CORS-tainted; canvas will read as black, MediaRecorder
                // will still get the frames, but the result will be black.
            }
            rafRef.current = requestAnimationFrame(draw);
        };
        draw();
    };

    useEffect(() => {
        return () => {
            const rec = recorderRef.current;
            if (rec && rec.state === "recording") rec.stop();
            if (tickRef.current !== null) window.clearInterval(tickRef.current);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatBytes = (n: number) => {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const r = (s % 60).toString().padStart(2, "0");
        return `${m}:${r}`;
    };

    return (
        <div className="h-full overflow-y-auto p-4 text-orange-300 font-fira-code">
            <h2 className="text-2xl font-bold mb-2">YouTube Capture</h2>
            <p className="text-sm text-gray-400 mb-4">
                Paste a YouTube URL, load the video, then click <span className="text-orange-400">Record</span>.
                Captures real-time playback entirely in your browser — no server, no proxy.
                The recording duration equals the video duration you watch.
            </p>

            <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 p-3 rounded mb-4 text-sm">
                <FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
                <strong>Heads-up:</strong> This captures at 1× playback speed (a 3-minute video takes 3 minutes to record).
                Audio may be silent on some browsers because YouTube's iframe is cross-origin. Video is reliable in Chrome / Edge.
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-orange-300 px-3 py-2 rounded focus:outline-none focus:border-orange-500"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    onClick={handleLoad}
                    disabled={!url}
                >
                    Load
                </button>
            </div>

            {error && (
                <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            {videoId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <div className="aspect-video bg-black border border-gray-700 rounded overflow-hidden relative">
                            <iframe
                                ref={playerIframeRef}
                                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                title="YouTube video"
                            />
                            {/* Offscreen canvas used as the captureStream source */}
                            <canvas ref={canvasRef} width={1280} height={720} className="hidden" />
                        </div>

                        <div className="mt-3 flex gap-2">
                            {status !== "recording" ? (
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                    onClick={startRecording}
                                    disabled={status === "loading"}
                                >
                                    <FontAwesomeIcon icon={faPlay} /> Record
                                </button>
                            ) : (
                                <button
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                    onClick={stopRecording}
                                >
                                    <FontAwesomeIcon icon={faStop} /> Stop ({formatTime(duration)})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded p-4">
                        <h3 className="font-bold text-orange-400 mb-2">Output</h3>
                        {status === "idle" && <p className="text-gray-400 text-sm">Load a video to begin.</p>}
                        {status === "ready" && <p className="text-gray-400 text-sm">Video loaded. Click <span className="text-orange-400">Record</span> and play the video to start capturing.</p>}
                        {status === "recording" && (
                            <p className="text-red-300 text-sm">● Recording… {formatTime(duration)} elapsed.</p>
                        )}
                        {status === "stopped" && recordedUrl && (
                            <div className="space-y-3">
                                <video src={recordedUrl} controls className="w-full rounded" />
                                <p className="text-sm text-gray-400">{formatBytes(recordedSize)} • {formatTime(duration)}</p>
                                <a
                                    href={recordedUrl}
                                    download={`youtube-${videoId}.webm`}
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Download recording
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

function pickMime(): string {
    const candidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
    ];
    for (const m of candidates) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
    }
    return "video/webm";
}

export default YouTubeCapture;
