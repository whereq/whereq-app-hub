import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";

export interface AppCardProps {
  name: string;
  icon: IconDefinition;
  description: string;
  path: string;
}

export const AppCard = ({ name, icon, description, path }: AppCardProps) => (
  <Link
    to={path}
    className="block p-4 border border-gray-700 rounded-lg bg-blue-900 text-orange-300 shadow-lg hover:shadow-xl transform transition-transform hover:-translate-y-1 focus:ring-2 focus:ring-orange-500"
  >
    <div className="flex flex-col items-center justify-between h-full">
      {/* Icon */}
      <div className="text-orange-400 text-4xl mb-3">
        <FontAwesomeIcon icon={icon} />
      </div>

      {/* App Name */}
      <h3 className="text-xl font-bold text-center font-mono">{name}</h3>

      {/* Description */}
      <p className="text-sm text-center text-orange-200 mt-2 hidden">{description}</p>
    </div>
  </Link>
);

export default AppCard;
