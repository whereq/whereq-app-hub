import "./responseHeadersTab.css";

export const ResponseHeadersTab = ({
    headers,
}: {
    headers?: Record<string, string>;
}) => {
    if (!headers || Object.keys(headers).length === 0) {
        return <div className="empty-headers">No headers available</div>;
    }

    return (
        <div className="response-headers-tab">
            <table className="headers-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(headers).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
