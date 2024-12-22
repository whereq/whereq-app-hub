import { useState } from "react";
import { ParamsTab } from "@features/api-executor/request-panel/ParamsTab/ParamsTab";
import { AuthorizationTab } from "@features/api-executor/request-panel/AuthorizationTab/AuthorizationTab";
import { BodyTab } from "@features/api-executor/request-panel/BodyTab/BodyTab";
import { SettingsTab } from "@features/api-executor/request-panel/SettingsTab/SettingsTab";
import { TAB_TYPES } from "src/utils/constants";

import "./requestPanel.css";
import { RestfulEndpoint } from "@models/RestfulEndpoint";

type RequestPanelProps = {
    restfulEndpoint?: RestfulEndpoint;
    onParamsChange: (updated: Record<string, string>) => void;
    onHeadersChange: (updated: Record<string, string>) => void;
    onResize: (isResizing: boolean) => void;
    headers: Record<string, string>;
    style?: React.CSSProperties; // Accept a style prop for dynamic height
};

type RequestTabKey = "params" | "authorization" | "headers" | "body" | "settings";

export const RequestPanel = ({
    restfulEndpoint,
    onParamsChange,
    onHeadersChange,
    headers,
    style,
}: RequestPanelProps) => {
    const [selectedRequestTab, setSelectedRequestTab] = useState<RequestTabKey>("params");

    return (
        <div className="request-panel" style={style}>
            <div className="request-tabs">
                {["Params", "Authorization", "Headers", "Body", "Settings"].map((tab) => (
                    <button
                        key={tab}
                        className={`request-tab ${selectedRequestTab === tab.toLowerCase() ? "active" : ""}`}
                        onClick={() => setSelectedRequestTab(tab.toLowerCase() as RequestTabKey)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="request-tab-content">
                {selectedRequestTab === "params" && (
                    <ParamsTab
                        restfulEndpoint={restfulEndpoint}   
                        onParamsChange={onParamsChange}
                        tabType={TAB_TYPES.PARAMETERS}
                    />
                )}
                {selectedRequestTab === "authorization" && <AuthorizationTab />}
                {selectedRequestTab === "headers" && (
                    <ParamsTab
                        restfulEndpoint={restfulEndpoint}   
                        onParamsChange={onHeadersChange}
                        initialParams={headers}
                        tabType={TAB_TYPES.HEADERS}
                    />
                )}
                {selectedRequestTab === "body" && <BodyTab />}
                {selectedRequestTab === "settings" && <SettingsTab restfulEndpoint={restfulEndpoint} />}
            </div>
        </div>
    );
};