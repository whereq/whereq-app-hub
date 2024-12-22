import { useState } from "react";
import { Resizable } from "re-resizable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisH, faChevronDown, faChevronRight, faFolderClosed, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { TopCategory } from "@models/EndpointCategory";

import "./indexPanel.css";

export const IndexPanel = ({
    panels,
    selectedPanel,
    setSelectedPanel,
}: {
    panels: TopCategory[];
    selectedPanel: string;
    setSelectedPanel: (panel: string) => void;
}) => {
    const [filterText, setFilterText] = useState("");
    const [isResizing, setIsResizing] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [expandedIndexes, setExpandedIndexes] = useState<Set<string>>(new Set());

    const toggleExpand = (set: Set<string>, key: string, setFn: React.Dispatch<React.SetStateAction<Set<string>>>) => {
        const newSet = new Set(set);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setFn(newSet);
    };

    return (
        <Resizable
            defaultSize={{ width: "15%", height: "100%" }}
            maxWidth="50%"
            minWidth="5%"
            enable={{ right: true }}
            className={`index-panel ${isResizing ? "resizing" : ""}`}
            handleStyles={{ right: { cursor: "ew-resize" } }}
            handleClasses={{ right: "resize-handle-right" }}
            onResizeStart={() => setIsResizing(true)}
            onResizeStop={() => setIsResizing(false)}
        >
            <div className="function-bar">
                <button className="add-button">
                    <FontAwesomeIcon icon={faPlus} title="Add New Panel" />
                </button>
                <input
                    type="text"
                    className="filter-input"
                    placeholder="Filter..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>
            <ul className="panel-index-list">
                {panels
                    .filter((topCategory) =>
                        topCategory.name.toLowerCase().includes(filterText.toLowerCase())
                    )
                    .map((topCategory) => (
                        <li key={topCategory.name} className="category-item">
                            <div
                                className="top-category"
                                onClick={() =>
                                    toggleExpand(expandedCategories, topCategory.name, setExpandedCategories)
                                }
                            >
                                <FontAwesomeIcon
                                    icon={
                                        expandedCategories.has(topCategory.name)
                                            ? faChevronDown
                                            : faChevronRight
                                    }
                                    className="chevron-icon"
                                />
                                <FontAwesomeIcon
                                    icon={
                                        expandedCategories.has(topCategory.name)
                                            ? faFolderOpen
                                            : faFolderClosed
                                    }
                                    className="folder-icon"
                                />
                                <span className="top-category-text">{topCategory.name}</span>
                            </div>
                            {expandedCategories.has(topCategory.name) && (
                                <ul className="category-list">
                                    {topCategory.categories.map((category) => (
                                        <li key={category.name} className="category-item">
                                            <div
                                                className="index-header"
                                                onClick={() =>
                                                    toggleExpand(expandedCategories, category.name, setExpandedCategories)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        expandedCategories.has(category.name)
                                                            ? faChevronDown
                                                            : faChevronRight
                                                    }
                                                    className="chevron-icon"
                                                />
                                                <FontAwesomeIcon
                                                    icon={
                                                        expandedCategories.has(category.name)
                                                            ? faFolderOpen
                                                            : faFolderClosed
                                                    }
                                                    className="folder-icon"
                                                />
                                                <span className="category-text">{category.name}</span>
                                            </div>
                                            {expandedCategories.has(category.name) && (
                                                <ul className="index-list">
                                                    {category.restfulEndpointGroups.map((restfulEndpointGroup) => (
                                                        <li key={restfulEndpointGroup.name} className="index-item">
                                                            <div
                                                                className="index-header"
                                                                onClick={() =>
                                                                    toggleExpand(expandedIndexes, restfulEndpointGroup.name, setExpandedIndexes)
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        expandedIndexes.has(restfulEndpointGroup.name)
                                                                            ? faChevronDown
                                                                            : faChevronRight
                                                                    }
                                                                    className="chevron-icon second-level-chevron"
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        expandedIndexes.has(restfulEndpointGroup.name)
                                                                            ? faFolderOpen
                                                                            : faFolderClosed
                                                                    }
                                                                    className="folder-icon"
                                                                />
                                                                <span className="index-text">{restfulEndpointGroup.name}</span>
                                                            </div>
                                                            {expandedIndexes.has(restfulEndpointGroup.name) && (
                                                                <ul className="leaf-list">
                                                                    {restfulEndpointGroup.restfulEndpoints.map((endpoint, i) => (
                                                                        <li key={i}
                                                                            className={`leaf-item ${selectedPanel === endpoint.title ? "selected-highlight" : ""}`}
                                                                            onClick={() => setSelectedPanel(endpoint.title)}
                                                                        >
                                                                            <span className={`http-method ${endpoint.method.toLowerCase()}`}>
                                                                                {endpoint.method}
                                                                            </span>
                                                                            <span className="request-name">{endpoint.title}</span>
                                                                            <FontAwesomeIcon
                                                                                icon={faEllipsisH}
                                                                                className="ellipsis-icon"
                                                                                title="Options"
                                                                            />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}

            </ul>
        </Resizable>
    );
};
