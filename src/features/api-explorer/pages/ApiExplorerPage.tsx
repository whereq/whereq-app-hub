import { useState, useEffect } from "react";

import { SideBar } from "@components/sidebar/Sidebar";
import { IndexPanel } from "@components/index-panel/IndexPanel";
import "@features/api-explorer/styles/api-explorer.css";

import { RestfulEndpoint } from "@models/RestfulEndpoint";
import { ApiExecutor } from "@features/api-executor/ApiExecutor";

// Import the public API indexes and endpoints
import { publicApiCategories } from "@resources/public-api/endpoints";
import { SettingPanel } from "@components/sidebar/settings-panel/SettingsPanel";

export const ApiExplorerPage = () => {
    const [isIndexPanelVisible, setIsIndexPanelVisible] = useState(true);
    const [isSettingPanelVisible, setIsSettingPanelVisible] = useState(false);
    
    const [selectedEndpoint, setSelectedEndpoint] = useState<RestfulEndpoint | null>(null);
    const [panels, setPanels] = useState<typeof publicApiCategories>([]);

    useEffect(() => {
        const mappedPanels = publicApiCategories.map((topCategory) => ({
            name: topCategory.name,
            categories: topCategory.categories.map((category) => ({
                name: category.name,
                restfulEndpointGroups: category.restfulEndpointGroups,
            })),
        }));
        setPanels(mappedPanels);
    }, []);


    const toggleIndexPanel = () => setIsIndexPanelVisible(!isIndexPanelVisible);
    const toggleSettingPanel = () => setIsSettingPanelVisible(!isSettingPanelVisible);


    return (
        <div className="flex h-screen">
            {/* Side Bar */}
            <SideBar
                isIndexPanelVisible={isIndexPanelVisible}
                toggleIndexPanel={toggleIndexPanel}
                openSettings={toggleSettingPanel}
            />

            {/* Index Panel */}
            {isIndexPanelVisible && (
                <IndexPanel
                    panels={panels}
                    selectedPanel={selectedEndpoint?.title || ""}
                    setSelectedPanel={(endpointTitle: string) => {
                        // Find the selected endpoint from all panels, including the new structure
                        const allEndpoints = panels.flatMap((panel) =>
                            panel.categories.flatMap((category) =>
                                category.restfulEndpointGroups.flatMap((index) => index.restfulEndpoints)
                            )
                        );
                        const selected = allEndpoints.find(
                            (endpoint) => endpoint.title === endpointTitle
                        );
                        setSelectedEndpoint(selected || null);
                    }}
                />
            )}

            {/* Main Panel */}
            <div className="flex-1 bg-white">
                <ApiExecutor endpoint={selectedEndpoint || undefined} />
            </div>

            {isSettingPanelVisible && (
                <SettingPanel onClose={toggleSettingPanel} />
            )}
        </div>
    );
};