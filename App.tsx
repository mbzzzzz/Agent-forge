import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ModuleId, CreativeModule } from './types';
import { CREATIVE_MODULES } from './constants';
import BrandKitStudio from './components/BrandKitStudio';
import MockupStudio from './components/MockupStudio';
import PosterStudio from './components/PosterStudio';
import SocialMediaStudio from './components/SocialMediaStudio';
import VideoStudio from './components/VideoStudio';
import AuthScreen from './components/Auth';
import { useAuth } from './AuthContext';
import { User, LogOut, Settings, ChevronDown, Bot } from 'lucide-react';


interface AppContextType {
  setBrandAccentColor: (color: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

const Sidebar: React.FC<{
  activeModule: ModuleId;
  setActiveModule: (id: ModuleId) => void;
}> = ({ activeModule, setActiveModule }) => {
  return (
    <aside className="w-80 bg-glass backdrop-blur-[var(--glass-blur)] border-r border-white/10 p-4 flex flex-col z-10 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-4 pt-4">
        <div className="bg-primary p-2.5 rounded-md">
          <Bot className="w-6 h-6 text-on-primary"/>
        </div>
        <h1 className="text-xl font-bold font-display text-on-surface">AgentForge</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {CREATIVE_MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`relative flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
              activeModule === module.id
                ? 'text-on-primary-container'
                : 'text-on-surface-variant hover:bg-white/5'
            }`}
          >
            {activeModule === module.id && (
              <motion.div
                layoutId="active-module-indicator"
                className="absolute inset-0 bg-primary-container rounded-lg z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-4">
               <module.icon className="w-5 h-5" />
               <span className="font-semibold">{module.name}</span>
            </div>
          </button>
        ))}
      </nav>
      <div className="mt-auto text-center text-on-surface-variant/50 text-xs px-4 pb-4">
        <p>Powered by Google AI</p>
      </div>
    </aside>
  );
};

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 bg-glass p-2 rounded-full border border-transparent hover:border-outline transition-colors">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-sm text-on-surface hidden md:block">{user.email}</span>
        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
           <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 w-56 bg-surface-variant border border-outline rounded-md shadow-lg z-50 overflow-hidden"
           >
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container rounded-md transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Header: React.FC<{ module: CreativeModule }> = ({ module }) => {
  return (
    <header className="p-6 flex justify-between items-center shrink-0">
      <div>
        <h2 className="text-3xl font-bold font-display text-on-surface">{module.name}</h2>
        <p className="text-on-surface-variant mt-1">{module.description}</p>
      </div>
      <UserMenu />
    </header>
  );
};

const Workspace: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(ModuleId.BRAND_KIT);
  const [brandAccentColor, setBrandAccentColor] = useState<string>('#C3B6FF'); // Default primary color

  const renderActiveModule = () => {
    switch (activeModuleId) {
      case ModuleId.BRAND_KIT: return <BrandKitStudio />;
      case ModuleId.MOCKUP: return <MockupStudio />;
      case ModuleId.POSTER: return <PosterStudio />;
      case ModuleId.SOCIAL: return <SocialMediaStudio />;
      case ModuleId.VIDEO: return <VideoStudio />;
      default: return null;
    }
  };
  
  const activeModule = CREATIVE_MODULES.find(m => m.id === activeModuleId)!;

  return (
    <AppContext.Provider value={{ setBrandAccentColor }}>
      <div className="h-screen w-full flex bg-background font-sans overflow-hidden relative">
        <div 
          className="absolute inset-0 z-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 15% 25%, ${brandAccentColor}30 0%, transparent 40%)`
          }}
        />
        <Sidebar activeModule={activeModuleId} setActiveModule={setActiveModuleId} />
        <main className="flex-1 flex flex-col z-10 min-w-0">
          <Header module={activeModule} />
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModuleId}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 30,
                  duration: 0.320
                }}
              >
                {renderActiveModule()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
}


const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        {/* You can replace this with a more sophisticated loading spinner */}
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Workspace />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <AuthScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
