import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

export const MechanicsSection = () => {

    return (
        <div className="paws-dogs flex flex-col border-b border-gray-700">
            {/* Section Header */}
            <div className="flex justify-between items-center p-2 bg-gray-800">
                <h3 className="text-sm font-semibold">Physics - Mechanics</h3>
                <button
                    onClick={() => console.log('Physics Mechanics Cleared')}
                    className="text-sm text-red-500 hover:text-red-700"
                    title="Clear Physics Mechanics"
                >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
            </div>
        </div>
    );
};