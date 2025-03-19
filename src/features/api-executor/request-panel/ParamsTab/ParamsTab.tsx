import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { TAB_TYPES, PLACEHOLDERS, LABELS } from "@utils/constants";
import LocalStorageHelper from "@utils/localStorageHelper";

export const ParamsTab = ({
    restfulEndpointUrl,
    tabType = TAB_TYPES.PARAMETERS,
    initialParams = {},
}: {
    restfulEndpointUrl: string;
    tabType?: string;
    initialParams?: Record<string, string>;
}) => {
    interface Row {
        selected: boolean;
        key: string;
        value: string;
        description: string;
    }

    const [rows, setRows] = useState<Row[]>([]);
    const restfulEndpointUrlRef = useRef(restfulEndpointUrl);

    // Update the ref whenever restfulEndpointUrl changes
    useEffect(() => {
        restfulEndpointUrlRef.current = restfulEndpointUrl;
    }, [restfulEndpointUrl]);


    // Initialize rows with the passed-in initialParams
    useEffect(() => {
        const initialRows = Object.entries(initialParams).map(([key, value]) => ({
            selected: true,
            key,
            value,
            description: "",
        }));
        setRows(initialRows);
    }, [initialParams]);

    // Persist changes to local storage when rows change
    useEffect(() => {
        const params = rows
            .filter((row) => row.selected && row.key)
            .reduce((acc, row) => {
                acc[row.key] = row.value;
                return acc;
            }, {} as Record<string, string>);

        // Persist to local storage based on tab type
        if (tabType === TAB_TYPES.PARAMETERS) {
            LocalStorageHelper.setParams(restfulEndpointUrlRef.current, params);
        } else if (tabType === TAB_TYPES.HEADERS) {
            LocalStorageHelper.setHeaders(restfulEndpointUrlRef.current, params);
        }
    }, [rows, tabType]);

    const updateRow = (index: number, field: string, value: string | boolean) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index] = { ...updatedRows[index], [field]: value };
            return updatedRows;
        });
    };

    const insertRow = (index: number) => {
        setRows((prevRows) => {
            const newRow = { selected: false, key: "", value: "", description: "" };
            return [
                ...prevRows.slice(0, index + 1),
                newRow,
                ...prevRows.slice(index + 1),
            ];
        });
    };

    const deleteRow = (index: number) => {
        setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    };

    const toggleSelectAll = (checked: boolean) => {
        setRows((prevRows) =>
            prevRows.map((row) => ({ ...row, selected: checked }))
        );
    };

    return (
        <div
            className="params-tab bg-gray-900 text-orange-300 font-fira-code overflow-x-auto"
            style={{ minWidth: "27rem" }}
        >
            <div className="grid grid-cols-[3%,20%,30%,40%,7%] border-b border-gray-700 sticky top-0 bg-gray-800 text-sm text-gray-400">
                <div className="flex items-center justify-center border-r border-gray-700">
                    <input
                        type="checkbox"
                        checked={rows.every((row) => row.selected)}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="h-4 w-4"
                    />
                </div>
                <div className="pl-2 border-r border-gray-700">
                    {tabType === TAB_TYPES.HEADERS
                        ? PLACEHOLDERS.HEADER_NAME
                        : PLACEHOLDERS.PARAM_KEY}
                </div>
                <div className="pl-2 border-r border-gray-700">{LABELS.VALUE}</div>
                <div className="pl-2 border-r border-gray-700">
                    {LABELS.DESCRIPTION}
                </div>
                <div className="pl-2">{LABELS.ACTION}</div>
            </div>
            <div className="overflow-y-auto max-h-64">
                {rows.map((row, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-[3%,20%,30%,40%,7%] border-b border-gray-700"
                    >
                        <div className="flex items-center justify-center border-r border-gray-700">
                            <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={(e) =>
                                    updateRow(index, "selected", e.target.checked)
                                }
                                className="h-4 w-4"
                            />
                        </div>
                        <div className="pl-2 border-r border-gray-700">
                            <input
                                type="text"
                                value={row.key}
                                placeholder={
                                    tabType === TAB_TYPES.HEADERS
                                        ? PLACEHOLDERS.HEADER_NAME
                                        : PLACEHOLDERS.PARAM_KEY
                                }
                                onChange={(e) =>
                                    updateRow(index, "key", e.target.value)
                                }
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                        <div className="pl-2 border-r border-gray-700">
                            <input
                                type="text"
                                value={row.value}
                                placeholder="Value"
                                onChange={(e) =>
                                    updateRow(index, "value", e.target.value)
                                }
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                        <div className="pl-2 border-r border-gray-700">
                            <input
                                type="text"
                                value={row.description}
                                onChange={(e) =>
                                    updateRow(index, "description", e.target.value)
                                }
                                className="w-full bg-transparent border-none outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                className="icon-button text-blue-500 hover:text-blue-600"
                                onClick={() => insertRow(index)}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                            <button
                                className="icon-button text-red-500 hover:text-red-600"
                                onClick={() => deleteRow(index)}
                            >
                                <FontAwesomeIcon icon={faMinus} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};