import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

export const ExperimentsSection = () => {

    return (
        <div className="paws-dogs flex flex-col border-b border-gray-700">
            {/* Section Header */}
            <div className="flex justify-between items-center p-2 bg-gray-800">
                <h3 className="text-sm font-semibold">Experiments</h3>
                <button
                    onClick={() => console.log('Saved Experiment Cleared')}
                    className="text-sm text-red-500 hover:text-red-700"
                    title="Clear Saved Experiments"
                >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
            </div>
        </div>
    );
};