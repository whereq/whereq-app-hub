import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from "src/layouts/Header/Header";
import { Footer } from "src/layouts/Footer/Footer";
import Home from "@pages/home/Home";
import About from "@pages/about/About";
import Contact from "@pages/contact/Contact";
import Signin from "@pages/signin/Signin";
import Signup from "@pages/signup/Signup";
import ApiExplorerPage from "@features/api-explorer/pages/ApiExplorerPage";

export const AppRouter = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow overflow-y-auto" style={{ height: "calc(100vh - 3.75rem - 3.125rem)" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/api-explorer" element={<ApiExplorerPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};