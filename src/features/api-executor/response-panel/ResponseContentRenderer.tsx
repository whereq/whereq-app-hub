import ReactMarkdown from "react-markdown";
import { ResponseContent } from "@models/ResponseContent";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // Choose a theme you like
import remarkGfm from "remark-gfm"; // Support GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw"; // Allow rendering raw HTML within Markdown

import "./responseContentRenderer.css"

// Custom style overrides for SyntaxHighlighter
const customStyle = {
    padding: "0", // Removes padding
    margin: "0", // Align with the parent container
    borderRadius: "0", // Removes border radius
};

export const ResponseContentRenderer = (response: ResponseContent) => {
    switch (response.type) {
        case "json":
            return (
                <SyntaxHighlighter
                    language="json"
                    style={oneDark}
                    className="response-body"
                    customStyle={customStyle} // Apply custom styles
                    wrapLongLines={true} // Ensures long lines are wrapped
                >
                    {JSON.stringify(response.content, null, 2)}
                </SyntaxHighlighter>
            );
        case "markdown":
            return (
                <div className="response-body markdown-content dark-theme">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            code({ inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {response.content as string}
                    </ReactMarkdown>
                </div>
            );
        default:
            return <div className="response-body">Unsupported response type</div>;
    }
};
