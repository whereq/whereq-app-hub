import { AppCard } from "@components/app-card/AppCard";
import { faHexagonNodes, 
         faMap, 
         faScrewdriverWrench, 
         faInfinity, 
         faCalendar,
         faTags,
         faTableCells,
         faGraduationCap,
         faPaw} from "@fortawesome/free-solid-svg-icons";
import { GiMaterialsScience, GiAcid  } from "react-icons/gi";
import { useAppStore } from "@store/store"; // Import useAppStore

const apps = [
  { id: 1, name: "API Explorer", icon: faHexagonNodes, description: "Public API Explorer", path: "/api-explorer" },
  { id: 2, name: "Map", icon: faMap, description: "WhereQ Map", path: "/map" },
  { id: 3, name: "Calendar", icon: faCalendar, description: "WhereQ Calendar", path: "/calendar" },
  { id: 4, name: "Tools", icon: faScrewdriverWrench, description: "Tools", path: "/tools" },
  { id: 5, name: "Tag", icon: faTags, description: "WhereQ Tags", path: "/tag" },
  { id: 6, name: "Category", icon: faTableCells, description: "WhereQ Categories", path: "/category" },
  { id: 7, name: "Math", icon: faInfinity, description: "Math Academy", path: "/math" },
  { id: 8, name: "Physics", icon: GiMaterialsScience, description: "Everything about Physics", path: "/physics" },
  { id: 9, name: "Chemistry", icon: GiAcid, description: "Everything about Chemistry", path: "/chemistry" },
  { id: 10, name: "Academy", icon: faGraduationCap, description: "Academy Resources", path: "/academy" },
  { id: 11, name: "Paws", icon: faPaw, description: "Paws", path: "/paws" },
];

const Home = () => {
  const { setAppDrawerOpen } = useAppStore(); // Access setAppDrawerOpen from the store

  // Function to close the AppLauncher
  const handleAppCardClick = () => {
    setAppDrawerOpen(false);
  };

  return (
    <div className="h-full bg-gray-900 text-orange-300 font-fira-code p-4">
      {/* Responsive Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {apps.map((app) => (
          <AppCard
            key={app.id}
            name={app.name}
            icon={app.icon}
            description={app.description}
            path={app.path}
            onClick={handleAppCardClick} // Pass the click handler to AppCard
          />
        ))}
      </div>
    </div>
  );
};

export default Home;