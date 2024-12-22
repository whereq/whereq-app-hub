import { ResponseCookie } from "@models/ResponseCookie";
import "./cookiesTab.css";

export const CookiesTab = ({ cookies }: { cookies: ResponseCookie[] }) => {
    if (!cookies || cookies.length === 0) {
        return <div className="no-cookies-message">No cookies available</div>;
    }

    return (
        <table className="cookies-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Domain</th>
                    <th>Path</th>
                    <th>Expires</th>
                    <th>HttpOnly</th>
                    <th>Secure</th>
                </tr>
            </thead>
            <tbody>
                {cookies.map((cookie, index) => (
                    <tr key={index}>
                        <td>{cookie.Name}</td>
                        <td>{cookie.Value}</td>
                        <td>{cookie.Domain || ""}</td>
                        <td>{cookie.Path || ""}</td>
                        <td>{cookie.Expires || ""}</td>
                        <td>{cookie.HttpOnly || ""}</td>
                        <td>{cookie.Secure || ""}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
