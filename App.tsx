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
import AuthCallback from './components/AuthCallback';
import { useAuth } from './AuthContext';
import { User, LogOut, Settings, ChevronDown, Bot } from 'lucide-react';
import { ShaderAnimation } from './components/ui/shader-animation';


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
    <aside className="w-80 bg-glass backdrop-blur-[var(--glass-blur)] border-r border-white/10 p-6 flex flex-col z-10 shrink-0 shadow-2xl relative">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg"
        >
          <Bot className="w-6 h-6 text-on-primary"/>
        </motion.div>
        <div>
          <h1 className="text-xl font-bold font-display text-on-surface">AgentForge</h1>
          <p className="text-xs text-on-surface-variant/70">Creative Studio</p>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {CREATIVE_MODULES.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
              activeModule === module.id
                ? 'text-on-primary-container'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
            }`}
          >
            {activeModule === module.id && (
              <motion.div
                layoutId="active-module-indicator"
                className="absolute inset-0 bg-primary-container rounded-xl z-0 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-4">
               <module.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeModule === module.id ? 'scale-110' : ''}`} />
               <span className="font-semibold">{module.name}</span>
            </div>
          </button>
        ))}
      </nav>
      <div className="mt-auto text-center text-on-surface-variant/40 text-xs px-4 pb-4 border-t border-outline/20 pt-4">
        <p>Powered by Google AI</p>
        <p className="mt-1">Built with Supabase</p>
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
      <motion.button 
        onClick={() => setIsOpen(!isOpen)} 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 bg-glass backdrop-blur-sm p-2 rounded-xl border border-outline/30 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-on-primary shadow-md">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-sm text-on-surface hidden md:block max-w-[120px] truncate">{user.email}</span>
        <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
           <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 w-56 bg-glass backdrop-blur-[var(--glass-blur)] border border-outline/30 rounded-xl shadow-2xl z-50 overflow-hidden"
           >
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-primary-container/50 hover:text-on-primary-container rounded-lg transition-all duration-200 group">
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Settings
                </button>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200 group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
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
    <header className="p-6 flex justify-between items-center shrink-0 bg-glass/30 backdrop-blur-sm border-b border-outline/20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold font-display text-on-surface flex items-center gap-3">
          <module.icon className="w-8 h-8 text-primary" />
          {module.name}
        </h2>
        <p className="text-on-surface-variant mt-1 text-sm">{module.description}</p>
      </motion.div>
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
        {/* Animated Shader Background */}
        <div className="absolute inset-0 z-0">
          <ShaderAnimation intensity={0.5} speed={0.7} />
        </div>
        
        {/* Dynamic background gradient based on brand color - layered over shader */}
        <div 
          className="absolute inset-0 z-[1] transition-all duration-1000 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at 15% 25%, ${brandAccentColor}25 0%, transparent 50%),
                        radial-gradient(circle at 85% 75%, ${brandAccentColor}15 0%, transparent 40%)`
          }}
        />
        
        {/* Additional subtle overlay for depth */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-background/70 via-background/50 to-background/70 pointer-events-none"></div>
        
        <Sidebar activeModule={activeModuleId} setActiveModule={setActiveModuleId} />
        <main className="flex-1 flex flex-col z-10 min-w-0 relative">
          <Header module={activeModule} />
          <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-10">
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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen to popstate for browser back/forward
    window.addEventListener('popstate', handleLocationChange);
    
    // Also check on initial load and when hash changes (for OAuth callbacks)
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Handle OAuth callback route
  if (currentPath === '/auth/callback') {
    return <AuthCallback />;
  }

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
