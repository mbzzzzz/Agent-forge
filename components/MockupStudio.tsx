
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import Select from './common/Select';
import { MOCKUP_CATEGORIES, MockupIcon } from '../constants';
import { generateMockup } from '../services/huggingFaceService';
import GeneratingLoader from './common/GeneratingLoader';
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
            console.log('Starting mockup generation:', { mockupType, designDescription });
            const imageBytes = await generateMockup(mockupType, designDescription);
            console.log('Mockup generation successful, imageBytes length:', imageBytes?.length);
            if (!imageBytes) {
                throw new Error('No image data returned from API');
            }
            setGeneratedImage(`data:image/png;base64,${imageBytes}`);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-xl shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
                <h3 className="text-xl font-bold font-display mb-6 text-on-surface bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text">Configuration</h3>
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
                        <label htmlFor="design-description" className="block text-sm font-medium text-on-surface-variant mb-2">
                            Design Description <span className="text-red-400" aria-label="required">*</span>
                        </label>
                        <textarea
                            id="design-description"
                            value={designDescription}
                            onChange={(e) => setDesignDescription(e.target.value)}
                            placeholder="e.g., A vibrant logo for a creative agency with gradient colors and modern typography"
                            aria-describedby="design-helper"
                            aria-required="true"
                            className="w-full bg-surface-variant/30 backdrop-blur-sm border border-outline/40 rounded-lg px-4 py-3 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 h-32 resize-none transition-all duration-200 hover:border-outline/60"
                            rows={5}
                        />
                        <p id="design-helper" className="text-xs text-on-surface-variant/70 mt-1">
                            Describe your design in detail: colors, style, layout, and key visual elements
                        </p>
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
                      className="w-full h-full flex items-center justify-center relative group/image"
                    >
                        <div className="bg-gradient-to-br from-surface/80 to-surface-variant/40 backdrop-blur-sm p-6 rounded-xl border border-outline/20 shadow-2xl">
                          <img src={generatedImage} alt="Generated Mockup" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                        </div>
                         <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/image:translate-y-0">
                            <DownloadAction dataUrl={generatedImage} filename="mockup.png" />
                            <ShareAction dataUrl={generatedImage} filename="mockup.png" title="Product Mockup" />
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
                      <Button 
                        onClick={() => {
                          setError(null);
                          setGeneratedImage(null);
                        }}
                        className="w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default MockupStudio;