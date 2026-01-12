import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import Button from './common/Button';
import Input from './common/Input';
import { LogIn, UserPlus } from 'lucide-react';
import iconImage from '../assets/icon.png';
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
    const { login, signup, loading, clearError, clearMessage } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Clear error and message when switching between sign in/up
    React.useEffect(() => {
        clearError();
        clearMessage();
    }, [isSignUp, clearError, clearMessage]);

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
            <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
            />
            <Button type="submit" isLoading={loading} className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-base" disabled={loading}>
                {isSignUp ? (
                    <>
                        <UserPlus className="w-5 h-5" />
                        <span>Sign Up</span>
                    </>
                ) : (
                    <>
                        <LogIn className="w-5 h-5" />
                        <span>Sign In</span>
                    </>
                )}
            </Button>
        </form>
    );
};



const AuthScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const { loginWithGoogle, loading, error, message, clearError, clearMessage } = useAuth();

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
                <div className="bg-glass backdrop-blur-xl border border-outline/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10"></div>

                    <div className="text-center mb-10 relative z-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-block mb-6"
                        >
                            <div className="bg-primary/20 p-4 rounded-2xl inline-block border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                                <img
                                    src={iconImage}
                                    alt="AgentForge"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-bold font-display text-on-surface mb-3 tracking-tight">
                            AgentForge
                        </h1>
                        <p className="text-on-surface-variant/80 text-sm font-medium">
                            {isSignUp ? 'Create your creative workspace' : 'Sign in to your AI dashboard'}
                        </p>
                    </div>

                    <div className="flex items-center bg-white/5 rounded-2xl p-1.5 mb-8 border border-white/10 relative z-10">
                        <motion.div
                            layoutId="auth-tab"
                            className="absolute inset-y-1.5 bg-primary rounded-xl shadow-lg z-0"
                            initial={false}
                            animate={{
                                left: isSignUp ? '50%' : '6px',
                                right: isSignUp ? '6px' : '50%'
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`relative z-10 w-1/2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 ${!isSignUp ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`relative z-10 w-1/2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 ${isSignUp ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
                        >
                            Sign Up
                        </button>
                    </div>


                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isSignUp ? 'signup' : 'login'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10"
                        >
                            <AuthForm isSignUp={isSignUp} />
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center my-6 relative z-10">
                        <div className="flex-grow h-px bg-white/10"></div>
                        <span className="mx-4 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">or</span>
                        <div className="flex-grow h-px bg-white/10"></div>
                    </div>

                    <button
                        onClick={loginWithGoogle}
                        disabled={loading}
                        className="w-full relative z-10 py-4 px-6 font-bold rounded-xl bg-surface-variant/30 border border-outline/30 hover:bg-surface-variant/50 hover:border-outline/50 transition-all flex items-center justify-center gap-3 text-base text-on-surface disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <GoogleIcon />
                        )}
                        <span>Continue with Google</span>
                    </button>


                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-xs font-medium"
                            >
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
                                <span className="flex-1">{error}</span>
                                <button onClick={clearError} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
                            </motion.div>
                        )}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-center gap-3 text-xs font-medium"
                            >
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                                <span className="flex-1">{message}</span>
                                <button onClick={clearMessage} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};


export default AuthScreen;
