// SplashScreen.tsx
import { useEffect, useState } from 'react';
import { FiCpu, FiShield, FiZap, FiGlobe } from 'react-icons/fi';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function SplashScreen({ onFinish, duration = 6000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            onFinish?.();
          }, 500);
        }, 200);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [duration, onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-container">
        {/* Logo avec animation */}
        <div className="logo-container">
          <img 
            src="/LogoNova.png" 
            alt="Stardust" 
            className="logo"
          />
          <div className="logo-glow"></div>
        </div>

        {/* Nom avec animation */}
        <h1 className="app-name">
          <span className="stardust">STARDUST</span>
          <span className="tagline">Administration</span>
        </h1>

        {/* Barre de progression élégante */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Badges technologiques */}
        <div className="tech-badges">
          <div className="badge">
            <FiCpu size={14} />
            <span>Quantum Ready</span>
          </div>
          <div className="badge">
            <FiShield size={14} />
            <span>Secure</span>
          </div>
          <div className="badge">
            <FiZap size={14} />
            <span>Fast</span>
          </div>
          <div className="badge">
            <FiGlobe size={14} />
            <span>Global</span>
          </div>
        </div>

        {/* Version */}
        <div className="version">
          v1.0.0
        </div>

        {/* Particules animées */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0a0c10 0%, #0d1117 50%, #0a0c10 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease;
        }

        .splash-screen.fade-out {
          opacity: 0;
        }

        .splash-container {
          text-align: center;
          position: relative;
          width: 100%;
          max-width: 600px;
          padding: 40px 20px;
        }

        /* Logo */
        .logo-container {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 32px;
          animation: float 3s ease-in-out infinite;
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 20px rgba(56, 139, 253, 0.3));
          animation: logoReveal 1s ease-out;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(56, 139, 253, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 3s ease-in-out infinite;
          z-index: 1;
        }

        /* Nom */
        .app-name {
          margin-bottom: 48px;
          animation: slideUp 0.8s ease-out;
        }

        .stardust {
          display: block;
          font-size: 48px;
          font-weight: 700;
          letter-spacing: 4px;
          background: linear-gradient(135deg, #e6edf3 0%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(56, 139, 253, 0.2);
          margin-bottom: 8px;
        }

        .tagline {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 2px;
          color: #8b949e;
          text-transform: uppercase;
        }

        /* Barre de progression */
        .progress-container {
          margin-bottom: 48px;
          animation: fadeIn 1s ease-out 0.3s both;
        }

        .progress-bar {
          width: 280px;
          height: 2px;
          background: #21262d;
          margin: 0 auto 12px;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #388bfd, #58a6ff, #79c0ff);
          transition: width 0.1s linear;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
          animation: shimmer 1.5s infinite;
        }

        .progress-text {
          font-size: 12px;
          color: #8b949e;
          letter-spacing: 1px;
        }

        /* Badges */
        .tech-badges {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
          animation: fadeIn 1s ease-out 0.6s both;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(13, 17, 23, 0.8);
          border: 1px solid #21262d;
          color: #8b949e;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }

        .badge:hover {
          border-color: #388bfd;
          color: #e6edf3;
          transform: translateY(-2px);
        }

        .badge svg {
          color: #388bfd;
        }

        /* Version */
        .version {
          font-size: 11px;
          color: #484f58;
          letter-spacing: 1px;
          animation: fadeIn 1s ease-out 0.9s both;
        }

        /* Particules */
        .particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #388bfd;
          border-radius: 50%;
          opacity: 0;
          animation: particleFloat linear infinite;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translateY(0) rotate(0deg);
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) rotate(360deg);
          }
        }

        /* Responsive */
        @media (max-width: 480px) {
          .logo-container {
            width: 100px;
            height: 100px;
          }

          .stardust {
            font-size: 36px;
          }

          .tech-badges {
            flex-wrap: wrap;
            gap: 8px;
          }

          .badge {
            padding: 4px 10px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}