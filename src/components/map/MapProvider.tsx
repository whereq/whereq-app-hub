import React, { useState } from "react";
import { LoadScript } from "@react-google-maps/api";

const libraries: ("places" | "marker" | "drawing" | "geometry" | "visualization")[] = ["places", "marker", "drawing"];

const MapProvider: React.FC<{ 
    apiKey: string; 
    children: React.ReactNode;
    onScriptLoad?: () => void; // Callback to notify when the script is loaded
}> = ({ apiKey, children, onScriptLoad }) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    return (
        <LoadScript
            googleMapsApiKey={apiKey}
            libraries={libraries}
            onLoad={() => {
                setIsScriptLoaded(true);
                onScriptLoad?.(); // Notify the parent component that the script is loaded
            }}
            onUnmount={() => {
                // Cleanup global Google Maps elements
                if (window.google && window.google.maps) {
                    // @ts-expect-error: Cleanup global Google Maps elements
                    delete window.google.maps;
                }
            }}
        >
            {isScriptLoaded ? children : <div>Loading Google Maps...</div>}
        </LoadScript>
    );
};

export default MapProvider;