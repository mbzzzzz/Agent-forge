
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import { generateImageToImage } from '../services/huggingFaceService';
import GeneratingLoader from './common/GeneratingLoader';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useApiKey } from '../hooks/useApiKey';
import ApiKeySelector from './common/ApiKeySelector';
import { useToastContext } from '../contexts/ToastContext';
import { TooltipIcon } from './common/Tooltip';
import { RotateCcw, Upload, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import EnhancePromptButton from './common/EnhancePromptButton';

const ImageRemixStudio: React.FC = () => {
    const { isKeyAvailable, isChecking } = useApiKey();
    const { showToast } = useToastContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Transform this into a futuristic cyberpunk version');
    const [sourceImage, setSourceImage] = useState<Blob | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_PROMPT_LENGTH = 500;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size too large. Please use an image under 10MB.');
                return;
            }
            setSourceImage(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setError(null);
            setGeneratedImage(null);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size too large. Please use an image under 10MB.');
                return;
            }
            setSourceImage(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setError(null);
            setGeneratedImage(null);
        }
    }, []);

    const handleGenerate = async () => {
        if (!sourceImage) {
            setError('Please upload a source image.');
            return;
        }
        if (!prompt.trim()) {
            setError('Please provide a prompt for the transformation.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log('Starting image remix:', { prompt });
            const resultBase64 = await generateImageToImage(sourceImage, prompt, {
                useCase: 'remix',
            });

            if (!resultBase64) {
                throw new Error('No image data returned from API');
            }
            setGeneratedImage(`data:image/png;base64,${resultBase64}`);
            showToast('Image remixed successfully!', 'success');
        } catch (e: any) {
            console.error('Image remix error:', e);
            setError(e?.message || 'Failed to remix image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
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
                    <h3 className="text-xl font-bold font-display text-on-surface bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text">Transformation</h3>
                    <TooltipIcon content="Upload an image and describe how you want to transform it using the Flux model." />
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">
                            Source Image
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className={`relative cursor-pointer group/upload bg-surface-variant/30 backdrop-blur-sm border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-surface-variant/50 hover:border-primary/50 min-h-[160px] overflow-hidden ${sourceImageUrl ? 'border-primary/30' : 'border-outline/40'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            {sourceImageUrl ? (
                                <div className="absolute inset-0">
                                    <img src={sourceImageUrl} alt="Source" className="w-full h-full object-cover opacity-40 group-hover/upload:opacity-30 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-surface/80 backdrop-blur-md p-2 rounded-lg border border-outline/20 flex items-center gap-2 shadow-xl translate-y-2 group-hover/upload:translate-y-0 opacity-0 group-hover/upload:opacity-100 transition-all duration-300">
                                            <Upload className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Change Image</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-primary/20 transition-all duration-300">
                                        <Upload className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-on-surface">Click or drag image</p>
                                        <p className="text-xs text-on-surface-variant mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="remix-prompt" className="block text-sm font-medium text-on-surface-variant">
                                Transformation Prompt <span className="text-red-400" aria-label="required">*</span>
                            </label>
                            <EnhancePromptButton
                                prompt={prompt}
                                onEnhanced={setPrompt}
                                useCase="remix"
                            />
                        </div>
                        <textarea
                            id="remix-prompt"
                            value={prompt}
                            onChange={(e) => {
                                if (e.target.value.length <= MAX_PROMPT_LENGTH) {
                                    setPrompt(e.target.value);
                                    setError(null);
                                }
                            }}
                            placeholder="Example: Turn the cat into a tiger with glowing neon eyes and a cybernetic collar."
                            maxLength={MAX_PROMPT_LENGTH}
                            className={`w-full bg-surface-variant/30 backdrop-blur-sm border rounded-lg px-4 py-3 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 h-32 resize-none transition-all duration-200 hover:border-outline/60 ${error && error.includes('prompt') ? 'border-red-500/50' : 'border-outline/40'
                                }`}
                            rows={5}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-on-surface-variant/70">
                                Describe the changes you want to see
                            </p>
                            <p className="text-xs text-on-surface-variant/70">
                                {prompt.length}/{MAX_PROMPT_LENGTH}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        isLoading={isLoading}
                        className="w-full flex items-center justify-center gap-2 group"
                        disabled={!sourceImage}
                    >
                        <Sparkles className={`w-5 h-5 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} />
                        Remix Image
                    </Button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden group"
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
                            <ImageIcon className="w-24 h-24 mx-auto mb-4 text-primary/50" />
                        </motion.div>
                        <h3 className="text-xl font-semibold font-display text-on-surface mb-2">Remix result will appear here</h3>
                        <p className="text-on-surface-variant">Upload an image, describe the change, and click "Remix"</p>
                    </motion.div>
                )}
                {generatedImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center relative"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Original</span>
                                <div className="bg-surface/40 p-2 rounded-lg border border-outline/10">
                                    <img src={sourceImageUrl!} alt="Original" className="w-full h-48 object-contain rounded" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Remixed</span>
                                <div className="bg-surface/80 backdrop-blur-sm p-4 rounded-xl border border-primary/20 shadow-2xl relative group/image">
                                    <img src={generatedImage} alt="Remixed" className="w-full h-auto max-h-[50vh] object-contain rounded-lg" />
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/image:translate-y-0">
                                        <DownloadAction dataUrl={generatedImage} filename="remixed-image.png" />
                                        <ShareAction dataUrl={generatedImage} filename="remixed-image.png" title="Remixed Image" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleRegenerate} variant="secondary" className="flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Regenerate
                            </Button>
                            <Button onClick={() => setGeneratedImage(null)} variant="secondary">
                                New Transformation
                            </Button>
                        </div>
                    </motion.div>
                )}
                {error && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center z-50 p-6"
                    >
                        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 text-red-300 p-8 rounded-2xl shadow-2xl max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4">Remix Failed</h3>
                            <p className="text-sm mb-6 opacity-80 leading-relaxed">{error}</p>
                            <Button onClick={() => setError(null)} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ImageRemixStudio;
