import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import "./titleBar.css";

type TitleBarProps = {
    title?: string;
};

export const TitleBar = ({ title }: TitleBarProps) => {
    return (
        <div className="title-bar flex justify-between items-center bg-gray-200 px-4">
            <span className="text-gray-800 font-bold text-xs">{title}</span>
            <div className="actions space-x-2">
                <button className="icon-button">
                    <FontAwesomeIcon icon={faFloppyDisk} title="Save" />
                </button>
                <button className="icon-button">
                    <FontAwesomeIcon icon={faShareAlt} title="Share" />
                </button>
            </div>
        </div>
    );
};
