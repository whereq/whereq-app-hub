import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { RestfulEndpoint } from "@models/RestfulEndpoint";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import LocalStorageHelper from "@utils/localStorageHelper";

type CurlTabProps = {
    restfulEndpoint?: RestfulEndpoint;
    onCopy?: () => void; // Optional callback when the command is copied
};

export const CurlTab = ({ restfulEndpoint, onCopy }: CurlTabProps) => {

    const constructCurlCommand = () => {
        if (!restfulEndpoint) return "No endpoint selected.";

        const baseCommand = `curl -X ${restfulEndpoint.method.toUpperCase()} "${restfulEndpoint.url}"`;

        let headers = LocalStorageHelper.getHeaders(restfulEndpoint.url);
        headers = headers ? headers : restfulEndpoint.headers || {};
        const headerLines = Object.entries(headers)
            .map(([key, value]) => `-H "${key}: ${value}"`);

        let params = LocalStorageHelper.getParams(restfulEndpoint.url);
        params = params ? params : restfulEndpoint.params || {};

        const paramString = Object.entries(params)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join("&");

        let curlCommand = baseCommand;

        // Add headers
        if (headerLines.length > 0) {
            curlCommand += ` \\\n  ${headerLines.join(" \\\n  ")}`;
        }

        // Add parameters
        if (paramString) {
            const paramLine = `-d "${paramString}"`;
            // Check line length to decide whether to split
            if (paramLine.length > 80) {
                curlCommand += ` \\\n  ${paramLine}`;
            } else {
                curlCommand += ` ${paramLine}`;
            }
        }

        return curlCommand;
    };


    const handleCopy = () => {
        const command = constructCurlCommand();
        navigator.clipboard.writeText(command).then(
            () => {
                if (onCopy) onCopy();
                alert("Curl command copied!");
            },
            () => alert("Failed to copy curl command.")
        );
    };

    const curlCommand = constructCurlCommand();

    return (
        <div className="flex flex-col space-y-4 h-full">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold ml-2">curl </h3>
                </div>
                <button
                    className="copy-button text-blue-500 hover:text-blue-700 mr-2"
                    onClick={handleCopy}
                >
                    <FontAwesomeIcon icon={faCopy} />
                </button>
            </div>
            <div className="bg-gray-700 p-4 overflow-x-auto text-left">
                <SyntaxHighlighter
                    language="bash"
                    style={{
                        ...materialDark,
                        'pre[class*="language-"]': {
                            backgroundColor: "transparent", // Remove SyntaxHighlighter's default background color
                        },
                        'code[class*="language-"]': {
                            backgroundColor: "transparent", // Remove the default background color for <code>
                        },
                    }}
                    wrapLines={true}
                    customStyle={{
                        backgroundColor: "transparent",
                        padding: 0,
                        fontSize: "0.875rem",
                        fontFamily: "Fira Code, monospace",
                        color: "text-orange-300",
                    }}
                >
                    {curlCommand}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
