import { AppCard } from "@components/app-card/AppCard";
import { faHexagonNodes, faMap, faCat, faDog, faFish } from "@fortawesome/free-solid-svg-icons";

const apps = [
  { id: 1, name: "API Explorer", icon: faHexagonNodes, description: "Public API Explorer", path: "/api-explorer" },
  { id: 2, name: "Map", icon: faMap, description: "WhereQ Map", path: "/map" },
  { id: 3, name: "Cat Explorer", icon: faCat, description: "Discover all cat breeds", path: "/catFact" },
  { id: 4, name: "Dog Finder", icon: faDog, description: "Explore dog breeds and more", path: "/dogs" },
  { id: 5, name: "Fish World", icon: faFish, description: "Learn about aquatic life", path: "/fish" },
  { id: 6, name: "Bird Watch", icon: faCat, description: "Identify bird species", path: "/birds" },
  { id: 7, name: "Reptile Guide", icon: faDog, description: "Study reptiles in-depth", path: "/reptiles" },
  { id: 8, name: "Insect Atlas", icon: faFish, description: "Get details on insects", path: "/insects" },
];

export const Home = () => (
  <div className="p-4">
    {/* <h2 className="text-2xl font-bold mb-4">Welcome to WhereQ App Hub</h2>
    <p className="text-gray-700 mb-8">
      Discover various applications and tools we’ve built to explore the animal world.
    </p> */}

    {/* Responsive Grid */}
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          name={app.name}
          icon={app.icon}
          description={app.description}
          path={app.path}
        />
      ))}
    </div>
  </div>
);
