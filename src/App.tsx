import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Accueil      from "./interfaces/Accueil";
import Login        from "./interfaces/Connexion";
import SplashScreen from "./components/splashscreen";

const SPLASH_FALLBACK_MS = 4000;

const App: React.FC = () => {
  const [loading,         setLoading]         = useState(true);
  const [fadeOut,         setFadeOut]         = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Restaurer l'auth si token présent
    const token = sessionStorage.getItem("nova-auth-token");
    if (token) setIsAuthenticated(true);

    // Le splash s'affiche TOUJOURS (premier chargement ET refresh).
    // Timeout de secours si SplashScreen n'appelle pas onFinish.
    const fallback = setTimeout(() => dismissSplash(), SPLASH_FALLBACK_MS);
    return () => clearTimeout(fallback);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissSplash() {
    setFadeOut(true);
    setTimeout(() => setLoading(false), 300);
  }

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("nova-auth-token", "dummy-token");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("nova-auth-token");
  };

  // ── Splash ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ transition: "opacity 0.3s" }} className={fadeOut ? "opacity-0" : "opacity-100"}>
        <SplashScreen onFinish={dismissSplash} />
      </div>
    );
  }

  // ── App ───────────────────────────────────────────────────────────────────
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/Accueil" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/Accueil"
          element={isAuthenticated ? <Accueil onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/Accueil" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/Accueil" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;