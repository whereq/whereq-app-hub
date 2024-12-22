import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCaretRight, faSquareCaretLeft, faCog } from "@fortawesome/free-solid-svg-icons";
import "./sidebar.css";

export const SideBar = ({
    isIndexPanelVisible,
    toggleIndexPanel,
    openSettings,
}: {
    isIndexPanelVisible: boolean;
    toggleIndexPanel: () => void;
    openSettings: () => void;
}) => {
    return (
        <div className="sidebar">
            {/* Toggle Index Panel Button */}
            <button
                className="sidebar-button"
                onClick={toggleIndexPanel}
                title={isIndexPanelVisible ? "Hide Index Panel" : "Show Index Panel"}
            >
                <FontAwesomeIcon
                    icon={isIndexPanelVisible ? faSquareCaretLeft: faSquareCaretRight}
                    size="lg"
                />
            </button>

            {/* Settings Button */}
            <button
                className="sidebar-button"
                onClick={openSettings}
                title="Open Settings"
            >
                <FontAwesomeIcon icon={faCog} size="lg" />
            </button>
        </div>
    );
};
