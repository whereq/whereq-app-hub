import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHexagonNodes,
  faMap,
  faCat,
  faDog,
  faFish,
  faPaw,
  faHorse,
  faBone,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "./appLauncher.css";

export const AppLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const adjustPosition = () => {
      if (launcherRef.current && menuRef.current) {
        const buttonRect = launcherRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();

        // Ensure the dropdown opens left-aligned
        if (buttonRect.left + menuRect.width > window.innerWidth) {
          menuRef.current.style.right = "0";
          menuRef.current.style.left = "auto";
        } else {
          menuRef.current.style.left = "0";
          menuRef.current.style.right = "auto";
        }
      }
    };

    adjustPosition();
    window.addEventListener("resize", adjustPosition);
    return () => window.removeEventListener("resize", adjustPosition);
  }, [isOpen]);

  // App List with routes
  const apps = [
    { name: "User", icon: faUser, path: "/" },
    { name: "API Explorer", icon: faHexagonNodes, path: "/api-explorer" },
    { name: "Map", icon: faMap, path: "/map" },
    { name: "CatFact", icon: faCat, path: "/catFact" },
    { name: "Dogs", icon: faDog, path: "/dogs" },
    { name: "Paws", icon: faPaw, path: "/paws" },
    { name: "Fish", icon: faFish, path: "/fish" },
    { name: "Horses", icon: faHorse, path: "/horses" },
    { name: "Bones", icon: faBone, path: "/bones" },
  ];

  return (
    <div className="app-launcher relative" ref={launcherRef}>
      {/* Nine-Dot Button */}
      <button
        className="launcher-button flex items-center justify-center"
        onClick={toggleMenu}
        aria-label="App Launcher"
      >
        <div className="dot-grid grid grid-cols-3 gap-[1px]">
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className="dot w-1 h-1 bg-gray-600 rounded-full"
            ></div>
          ))}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="menu-dropdown absolute mt-2 bg-white shadow-lg rounded-lg"
        >
          <div className="grid grid-cols-3 gap-4 p-4">
            {apps.map((app, index) => (
              <Link
                key={index}
                to={app.path}
                onClick={() => setIsOpen(false)}
                className="app-item flex flex-col items-center text-center hover:bg-gray-100 p-2 rounded"
              >
                <FontAwesomeIcon
                  icon={app.icon}
                  className="text-blue-500 text-2xl mb-1"
                />
                <span className="app-name text-gray-700 text-sm truncate">
                  {app.name}
                </span>
                <span className="app-name-tooltip absolute bg-gray-100 text-gray-700 text-xs p-1 rounded shadow-md opacity-0 pointer-events-none transition-opacity">
                  {app.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};