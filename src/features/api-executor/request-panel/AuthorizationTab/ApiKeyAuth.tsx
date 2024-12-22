import { useState } from "react";

export const ApiKeyAuth = () => {
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const [addTo, setAddTo] = useState("Header");

    return (
        <div className="api-key-auth flex flex-col gap-4">
            <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border p-2 rounded"
            />
            <div>
                <label className="block text-gray-700 font-semibold mb-2">
                    Add to:
                </label>
                <select
                    value={addTo}
                    onChange={(e) => setAddTo(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="Header">Header</option>
                    <option value="Query Params">Query Params</option>
                </select>
            </div>
        </div>
    );
};
