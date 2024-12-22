import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { 
    getLocalSettings, 
    loadDefaultLocalSettings, 
    updateLocalSetting 
} from "@utils/localSettingsLoader";
import "./settingsTab.css";
import { RestfulEndpoint } from "@models/RestfulEndpoint";

type SettingsTabProps = {
    restfulEndpoint?: RestfulEndpoint;
};

export const SettingsTab = ({ restfulEndpoint }: SettingsTabProps) => {
    const [rows, setRows] = useState(getLocalSettings(restfulEndpoint?.url));

    // Load default settings when the tab is activated
    useEffect(() => {
        loadDefaultLocalSettings(); // Reload default settings
        setRows(getLocalSettings(restfulEndpoint?.url)); // Fetch updated settings
    }, [restfulEndpoint?.url]); // Runs when restfulEndpoint.url changes

    const updateRow = (index: number, field: string, value: string | boolean) => {
        const updatedRows = [...rows];
        updatedRows[index] = { ...updatedRows[index], [field]: value };
        setRows(updatedRows);
        if (restfulEndpoint?.url) {
            updateLocalSetting(restfulEndpoint.url, updatedRows[index].key, updatedRows[index].value as string | boolean);
        }
    };

    return (
        <div className="settings-tab">
            <div className="setting-panel-body">
                <table className="settings-table">
                    <tbody>
                        {rows.map((row: { key: string; keyName: string; valueType: string; value: string | number | boolean }, index: number) => (
                            <tr key={row.key}>
                                <td>
                                    <input
                                        type="text"
                                        value={row.keyName}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </td>
                                <td>
                                    {row.valueType === "boolean" ? (
                                        <button
                                            onClick={() =>
                                                updateRow(index, "value", !(row.value as boolean))
                                            }
                                            className="toggle-button"
                                            aria-label={`Toggle ${row.keyName}`}
                                        >
                                            <FontAwesomeIcon
                                                icon={row.value ? faToggleOn : faToggleOff}
                                                className={`text-2xl ${
                                                    row.value ? "text-blue-500" : "text-gray-500"
                                                }`}
                                            />
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            value={row.value as string}
                                            onChange={(e) =>
                                                updateRow(index, "value", e.target.value)
                                            }
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
