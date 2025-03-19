import { useState } from "react";
import { useAuth } from "@contexts/AuthContext";

export const AuthButton = () => {
  const { isAuthenticated, user, signOut, signIn } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignIn = () => {
    signIn({ name: "John Doe", profilePicture: "https://via.placeholder.com/32" });
  };

  const handleSignOut = () => {
    signOut();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      {!isAuthenticated ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => setShowMenu(!showMenu)}
        >
          Sign In / Sign Up
        </button>
      ) : (
        <img
          src={user?.profilePicture}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        />
      )}

      {showMenu && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 p-2 border border-gray-200">
          {!isAuthenticated ? (
            <>
              <button
                className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={handleSignIn}
              >
                Sign In
              </button>
              <button
                className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 mt-2"
                onClick={() => alert("Redirect to Sign Up")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => alert("Go to Account Details")}
              >
                Account Details
              </button>
              <button
                className="w-full text-left px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 mt-2"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
