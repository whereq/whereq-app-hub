import { useCallback, useEffect, useState } from "react";
import { RestfulEndpoint } from "@models/RestfulEndpoint";
import { TitleBar } from "./title-bar/TitleBar";
import { UrlPanel } from "./request-panel/UrlPanel/UrlPanel";
import { RequestPanel } from "@features/api-executor/request-panel/RequestPanel";
import { ResponseContent } from "@models/ResponseContent";
import { ResponsePanel } from "@features/api-executor/response-panel/ResponsePanel";
import { ResponseCookie } from "@models/ResponseCookie";
import { sendRequest } from "./apiExecutorUtil"; // Import sendRequest

import "./apiExecutor.css";
import { NetworkInformation } from "@models/NetworkInformation";

export const ApiExecutor = ({ endpoint }: { endpoint?: RestfulEndpoint | null }) => {
    const [updatedParams, setUpdatedParams] = useState<Record<string, string>>(endpoint?.params || {});
    const [updatedHeaders, setUpdatedHeaders] = useState<Record<string, string>>(endpoint?.headers || {});
    const [updatedUrl, setUpdatedUrl] = useState(endpoint?.url || "");
    const [middlePanelHeight, setMiddlePanelHeight] = useState(30);
    const [isResizing, setIsResizing] = useState(false);
    const [response, setResponse] = useState<ResponseContent | null>(null);
    const [cookies, setCookies] = useState<ResponseCookie[]>([]);
    const [headers, setHeaders] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [networkInfo, setNetworkInfo] = useState<NetworkInformation | undefined>(undefined);

    useEffect(() => {
        if (endpoint) {
            setUpdatedParams(endpoint.params || {});
            setUpdatedHeaders(endpoint.headers || {});
            setUpdatedUrl(endpoint.url.toString());
            setResponse(null);
        } else {
            setUpdatedUrl("");
            setUpdatedParams({});
            setUpdatedHeaders({});
            setResponse(null);
        }
    }, [endpoint]);

    useEffect(() => {
        if (endpoint) {
            const url = new URL(endpoint.url);
            Object.keys(updatedParams).forEach((key) => {
                const value = updatedParams[key];
                if (key && value && value.trim() !== '') {
                    url.searchParams.set(key, value);
                }
            });
            setUpdatedUrl(url.toString());
        }
    }, [updatedParams, endpoint]);

    const handleParamsChange = useCallback((updatedParams: Record<string, string>) => {
        setUpdatedParams(updatedParams);
        if (endpoint) {
            const url = new URL(endpoint.url);
            Object.keys(updatedParams).forEach((key) => {
                if (updatedParams[key]) {
                    url.searchParams.set(key, updatedParams[key]);
                } else {
                    url.searchParams.delete(key);
                }
            });
            setUpdatedUrl(url.toString());
        }
    }, [endpoint]);

    const handleHeadersChange = useCallback((updated: Record<string, string>) => {
        setUpdatedHeaders(updated);
    }, []);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const panel = document.querySelector(".api-executor") as HTMLElement;
        const totalHeight = panel.getBoundingClientRect().height;
        const newMiddleHeight = ((e.clientY - panel.offsetTop) / totalHeight) * 100;
        if (newMiddleHeight > 10 && newMiddleHeight < 80) {
            setMiddlePanelHeight(newMiddleHeight);
        }
    };

    const stopResizing = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", stopResizing);
    };

    const startResizing = () => {
        setIsResizing(true);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stopResizing);
    };

    const handleSendRequest = async () => {
        if (!endpoint) return;

        const result = await sendRequest(endpoint, updatedParams, updatedHeaders);

        if (result.error) {
            setResponse({type: "markdown", content: result.error});
            setStatus(result.status);
        } else {
            setResponse({type: "json", content: result.data});
            setCookies(result.cookies || []);
            setHeaders(result.networkInformation?.headers || {});
            setStatus(result.networkInformation?.status ?? null);
            setResponseTime(result.networkInformation?.responseTime || 0);
            setNetworkInfo(result.networkInformation || undefined);
        }
    };

    return (
        <div className="api-executor flex flex-col h-full">
            <TitleBar title={endpoint?.title || "Select an endpoint from the Index Panel"} />
            <UrlPanel url={updatedUrl} onSendRequest={handleSendRequest} />
            <RequestPanel
                restfulEndpoint={endpoint ?? undefined}
                onParamsChange={handleParamsChange}
                onHeadersChange={handleHeadersChange}
                headers={updatedHeaders}
                onResize={startResizing}
                style={{ height: `${middlePanelHeight}%` }}
            />
            <ResponsePanel
                height={100 - middlePanelHeight}
                response={response}
                cookies={cookies}
                headers={headers}
                status={status}
                responseTime={responseTime}
                networkInformation={networkInfo}
            />
        </div>
    );
};