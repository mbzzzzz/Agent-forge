
import React from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import AgentForgeLogo from './common/AgentForgeLogo';
import { ShaderAnimation } from './ui/shader-animation';
import { Sparkles, BarChart3, Rocket, Zap, Crown, Users } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
    onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
    return (
        <div className="min-h-screen w-full bg-background text-on-surface selection:bg-primary/30 relative overflow-x-hidden">
            {/* Background Animation */}
            <div className="fixed inset-0 z-0">
                <ShaderAnimation intensity={0.4} speed={0.6} />
            </div>

            {/* Hero Section */}
            <header className="relative z-10 pt-8 px-6 max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-lg">
                        <AgentForgeLogo className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold font-display tracking-tight">Agent Forge</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSignIn}
                        className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                        Sign In
                    </button>
                    <Button onClick={onGetStarted} size="sm" className="shadow-lg shadow-primary/20">
                        Get Started
                    </Button>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-32">
                <section className="px-6 max-w-5xl mx-auto text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">The Future of Creative Marketing</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold font-display tracking-tighter mb-8 bg-gradient-to-r from-on-surface via-on-surface to-on-surface-variant bg-clip-text">
                            Forging Ideas into <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Market Dominance</span>
                        </h1>
                        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
                            Stop settling for generic. Agent Forge deploys elite AI agents to handle your branding,
                            campaigns, and content. Professional-grade high-fidelity visuals at the speed of thought.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Button onClick={onGetStarted} className="h-16 px-10 text-lg group shadow-2xl shadow-primary/20">
                                Start Forging Now
                                <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                            <div className="flex -space-x-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-gradient-to-br from-surface-variant to-background overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i + 42}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="h-12 flex items-center pl-6 text-sm font-medium text-on-surface-variant/80">
                                    Join 500+ Top Marketers
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Zap}
                            title="Brand Kit Studio"
                            description="Establish an unforgettable identity in seconds. Logos, palettes, and typography that don't just look good—they convert."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Campaign Architect"
                            description="Elite-level marketing strategy on demand. Llama 3 powered campaign concepts and high-engagement social kits."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Crown}
                            title="Flux Visual Engine"
                            description="Ditch the stock photos. Hyper-realistic, 8K visuals for social media and mockups that set your brand apart."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* Marketing Insight / Senior Agent Voice */}
                <section className="mt-40 px-6 max-w-7xl mx-auto">
                    <div className="bg-glass/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                                    "In the digital age, <br />
                                    <span className="text-primary italic">Speed</span> is the only <br />
                                    unfair advantage."
                                </h2>
                                <div className="space-y-6 text-on-surface-variant leading-relaxed">
                                    <p>
                                        I’ve spent 20 years in the marketing trenches. The bottleneck was never creative—it was execution.
                                        Waiting for designers, waiting for copywriters, waiting for approval.
                                    </p>
                                    <p className="font-bold text-on-surface">
                                        Agent Forge breaks that bottleneck.
                                    </p>
                                    <p>
                                        Our AI agents are trained on high-converting patterns and elite design principles.
                                        They don't just generate; they innovate. From logo conception to final 8K campaign rollout,
                                        we've collapsed the creative lifecycle from weeks to seconds.
                                    </p>
                                </div>
                                <div className="mt-10 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-bold uppercase tracking-widest text-xs opacity-50">Chief Strategy Officer</div>
                                        <div className="text-on-surface">The Agent Forge Core</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-3xl bg-black/40">
                                <div className="absolute inset-0 flex items-center justify-center p-8 text-center group-hover:scale-105 transition-transform duration-700">
                                    <div className="space-y-4">
                                        <BarChart3 className="w-16 h-16 mx-auto text-primary opacity-50 mb-6" />
                                        <div className="text-3xl font-display font-bold">+340% Reach</div>
                                        <p className="text-sm text-on-surface-variant max-w-xs mx-auto">Average engagement increase for brands switching to Flux-powered campaign visuals.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-50 filter grayscale grayscale-brightness-150">
                        <AgentForgeLogo className="w-5 h-5" />
                        <span className="font-display font-bold text-lg">Agent Forge</span>
                    </div>
                    <div className="text-sm text-on-surface-variant font-medium">
                        &copy; 2026 Agent Forge AI. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Button variant="ghost" size="sm" onClick={onSignIn} className="text-on-surface-variant">Sign In</Button>
                        <Button size="sm" onClick={onGetStarted}>Join Waitlist</Button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string, delay: number }> = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="p-8 rounded-3xl bg-glass/20 border border-white/10 hover:border-primary/30 transition-all hover:bg-glass/30 group"
    >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-4">{title}</h3>
        <p className="text-on-surface-variant text-sm leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default LandingPage;
