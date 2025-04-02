import { useEffect, useState } from "react";
import { AuthContext } from "@contexts/AuthContextInstance";
import KeycloakService from "@services/keycloak";
import type { AuthContextType } from "@contexts/AuthContextTypes";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Omit<AuthContextType, 'login' | 'logout' | 'register'>>({
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = await KeycloakService.init();
        setState({
          isAuthenticated: authenticated,
          isLoading: false
        });
      } catch (error) {
        console.error("Keycloak initialization failed:", error);
        setState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login: () => KeycloakService.getInstance().login(),
    logout: () => KeycloakService.getInstance().logout(),
    register: () => KeycloakService.getInstance().register()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext } from "@contexts/AuthContextInstance";