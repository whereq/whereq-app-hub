import React, { useState, useEffect } from "react";
import "./urlPanel.css";

interface UrlPanelProps {
    url?: string;
    onSendRequest: () => void;
}

export const UrlPanel: React.FC<UrlPanelProps> = ({ url, onSendRequest }) => {
    const [inputValue, setInputValue] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isValidUrl, setIsValidUrl] = useState<boolean>(false);

    useEffect(() => {
        // Set dummy URL as placeholder if `url` is empty
        if (!url && !isFocused) {
            setInputValue("");
        } else if (url) {
            setInputValue(url);
        }
    }, [url, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (!inputValue.trim() && !url) {
            setInputValue(""); // Reset to empty for placeholder
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        validateUrl(newValue);
    };

    const validateUrl = (value: string) => {
        const urlPattern = new RegExp(
            "^(https?://)" + // Protocol (http or https)
            "([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})" + // Domain
            "(:\\d+)?(/.*)?$", // Optional port and path
            "i"
        );
        setIsValidUrl(urlPattern.test(value));
    };

    useEffect(() => {
        // Initial validation for the passed URL prop
        if (url) {
            validateUrl(url);
        }
    }, [url]);

    return (
        <div className="url-panel flex items-center">
            <input
                type="text"
                className={`endpoint-input ${!isFocused && !inputValue ? "placeholder" : ""}`}
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={!isFocused && !inputValue ? "https://api.example.com/endpoint" : ""}
            />
            <button
                className={`send-button bg-blue-500 text-white px-4 py-1 ml-2 ${
                    !isValidUrl ? "send-button-disabled" : ""
                }`}
                onClick={onSendRequest}
                disabled={!isValidUrl}
            >
                Send
            </button>
        </div>
    );
};
