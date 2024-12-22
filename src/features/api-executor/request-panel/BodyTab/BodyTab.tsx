import { useState } from "react";

export const BodyTab = () => {
    const [selectedOption, setSelectedOption] = useState("none");

    const renderBodyContent = () => {
        switch (selectedOption) {
            case "form-data":
                return <div>Form Data Editor</div>;
            case "x-www-form-urlencoded":
                return <div>URL-encoded Editor</div>;
            case "raw":
                return (
                    <textarea
                        placeholder="Raw JSON or text here..."
                        className="w-full h-full p-2 border rounded"
                    />
                );
            case "binary":
                return (
                    <input
                        type="file"
                        className="w-full p-2 border rounded"
                    />
                );
            case "GraphQL":
                return (
                    <textarea
                        placeholder="GraphQL Query here..."
                        className="w-full h-full p-2 border rounded"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="body-tab h-full flex flex-col">
            {/* Top: Radio Buttons */}
            <div className="radio-group flex gap-4 p-2 bg-gray-100 border-b">
                {[
                    "none",
                    "form-data",
                    "x-www-form-urlencoded",
                    "raw",
                    "binary",
                    "GraphQL",
                ].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-gray-700">
                        <input
                            type="radio"
                            value={option}
                            checked={selectedOption === option}
                            onChange={() => setSelectedOption(option)}
                            className="accent-blue-500"
                        />
                        {option}
                    </label>
                ))}
            </div>

            {/* Bottom: Dynamic Content Panel */}
            <div className="content-panel flex-1 p-4 overflow-y-auto">
                {renderBodyContent()}
            </div>
        </div>
    );
};
