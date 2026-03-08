// App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Accueil from "./interfaces/Accueil";
import SplashScreen from "./components/splashscreen";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {

    const hasVisited = sessionStorage.getItem('nova-has-visited');
    
    if (hasVisited) {
      // Si déjà visité dans cette session, on passe directement
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 6000);
    } else {
      // Première visite, on marque la session
      sessionStorage.setItem('nova-has-visited', 'true');
      // Le splash screen va s'afficher pendant 6 secondes
    }
  }, []);

  const handleSplashFinish = () => {
    setFadeOut(true);
    setTimeout(() => {
      setLoading(false);
    }, 6000);
  };

  if (loading) {
    return (
      <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <SplashScreen onFinish={handleSplashFinish} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="text-gray-600">Page non trouvée</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;