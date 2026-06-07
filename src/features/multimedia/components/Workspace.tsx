import { useMultimediaStore } from "@/features/multimedia/store/multimediaStore";
import { SectionType } from "@/features/multimedia/models/MultimediaEnum";
import YouTubeCapture from "@/features/multimedia/components/YouTubeCapture";
import BackgroundRemover from "@/features/multimedia/components/BackgroundRemover";
import ImageFormatConverter from "@/features/multimedia/components/ImageFormatConverter";
import VideoToGif from "@/features/multimedia/components/VideoToGif";
import GifCompressor from "@/features/multimedia/components/GifCompressor";
import VideoSplitter from "@/features/multimedia/components/VideoSplitter";

const Workspace = () => {
    const { activeSection } = useMultimediaStore();

    return (
        <div className="flex-1 bg-gray-800 h-full overflow-hidden">
            {activeSection === SectionType.YOUTUBE_CAPTURE && <YouTubeCapture />}
            {activeSection === SectionType.BACKGROUND_REMOVER && <BackgroundRemover />}
            {activeSection === SectionType.IMAGE_FORMAT_CONVERTER && <ImageFormatConverter />}
            {activeSection === SectionType.VIDEO_TO_GIF && <VideoToGif />}
            {activeSection === SectionType.GIF_COMPRESSOR && <GifCompressor />}
            {activeSection === SectionType.VIDEO_SPLITTER && <VideoSplitter />}
        </div>
    );
};

export default Workspace;