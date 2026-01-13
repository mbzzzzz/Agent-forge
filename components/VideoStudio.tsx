import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import { generateVideo } from '../services/huggingFaceService';
import ApiKeySelector from './common/ApiKeySelector';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useApiKey } from '../hooks/useApiKey';
import { useToastContext } from '../contexts/ToastContext';
import { RotateCcw, Sparkles, Video, Wand2 } from 'lucide-react';
import EnhancePromptButton from './common/EnhancePromptButton';

const VideoStudio: React.FC = () => {
  const { isKeyAvailable, isChecking } = useApiKey();
  const { showToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('A cinematic shot of a coffee being poured in slow motion, with steam rising');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const savedInputsRef = useRef({ prompt });

  const MAX_PROMPT_LENGTH = 500;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video prompt.');
      return;
    }

    if (prompt.trim().length < 10) {
      setError('Video prompt must be at least 10 characters long.');
      return;
    }

    savedInputsRef.current = { prompt };

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setStatus('Initializing generation...');

    try {
      console.log('Starting video generation with prompt:', prompt);
      const url = await generateVideo(prompt, setStatus);
      console.log('Video generation successful, URL:', url);
      setGeneratedVideoUrl(url);
      showToast('Video generated successfully!', 'success');
    } catch (e: any) {
      console.error('Video generation error:', e);
      const errorMessage = e?.message || e?.toString() || 'Unknown error occurred';
      if (errorMessage.includes('Requested entity was not found') || errorMessage.includes('API key')) {
        setError("API Key validation failed. Please select your API key again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  const handleRegenerate = () => {
    setGeneratedVideoUrl(null);
    handleGenerate();
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-on-surface-variant animate-pulse">Checking API key...</div>
      </div>
    );
  }

  if (!isKeyAvailable) {
    return <ApiKeySelector onKeySelected={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display text-on-surface">Video Request</h3>
              </div>
              <EnhancePromptButton
                prompt={prompt}
                onEnhanced={setPrompt}
                useCase="general"
              />
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_PROMPT_LENGTH) {
                    setPrompt(e.target.value);
                    setError(null);
                  }
                }}
                placeholder="Describe your scene: A futuristic city with flying cars at sunset..."
                maxLength={MAX_PROMPT_LENGTH}
                className={`w-full bg-surface-variant/30 border rounded-xl px-4 py-4 text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary h-48 resize-none transition-all duration-200 ${error ? 'border-red-500/50 focus:ring-red-500' : 'border-outline/30 focus:border-primary'
                  }`}
              />
              <div className="absolute bottom-3 right-3 text-xs text-on-surface-variant/60 bg-surface/50 px-2 py-1 rounded-md backdrop-blur-sm">
                {prompt.length}/{MAX_PROMPT_LENGTH}
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleGenerate}
                isLoading={isLoading}
                className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-primary/25 transition-all"
                disabled={isLoading}
              >
                {!isLoading && <Sparkles className="w-5 h-5 mr-2" />}
                {isLoading ? 'Creating Magic...' : 'Generate Video'}
              </Button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="relative h-full min-h-[400px]">
          <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-2xl h-full shadow-sm flex flex-col items-center justify-center relative overflow-hidden">

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-6"
                />
                <h4 className="text-xl font-semibold mb-2 text-on-surface">{status || "Processing..."}</h4>
                <p className="text-on-surface-variant text-sm max-w-xs">Connecting to GPU cluster...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={handleGenerate} variant="secondary" size="sm">Try Again</Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !generatedVideoUrl && !error && (
              <div className="text-center opacity-60">
                <div className="w-20 h-20 bg-surface-variant/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-on-surface-variant" />
                </div>
                <h3 className="text-lg font-medium text-on-surface mb-1">Ready to create</h3>
                <p className="text-sm text-on-surface-variant">Your generated video will appear here</p>
              </div>
            )}

            {/* Success State */}
            {generatedVideoUrl && !isLoading && (
              <div className="w-full h-full flex flex-col">
                <div className="relative rounded-xl overflow-hidden shadow-2xl flex-grow bg-black aspect-video group">
                  <video
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                    src={generatedVideoUrl}
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DownloadAction dataUrl={generatedVideoUrl} filename="ai-video.mp4" />
                    <ShareAction dataUrl={generatedVideoUrl} filename="ai-video.mp4" title="AI Video" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant/60 font-mono">MODEL: DAMO-TEXT-TO-VIDEO</span>
                  <Button onClick={handleRegenerate} variant="ghost" size="sm" className="text-on-surface-variant hover:text-primary">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;