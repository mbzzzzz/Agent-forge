
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import Select from './common/Select';
import { SOCIAL_PLATFORMS } from '../constants';
import { generateSocialPost } from '../services/huggingFaceService';
import GeneratingLoader from './common/GeneratingLoader';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useApiKey } from '../hooks/useApiKey';
import ApiKeySelector from './common/ApiKeySelector';
import { useToastContext } from '../contexts/ToastContext';
import { TooltipIcon } from './common/Tooltip';
import { RotateCcw, Wand2 } from 'lucide-react';
import EnhancePromptButton from './common/EnhancePromptButton';

interface SocialPost {
    image: string;
    caption: string;
    hashtags: string;
}

const SocialMediaStudio: React.FC = () => {
    const { isKeyAvailable, isChecking } = useApiKey();
    const { showToast } = useToastContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [platform, setPlatform] = useState('Instagram');
    const [theme, setTheme] = useState('A new product launch for a sustainable skincare brand');
    const [generatedPost, setGeneratedPost] = useState<SocialPost | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const savedInputsRef = useRef({ platform, theme });

    const MAX_THEME_LENGTH = 300;

    const handleGenerate = async () => {
        if (!platform || !theme.trim()) {
            setError('Please select a platform and provide a theme.');
            return;
        }

        if (theme.trim().length < 10) {
            setError('Theme description must be at least 10 characters long.');
            return;
        }

        savedInputsRef.current = { platform, theme };

        setIsLoading(true);
        setError(null);
        setGeneratedPost(null);
        try {
            console.log('Starting social post generation:', { platform, theme });
            const post = await generateSocialPost(platform, theme);
            console.log('Social post generation successful');
            if (!post || !post.image || !post.caption) {
                throw new Error('Incomplete data returned from API');
            }
            setGeneratedPost(post);
            showToast('Social media post generated successfully!', 'success');
        } catch (e: any) {
            console.error('Social post generation error:', e);
            const errorMessage = e?.message || e?.toString() || 'Unknown error occurred';
            console.error('Error details:', { message: errorMessage, error: e });

            if (errorMessage.includes('API key')) {
                setError('API key is required. Please set HF_TOKEN environment variable or select an API key.');
            } else {
                const errorMsg = errorMessage.length > 100
                    ? 'Failed to generate social media post. Please check your API key and try again.'
                    : errorMessage;
                setError(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedPost(null);
        handleGenerate();
    };

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-on-surface-variant">Checking API key...</div>
            </div>
        );
    }

    if (!isKeyAvailable) {
        return <ApiKeySelector onKeySelected={() => window.location.reload()} />;
    }

    const handleCopy = () => {
        if (generatedPost) {
            const textToCopy = `${generatedPost.caption}\n\n${generatedPost.hashtags}`;
            navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold font-display text-on-surface">Content Strategy</h3>
                    <TooltipIcon content="Generate engaging social media posts with images, captions, and hashtags tailored to your chosen platform" />
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Platform</label>
                        <Select value={platform} onChange={e => setPlatform(e.target.value)}>
                            {SOCIAL_PLATFORMS.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
                        </Select>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-on-surface-variant">Post Theme / Goal</label>
                            <EnhancePromptButton
                                prompt={theme}
                                onEnhanced={setTheme}
                                useCase="social"
                            />
                        </div>
                        <textarea
                            value={theme}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_THEME_LENGTH) {
                                    setTheme(e.target.value);
                                    setError(null);
                                }
                            }}
                            placeholder="Example: Announce a weekend sale for our new sustainable skincare collection. Highlight eco-friendly packaging, natural ingredients, and special discount. Target audience: health-conscious millennials and Gen Z. Tone: friendly and inspiring."
                            maxLength={MAX_THEME_LENGTH}
                            aria-describedby="theme-helper theme-counter"
                            className={`w-full bg-surface-variant/40 border rounded-md px-4 py-3 text-white placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition ${error && error.includes('theme') ? 'border-red-500/50' : 'border-outline/50'
                                } ${theme.length >= MAX_THEME_LENGTH * 0.9 ? 'border-yellow-500/50' : ''}`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p id="theme-helper" className="text-xs text-on-surface-variant/70">
                                Describe your post theme and goals (min. 10 characters)
                            </p>
                            <p
                                id="theme-counter"
                                className={`text-xs ml-auto ${theme.length >= MAX_THEME_LENGTH
                                        ? 'text-red-400'
                                        : theme.length >= MAX_THEME_LENGTH * 0.9
                                            ? 'text-yellow-400'
                                            : 'text-on-surface-variant/70'
                                    }`}
                            >
                                {theme.length}/{MAX_THEME_LENGTH}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                        Generate Social Post
                    </Button>
                </div>
            </div>

            <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg min-h-[60vh] relative">
                <h3 className="text-xl font-bold font-display mb-4 text-on-surface">Generated Post</h3>
                {isLoading && <GeneratingLoader />}
                {error && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50 bg-glass/80 backdrop-blur-sm"
                    >
                        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-300 p-6 rounded-xl shadow-2xl max-w-md mx-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <h3 className="text-lg font-bold">Generation Failed</h3>
                            </div>
                            <p className="text-sm mb-4">{error}</p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setError(null);
                                        if (savedInputsRef.current.theme) {
                                            setPlatform(savedInputsRef.current.platform);
                                            setTheme(savedInputsRef.current.theme);
                                        }
                                    }}
                                    className="flex-1"
                                >
                                    Edit & Retry
                                </Button>
                                <Button
                                    onClick={handleGenerate}
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
                {!isLoading && !generatedPost && (
                    <div className="text-center text-on-surface-variant/70 pt-16">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />
                        </svg>
                        <h3 className="text-xl font-semibold font-display">Your post will appear here</h3>
                    </div>
                )}
                {generatedPost && (
                    <div className="bg-surface/50 rounded-lg overflow-hidden shadow-lg max-w-md mx-auto border border-outline/30">
                        <div className="relative group">
                            <img src={`data:image/jpeg;base64,${generatedPost.image}`} alt="Social media post visual" className="w-full aspect-square object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DownloadAction dataUrl={`data:image/jpeg;base64,${generatedPost.image}`} filename="social-post.jpg" />
                                <ShareAction dataUrl={`data:image/jpeg;base64,${generatedPost.image}`} filename="social-post.jpg" title="Social Media Post" text={generatedPost.caption} />
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-on-surface whitespace-pre-wrap text-sm">{generatedPost.caption}</p>
                            <p className="text-secondary/80 mt-4 text-sm whitespace-pre-wrap">{generatedPost.hashtags}</p>
                        </div>
                        <div className="p-4 border-t border-outline/30 space-y-3">
                            <Button onClick={handleCopy} variant="secondary" className="w-full">
                                {isCopied ? 'Copied!' : 'Copy Caption & Hashtags'}
                            </Button>
                            <div className="flex gap-3">
                                <Button onClick={handleRegenerate} variant="secondary" className="flex items-center gap-2 flex-1">
                                    <RotateCcw className="w-4 h-4" />
                                    Regenerate
                                </Button>
                                <Button onClick={() => setGeneratedPost(null)} variant="secondary" className="flex-1">
                                    Create New
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaStudio;