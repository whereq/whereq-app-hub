import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { AppLauncher } from "@components/app-launcher/AppLauncher"; // Ensure the path is correct
import "./header.css";

export const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                {/* App Title */}
                <h1 className="app-title">WhereQ App Hub</h1>

                {/* Navigation Menu */}
                <nav className="header-nav">
                    <NavLink to="/" title="Home">
                        <FontAwesomeIcon icon={faHome} size="lg" />
                    </NavLink>
                    <NavLink to="/about" title="About">
                        <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                    </NavLink>
                    <NavLink to="/contact" title="Contact Us">
                        <FontAwesomeIcon icon={faEnvelope} size="lg" />
                    </NavLink>

                    {/* AppLauncher */}
                    <AppLauncher />

                    <NavLink to="/signin" title="Sign In/Sign Up">
                        <FontAwesomeIcon icon={faUser} size="lg" />
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};
