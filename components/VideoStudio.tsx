
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './common/Button';
import { generateVideo } from '../services/huggingFaceService';
import ApiKeySelector from './common/ApiKeySelector';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useApiKey } from '../hooks/useApiKey';
import { useToastContext } from '../contexts/ToastContext';
import { TooltipIcon } from './common/Tooltip';
import { RotateCcw } from 'lucide-react';

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
    setStatus('');
    try {
      console.log('Starting video generation with prompt:', prompt);
      const url = await generateVideo(prompt, setStatus);
      console.log('Video generation successful, URL:', url);
      setGeneratedVideoUrl(url);
      showToast('Video generated successfully!', 'success');
    } catch (e: any) {
      console.error('Video generation error:', e);
      const errorMessage = e?.message || e?.toString() || 'Unknown error occurred';
      console.error('Error details:', { message: errorMessage, error: e });
      
      if (errorMessage.includes('Requested entity was not found') || errorMessage.includes('API key')) {
        setError("API Key validation failed. Please select your API key again.");
      } else if (errorMessage.includes('API key not found')) {
        setError("API key is required. Please select an API key.");
      } else {
        const errorMsg = errorMessage.length > 150 
          ? 'Failed to generate video. Please check your API key and try again.' 
          : errorMessage;
        setError(errorMsg);
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
        <div className="text-on-surface-variant">Checking API key...</div>
      </div>
    );
  }
  
  if (!isKeyAvailable) {
    return <ApiKeySelector onKeySelected={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold font-display text-on-surface">Video Concept</h3>
          <TooltipIcon content="Describe your video scene in detail. Include camera movements, style, mood, colors, and key visual elements for best results" />
        </div>
        <p className="text-on-surface-variant mb-4">
          Describe the video you want to create. Be descriptive about the scene, camera movement, style, and mood.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => {
            if (e.target.value.length <= MAX_PROMPT_LENGTH) {
              setPrompt(e.target.value);
              setError(null);
            }
          }}
          placeholder="Example: A cinematic slow-motion shot of rich espresso coffee being poured into a white ceramic cup. Steam rises elegantly in the golden morning light. The camera slowly zooms in on the dark liquid, capturing the crema swirl. Warm, cozy atmosphere with soft focus and shallow depth of field. Professional food photography style."
          maxLength={MAX_PROMPT_LENGTH}
          aria-describedby="prompt-helper prompt-counter"
          className={`w-full bg-surface-variant/40 border rounded-md px-4 py-3 text-white placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none mb-2 transition ${
            error && error.includes('prompt') ? 'border-red-500/50' : 'border-outline/50'
          } ${prompt.length >= MAX_PROMPT_LENGTH * 0.9 ? 'border-yellow-500/50' : ''}`}
        />
        <div className="flex items-center justify-between mb-4">
          <p id="prompt-helper" className="text-xs text-on-surface-variant/70">
            Be specific: scene, camera movement, style, mood, and visual elements (min. 10 characters)
          </p>
          <p 
            id="prompt-counter"
            className={`text-xs ml-auto ${
              prompt.length >= MAX_PROMPT_LENGTH 
                ? 'text-red-400' 
                : prompt.length >= MAX_PROMPT_LENGTH * 0.9 
                ? 'text-yellow-400' 
                : 'text-on-surface-variant/70'
            }`}
          >
            {prompt.length}/{MAX_PROMPT_LENGTH}
          </p>
        </div>
        <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
          Generate Video
        </Button>
      </div>

      <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg min-h-[400px] flex items-center justify-center">
        {isLoading && (
          <div className="text-center">
             <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-semibold text-on-surface-variant animate-pulse">{status || "Initializing..."}</p>
                <p className="text-sm text-on-surface-variant/70">Video generation may take several minutes.</p>
            </div>
          </div>
        )}
        {!isLoading && error && (
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
              <p className="text-sm">{error}</p>
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={() => {
                    setError(null);
                    if (savedInputsRef.current.prompt) {
                      setPrompt(savedInputsRef.current.prompt);
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
        {!isLoading && !generatedVideoUrl && !error && (
            <div className="text-center text-on-surface-variant/70">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                <h3 className="text-xl font-semibold font-display">Your video will appear here</h3>
                <p>Describe your scene and click "Generate Video"</p>
            </div>
        )}
        {generatedVideoUrl && (
          <div className="w-full flex flex-col">
            <div className="relative group mb-4">
              <video controls autoPlay loop className="w-full rounded-md shadow-2xl">
                <source src={generatedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DownloadAction dataUrl={generatedVideoUrl} filename="generated-video.mp4" />
                  <ShareAction dataUrl={generatedVideoUrl} filename="generated-video.mp4" title="AI Generated Video" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRegenerate} variant="secondary" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={() => setGeneratedVideoUrl(null)} variant="secondary">
                Edit & Generate New
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;