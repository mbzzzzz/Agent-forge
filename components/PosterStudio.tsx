
import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import { POSTER_TYPES } from '../constants';
import { generatePoster } from '../services/geminiService';
import Loader from './common/Loader';
import { DownloadAction, ShareAction } from './common/ActionButtons';

const PosterStudio: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [posterType, setPosterType] = useState('Event posters');
    const [theme, setTheme] = useState('A summer music festival with a retro vibe');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [headline, setHeadline] = useState('Summer Fest');
    const [subheadline, setSubheadline] = useState('Three Days of Music & Sun');


    const handleGenerate = async () => {
        if (!posterType || !theme) {
            setError('Please select a poster type and provide a theme.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const imageBytes = await generatePoster(posterType, theme);
            setGeneratedImage(`data:image/jpeg;base64,${imageBytes}`);
        } catch (e) {
            setError('Failed to generate poster. Please try again.');
            console.error(e);
        }
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-1 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg">
                <h3 className="text-xl font-bold font-display mb-6 text-on-surface">Poster Details</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Poster Type</label>
                        <Select value={posterType} onChange={e => setPosterType(e.target.value)}>
                            {POSTER_TYPES.map(type => <option key={type} value={type} className="bg-surface">{type}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Theme / Concept</label>
                        <textarea
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g., A minimalist design for a tech conference"
                            className="w-full bg-surface-variant/40 border border-outline/50 rounded-md px-4 py-3 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Headline Text</label>
                        <Input value={headline} onChange={e => setHeadline(e.target.value)} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Subheadline Text</label>
                        <Input value={subheadline} onChange={e => setSubheadline(e.target.value)} />
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                        Generate Poster
                    </Button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg flex items-center justify-center min-h-[70vh] aspect-[3/4] relative">
                {isLoading && <Loader text="Designing your poster..." />}
                {!isLoading && !generatedImage && (
                    <div className="text-center text-on-surface-variant/70">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto mb-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h16.5v11.25c0 1.242-.99 2.25-2.218 2.25H6.982c-.524 0-1.028.16-1.455.43A3.75 3.75 0 003 20.25V3.75" />
                        </svg>
                        <h3 className="text-xl font-semibold font-display">Your poster will appear here</h3>
                        <p>Fill in the details and unleash your creativity</p>
                    </div>
                )}
                {generatedImage && (
                    <div className="relative w-full h-full shadow-2xl group">
                        <img src={generatedImage} alt="Generated Poster" className="w-full h-full object-cover rounded-md" />
                        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 text-white bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                           <h1 className="text-4xl md:text-6xl font-extrabold font-display text-center" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>{headline}</h1>
                           <h2 className="text-xl md:text-2xl font-semibold text-center" style={{textShadow: '1px 1px 6px rgba(0,0,0,0.7)'}}>{subheadline}</h2>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DownloadAction dataUrl={generatedImage} filename={`${headline.replace(/\s+/g, '-')}-poster.jpg`} />
                            <ShareAction dataUrl={generatedImage} filename={`${headline.replace(/\s+/g, '-')}-poster.jpg`} title={`Poster: ${headline}`} />
                        </div>
                    </div>
                )}
                 {error && <p className="text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default PosterStudio;