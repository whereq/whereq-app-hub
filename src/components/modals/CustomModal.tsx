import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faCheckCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface ModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmAction?: () => void;
    cancelAction?: () => void;
    isConfirmDialog?: boolean;
    onRequestClose: () => void;
    type?: "info" | "success" | "error"; // Specify the type of modal
}

const CustomModal: React.FC<ModalProps> = ({
    isOpen,
    title,
    message,
    confirmAction,
    cancelAction,
    isConfirmDialog = false,
    onRequestClose,
    type = "info", // Default to info type
}) => {
    // Determine icon based on modal type
    const getIcon = () => {
        switch (type) {
            case "success":
                return faCheckCircle;
            case "error":
                return faExclamationCircle;
            case "info":
            default:
                return faInfoCircle;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="bg-gray-900 p-6 border border-gray-700 shadow-lg font-firacode"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
        >
            {/* Title Area */}
            <div className="flex items-center gap-2 text-center mb-4 text-orange-500 font-bold text-xl border-b border-gray-700 pb-2">
                <FontAwesomeIcon icon={getIcon()} className="text-lg" />
                {title}
            </div>

            {/* Message Content Area */}
            <div
                className="text-orange-300 text-center my-4 border-b border-gray-700 pb-4"
                dangerouslySetInnerHTML={{ __html: message }}
            ></div>

            {/* Button Area */}
            <div className="flex justify-end gap-3 mt-4">
                {isConfirmDialog && cancelAction && (
                    <button
                        onClick={cancelAction}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                )}
                {isConfirmDialog && confirmAction && (
                    <button
                        onClick={confirmAction}
                        className="bg-orange-500 hover:bg-orange-600 text-black px-5 py-2 transition-colors duration-200"
                    >
                        Confirm
                    </button>
                )}
                {!isConfirmDialog && (
                    <button
                        onClick={onRequestClose}
                        className="bg-orange-500 hover:bg-orange-600 text-black px-5 py-2 transition-colors duration-200"
                    >
                        OK
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default CustomModal;
