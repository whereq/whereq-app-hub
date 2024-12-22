import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUndo, faSave } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { GLOBAL_SETTINGS } from "@utils/constants";
import { GLOBAL_SETTINGS_KEYS } from "@utils/constants";

import "./settingsPanel.css";

export const SettingPanel = ({ onClose }: { onClose: () => void }) => {
    const [rows, setRows] = useState([
        { selected: false, key: GLOBAL_SETTINGS_KEYS.HTTP_PROXY, value: "http://127.0.0.1:7777", description: "Description 1" },
    ]);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [modalInfo, setModalInfo] = useState<{
        isOpen: boolean;
        title?: string;
        message: string;
        confirmAction?: () => void;
        cancelAction?: () => void;
        isConfirmDialog?: boolean;
    }>({
        isOpen: false,
        message: "",
    });

    // Load settings from local storage when the panel is opened
    useEffect(() => {
        const savedSettings = localStorage.getItem(GLOBAL_SETTINGS);
        if (savedSettings) {
            setRows(JSON.parse(savedSettings));
        }
    }, []);

    const updateRow = (index: number, field: string, value: string | boolean) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index] = { ...updatedRows[index], [field]: value };
            return updatedRows;
        });
        setUnsavedChanges(true);
    };

    const toggleSelectAll = (checked: boolean) => {
        setRows((prevRows) =>
            prevRows.map((row) => ({ ...row, selected: checked }))
        );
        setUnsavedChanges(true);
    };

    // Save settings to local storage
    const handleSave = () => {
        const savedSettings = JSON.parse(localStorage.getItem(GLOBAL_SETTINGS) || "[]");
        const changedSettings = rows.filter((row, index) => {
            const savedRow = savedSettings[index];
            return (
                !savedRow ||
                row.key !== savedRow.key ||
                row.value !== savedRow.value ||
                row.description !== savedRow.description
            );
        });

        localStorage.setItem(GLOBAL_SETTINGS, JSON.stringify(rows));
        setUnsavedChanges(false);

        const changesSummary = changedSettings
            .map(
                (change) =>
                    `<strong>Key:</strong> ${change.key}<br><strong>Value:</strong> ${change.value}<br><strong>Description:</strong> ${change.description}`
            )
            .join("<hr>");

        setModalInfo({
            isOpen: true,
            title: "Saved Changes",
            message: changedSettings.length
                ? `The following settings were saved:<br>${changesSummary}`
                : "No changes were made.",
        });

    };

    // Restore settings from local storage
    const handleRevert = () => {
        const savedSettings = localStorage.getItem(GLOBAL_SETTINGS);
        if (savedSettings) {
            setRows(JSON.parse(savedSettings));
            setUnsavedChanges(false);
            setModalInfo({
                isOpen: true,
                message: "Settings restored from saved version!",
            });
        } else {
            setModalInfo({
                isOpen: true,
                message: "No saved settings to restore!",
            });
        }
    };

    // Alert user about unsaved changes when closing the panel
    const handleClose = () => {
        if (unsavedChanges) {
            setModalInfo({
                isOpen: true,
                message: "You have unsaved changes. Are you sure you want to close?",
                isConfirmDialog: true,
                confirmAction: () => {
                    setModalInfo({ isOpen: false, message: "" });
                    onClose();
                },
                cancelAction: () => setModalInfo({ isOpen: false, message: "" }),
            });
        } else {
            onClose();
        }
    };

    return (
        <div className="setting-panel">
            <div className="setting-panel-header">
                <h2>Settings</h2>
                <div className="right-buttons">
                    <button onClick={handleRevert} className="revert-button" title="Revert">
                        <FontAwesomeIcon icon={faUndo} />
                    </button>
                    <button onClick={handleSave} className="save-button" title="Save">
                        <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button onClick={handleClose} className="close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>
            <div className="setting-panel-body">
                <table className="settings-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={rows.every((row) => row.selected)}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th>Key</th>
                            <th>Value</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={row.selected}
                                        onChange={(e) =>
                                            updateRow(index, "selected", e.target.checked)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.key}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.value}
                                        onChange={(e) =>
                                            updateRow(index, "value", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.description}
                                        onChange={(e) =>
                                            updateRow(index, "description", e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                isOpen={modalInfo.isOpen}
                onRequestClose={() => setModalInfo({ isOpen: false, message: "" })}
                className="custom-modal"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            >
                <div className="custom-modal-title-bar">{modalInfo.title || "Notification"}</div>
                <div
                    className="custom-modal-content"
                    dangerouslySetInnerHTML={{ __html: modalInfo.message }}
                ></div>
                <div className="custom-modal-buttons">
                    {modalInfo.isConfirmDialog && modalInfo.cancelAction && (
                        <button
                            onClick={modalInfo.cancelAction}
                            className="custom-modal-button cancel"
                        >
                            Cancel
                        </button>
                    )}
                    {modalInfo.isConfirmDialog && modalInfo.confirmAction && (
                        <button
                            onClick={modalInfo.confirmAction}
                            className="custom-modal-button ok"
                        >
                            Confirm
                        </button>
                    )}
                    {!modalInfo.isConfirmDialog && (
                        <button
                            onClick={() => setModalInfo({ isOpen: false, message: "" })}
                            className="custom-modal-button ok"
                        >
                            OK
                        </button>
                    )}
                </div>
            </Modal>

        </div>
    );
};
