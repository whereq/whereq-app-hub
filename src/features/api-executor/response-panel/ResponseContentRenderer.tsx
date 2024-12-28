import ReactMarkdown from "react-markdown";
import { ResponseContent } from "@models/ResponseContent";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // Choose a theme you like
import remarkGfm from "remark-gfm"; // Support GitHub Flavored Markdown (tables, strikethrough, etc.)
import rehypeRaw from "rehype-raw"; // Allow rendering raw HTML within Markdown

export const ResponseContentRenderer = (response: ResponseContent) => {
    switch (response.type) {
        case "json":
            return (
                <div style={{ maxWidth: "100%", overflow: "auto", height: "100%" }}>
                    <SyntaxHighlighter
                        language="json"
                        style={oneDark}
                        className="response-body"
                        customStyle={{ padding: "0", margin: "0", borderRadius: "0", height: "100%" }} // Apply custom styles
                        wrapLongLines={true} // Ensures long lines are wrapped
                    >
                        {JSON.stringify(response.content, null, 2)}
                    </SyntaxHighlighter>
                </div>
            );
        case "markdown":
            return (
                <div className="response-body markdown-content dark-theme"
                    style={{ maxWidth: "100%", overflow: "auto", height: "100%" }}
                >
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
            return <div className="response-body" style={{ maxWidth: "100%", overflowX: "auto", height: "100%" }}>Unsupported response type</div>;
    }
};