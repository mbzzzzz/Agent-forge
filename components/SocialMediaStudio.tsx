
import React, { useState } from 'react';
import Button from './common/Button';
import Select from './common/Select';
import { SOCIAL_PLATFORMS } from '../constants';
import { generateSocialPost } from '../services/geminiService';
import Loader from './common/Loader';
import { DownloadAction, ShareAction } from './common/ActionButtons';

interface SocialPost {
    image: string;
    caption: string;
    hashtags: string;
}

const SocialMediaStudio: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [platform, setPlatform] = useState('Instagram');
    const [theme, setTheme] = useState('A new product launch for a sustainable skincare brand');
    const [generatedPost, setGeneratedPost] = useState<SocialPost | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!platform || !theme) {
            setError('Please select a platform and provide a theme.');
            return;
        }
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
        } catch (e: any) {
            console.error('Social post generation error:', e);
            const errorMessage = e?.message || e?.toString() || 'Unknown error occurred';
            console.error('Error details:', { message: errorMessage, error: e });
            
            if (errorMessage.includes('API key')) {
                setError('API key is required. Please set GEMINI_API_KEY environment variable or select an API key.');
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
                <h3 className="text-xl font-bold font-display mb-6 text-on-surface">Content Strategy</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Platform</label>
                        <Select value={platform} onChange={e => setPlatform(e.target.value)}>
                            {SOCIAL_PLATFORMS.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Post Theme / Goal</label>
                        <textarea
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g., Announcing a weekend sale for our new collection"
                            className="w-full bg-surface-variant/40 border border-outline/50 rounded-md px-4 py-3 text-white placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition"
                        />
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                        Generate Social Post
                    </Button>
                </div>
            </div>

            <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg min-h-[60vh]">
                <h3 className="text-xl font-bold font-display mb-4 text-on-surface">Generated Post</h3>
                {isLoading && <Loader text="Crafting your social post..." />}
                {error && <p className="text-red-400">{error}</p>}
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
                         <div className="p-4 border-t border-outline/30">
                            <Button onClick={handleCopy} variant="secondary" className="w-full">
                                {isCopied ? 'Copied!' : 'Copy Caption & Hashtags'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaStudio;