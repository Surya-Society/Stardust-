// Accueil.tsx
import { useState, useEffect } from 'react';
import { 
  FiGrid, FiKey, FiCreditCard, FiUsers, FiMessageCircle,
  FiCode, FiBox, FiSettings, FiLogOut, FiBell, FiSearch,
  FiMenu, FiUser, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import Dashboard         from '../components/Dashboard';
import KeysPage          from '../components/CleActvation';
import SubscriptionsPage from '../components/Abonnement';
import ClientsPage       from '../components/Clients';
import CommentsPage      from '../components/Avis';
import ApiPage           from '../components/ClesApi';
import Applications      from '../components/Applications';
import SettingsPage      from '../components/Parametres';
import Toast             from '../components/Toast';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'red';
}

interface ToastMessage {
  msg: string;
  type: 'green' | 'red' | 'amber' | 'blue';
}

export default function Accueil() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && navCollapsed) {
        // Sur desktop, on peut garder l'état replié
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navCollapsed]);

  const showNotification = (msg: string, type: ToastMessage['type'] = 'green') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: FiGrid, label: 'Vue d\'ensemble' },
    { id: 'keys', icon: FiKey, label: 'Clés d\'activation', badge: '5' },
    { id: 'subscriptions', icon: FiCreditCard, label: 'Abonnements', badge: '1', badgeColor: 'amber' },
    { id: 'clients', icon: FiUsers, label: 'Clients' },
    { id: 'comments', icon: FiMessageCircle, label: 'Avis', badge: '4', badgeColor: 'green' },
    { id: 'api', icon: FiCode, label: 'Clés API' },
    { id: 'apps', icon: FiBox, label: 'Applications' },
  ];

  const pageTitles: Record<string, string> = {
    dashboard: 'Vue d\'ensemble',
    keys: 'Clés d\'activation',
    subscriptions: 'Abonnements',
    clients: 'Clients',
    comments: 'Avis Clients',
    api: 'Clés API',
    apps: 'Applications',
    settings: 'Paramètres',
  };

  const navigateTo = (pageId: string) => {
    setCurrentPage(pageId);
    if (isMobile) {
      setNavOpen(false);
    }
  };

  const toggleNavCollapse = () => {
    setNavCollapsed(!navCollapsed);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'keys':
        return <KeysPage onNotify={showNotification} />;
      case 'subscriptions':
        return <SubscriptionsPage onNotify={showNotification} />;
      case 'clients':
        return <ClientsPage onNotify={showNotification} />;
      case 'comments':
        return <CommentsPage />;
      case 'api':
        return <ApiPage onNotify={showNotification} />;
      case 'apps':
        return <Applications onNotify={showNotification} />;
      case 'settings':
        return <SettingsPage onNotify={showNotification} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="layout">
        {/* Overlay mobile */}
        {isMobile && (
          <div 
            className={`nav-overlay ${navOpen ? 'show' : ''}`} 
            onClick={() => setNavOpen(false)} 
            aria-hidden="true"
          />
        )}

        {/* Navigation latérale */}
        <nav className={`nav ${navOpen ? 'open' : ''} ${navCollapsed && !isMobile ? 'collapsed' : ''}`}>
          <div className="nav-header">
            <div className="nav-logo">
              <div className="nav-logo-mark animate-pulse-slow">N</div>
              {(!navCollapsed || isMobile) && (
                <div className="nav-logo-text">
                  <span>Nova</span> Admin
                </div>
              )}
            </div>
            
            {!isMobile && (
              <button 
                className="nav-collapse-btn"
                onClick={toggleNavCollapse}
                title={navCollapsed ? 'Développer' : 'Réduire'}
              >
                {navCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
              </button>
            )}
          </div>

          <div className="nav-section">
            <div className="nav-label">
              {(!navCollapsed || isMobile) ? 'Navigation' : '···'}
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigateTo(item.id)}
                type="button"
                title={navCollapsed && !isMobile ? item.label : undefined}
              >
                <item.icon size={18} className="nav-icon" />
                {(!navCollapsed || isMobile) && (
                  <>
                    <span className="nav-label-text">{item.label}</span>
                    {item.badge && (
                      <span 
                        className={`nav-badge ${item.badgeColor === 'green' ? 'green' : ''}`}
                        style={item.badgeColor === 'amber' ? { background: 'var(--accent-amber)', color: '#000' } : {}}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {navCollapsed && !isMobile && item.badge && (
                  <span className="nav-badge-collapsed">{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="nav-section nav-section-bottom">
            <div className="nav-label">
              {(!navCollapsed || isMobile) ? 'Système' : '···'}
            </div>
            <button
              className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => navigateTo('settings')}
              type="button"
              title={navCollapsed && !isMobile ? 'Paramètres' : undefined}
            >
              <FiSettings size={18} className="nav-icon" />
              {(!navCollapsed || isMobile) && (
                <span className="nav-label-text">Paramètres</span>
              )}
            </button>
          </div>

          <div className="nav-footer">
            <button className="nav-user" type="button">
              <div className="nav-avatar">
                <FiUser size={16} />
              </div>
              {(!navCollapsed || isMobile) && (
                <>
                  <div className="nav-user-info">
                    <div className="nav-user-name">Admin</div>
                    <div className="nav-user-role">Super Admin</div>
                  </div>
                  <FiLogOut size={16} className="nav-logout-icon" />
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className={`main ${navCollapsed && !isMobile ? 'expanded' : ''}`}>
          {/* Barre supérieure */}
          <header className="topbar">
            <button 
              className="menu-btn" 
              onClick={() => isMobile ? setNavOpen(!navOpen) : toggleNavCollapse()}
              type="button"
              aria-label="Menu"
            >
              {isMobile ? <FiMenu size={20} /> : (navCollapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />)}
            </button>
            
            <h1 className="topbar-title animate-fade-in">
              {pageTitles[currentPage]}
            </h1>
            
            <div className="topbar-search animate-fade-in">
              <FiSearch size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Recherche globale..." 
                aria-label="Recherche globale"
              />
            </div>
            
            <button 
              className="topbar-btn notification-btn animate-fade-in"
              onClick={() => showNotification('Aucune nouvelle notification', 'blue')}
              type="button"
              aria-label="Notifications"
            >
              <FiBell size={18} />
              <span className="topbar-dot" />
            </button>
            
            <button 
              className="topbar-btn user-btn animate-fade-in"
              type="button"
              aria-label="Profil"
            >
              <span className="user-initials">A</span>
            </button>
          </header>

          {/* Zone de contenu avec animation de transition */}
          <div className="content page-transition">
            {renderPage()}
          </div>
        </main>

        {/* Toast de notification */}
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}

// Styles globaux améliorés avec animations supplémentaires
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }
  
  :root {
    --bg-base: #090c10;
    --bg-panel: #0d1117;
    --bg-surface: #161b22;
    --bg-elevated: #1c2330;
    --border: #21262d;
    --border-bright: #30363d;
    --accent: #e8f4fd;
    --accent-blue: #388bfd;
    --accent-teal: #39d353;
    --accent-amber: #e3b341;
    --accent-red: #f85149;
    --accent-purple: #a5a0e8;
    --text-primary: #e6edf3;
    --text-secondary: #8b949e;
    --text-muted: #484f58;
    --font: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
    --nav-w: 260px;
    --nav-w-collapsed: 80px;
    --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  }

  html, body { 
    background: var(--bg-base); 
    color: var(--text-primary); 
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar { 
    width: 6px; 
    height: 6px; 
  }
  ::-webkit-scrollbar-track { 
    background: transparent; 
  }
  ::-webkit-scrollbar-thumb { 
    background: var(--border-bright);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { 
    background: var(--text-muted);
  }

  /* Layout principal */
  .layout { 
    display: flex; 
    min-height: 100vh; 
  }

  /* Navigation */
  .nav {
    width: var(--nav-w);
    background: var(--bg-panel);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transition: width 0.3s var(--transition-smooth), transform 0.3s var(--transition-smooth);
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .nav.collapsed { 
    width: var(--nav-w-collapsed);
  }
  
  .nav.closed { 
    transform: translateX(-100%); 
  }

  .nav-header {
    position: relative;
    border-bottom: 1px solid var(--border);
  }

  .nav-logo {
    padding: 24px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .nav.collapsed .nav-logo {
    padding: 24px 0;
    justify-content: center;
  }
  
  .nav-logo-mark {
    width: 32px;
    height: 32px;
    background: var(--accent-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    color: #fff;
    border-radius: 6px;
    transition: transform 0.2s var(--transition-bounce);
  }
  
  .nav-logo-mark:hover {
    transform: rotate(5deg) scale(1.05);
  }
  
  .nav-logo-text { 
    font-weight: 600; 
    font-size: 16px; 
    letter-spacing: -0.3px;
    white-space: nowrap;
  }
  .nav-logo-text span { 
    color: var(--accent-blue); 
  }

  .nav-collapse-btn {
    position: absolute;
    right: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .nav-collapse-btn:hover {
    background: var(--accent-blue);
    border-color: var(--accent-blue);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }

  .nav-section { 
    padding: 16px 12px 8px; 
  }
  
  .nav.collapsed .nav-section {
    padding: 16px 4px;
  }
  
  .nav-section-bottom {
    margin-top: auto;
  }
  
  .nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0 8px;
    margin-bottom: 8px;
    white-space: nowrap;
  }
  
  .nav.collapsed .nav-label {
    text-align: center;
    padding: 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 400;
    transition: all 0.2s ease;
    position: relative;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    border-radius: 6px;
    margin-bottom: 2px;
    white-space: nowrap;
  }
  
  .nav.collapsed .nav-item {
    padding: 10px 0;
    justify-content: center;
  }
  
  .nav-item:hover { 
    color: var(--text-primary); 
    background: var(--bg-surface);
  }
  
  .nav.collapsed .nav-item:hover {
    transform: scale(1.05);
  }
  
  .nav-item.active { 
    color: var(--text-primary); 
    background: var(--bg-elevated);
  }
  
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-blue);
    border-radius: 0 3px 3px 0;
    animation: slideInLeft 0.2s var(--transition-smooth);
  }
  
  .nav.collapsed .nav-item.active::before {
    width: 2px;
  }

  .nav-icon {
    transition: transform 0.2s ease;
  }
  
  .nav-item:hover .nav-icon {
    transform: scale(1.1);
  }
  
  .nav-badge {
    margin-left: auto;
    background: var(--accent-red);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    min-width: 20px;
    text-align: center;
    border-radius: 12px;
    animation: pulse 2s infinite;
  }
  
  .nav-badge.green { 
    background: var(--accent-teal); 
    color: #000; 
  }

  .nav-badge-collapsed {
    position: absolute;
    top: 2px;
    right: 2px;
    background: var(--accent-red);
    color: #fff;
    font-size: 8px;
    font-weight: 600;
    padding: 2px 4px;
    min-width: 16px;
    text-align: center;
    border-radius: 8px;
    animation: pulse 2s infinite;
  }

  .nav-footer {
    border-top: 1px solid var(--border);
    padding: 16px;
  }
  
  .nav.collapsed .nav-footer {
    padding: 16px 0;
  }
  
  .nav-user {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .nav.collapsed .nav-user {
    padding: 8px 0;
    justify-content: center;
  }
  
  .nav-user:hover { 
    background: var(--bg-surface);
    transform: translateY(-2px);
  }
  
  .nav-avatar {
    width: 36px;
    height: 36px;
    background: var(--accent-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    color: #fff;
    border-radius: 8px;
    transition: transform 0.2s var(--transition-bounce);
  }
  
  .nav-user:hover .nav-avatar {
    transform: rotate(5deg);
  }
  
  .nav-user-info { 
    flex: 1; 
    min-width: 0; 
  }
  
  .nav-user-name { 
    font-size: 13px; 
    font-weight: 600; 
  }
  
  .nav-user-role { 
    font-size: 11px; 
    color: var(--text-muted); 
  }
  
  .nav-logout-icon {
    color: var(--text-muted);
    transition: all 0.2s ease;
  }
  
  .nav-user:hover .nav-logout-icon {
    color: var(--accent-red);
    transform: translateX(4px);
  }

  /* Contenu principal */
  .main { 
    margin-left: var(--nav-w); 
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-base);
    transition: margin-left 0.3s var(--transition-smooth);
  }
  
  .main.expanded { 
    margin-left: var(--nav-w-collapsed); 
  }

  /* Barre supérieure */
  .topbar {
    height: 64px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 20px;
    background: var(--bg-panel);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(8px);
    background: rgba(13, 17, 23, 0.95);
  }
  
  .topbar-title { 
    font-size: 16px; 
    font-weight: 500; 
    flex: 1;
    letter-spacing: -0.3px;
  }
  
  .topbar-search {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 8px 16px;
    width: 280px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .topbar-search:focus-within {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.1);
    width: 320px;
  }
  
  .topbar-search input {
    background: none;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 13px;
    width: 100%;
  }
  
  .topbar-search input::placeholder { 
    color: var(--text-muted); 
  }
  
  .search-icon {
    color: var(--text-muted);
  }
  
  .topbar-btn {
    width: 38px;
    height: 38px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    position: relative;
    border-radius: 8px;
  }
  
  .topbar-btn:hover { 
    color: var(--text-primary); 
    border-color: var(--border-bright);
    transform: translateY(-2px);
  }
  
  .notification-btn {
    animation: float 3s ease-in-out infinite;
  }
  
  .topbar-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--accent-red);
    border-radius: 50%;
    border: 2px solid var(--bg-panel);
    animation: pulse 2s infinite;
  }
  
  .user-btn {
    background: var(--accent-blue);
    color: white;
    font-weight: 600;
  }
  
  .user-btn:hover {
    background: var(--accent-blue);
    filter: brightness(1.1);
  }
  
  .user-initials {
    font-size: 14px;
    font-weight: 600;
  }
  
  .menu-btn {
    display: none;
    width: 38px;
    height: 38px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .menu-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-bright);
    transform: rotate(90deg);
  }

  /* Zone de contenu */
  .content { 
    padding: 32px 32px; 
    flex: 1;
  }

  /* Overlay mobile */
  .nav-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }
  
  .nav-overlay.show { 
    display: block; 
  }

  /* Animations globales */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  .animate-fade-in {
    animation: slideInUp 0.3s var(--transition-smooth) both;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }

  .page-transition {
    animation: slideInUp 0.4s var(--transition-smooth);
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .topbar-search {
      width: 200px;
    }
    
    .topbar-search:focus-within {
      width: 240px;
    }
  }
  
  @media (max-width: 768px) {
    :root { 
      --nav-w: 280px; 
      --nav-w-collapsed: 280px;
    }
    
    .nav { 
      transform: translateX(-100%); 
    }
    
    .nav.collapsed { 
      width: 280px;
    }
    
    .nav.open { 
      transform: translateX(0);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
    }
    
    .main, .main.expanded { 
      margin-left: 0; 
    }
    
    .menu-btn { 
      display: flex; 
    }
    
    .nav-collapse-btn {
      display: none;
    }
    
    .content { 
      padding: 20px; 
    }
    
    .topbar { 
      padding: 0 16px; 
      gap: 12px;
    }
    
    .topbar-search { 
      display: none; 
    }
    
    .topbar-title {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .content { 
      padding: 16px; 
    }
    
    .topbar-btn:not(.menu-btn):not(.user-btn) {
      display: none;
    }
  }

  /* Classes utilitaires */
  .text-mono { font-family: var(--mono); }
  .text-accent-blue { color: var(--accent-blue); }
  .text-accent-teal { color: var(--accent-teal); }
  .text-accent-amber { color: var(--accent-amber); }
  .text-accent-red { color: var(--accent-red); }
  
  .bg-surface { background: var(--bg-surface); }
  .bg-elevated { background: var(--bg-elevated); }
  
  .border-default { border: 1px solid var(--border); }
  .border-bright { border: 1px solid var(--border-bright); }
  
  .rounded-lg { border-radius: 8px; }
  .rounded-xl { border-radius: 12px; }
  
  .shadow-lg { box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); }
  .shadow-elevated { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
`;