import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import Button from './common/Button';
import Input from './common/Input';
import { Mail, KeyRound, LogIn, UserPlus } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.552-3.443-11.179-8.169l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.599,35.536,48,29.82,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path>
    </svg>
);

const AuthForm: React.FC<{ isSignUp: boolean }> = ({ isSignUp }) => {
    const { login, signup, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                <Input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/70" />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
                {isSignUp ? <><UserPlus className="w-5 h-5"/>Sign Up</> : <><LogIn className="w-5 h-5"/>Sign In</>}
            </Button>
        </form>
    );
};


const AuthScreen: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const { loginWithGoogle, loading } = useAuth();
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-full max-w-md bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) rounded-xl p-8 shadow-2xl"
             >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-display text-on-surface">Welcome to AgentForge</h1>
                    <p className="text-on-surface-variant mt-2">{isSignUp ? 'Create an account to start building.' : 'Sign in to your workspace.'}</p>
                </div>
                
                <div className="flex items-center bg-surface-variant/30 rounded-lg p-1 mb-6">
                    <button onClick={() => setIsSignUp(false)} className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${!isSignUp ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
                        Sign In
                    </button>
                    <button onClick={() => setIsSignUp(true)} className={`w-1/2 py-2.5 rounded-md font-semibold transition-colors ${isSignUp ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
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
                    >
                        <AuthForm isSignUp={isSignUp} />
                    </motion.div>
                </AnimatePresence>

                <div className="flex items-center my-6">
                    <hr className="flex-grow border-outline/30"/>
                    <span className="mx-4 text-xs text-on-surface-variant">OR</span>
                    <hr className="flex-grow border-outline/30"/>
                </div>

                <Button onClick={loginWithGoogle} isLoading={loading} variant="secondary" className="w-full">
                    <GoogleIcon />
                    Continue with Google
                </Button>

            </motion.div>
        </div>
    );
};

export default AuthScreen;
