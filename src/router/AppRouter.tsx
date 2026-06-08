import { Route, Routes } from "react-router-dom";
import { Header } from "@/layouts/Header/Header";
import { Footer } from "@/layouts/Footer/Footer";
import { RouteChangeTracker } from "@/components/analytics/RouteChangeTracker";
import Home from "@/pages/home/Home";
import About from "@/pages/about/About";
import Contact from "@/pages/contact/Contact";
import Signin from "@/pages/signin/Signin";
import Signup from "@/pages/signup/Signup";
import ApiExplorerPage from "@/features/api-explorer/pages/ApiExplorerPage";
import MapsPage from "@/features/map/pages/MapsPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import TagPage from "@/features/tag/pages/TagPage";
import CategoryPage from "@/features/category/pages/CategoryPage";
import AcademyPage from "@/features/academy/pages/AcademyPage";
import MathPage from "@/features/math/pages/MathPage";
import ToolsPage from "@/features/tools/pages/ToolsPage";
import PhysicsPage from "@/features/physics/pages/PhysicsPage";
import ChemistryPage from "@/features/chemistry/pages/ChemistryPage";
import PawsPage from "@/features/paws/pages/PawsPage";
import MultimediaPage from "@/features/multimedia/pages/MultimediaPage";
import EventBoard from "@/pages/event-board/EventBoard";
import Profile from "@/pages/profile/Profile";

/**
 * Top-level router shell.
 *
 * Layout model: a fixed-position 3-row grid.
 *   ┌─ header (fixed, h-[3.125rem]) ──────┐
 *   │ main (scrolls, top/bottom padding)  │  ← 100vh - 6.25rem
 *   ├─ footer (fixed, h-[3.125rem]) ──────┤
 *   └─────────────────────────────────────┘
 *
 * Both the header and footer use `fixed` positioning. `<main>` is the
 * only scroll container and its height = 100vh - header - footer.
 * Subtract the footer too — if we don't, the last 3.125rem of
 * `<main>` sits *under* the fixed footer and the user can't reach it
 * with the scrollbar (the scrollbar's max scroll value is past the
 * visible viewport edge).
 */
export const AppRouter = () => {
  return (
    // bg-gray-900 covers the entire viewport so the fixed header / fixed
    // footer overlay regions and any empty space inside the flex parent
    // all show the dark theme background. Without this, when the route
    // content is shorter than the viewport, you get white bands above
    // main and below main (transparent parent + transparent body).
    // The gray-900 token is overridden in @theme (index.css) to
    // resolve to #161b27 — the same color used on html/body.
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      {/* Fire a GA4 pageview for every client-side route change. */}
      <RouteChangeTracker />
      <main
        className="flex-grow overflow-y-auto"
        style={{
          height: "calc(100vh - 6.25rem)",
          marginTop: "3.125rem",
          marginBottom: "3.125rem",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event-board" element={<EventBoard/>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile/>} />
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
          <Route path="/multimedia" element={<MultimediaPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
