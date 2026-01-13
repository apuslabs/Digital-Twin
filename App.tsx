import React from "react";
import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { SelectorPage } from "./components/home/SelectorPage";
import { ChatPage } from "./components/chat/ChatPage";
import { ContestPage } from "./components/competition/ContestPage";



// Main App Layout Component
const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  const handleBackToSelector = () => {
    navigate("/");
  };

  return (
    <div className="bg-shader min-h-screen text-foreground">
      <Header onLogoClick={handleBackToSelector} isHomePage={isHomePage} />
      <main
        className={`sm:mx-auto px-0 sm:px-4 py-0 sm:py-8 font-mono relative z-10 ${
          isHomePage ? "max-w-[2000px]" : "container"
        }`}
      >
        <Routes>
          <Route path="/" element={<SelectorPage />} />
          <Route path="/chat/:figureId" element={<ChatPage />} />
          <Route path="/outofcontext/" element={<ContestPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App Component with HashRouter
const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
