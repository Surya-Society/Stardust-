import { useState, useEffect, useRef } from 'react';
import { 
  FiGrid, FiKey, FiCreditCard, FiUsers, FiMessageCircle,
  FiCode, FiBox, FiSettings, FiLogOut, FiBell, FiSearch,
  FiMenu, FiUser, FiChevronLeft, FiChevronRight, FiShield, FiDollarSign
} from 'react-icons/fi';
import Dashboard         from '../components/Dashboard';
import KeysPage          from '../components/CleActvation';
import SubscriptionsPage from '../components/Abonnement';
import ClientsPage       from '../components/Clients';
import CommentsPage      from '../components/Avis';
import ApiPage           from '../components/ClesApi';
import Applications      from '../components/ApplicationsModule/Applications';
import SettingsPage      from '../components/Parametres';
import Toast             from '../components/Toast';
import AdminPage         from '../components/Admin';
import ProfileModal      from '../components/ProfilModal';
import FinanceSection    from '../components/FinanceSection';

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

type NotificationType = 'green' | 'red' | 'amber' | 'blue';

interface AccueilProps {
  onLogout?: () => void;
}

export default function Accueil({ onLogout }: AccueilProps) {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  
  const userBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && navOpen) {
        setNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navOpen]);

  const showNotification = (msg: string, type: NotificationType = 'green') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: FiGrid, label: 'Vue d\'ensemble' },
    { id: 'keys', icon: FiKey, label: 'Clés d\'activation', badge: '5' },
    { id: 'subscriptions', icon: FiCreditCard, label: 'Abonnements', badge: '1', badgeColor: 'amber' },
    { id: 'clients', icon: FiUsers, label: 'Clients' },
    { id: 'comments', icon: FiMessageCircle, label: 'Site web', badge: '4', badgeColor: 'green' },
    { id: 'finance', icon: FiDollarSign, label: 'Finance', badge: 'Nouveau', badgeColor: 'green' },
    { id: 'api', icon: FiCode, label: 'Clés API' },
    { id: 'apps', icon: FiBox, label: 'Applications' },
    { id: 'admin', icon: FiShield, label: 'Administration' },
  ];

  const pageTitles: Record<string, string> = {
    dashboard: 'Vue d\'ensemble',
    keys: 'Clés d\'activation',
    subscriptions: 'Abonnements',
    clients: 'Clients',
    comments: 'Avis Clients',
    finance: 'Finance',
    api: 'Clés API',
    apps: 'Applications',
    settings: 'Paramètres',
    admin: 'Administration',
  };

  const navigateTo = (pageId: string) => {
    setCurrentPage(pageId);
    if (isMobile) {
      setNavOpen(false);
    }
  };

  const toggleNavCollapse = () => {
    if (!isMobile) {
      setNavCollapsed(!navCollapsed);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNotify={showNotification} />;
      case 'keys':
        return <KeysPage />;
      case 'subscriptions':
        return <SubscriptionsPage onNotify={showNotification} />;
      case 'clients':
        return <ClientsPage onNotify={showNotification} />;
      case 'comments':
        return <CommentsPage />;
      case 'finance':
        return <FinanceSection />;
      case 'api':
        return <ApiPage onNotify={showNotification} />;
      case 'apps':
        return <Applications onNotify={showNotification} />;
      case 'settings':
        return <SettingsPage onNotify={showNotification} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <Dashboard onNotify={showNotification} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#090c10] text-[#e6edf3] text-sm leading-relaxed antialiased font-['DM_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363d; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Overlay mobile */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] animate-[fadeIn_0.2s_ease] ${navOpen ? 'block' : 'hidden'}`}
          onClick={() => setNavOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* Navigation latérale */}
      <nav className={`fixed top-0 left-0 bottom-0 z-[100] flex flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[#0d1117] border-r border-[#21262d] ${navOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'} ${navCollapsed && !isMobile ? 'w-[80px]' : 'w-[280px]'}`}>
        <div className="relative border-b border-[#21262d]">
          <div className={`flex items-center gap-3 min-h-[72px] ${navCollapsed && !isMobile ? 'justify-center px-0 py-5' : 'p-5'}`}>
            <img src="/LogoNova.png" alt="Nova Logo" className="w-9 h-9 object-contain transition-transform duration-200 hover:scale-105" />
            {(!navCollapsed || isMobile) && (
              <span className="font-semibold text-lg tracking-tight text-white whitespace-nowrap">Nova</span>
            )}
          </div>
          
          {!isMobile && (
            <button 
              className={`absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-[#1c2330] border border-[#21262d] flex items-center justify-center text-[#8b949e] cursor-pointer transition-all duration-200 z-10 hover:bg-[#388bfd] hover:border-[#388bfd] hover:text-white ${navCollapsed ? 'rotate-180' : ''}`}
              onClick={toggleNavCollapse}
              title={navCollapsed ? 'Développer' : 'Réduire'}
              type="button"
            >
              {navCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
          )}
        </div>

        <div className={`${navCollapsed && !isMobile ? 'px-1 py-4' : 'px-3 py-4'}`}>
          <div className={`text-[10px] font-semibold tracking-[1.2px] uppercase text-[#484f58] mb-2 whitespace-nowrap ${navCollapsed && !isMobile ? 'text-center px-0' : 'px-2'}`}>
            {(!navCollapsed || isMobile) ? 'Navigation' : '···'}
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`group relative flex items-center gap-3 px-3 py-2.5 text-[#8b949e] cursor-pointer text-[13.5px] transition-all duration-200 border-none bg-transparent w-full text-left mb-0.5 whitespace-nowrap hover:text-[#e6edf3] hover:bg-[#161b22] ${currentPage === item.id ? '!text-[#e6edf3] !bg-[#1c2330]' : ''} ${navCollapsed && !isMobile ? 'justify-center px-0' : ''}`}
              onClick={() => navigateTo(item.id)}
              type="button"
              title={navCollapsed && !isMobile ? item.label : undefined}
            >
              {currentPage === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#388bfd]" />
              )}
              <item.icon size={18} className="flex-shrink-0" />
              {(!navCollapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-white text-[10px] font-semibold py-0.5 px-1.5 min-w-[20px] text-center ${
                      item.badgeColor === 'green' ? 'bg-[#39d353]' : item.badgeColor === 'amber' ? 'bg-[#e3b341]' : 'bg-[#f85149]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {navCollapsed && !isMobile && item.badge && (
                <span className="absolute top-0.5 right-0.5 bg-[#f85149] text-white text-[8px] font-semibold py-0.5 px-1 min-w-4 text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={`mt-auto ${navCollapsed && !isMobile ? 'px-1 py-4' : 'px-3 py-4'}`}>
          <div className={`text-[10px] font-semibold tracking-[1.2px] uppercase text-[#484f58] mb-2 whitespace-nowrap ${navCollapsed && !isMobile ? 'text-center px-0' : 'px-2'}`}>
            {(!navCollapsed || isMobile) ? 'Système' : '···'}
          </div>
          <button
            className={`group relative flex items-center gap-3 px-3 py-2.5 text-[#8b949e] cursor-pointer text-[13.5px] transition-all duration-200 border-none bg-transparent w-full text-left mb-0.5 whitespace-nowrap hover:text-[#e6edf3] hover:bg-[#161b22] ${currentPage === 'settings' ? '!text-[#e6edf3] !bg-[#1c2330]' : ''} ${navCollapsed && !isMobile ? 'justify-center px-0' : ''}`}
            onClick={() => navigateTo('settings')}
            type="button"
            title={navCollapsed && !isMobile ? 'Paramètres' : undefined}
          >
            {currentPage === 'settings' && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#388bfd]" />
            )}
            <FiSettings size={18} className="flex-shrink-0" />
            {(!navCollapsed || isMobile) && (
              <span className="flex-1 text-left">Paramètres</span>
            )}
          </button>
        </div>

        <div className={`border-t border-[#21262d] ${navCollapsed && !isMobile ? 'p-4' : 'p-4'}`}>
          <button className={`flex items-center gap-3 px-3 py-2 cursor-pointer border-none bg-transparent w-full transition-all duration-200 hover:bg-[#161b22] ${navCollapsed && !isMobile ? 'justify-center px-0' : ''}`} type="button" onClick={handleLogout}>
            <div className="w-9 h-9 bg-[#388bfd] flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            {(!navCollapsed || isMobile) && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[13px] font-semibold text-[#e6edf3]">Admin</div>
                  <div className="text-[11px] text-[#484f58]">Super Admin</div>
                </div>
                <FiLogOut size={16} className="text-[#484f58] transition-transform duration-200 group-hover:text-[#f85149] group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className={`flex-1 min-h-screen flex flex-col bg-[#090c10] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${navCollapsed && !isMobile ? 'ml-[80px]' : isMobile ? 'ml-0' : 'ml-[280px]'}`}>
        {/* Barre supérieure */}
        <header className="h-16 border-b border-[#21262d] flex items-center px-7 gap-5 bg-[rgba(13,17,23,0.95)] backdrop-blur-sm sticky top-0 z-50">
          <button 
            className={`${isMobile ? 'flex' : 'flex'} w-[38px] h-[38px] bg-[#161b22] border border-[#21262d] items-center justify-center cursor-pointer text-[#8b949e] transition-all duration-200 hover:text-[#e6edf3] hover:border-[#30363d] ${isMobile ? '' : 'hover:rotate-90'}`}
            onClick={() => isMobile ? setNavOpen(!navOpen) : toggleNavCollapse()}
            type="button"
            aria-label="Menu"
          >
            <FiMenu size={20} />
          </button>
          
          <h1 className="text-base font-medium tracking-tight text-[#e6edf3] flex-1">
            {pageTitles[currentPage] || 'Nova'}
          </h1>
          
          <div className="hidden md:flex items-center gap-2.5 bg-[#161b22] border border-[#21262d] px-4 py-2 w-[280px] transition-all duration-200 focus-within:border-[#388bfd] focus-within:shadow-[0_0_0_3px_rgba(56,139,253,0.1)] focus-within:w-[320px]">
            <FiSearch size={16} className="text-[#484f58]" />
            <input 
              type="text" 
              placeholder="Recherche globale..." 
              aria-label="Recherche globale"
              className="bg-transparent border-none outline-none text-[#e6edf3] font-['DM_Sans'] text-[13px] w-full placeholder:text-[#484f58]"
            />
          </div>
          
          <button 
            className="relative w-[38px] h-[38px] bg-[#161b22] border border-[#21262d] flex items-center justify-center cursor-pointer text-[#8b949e] transition-all duration-200 hover:text-[#e6edf3] hover:border-[#30363d] hover:-translate-y-px"
            onClick={() => showNotification('Aucune nouvelle notification', 'blue')}
            type="button"
            aria-label="Notifications"
          >
            <FiBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#f85149] border-2 border-[#0d1117]" />
          </button>
          
          <button
            ref={userBtnRef}
            className={`w-[38px] h-[38px] bg-[#388bfd] border border-[#21262d] flex items-center justify-center cursor-pointer text-white transition-all duration-200 hover:brightness-110 ${profileOpen ? 'ring-2 ring-[#388bfd] ring-offset-2 ring-offset-[#090c10]' : ''}`}
            type="button"
            aria-label="Profil"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(v => !v)}
          >
            <span className="text-sm font-semibold">A</span>
          </button>
        </header>

        {/* Zone de contenu */}
        <div className="p-8 flex-1 md:p-8 sm:p-5">
          {renderPage()}
        </div>
      </main>

      {/* Toast de notification */}
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Modal de profil */}
      {userBtnRef.current && (
        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          onLogout={handleLogout}
          anchorRef={userBtnRef as React.RefObject<HTMLButtonElement>}
        />
      )}
    </div>
  );
}