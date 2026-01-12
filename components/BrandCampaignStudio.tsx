import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './common/Button';
import { generateCampaignIdeas, generateCarouselPost, generateSocialPost, generateVideo } from '../services/huggingFaceService';
import { BrandCampaign, CarouselPost, CampaignInput } from '../types';
import { Target, ChevronRight, Layout, Video, Image as ImageIcon, Sparkles, Check, ArrowLeft, Copy, Maximize2, RotateCcw, Hash, MessageSquare } from 'lucide-react';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useToastContext } from '../contexts/ToastContext';
import ProgressIndicator from './common/ProgressIndicator';
import SkeletonLoader from './common/SkeletonLoader';
import Lightbox from './common/Lightbox';
import CarouselDownload from './common/CarouselDownload';

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
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-glass backdrop-blur-[var(--glass-blur)] border border-outline/20 p-6 rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/10 group relative overflow-hidden"
        onClick={onSelect}
    >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-300 pointer-events-none"></div>
        
        {/* Animated accent bar */}
        <motion.div 
            className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full mb-4 relative z-10"
            initial={{ width: 48 }}
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.3 }}
        ></motion.div>
        
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-on-surface mb-2 font-display group-hover:text-primary transition-colors">{campaign.title}</h3>
            <p className="text-on-surface-variant text-sm mb-4 line-clamp-3">{campaign.description}</p>
            <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-3 py-1.5 bg-primary-container/80 backdrop-blur-sm text-on-primary-container rounded-md font-medium">
                    {campaign.targetAudience}
                </span>
                <span className="text-xs px-3 py-1.5 bg-surface-variant/50 text-on-surface-variant rounded-md font-medium">
                    {campaign.objective}
                </span>
            </div>
        </div>
        
        {/* Hover indicator */}
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <ChevronRight className="w-5 h-5" />
        </motion.div>
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
    
    // Store brand name for use in downloads and prompts
    const [currentBrandName, setCurrentBrandName] = useState<string>('');

    // Selection Step State
    const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);

    // Execution Step State (Generated Assets)
    const [socialPost, setSocialPost] = useState<{ image: string; caption: string; hashtags: string } | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [carouselPost, setCarouselPost] = useState<CarouselPost | null>(null);

    const [generatingType, setGeneratingType] = useState<'social' | 'video' | 'carousel' | null>(null);
    const [status, setStatus] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string>('');
    const [lightboxType, setLightboxType] = useState<'image' | 'video'>('image');
    const [captionExpanded, setCaptionExpanded] = useState(false);
    
    // Form validation
    const [errors, setErrors] = useState<{ brandName?: string; products?: string }>({});
    
    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${type} copied to clipboard!`, 'success');
    };

    // --- Handlers ---

    const validateForm = () => {
        const newErrors: { brandName?: string; products?: string } = {};
        
        if (!input.brandName.trim()) {
            newErrors.brandName = 'Brand name is required';
        } else if (input.brandName.trim().length < 2) {
            newErrors.brandName = 'Brand name must be at least 2 characters';
        }
        
        if (!input.products.trim()) {
            newErrors.products = 'Products/Services description is required';
        } else if (input.products.trim().length < 10) {
            newErrors.products = 'Please provide at least 10 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateCampaigns = async () => {
        if (!validateForm()) {
            showToast("Please fix the errors in the form", "error");
            return;
        }

        setIsLoading(true);
        setErrors({});
        try {
            const results = await generateCampaignIdeas(input);
            setCampaigns(results);
            setCurrentBrandName(input.brandName); // Store brand name for later use
            setStep(2);
        } catch (e) {
            console.error(e);
            showToast("Failed to generate campaigns", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const openLightbox = (src: string, type: 'image' | 'video' = 'image') => {
        setLightboxSrc(src);
        setLightboxType(type);
        setLightboxOpen(true);
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
            const result = await generateSocialPost("Instagram", selectedCampaign.title + " - " + selectedCampaign.keyMessage, currentBrandName);
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
            const result = await generateCarouselPost(selectedCampaign, "Modern & Clean", currentBrandName);
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

            <ProgressIndicator 
                currentStep={1} 
                totalSteps={3} 
                labels={['Brand Info', 'Select Concept', 'Generate Content']}
            />

            <div className="bg-glass backdrop-blur-[var(--glass-blur)] border border-outline/20 p-8 rounded-2xl shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2 flex items-center gap-2">
                        Brand Name
                        {errors.brandName && <span className="text-red-400 text-xs">*</span>}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full bg-surface-variant/30 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:outline-none transition-all ${
                                errors.brandName 
                                    ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-outline/30 focus:ring-primary focus:border-primary'
                            }`}
                            placeholder="e.g. Acme Co."
                            value={input.brandName}
                            onChange={(e) => {
                                setInput({ ...input, brandName: e.target.value });
                                if (errors.brandName) {
                                    setErrors({ ...errors, brandName: undefined });
                                }
                            }}
                        />
                        {input.brandName && !errors.brandName && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <Check className="w-5 h-5 text-green-400" />
                            </motion.div>
                        )}
                    </div>
                    {errors.brandName && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs mt-1"
                        >
                            {errors.brandName}
                        </motion.p>
                    )}
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
                    <label className="block text-sm font-medium text-on-surface-variant mb-2 flex items-center gap-2">
                        Products / Services
                        {errors.products && <span className="text-red-400 text-xs">*</span>}
                    </label>
                    <div className="relative">
                        <textarea
                            className={`w-full bg-surface-variant/30 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:outline-none h-32 resize-none transition-all ${
                                errors.products 
                                    ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' 
                                    : 'border-outline/30 focus:ring-primary focus:border-primary'
                            }`}
                            placeholder="Describe what you are selling..."
                            value={input.products}
                            onChange={(e) => {
                                setInput({ ...input, products: e.target.value });
                                if (errors.products) {
                                    setErrors({ ...errors, products: undefined });
                                }
                            }}
                        />
                        {input.products && !errors.products && input.products.length >= 10 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-3"
                            >
                                <Check className="w-5 h-5 text-green-400" />
                            </motion.div>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        {errors.products && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-xs"
                            >
                                {errors.products}
                            </motion.p>
                        )}
                        <span className={`text-xs ml-auto ${input.products.length < 10 ? 'text-on-surface-variant/60' : 'text-green-400'}`}>
                            {input.products.length} / 10 min
                        </span>
                    </div>
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

            <ProgressIndicator 
                currentStep={2} 
                totalSteps={3} 
                labels={['Brand Info', 'Select Concept', 'Generate Content']}
            />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <SkeletonLoader key={idx} variant="card" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, idx) => (
                        <CampaignCard
                            key={idx}
                            campaign={campaign}
                            onSelect={() => handleSelectCampaign(campaign)}
                        />
                    ))}
                </div>
            )}
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

                <ProgressIndicator 
                    currentStep={3} 
                    totalSteps={3} 
                    labels={['Brand Info', 'Select Concept', 'Generate Content']}
                />

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
                                {socialPost ? <RotateCcw className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {socialPost ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {generatingType === 'social' ? (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center">
                                <SkeletonLoader variant="image" className="w-full h-full" />
                            </div>
                        ) : socialPost ? (
                            <GeneratedContentSection title="Instagram Post" icon={ImageIcon}>
                                <div className="relative group">
                                    <img 
                                        src={`data:image/png;base64,${socialPost.image}`} 
                                        alt="Social" 
                                        className="w-full rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => openLightbox(`data:image/png;base64,${socialPost.image}`, 'image')}
                                    />
                                    <button
                                        onClick={() => openLightbox(`data:image/png;base64,${socialPost.image}`, 'image')}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Maximize2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <div className="bg-black/30 p-3 rounded-lg text-xs text-on-surface-variant space-y-2">
                                    <p>{socialPost.caption}</p>
                                    <p className="text-primary/70">{socialPost.hashtags}</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <DownloadAction dataUrl={`data:image/png;base64,${socialPost.image}`} filename="social-post.png" />
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50 bg-surface-variant/5">
                                <div className="text-center">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Generate a standard social media post</p>
                                </div>
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
                                {carouselPost ? <RotateCcw className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {carouselPost ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {generatingType === 'carousel' ? (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center">
                                <SkeletonLoader variant="image" className="w-full h-full" />
                            </div>
                        ) : carouselPost ? (
                            <GeneratedContentSection title="5-Slide Carousel" icon={Layout}>
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
                                    {carouselPost.slides.map((slide, i) => (
                                        <div key={i} className="min-w-[200px] snap-center group">
                                            {slide.image ? (
                                                <div className="relative">
                                                    <img 
                                                        src={`data:image/png;base64,${slide.image}`} 
                                                        className="w-full aspect-square object-cover rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => openLightbox(`data:image/png;base64,${slide.image}`, 'image')}
                                                    />
                                                    <button
                                                        onClick={() => openLightbox(`data:image/png;base64,${slide.image}`, 'image')}
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Maximize2 className="w-3 h-3 text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-square bg-white/10 rounded-lg animate-pulse" />
                                            )}
                                            <p className="text-xs text-on-surface-variant line-clamp-2">{slide.caption}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Caption Section */}
                                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-4 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            <h5 className="text-sm font-semibold text-on-surface">Instagram Caption</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(carouselPost.caption, 'Caption')}
                                            className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors group"
                                            title="Copy caption"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors" />
                                        </button>
                                    </div>
                                    <p className={`text-sm text-on-surface-variant leading-relaxed ${!captionExpanded && carouselPost.caption.length > 200 ? 'line-clamp-4' : ''}`}>
                                        {carouselPost.caption}
                                    </p>
                                    {carouselPost.caption.length > 200 && (
                                        <button
                                            onClick={() => setCaptionExpanded(!captionExpanded)}
                                            className="text-xs text-primary hover:text-primary/80 font-medium"
                                        >
                                            {captionExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>
                                
                                {/* Hashtags Section */}
                                <div className="bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-secondary" />
                                            <h5 className="text-sm font-semibold text-on-surface">Hashtags</h5>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(carouselPost.hashtags, 'Hashtags')}
                                            className="p-1.5 hover:bg-secondary/20 rounded-lg transition-colors group"
                                            title="Copy hashtags"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-secondary transition-colors" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-secondary/90 font-medium break-words">
                                        {carouselPost.hashtags}
                                    </p>
                                </div>
                                
                                {/* Download Actions */}
                                <div className="space-y-3 pt-2">
                                    <CarouselDownload 
                                        slides={carouselPost.slides}
                                        brandName={currentBrandName}
                                        campaignTitle={selectedCampaign?.title}
                                    />
                                    
                                    <div className="flex justify-end gap-2 pt-2 border-t border-outline/20">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                const fullContent = `${carouselPost.caption}\n\n${carouselPost.hashtags}`;
                                                copyToClipboard(fullContent, 'Full post content');
                                            }}
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copy All Text
                                        </Button>
                                    </div>
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50 bg-surface-variant/5">
                                <div className="text-center">
                                    <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Generate a 5-slide carousel</p>
                                </div>
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
                                {videoUrl ? <RotateCcw className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {videoUrl ? 'Regenerate' : 'Generate'}
                            </Button>
                        </div>

                        {generatingType === 'video' && status && (
                            <div className="p-4 bg-primary/10 rounded-lg text-xs text-primary animate-pulse mb-2">
                                {status}
                            </div>
                        )}

                        {generatingType === 'video' ? (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center">
                                <SkeletonLoader variant="image" className="w-full h-full" />
                            </div>
                        ) : videoUrl ? (
                            <GeneratedContentSection title="Campaign Video" icon={Video}>
                                <div className="relative group">
                                    <video src={videoUrl} controls className="w-full rounded-lg shadow-lg mb-4" />
                                    <button
                                        onClick={() => openLightbox(videoUrl, 'video')}
                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Maximize2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-outline/20">
                                    <span className="text-xs text-on-surface-variant">
                                        {currentBrandName ? `${currentBrandName} - ` : ''}Campaign Video
                                    </span>
                                    <DownloadAction 
                                        dataUrl={videoUrl} 
                                        filename={`${currentBrandName ? currentBrandName.replace(/\s+/g, '-') + '-' : ''}campaign-video.mp4`} 
                                    />
                                </div>
                            </GeneratedContentSection>
                        ) : (
                            <div className="h-64 border-2 border-dashed border-outline/20 rounded-xl flex items-center justify-center text-on-surface-variant/50 bg-surface-variant/5">
                                <div className="text-center">
                                    <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Generate a campaign video</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return (
        <>
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
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={lightboxSrc}
                type={lightboxType}
            />
        </>
    );
};

export default BrandCampaignStudio;
