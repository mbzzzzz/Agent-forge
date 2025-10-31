
import React, { useState } from 'react';
import Button from './common/Button';
import Select from './common/Select';
import { MOCKUP_CATEGORIES, MockupIcon } from '../constants';
import { generateMockup } from '../services/geminiService';
import Loader from './common/Loader';
import { DownloadAction, ShareAction } from './common/ActionButtons';

const MockupStudio: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mockupType, setMockupType] = useState('iPhone mockups');
    const [designDescription, setDesignDescription] = useState('A sleek and modern mobile app UI for a fintech company');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!mockupType || !designDescription) {
            setError('Please select a mockup type and provide a design description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const imageBytes = await generateMockup(mockupType, designDescription);
            setGeneratedImage(`data:image/png;base64,${imageBytes}`);
        } catch (e) {
            setError('Failed to generate mockup. Please try again.');
            console.error(e);
        }
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-1 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg">
                <h3 className="text-xl font-bold font-display mb-6 text-on-surface">Configuration</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Mockup Type</label>
                        <Select value={mockupType} onChange={e => setMockupType(e.target.value)}>
                            {Object.entries(MOCKUP_CATEGORIES).map(([category, types]) => (
                                <optgroup label={category} key={category} className="bg-surface">
                                    {types.map(type => <option key={type} value={type}>{type}</option>)}
                                </optgroup>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Design Description</label>
                        <textarea
                            value={designDescription}
                            onChange={(e) => setDesignDescription(e.target.value)}
                            placeholder="e.g., A vibrant logo for a creative agency"
                            className="w-full bg-surface-variant/40 border border-outline/50 rounded-md px-4 py-3 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none transition"
                        />
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                        Generate Mockup
                    </Button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg flex items-center justify-center min-h-[60vh] relative">
                {isLoading && <Loader text="Generating photorealistic mockup..." />}
                {!isLoading && !generatedImage && (
                    <div className="text-center text-on-surface-variant/70">
                        <MockupIcon className="w-24 h-24 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold font-display">Your mockup will appear here</h3>
                        <p>Configure the settings and click "Generate"</p>
                    </div>
                )}
                {generatedImage && (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src={generatedImage} alt="Generated Mockup" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" />
                         <div className="absolute top-4 right-4 flex gap-2">
                            <DownloadAction dataUrl={generatedImage} filename="mockup.png" />
                            <ShareAction dataUrl={generatedImage} filename="mockup.png" title="Product Mockup" />
                        </div>
                    </div>
                )}
                {error && <p className="text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default MockupStudio;