
import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { improveImagePrompt } from '../../services/huggingFaceService';
import { useToastContext } from '../../contexts/ToastContext';

interface EnhancePromptButtonProps {
    prompt: string;
    onEnhanced: (newPrompt: string) => void;
    useCase?: 'logo' | 'mockup' | 'poster' | 'social' | 'carousel' | 'brand-asset' | 'general' | 'remix';
    className?: string;
}

const EnhancePromptButton: React.FC<EnhancePromptButtonProps> = ({
    prompt,
    onEnhanced,
    useCase = 'general',
    className = ""
}) => {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const { showToast } = useToastContext();

    const handleEnhance = async () => {
        if (!prompt.trim()) {
            showToast('Please enter a prompt first', 'error');
            return;
        }

        setIsEnhancing(true);
        try {
            const enhanced = await improveImagePrompt(prompt, useCase);
            onEnhanced(enhanced);
            showToast('Prompt enhanced by Senior AI Engineer', 'success');
        } catch (error) {
            console.error('Enhancement error:', error);
            showToast('Failed to enhance prompt', 'error');
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing || !prompt.trim()}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all duration-300 ${isEnhancing
                    ? 'bg-primary/20 text-primary animate-pulse'
                    : 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale'
                } ${className}`}
        >
            {isEnhancing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <Sparkles className="w-3 h-3" />
            )}
            {isEnhancing ? 'Engineering...' : 'Enhance Prompt'}
        </button>
    );
};

export default EnhancePromptButton;
