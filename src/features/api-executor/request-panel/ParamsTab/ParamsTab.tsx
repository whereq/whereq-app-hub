import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./paramsTab.css";
import { TAB_TYPES, PLACEHOLDERS, LABELS } from "@utils/constants";
import { RestfulEndpoint } from "@models/RestfulEndpoint";

export const ParamsTab = ({
    restfulEndpoint,
    onParamsChange,
    tabType = TAB_TYPES.PARAMETERS,
    initialParams = {},
}: {
    restfulEndpoint?: RestfulEndpoint;
    onParamsChange: (updatedParams: Record<string, string>) => void;
    tabType?: string;
    initialParams?: Record<string, string>;
}) => {
    interface Row {
        selected: boolean;
        key: string;
        value: string;
        description: string;
    }

    // State to track parameters for each endpoint by URL
    const [endpointParamsState, setEndpointParamsState] = useState<{
        [url: string]: Row[];
    }>({});

    // Current rows displayed in the table
    // const [rows, setRows] = useState<Row[]>([]);
    const [rows, setRows] = useState<Row[]>(
        Object.entries(initialParams).map(([key, value]) => ({
            selected: true,
            key,
            value,
            description: "",
        }))
    );

    // Effect 1: Handle endpoint switching
    useEffect(() => {
        if (!restfulEndpoint) return;

        const { url, params } = restfulEndpoint;

        setRows(() => {
            // Load rows from state or initialize from endpoint params
            return (
                endpointParamsState[url] ??
                Object.entries(params || {}).map(([key, value]) => ({
                    selected: true,
                    key,
                    value,
                    description: "",
                }))
            );
        });
    }, [restfulEndpoint?.url]); // Only re-run if the endpoint URL changes

    // Effect 2: Reflect rows into endpoint state and propagate changes
    useEffect(() => {
        if (!restfulEndpoint) return;

        const { url } = restfulEndpoint;

        // Update endpointParamsState only if rows actually changed
        setEndpointParamsState((prevState) => {
            const currentState = prevState[url] ?? [];
            if (JSON.stringify(currentState) === JSON.stringify(rows)) {
                return prevState; // Prevent unnecessary updates
            }
            return {
                ...prevState,
                [url]: rows,
            };
        });

        // Propagate selected params to parent
        const updatedParams = rows.reduce((acc, row) => {
            if (row.selected && row.key && row.value) {
                acc[row.key] = row.value;
            }
            return acc;
        }, {} as Record<string, string>);

        onParamsChange(updatedParams);
    }, [rows]); // Only re-run if `rows` changes

    const updateRow = (index: number, field: string, value: string | boolean) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index] = { ...updatedRows[index], [field]: value };
            return updatedRows;
        });
    };

    const addRow = () => {
        setRows((prevRows) => [
            ...prevRows,
            { selected: false, key: "", value: "", description: "" },
        ]);
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
        <div className="params-tab">
            <table className="params-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={rows.every((row) => row.selected)}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                            />
                        </th>
                        <th>
                            {tabType === TAB_TYPES.HEADERS
                                ? PLACEHOLDERS.HEADER_NAME
                                : PLACEHOLDERS.PARAM_KEY}
                        </th>
                        <th>{LABELS.VALUE}</th>
                        <th>{LABELS.DESCRIPTION}</th>
                        <th>{LABELS.ACTION}</th>
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
                                    placeholder={
                                        tabType === TAB_TYPES.HEADERS
                                            ? PLACEHOLDERS.HEADER_NAME
                                            : PLACEHOLDERS.PARAM_KEY
                                    }
                                    onChange={(e) =>
                                        updateRow(index, "key", e.target.value)
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={row.value}
                                    placeholder="Value"
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
                            <td>
                                <button
                                    className="icon-button"
                                    onClick={() => deleteRow(index)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="add-row-button" onClick={addRow}>
                Add Row
            </button>
        </div>
    );
};
