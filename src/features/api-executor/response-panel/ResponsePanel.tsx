import { Resizable } from "re-resizable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { ResponseCookie } from "@models/ResponseCookie";
import { CookiesTab } from "@features/api-executor/response-panel/CookiesTab/CookiesTab";
import { ResponseHeadersTab } from "@features/api-executor/response-panel/Headers/ResponseHeadersTab";
import { ResponseContent } from "@models/ResponseContent"; // Import the ResponseModel
import { ResponseContentRenderer } from "./ResponseContentRenderer"; // Import the utility function
import { NetworkInformation } from "@models/NetworkInformation";
import { NetworkInformationModal } from "./network-information-modal/NetworkInformationModal"; // Import the new component

import "./responsePanel.css";

export const ResponsePanel = ({
    height,
    response,
    status,
    responseTime,
    cookies,
    headers,
    networkInformation,
}: {
    height: number;
    response: ResponseContent | null; // Use ResponseModel instead of unknown
    status: string | null;
    responseTime: number | null;
    cookies?: ResponseCookie[];
    headers?: Record<string, string>;
    networkInformation?: NetworkInformation;
}) => {
    const [isResizing, setIsResizing] = useState(false); // Track resizing state
    const [activeTab, setActiveTab] = useState<"Response" | "Cookies" | "Headers">("Response"); // State for active tab
    const [isModalOpen, setIsModalOpen] = useState(false) ; // State for modal visibility

    // const [showGlobeIcon, setShowGlobeIcon] = useState(false);
    const showGlobeIcon = false;


    const renderTabContent = () => {
        switch (activeTab) {
            case "Response":
                return response ? (
                    ResponseContentRenderer(response) // Use the utility function to render content
                ) : (
                    <div className="response-body" />
                );
            case "Cookies":
                return <CookiesTab cookies={cookies || []} />; // Use the new component
            case "Headers":
                return <ResponseHeadersTab headers={headers} />;
            default:
                return null;
        }
    };

    // Copy content to clipboard
    const handleCopyToClipboard = () => {
        if (response) {
            const content =
                response.type === "markdown"
                    ? response.content
                    : JSON.stringify(response.content, null, 2);
            navigator.clipboard
                .writeText(content as string)
                .then(() => alert("Copied to clipboard!"))
                .catch(() => alert("Failed to copy!"));
        }
    };

    // Open the modal
    const openModal = () => setIsModalOpen(true);

    // Close the modal
    const closeModal = () => setIsModalOpen(false);

    return (
        <Resizable
            defaultSize={{ width: "100%", height: `${height}%` }}
            enable={{ top: true }}
            className={`response-panel ${isResizing ? "resizing" : ""}`} // Add class during resizing
            handleStyles={{
                right: {
                    cursor: "ew-resize",
                },
            }}
            handleClasses={{
                top: "resize-handle-top", // Add a class for the right handle
            }}
            onResizeStart={() => setIsResizing(true)} // Set resizing to true on drag start
            onResizeStop={() => setIsResizing(false)} // Set resizing to false on drag end
        >
            <div className="response-top-bar flex items-center">
                <div className="response-tabs flex">
                    {["Response", "Cookies", "Headers"].map((tab) => (
                        <button
                            key={tab}
                            className={`response-tab ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab as "Response" | "Cookies" | "Headers")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="response-button-group flex items-center space-x-2 ml-auto">
                    <span className="status-code text-green-600 font-medium">{status}</span>
                    <span className="response-time text-gray-700">Time: {responseTime}ms</span>
                    <div className="icon-group flex items-center space-x-1">
                        {showGlobeIcon && <FontAwesomeIcon
                            icon={faGlobe}
                            className="response-icon cursor-pointer"
                            onMouseEnter={openModal} // Open modal on hover
                            onClick={openModal} // Open modal on hover
                        />}
                        <button
                            onClick={handleCopyToClipboard}
                            className="copy-button focus:outline-none"
                            title="Copy to Clipboard"
                        >
                            <FontAwesomeIcon icon={faCopy} className="response-icon" />
                        </button>
                    </div>
                </div>

            </div>
            <div className="response-tab-content">
                {response ? (
                    renderTabContent()
                ) : (
                    <div className="response-body" />
                )}
            </div>

            {/* Network Information Modal */}
            <NetworkInformationModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                networkInformation={networkInformation}
            />
        </Resizable>
    );
};
