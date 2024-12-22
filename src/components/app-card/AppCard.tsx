import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"; // Import IconDefinition for type safety
import { Link } from "react-router-dom";
import "./appCard.css";

export interface AppCardProps {
  name: string;
  icon: IconDefinition; // Accept FontAwesomeIcon types
  description: string;
  path: string;
}

export const AppCard = ({ name, icon, description, path }: AppCardProps) => (
  <Link to={path} className="app-card">
    <div className="app-card-container">
      {/* Icon */}
      <div className="app-card-icon">
        <FontAwesomeIcon icon={icon} />
      </div>

      {/* App Name */}
      <h3 className="app-card-title">{name}</h3>

      {/* Description */}
      <p className="app-card-description">{description}</p>
    </div>
  </Link>
);
