import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import Button from './common/Button';
import Input from './common/Input';
import { Mail, KeyRound, LogIn, UserPlus, Bot } from 'lucide-react';
import { ShaderAnimation } from './ui/shader-animation';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.552-3.443-11.179-8.169l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.599,35.536,48,29.82,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
    </svg>
);

const AuthForm: React.FC<{ isSignUp: boolean }> = ({ isSignUp }) => {
    const { login, signup, loading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Clear error when switching between sign in/up
    React.useEffect(() => {
        clearError();
    }, [isSignUp, clearError]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            signup(email, password);
        } else {
            login(email, password);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-300 p-3 rounded-lg shadow-lg flex items-center gap-3 text-sm"
                >
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="flex-1">{error}</span>
                    <button 
                        type="button"
                        onClick={clearError}
                        className="text-red-300 hover:text-red-200 transition-colors"
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                <Input 
                    type="email" 
                    placeholder="email@example.com" 
                    value={email} 
                    onChange={e => {
                        setEmail(e.target.value);
                        if (error) clearError();
                    }} 
                    className="pl-10" 
                    required 
                />
            </div>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                <Input 
                    type="password" 
                    placeholder="Password (min 6 characters)" 
                    value={password} 
                    onChange={e => {
                        setPassword(e.target.value);
                        if (error) clearError();
                    }} 
                    className="pl-10" 
                    required 
                    minLength={6}
                />
            </div>
            <Button type="submit" isLoading={loading} className="w-full" disabled={loading}>
                {isSignUp ? <><UserPlus className="w-5 h-5"/>Sign Up</> : <><LogIn className="w-5 h-5"/>Sign In</>}
            </Button>
        </form>
    );
};


const AuthScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const { loginWithGoogle, loading } = useAuth();
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Shader Background */}
            <div className="absolute inset-0 z-0">
                <ShaderAnimation intensity={0.6} speed={0.8} />
            </div>
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 z-[1]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/90 to-secondary/10"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.6, damping: 20 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-50 blur-xl -z-10"></div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10"></div>
                    
                    <div className="text-center mb-8 relative z-10">
                        <motion.div 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-4"
                        >
                            <div className="bg-primary/20 p-3 rounded-xl inline-block">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-bold font-display text-on-surface mb-2 bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text">
                            Welcome to AgentForge
                        </h1>
                        <p className="text-on-surface-variant mt-2 text-sm">{isSignUp ? 'Create an account to start building.' : 'Sign in to your workspace.'}</p>
                    </div>
                    
                    <div className="flex items-center bg-surface-variant/20 backdrop-blur-sm rounded-xl p-1 mb-6 border border-outline/20 relative z-10">
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-lg bg-primary-container transition-all duration-300"
                            style={{
                                left: isSignUp ? '50%' : '0.25rem',
                                right: isSignUp ? '0.25rem' : '50%',
                            }}
                        />
                        <button 
                            onClick={() => setIsSignUp(false)} 
                            className={`relative z-10 w-1/2 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                                !isSignUp 
                                    ? 'text-on-primary-container' 
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => setIsSignUp(true)} 
                            className={`relative z-10 w-1/2 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                                isSignUp 
                                    ? 'text-on-primary-container' 
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isSignUp ? 'signup' : 'login'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10"
                        >
                            <AuthForm isSignUp={isSignUp} />
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center my-6 relative z-10">
                        <hr className="flex-grow border-outline/30"/>
                        <span className="mx-4 text-xs text-on-surface-variant font-medium">OR</span>
                        <hr className="flex-grow border-outline/30"/>
                    </div>

                    <Button 
                        onClick={loginWithGoogle} 
                        isLoading={loading} 
                        variant="secondary" 
                        className="w-full relative z-10 hover:scale-[1.02] transition-transform"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthScreen;
