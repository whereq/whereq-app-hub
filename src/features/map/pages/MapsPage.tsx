import { useEffect, useState } from "react";
import { Sidebar } from "@features/map/components/sidebar/Sidebar";
import { SettingPanel } from "@features/map/components/sidebar/settings-panel/SettingsPanel";
import { Workspace } from "@features/map/components/workspace/Workspace";
import Maps from "@features/map/components/Maps";
import PageLayout from "@layouts/PageLayout";
import { useMapStore } from "@features/map/store/mapStore";
import LocalStorageHelper from "@utils/localStorageHelper";
import { GOOGLE_MAP_ID, MAP_LOCAL_STORAGE_KEYS } from "@features/map/utils/constants";

const MapsPage = () => {
    const { isWorkspaceVisible } = useMapStore(); // Get workspace visibility from the store
    const [isSettingPanelVisible, setIsSettingPanelVisible] = useState(false);

    // Check if GOOGLE_MAP_ID is available in local storage on component mount
    useEffect(() => {
        const savedSettings = LocalStorageHelper.loadSetting(MAP_LOCAL_STORAGE_KEYS.BASE_KEY);
        if (!savedSettings || !savedSettings[GOOGLE_MAP_ID]) {
            setIsSettingPanelVisible(true); // Open settings panel if GOOGLE_MAP_ID is not found
        }
    }, []);

    const toggleSettingPanel = () => setIsSettingPanelVisible(!isSettingPanelVisible);

    return (
        <PageLayout>
            <div className="maps-page flex h-full bg-gray-900 text-orange-300 font-fira-code">
                {/* Side Bar */}
                <Sidebar
                    openSettings={toggleSettingPanel}
                />

                {/* Workspace */}
                {isWorkspaceVisible && <Workspace />}

                {/* Main Panel */}
                <div
                    className="flex-1 bg-gray-800 text-orange-300 h-full"
                >
                    <Maps />
                </div>

                {/* Settings Panel */}
                {isSettingPanelVisible && <SettingPanel onClose={toggleSettingPanel} />}
            </div>
        </PageLayout>
    );
};

export default MapsPage;