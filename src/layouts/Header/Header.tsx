import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faChalkboard, faInfoCircle, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useLocation } from "react-router-dom";
import { AppLauncher } from "@components/app-launcher/AppLauncher";
import { useAppStore } from "@store/store";
import { useNavigationStore } from "@store/store"; // Import the navigation store
import { routeTitles } from "@utils/utils";
import { APPLICATION_NAME } from "@utils/constants";

export const Header = () => {
  const { setAppDrawerOpen } = useAppStore();
  const { path } = useNavigationStore(); // Get the current path from the store
  const location = useLocation();

  // Determine the current feature title
  const currentTitle = routeTitles[location.pathname] || "";

  // Function to close the AppLauncher
  const closeAppDrawer = () => {
    setAppDrawerOpen(false);
  };

  // Build the navigation path
  const buildNavigationPath = () => {
    let navigationPath = APPLICATION_NAME;

    if (currentTitle) {
      navigationPath += ` -> ${currentTitle}`;
    }

    if (path && path.length > 0) {
      navigationPath += ` -> ${path.join(" -> ")}`;
    }

    return navigationPath;
  };

  return (
    <header className="fixed top-0 left-0 right-0 
                       z-10 bg-blue-900 text-orange-300 
                       border-b-2 border-orange-700 
                       shadow-md h-[3.125rem]">
      <div className="w-full h-full flex items-center justify-between px-4">
        {/* App Title with Navigation Path */}
        <h1 className="text-lg font-bold font-fira-code">
          {buildNavigationPath()} {/* Display the navigation path */}
        </h1>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-4">
          <NavLink
            to="/"
            title="Home"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
            onClick={closeAppDrawer} // Close AppLauncher on click
          >
            <FontAwesomeIcon icon={faHome} size="lg" />
          </NavLink>
          <NavLink
            to="/event-board"
            title="App Event Board"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
            onClick={closeAppDrawer} // Close AppLauncher on click
          >
            <FontAwesomeIcon icon={faChalkboard} size="lg" />
          </NavLink>
          <NavLink
            to="/about"
            title="About"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
            onClick={closeAppDrawer} // Close AppLauncher on click
          >
            <FontAwesomeIcon icon={faInfoCircle} size="lg" />
          </NavLink>
          <NavLink
            to="/contact"
            title="Contact Us"
            className={({ isActive }) =>
              `hover:text-orange-400 transition-colors ${isActive ? "text-orange-400" : ""}`
            }
            onClick={closeAppDrawer} // Close AppLauncher on click
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
            onClick={closeAppDrawer} // Close AppLauncher on click
          >
            <FontAwesomeIcon icon={faUser} size="lg" />
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;