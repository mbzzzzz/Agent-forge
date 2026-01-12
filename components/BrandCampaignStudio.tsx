import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './common/Button';
import { generateCampaignIdeas, generateCarouselPost, generateSocialPost, generateVideo } from '../services/huggingFaceService';
import { BrandCampaign, CarouselPost, CampaignInput } from '../types';
import { Target, ChevronRight, Layout, Video, Image as ImageIcon, Sparkles, Check, ArrowLeft, Copy } from 'lucide-react';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useToastContext } from '../contexts/ToastContext';

// --- Constants ---

const TONE_OPTIONS = [
    "Professional & Authoritative",
    "Friendly & Approachable",
    "Luxury & Sophisticated",
    "Bold & Energetic",
    "Minimalist & Modern",
    "Playful & Fun",
    "Trustworthy & Reliable"
];

const AUDIENCE_OPTIONS = [
    "Gen Z (18-24)",
    "Millennials (25-40)",
    "Gen X (41-56)",
    "Baby Boomers (57+)",
    "Small Business Owners",
    "Tech Enthusiasts",
    "Parents",
    "Students",
    "Luxury Shoppers"
];

// --- Components ---

const CampaignCard: React.FC<{ campaign: BrandCampaign; onSelect: () => void }> = ({ campaign, onSelect }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-glass backdrop-blur-[var(--glass-blur)] border border-outline/20 p-6 rounded-xl cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
        onClick={onSelect}
    >
        <div className="h-2 w-12 bg-primary/20 rounded-full mb-4"></div>
        <h3 className="text-xl font-bold text-on-surface mb-2 font-display">{campaign.title}</h3>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-3">{campaign.description}</p>
        <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-primary-container text-on-primary-container rounded-md">
                {campaign.targetAudience}
            </span>
        </div>
    </motion.div>
);

const GeneratedContentSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-glass/50 border border-outline/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-outline/10 flex items-center gap-2 bg-black/20">
            <Icon className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-on-surface">{title}</h4>
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

// --- Main Component ---

const BrandCampaignStudio: React.FC = () => {
    const { showToast } = useToastContext();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Input Step State
    const [input, setInput] = useState<CampaignInput>({
        brandName: '',
        tone: TONE_OPTIONS[0],
        targetAudience: AUDIENCE_OPTIONS[1],
        products: ''
    });

    // Selection Step State
    const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);

    // Execution Step State (Generated Assets)
    const [socialPost, setSocialPost] = useState<{ image: string; caption: string; hashtags: string } | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [carouselPost, setCarouselPost] = useState<CarouselPost | null>(null);

    const [generatingType, setGeneratingType] = useState<'social' | 'video' | 'carousel' | null>(null);
    const [status, setStatus] = useState('');

    // --- Handlers ---

    const handleCreateCampaigns = async () => {
        if (!input.brandName || !input.products) {
            showToast("Please fill in all fields", "error");
            return;
        }

        setIsLoading(true);
        try {
            const results = await generateCampaignIdeas(input);
            setCampaigns(results);
            setStep(2);
        } catch (e) {
            console.error(e);
            showToast("Failed to generate campaigns", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCampaign = (campaign: BrandCampaign) => {
        setSelectedCampaign(campaign);
        setStep(3);
        // Reset previous generations
        setSocialPost(null);
        setVideoUrl(null);
        setCarouselPost(null);
    };

    const handleGenerateSocial = async () => {
        if (!selectedCampaign) return;
        setGeneratingType('social');
        try {
            const result = await generateSocialPost("Instagram", selectedCampaign.title + " - " + selectedCampaign.keyMessage);
            setSocialPost(result);
        } catch (e) {
            showToast("Failed to generate social post", "error");
        } finally {
            setGeneratingType(null);
        }
    };

    const handleGenerateVideo = async () => {
        if (!selectedCampaign) return;
        setGeneratingType('video');
        try {
            const prompt = `Cinematic commercial for ${selectedCampaign.title}. ${selectedCampaign.description}. High quality, professional lighting.`;
            const url = await generateVideo(prompt, setStatus);
            setVideoUrl(url);
        } catch (e) {
            showToast("Failed to generate video", "error");
        } finally {
            setGeneratingType(null);
            setStatus('');
        }
    };

    const handleGenerateCarousel = async () => {
        if (!selectedCampaign) return;
        setGeneratingType('carousel');
        try {
            const result = await generateCarouselPost(selectedCampaign, "Modern & Clean");
            setCarouselPost(result);
        } catch (e) {
            showToast("Failed to generate carousel", "error");
        } finally {
            setGeneratingType(null);
        }
    };

    // --- Renders ---

    const renderStep1 = () => (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-bold text-on-surface">Let's build your Campaign</h2>
                <p className="text-on-surface-variant">Tell us about your brand and what you're selling.</p>
            </div>

            <div className="bg-glass backdrop-blur-[var(--glass-blur)] border border-outline/20 p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">Brand Name</label>
                    <input
                        type="text"
                        className="w-full bg-surface-variant/30 border border-outline/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="e.g. Acme Co."
                        value={input.brandName}
                        onChange={(e) => setInput({ ...input, brandName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Brand Tone</label>
                        <select
                            className="w-full bg-surface-variant/30 border border-outline/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none [&>option]:bg-surface-variant [&>option]:text-white"
                            value={input.tone}
                            onChange={(e) => setInput({ ...input, tone: e.target.value })}
                        >
                            {TONE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Target Audience</label>
                        <select
                            className="w-full bg-surface-variant/30 border border-outline/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none [&>option]:bg-surface-variant [&>option]:text-white"
                            value={input.targetAudience}
                            onChange={(e) => setInput({ ...input, targetAudience: e.target.value })}
                        >
                            {AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">Products / Services</label>
                    <textarea
                        className="w-full bg-surface-variant/30 border border-outline/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none h-32 resize-none"
                        placeholder="Describe what you are selling..."
                        value={input.products}
                        onChange={(e) => setInput({ ...input, products: e.target.value })}
                    />
                </div>

                <Button
                    onClick={handleCreateCampaigns}
                    isLoading={isLoading}
                    className="w-full h-12 text-lg"
                >
                    Generate Campaign Concepts
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div>
                    <h2 className="text-2xl font-display font-bold text-on-surface">Select a Concept</h2>
                    <p className="text-on-surface-variant text-sm">We generated 5 campaigns based on your profile.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign, idx) => (
                    <CampaignCard
                        key={idx}
                        campaign={campaign}
                        onSelect={() => handleSelectCampaign(campaign)}
                    />
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => {
        if (!selectedCampaign) return null;

        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setStep(2)} size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Concepts
                        </Button>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-on-surface">{selectedCampaign.title}</h2>
                            <p className="text-on-surface-variant text-sm">{selectedCampaign.objective}</p>
                        </div>
                    </div>
                </div>

                {/* Content Generation Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Column 1: Social Post */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> Social Post
                            </h3>
                            <Button
                                size="sm"
                                variant={socialPost ? "secondary" : "primary"}
                                onClick={handleGenerateSocial}
                                isLoading={generatingType === 'social'}
                                disabled={generatingType === 'social'}
                            >
                                {socialPost ? <RotateCcwIcon className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {socialPost ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {socialPost ? (
                            <GeneratedContentSection title="Instagram Post" icon={ImageIcon}>
                                <img src={`data:image/png;base64,${socialPost.image}`} alt="Social" className="w-full rounded-lg mb-4" />
                                <div className="bg-black/30 p-3 rounded-lg text-xs text-on-surface-variant space-y-2">
                                    <p>{socialPost.caption}</p>
                                    <p className="text-primary/70">{socialPost.hashtags}</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <DownloadAction dataUrl={`data:image/png;base64,${socialPost.image}`} filename="social-post.png" />
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50">
                                Generate a standard social media post
                            </div>
                        )}
                    </div>

                    {/* Column 2: Carousel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <Layout className="w-5 h-5" /> Carousel
                            </h3>
                            <Button
                                size="sm"
                                variant={carouselPost ? "secondary" : "primary"}
                                onClick={handleGenerateCarousel}
                                isLoading={generatingType === 'carousel'}
                                disabled={generatingType === 'carousel'}
                            >
                                {carouselPost ? <RotateCcwIcon className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {carouselPost ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {carouselPost ? (
                            <GeneratedContentSection title="5-Slide Carousel" icon={Layout}>
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                                    {carouselPost.slides.map((slide, i) => (
                                        <div key={i} className="min-w-[200px] snap-center">
                                            {slide.image ? (
                                                <img src={`data:image/png;base64,${slide.image}`} className="w-full aspect-square object-cover rounded-lg mb-2" />
                                            ) : (
                                                <div className="w-full aspect-square bg-white/10 rounded-lg animate-pulse" />
                                            )}
                                            <p className="text-xs text-on-surface-variant line-clamp-2">{slide.caption}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg text-xs text-on-surface-variant">
                                    {carouselPost.caption.substring(0, 100)}...
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50">
                                Generate a 5-slide carousel
                            </div>
                        )}
                    </div>

                    {/* Column 3: Video */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <Video className="w-5 h-5" /> Video Ad
                            </h3>
                            <Button
                                size="sm"
                                variant={videoUrl ? "secondary" : "primary"}
                                onClick={handleGenerateVideo}
                                isLoading={generatingType === 'video'}
                                disabled={generatingType === 'video'}
                            >
                                {videoUrl ? <RotateCcwIcon className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {videoUrl ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {generatingType === 'video' && status && (
                            <div className="p-4 bg-primary/10 rounded-lg text-xs text-primary animate-pulse mb-2">
                                {status}
                            </div>
                        )}

                        {videoUrl ? (
                            <GeneratedContentSection title="Campaign Video" icon={Video}>
                                <video src={videoUrl} controls className="w-full rounded-lg shadow-lg mb-4" />
                                <div className="flex justify-end">
                                    <DownloadAction dataUrl={videoUrl} filename="campaign-video.mp4" />
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50">
                                Generate a campaign video
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Helper
const RotateCcwIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 5v7h7" /></svg>
);

export default BrandCampaignStudio;
