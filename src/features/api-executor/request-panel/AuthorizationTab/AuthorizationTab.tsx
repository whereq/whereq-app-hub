import { useState } from "react";
import { ApiKeyAuth } from "./ApiKeyAuth"; // Import the new component

export const AuthorizationTab = () => {
    const [authType, setAuthType] = useState("No Auth");

    const renderAuthInputs = () => {
        switch (authType) {
            case "Basic Auth":
                return (
                    <div className="auth-inputs flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Username"
                            className="border p-2 rounded"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="border p-2 rounded"
                        />
                    </div>
                );
            case "Bearer Token":
                return (
                    <div className="auth-inputs">
                        <input
                            type="text"
                            placeholder="Token"
                            className="border p-2 rounded w-full"
                        />
                    </div>
                );
            case "API Key":
                return <ApiKeyAuth />; // Use the new ApiKeyAuth component
            default:
                return null;
        }
    };

    return (
        <div className="authorization-tab flex h-full">
            {/* Left Part: Auth Type Selector */}
            <div className="auth-type-selector w-1/3 p-4 border-r border-gray-200">
                <label className="block text-gray-700 font-semibold mb-2">
                    Auth Type:
                </label>
                <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="No Auth">No Auth</option>
                    <option value="Basic Auth">Basic Auth</option>
                    <option value="Bearer Token">Bearer Token</option>
                    <option value="API Key">API Key</option>
                </select>
            </div>

            {/* Right Part: Dynamic Auth Inputs */}
            <div
                className="auth-inputs-container w-2/3 p-4 overflow-y-auto"
                style={{ maxHeight: "calc(100% - 8px)" }} // Adjust for padding
            >
                {renderAuthInputs()}
            </div>
        </div>
    );
};
