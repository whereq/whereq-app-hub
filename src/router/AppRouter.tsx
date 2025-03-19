import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from "src/layouts/Header/Header";
import { Footer } from "src/layouts/Footer/Footer";
import Home from "@pages/home/Home";
import About from "@pages/about/About";
import Contact from "@pages/contact/Contact";
import Signin from "@pages/signin/Signin";
import Signup from "@pages/signup/Signup";
import ApiExplorerPage from "@features/api-explorer/pages/ApiExplorerPage";
// import MapsPage from "@features/map-gl/pages/MapsPage";
import MapsPage from "@features/map/pages/MapsPage";
import CalendarPage from "@features/calendar/pages/CalendarPage";
import TagPage from "@features/tag/pages/TagPage";
import CategoryPage from "@features/category/pages/CategoryPage";
import AcademyPage from "@features/academy/pages/AcademyPage";
import MathPage from "@features/math/pages/MathPage";
import ToolsPage from "@features/tools/pages/ToolsPage";
import PhysicsPage from "@features/physics/pages/PhysicsPage";
import ChemistryPage from "@features/chemistry/pages/ChemistryPage";
import PawsPage from "@features/paws/pages/PawsPage";
import EventBoard from "@pages/event-board/EventBoard";

export const AppRouter = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow overflow-y-auto mt-12" 
          style={{ height: "calc(100vh - 6.25rem)"}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event-board" element={<EventBoard/>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/api-explorer" element={<ApiExplorerPage />} />
            <Route path="/map" element={<MapsPage />} />
            <Route path="/tag" element={<TagPage/>} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/category" element={<CategoryPage/>} />
            <Route path="/academy" element={<AcademyPage/>} />
            <Route path="/math" element={<MathPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/physics" element={<PhysicsPage />} />
            <Route path="/chemistry" element={<ChemistryPage />} />
            <Route path="/paws" element={<PawsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};