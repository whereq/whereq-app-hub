import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { AppLauncher } from "@components/app-launcher/AppLauncher";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-blue-900 text-orange-300 shadow-md h-[3.75rem]">
      <div className="w-full h-full flex items-center justify-between px-4">
        {/* App Title */}
        <h1 className="text-lg font-bold font-mono">WhereQ App Hub</h1>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-4">
          <NavLink
            to="/"
            title="Home"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
          >
            <FontAwesomeIcon icon={faHome} size="lg" />
          </NavLink>
          <NavLink
            to="/about"
            title="About"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} size="lg" />
          </NavLink>
          <NavLink
            to="/contact"
            title="Contact Us"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
          >
            <FontAwesomeIcon icon={faEnvelope} size="lg" />
          </NavLink>

          {/* AppLauncher */}
          <AppLauncher />

          <NavLink
            to="/signin"
            title="Sign In/Sign Up"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
          >
            <FontAwesomeIcon icon={faUser} size="lg" />
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;