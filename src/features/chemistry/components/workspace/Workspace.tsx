import { useState } from "react";
import { Resizable } from "re-resizable";

import { useChemistryStore } from "@features/chemistry/store/chemistryStore";
import { SectionType } from "@features/chemistry/models/ChemistryEnum";
import { PeriodicTableSection } from "@features/chemistry/components/workspace/PeriodicTableSection";
import { ExperimentsSection } from "@features/chemistry/components/workspace/ExperimentsSection";


export const Workspace = () => {
    const { activeSection } = useChemistryStore();
    const [isResizing, setIsResizing] = useState(false);

    return (
        <Resizable
            defaultSize={{ width: "15%", height: "100%" }}
            maxWidth="50%"
            enable={{ right: true }}
            className={`chemistry-workspace flex flex-col bg-gray-900 text-orange 
                        font-fira-code h-full overflow-hidden ${
                isResizing ? "border-r-2 border-orange" : ""
            }`}
            handleStyles={{ 
                right: { 
                    cursor: "ew-resize", 
                    width: "8px" 
                }
            }}
            handleClasses={{ right: "bg-blue-500 hover:bg-blue-700" }}
            onResizeStart={() => setIsResizing(true)}
            onResizeStop={() => setIsResizing(false)}
        >
            {/* Conditionally Render Sections */}
            <div className="flex-1 overflow-hidden">
                {activeSection === SectionType.PERIODIC_TABLE && (
                    <PeriodicTableSection />
                )}

                {activeSection === SectionType.EXPERIMENTS && (
                    <ExperimentsSection />
                )}

            </div>
        </Resizable>
    );
};