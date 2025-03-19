import { AuthProvider } from "@contexts/AuthContext";
import { AppRouter } from "@router/AppRouter";
import MapProvider from "@components/map/MapProvider";
import { useEffect, useState } from "react";
import LocalStorageHelper from "@utils/localStorageHelper";
import { MAP_LOCAL_STORAGE_KEYS, API_KEY } from "@features/map/utils/constants";

const App = () => {
	// const [googleMapApiKey, setGoogleMapApiKey] = useState(""); // Default to empty API key
	// const [isLoading, setIsLoading] = useState(true); // Loading state to block initialization

    // // Load the API key from local storage
    // useEffect(() => {
    //     const savedSettings = LocalStorageHelper.loadSetting(BASE_KEY);
    //     if (savedSettings) {
    //         if (savedSettings[API_KEY]) {
    //             setApiKey(savedSettings[API_KEY]); // Set the API key from local storage
    //         } else {
    //             setApiKey(""); // No API key found in local storage
    //         }
    //     }
    //     setIsLoading(false); // Mark loading as complete
    // }, []);

    // Block rendering until the API key is loaded
    // if (isLoading) {
    //     return <div>Loading...</div>; // Show a loading indicator
    // }
	
    const [googleMapApiKey, setGoogleMapApiKey] = useState(""); // Default to empty API key
    const [isInitialized, setIsInitialized] = useState<boolean>(false); // Track if initialization is complete
    const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false); // Track if the Google Maps script is loaded

    useEffect(() => {
        const loadGoogleMapApiKey = async () => {
            const savedSettings = LocalStorageHelper.loadSetting(MAP_LOCAL_STORAGE_KEYS.BASE_KEY);
            if (savedSettings && savedSettings[API_KEY]) {
                setGoogleMapApiKey(savedSettings[API_KEY]); // Set the API key from local storage
            } else {
                setGoogleMapApiKey(""); // No API key found in local storage
            }
            setIsInitialized(true); // Mark initialization as complete
        };

        loadGoogleMapApiKey();
    }, []);

    if (!isInitialized) {
        // Render a loading screen while waiting for the API key
        return <div>Loading application...</div>;
    }

    return (
        <AuthProvider>
            <MapProvider 
                apiKey={googleMapApiKey}
                onScriptLoad={() => setIsScriptLoaded(true)} // Notify when the script is loaded
            >
                {isScriptLoaded ? <AppRouter /> : <div>Loading Google Maps...</div>}
            </MapProvider>
        </AuthProvider>
    );
};

export default App;