
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import Select from './common/Select';
import { MOCKUP_CATEGORIES, MockupIcon } from '../constants';
import { generateMockup } from '../services/huggingFaceService';
import GeneratingLoader from './common/GeneratingLoader';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useApiKey } from '../hooks/useApiKey';
import ApiKeySelector from './common/ApiKeySelector';
import { useToastContext } from '../contexts/ToastContext';
import { TooltipIcon } from './common/Tooltip';
import { RotateCcw, Wand2 } from 'lucide-react';
import EnhancePromptButton from './common/EnhancePromptButton';

const MockupStudio: React.FC = () => {
    const { isKeyAvailable, isChecking } = useApiKey();
    const { showToast } = useToastContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mockupType, setMockupType] = useState('iPhone mockups');
    const [designDescription, setDesignDescription] = useState('A sleek and modern mobile app UI for a fintech company');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const savedInputsRef = useRef({ mockupType, designDescription });

    const MAX_DESCRIPTION_LENGTH = 500;

    const handleGenerate = async () => {
        if (!mockupType || !designDescription.trim()) {
            setError('Please select a mockup type and provide a design description.');
            return;
        }

        if (designDescription.trim().length < 10) {
            setError('Design description must be at least 10 characters long.');
            return;
        }

        // Save inputs for potential retry
        savedInputsRef.current = { mockupType, designDescription };

        setIsLoading(true);
        setError(null);
        try {
            console.log('Starting mockup generation:', { mockupType, designDescription });
            const imageBytes = await generateMockup(mockupType, designDescription);
            console.log('Mockup generation successful, imageBytes length:', imageBytes?.length);
            if (!imageBytes) {
                throw new Error('No image data returned from API');
            }
            setGeneratedImage(`data:image/png;base64,${imageBytes}`);
            showToast('Mockup generated successfully!', 'success');
        } catch (e: any) {
            console.error('Mockup generation error:', e);
            const errorMessage = e?.message || e?.toString() || 'Unknown error occurred';
            console.error('Error details:', { message: errorMessage, error: e });

            if (errorMessage.includes('API key')) {
                setError('API key is required. Please set HF_TOKEN environment variable or select an API key.');
            } else {
                const errorMsg = errorMessage.length > 100
                    ? 'Failed to generate mockup. Please check your API key and try again.'
                    : errorMessage;
                setError(errorMsg);
            }
            // Inputs are preserved in savedInputsRef, user can retry easily
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedImage(null);
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-xl shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold font-display text-on-surface bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text">Configuration</h3>
                    <TooltipIcon content="Configure your mockup type and provide a detailed description of the design you want to generate" />
                </div>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="mockup-type" className="block text-sm font-medium text-on-surface-variant mb-2">
                            Mockup Type
                        </label>
                        <Select
                            id="mockup-type"
                            value={mockupType}
                            onChange={e => setMockupType(e.target.value)}
                            aria-label="Select mockup type"
                        >
                            {Object.entries(MOCKUP_CATEGORIES).map(([category, types]) => (
                                <optgroup label={category} key={category} className="bg-surface">
                                    {types.map(type => <option key={type} value={type}>{type}</option>)}
                                </optgroup>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="design-description" className="block text-sm font-medium text-on-surface-variant">
                                Design Description <span className="text-red-400" aria-label="required">*</span>
                            </label>
                            <EnhancePromptButton
                                prompt={designDescription}
                                onEnhanced={setDesignDescription}
                                useCase="mockup"
                            />
                        </div>
                        <textarea
                            id="design-description"
                            value={designDescription}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                                    setDesignDescription(e.target.value);
                                    setError(null); // Clear error on input
                                }
                            }}
                            placeholder="Example: A sleek mobile app interface featuring a dark theme with neon blue accents. Modern card-based layout with rounded corners, clean typography, and subtle shadows. The design should showcase a dashboard with analytics charts and user profile sections."
                            aria-describedby="design-helper design-counter"
                            aria-required="true"
                            maxLength={MAX_DESCRIPTION_LENGTH}
                            className={`w-full bg-surface-variant/30 backdrop-blur-sm border rounded-lg px-4 py-3 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 h-32 resize-none transition-all duration-200 hover:border-outline/60 ${error && error.includes('description') ? 'border-red-500/50' : 'border-outline/40'
                                } ${designDescription.length >= MAX_DESCRIPTION_LENGTH * 0.9 ? 'border-yellow-500/50' : ''}`}
                            rows={5}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p id="design-helper" className="text-xs text-on-surface-variant/70">
                                Be specific: colors, style, layout, and key visual elements (min. 10 characters)
                            </p>
                            <p
                                id="design-counter"
                                className={`text-xs ml-auto ${designDescription.length >= MAX_DESCRIPTION_LENGTH
                                        ? 'text-red-400'
                                        : designDescription.length >= MAX_DESCRIPTION_LENGTH * 0.9
                                            ? 'text-yellow-400'
                                            : 'text-on-surface-variant/70'
                                    }`}
                            >
                                {designDescription.length}/{MAX_DESCRIPTION_LENGTH}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
                        Generate Mockup
                    </Button>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-xl shadow-2xl flex items-center justify-center min-h-[60vh] relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
                {isLoading && <GeneratingLoader />}
                {!isLoading && !generatedImage && !error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-on-surface-variant/70"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <MockupIcon className="w-24 h-24 mx-auto mb-4 text-primary/50" />
                        </motion.div>
                        <h3 className="text-xl font-semibold font-display text-on-surface mb-2">Your mockup will appear here</h3>
                        <p className="text-on-surface-variant">Configure the settings and click "Generate"</p>
                    </motion.div>
                )}
                {generatedImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center relative"
                    >
                        <div className="bg-gradient-to-br from-surface/80 to-surface-variant/40 backdrop-blur-sm p-6 rounded-xl border border-outline/20 shadow-2xl relative group/image mb-4">
                            <img src={generatedImage} alt="Generated Mockup" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/image:translate-y-0">
                                <DownloadAction dataUrl={generatedImage} filename="mockup.png" />
                                <ShareAction dataUrl={generatedImage} filename="mockup.png" title="Product Mockup" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleRegenerate} variant="secondary" className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Regenerate
                            </Button>
                            <Button onClick={() => setGeneratedImage(null)} variant="secondary">
                                Edit & Generate New
                            </Button>
                        </div>
                    </motion.div>
                )}
                {error && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50"
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
                                        // Restore saved inputs if available
                                        if (savedInputsRef.current.designDescription) {
                                            setDesignDescription(savedInputsRef.current.designDescription);
                                            setMockupType(savedInputsRef.current.mockupType);
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
            </motion.div>
        </div>
    );
};

export default MockupStudio;