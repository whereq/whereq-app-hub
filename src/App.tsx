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
	
    const [googleMapApiKey, setGoogleMapApiKey] = useState("");
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

    useEffect(() => {
        const loadGoogleMapApiKey = async () => {
            const savedSettings = LocalStorageHelper.loadSetting(MAP_LOCAL_STORAGE_KEYS.BASE_KEY);
            if (savedSettings && savedSettings[API_KEY]) {
                setGoogleMapApiKey(savedSettings[API_KEY]);
            } else {
                setGoogleMapApiKey("");
            }
            setIsInitialized(true);
        };

        loadGoogleMapApiKey();
    }, []);

    if (!isInitialized) {
        return <div>Loading application...</div>;
    }

    return (
        <MapProvider
            apiKey={googleMapApiKey}
            onScriptLoad={() => setIsScriptLoaded(true)}
        >
            {isScriptLoaded ? <AppRouter /> : <div>Loading Google Maps...</div>}
        </MapProvider>
    );
};

export default App;