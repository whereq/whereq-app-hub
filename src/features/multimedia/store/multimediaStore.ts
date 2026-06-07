import { create } from "zustand";
import { SectionType } from "@/features/multimedia/models/MultimediaEnum";

interface MultimediaStore {
    isWorkspaceVisible: boolean;
    toggleWorkspace: () => void;
    activeSection: SectionType;
    setActiveSection: (section: SectionType) => void;
}

export const useMultimediaStore = create<MultimediaStore>((set) => ({
    isWorkspaceVisible: false,
    toggleWorkspace: () => set((state) => ({ isWorkspaceVisible: !state.isWorkspaceVisible })),
    activeSection: SectionType.YOUTUBE_CAPTURE,
    setActiveSection: (section) => set({ activeSection: section }),
}));
