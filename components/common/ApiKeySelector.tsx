
import React from 'react';
import Button from './Button';

// Mock the aistudio object for environments where it might not exist
if (typeof window !== 'undefined' && !(window as any).aistudio) {
  (window as any).aistudio = {
    hasSelectedApiKey: async () => {
      console.log('Mock aistudio.hasSelectedApiKey called, returning false.');
      return Promise.resolve(sessionStorage.getItem('aistudio_api_key_selected') === 'true');
    },
    openSelectKey: async () => {
      console.log('Mock aistudio.openSelectKey called.');
      sessionStorage.setItem('aistudio_api_key_selected', 'true');
      window.dispatchEvent(new Event('aistudio_key_selected'));
      return Promise.resolve();
    }
  };
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      onKeySelected();
    } catch (error) {
      console.error("Error opening API key selection dialog:", error);
    }
  };

  return (
    <div className="bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) rounded-lg p-8 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 mx-auto bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold font-display text-on-surface mb-2">API Key Required</h3>
      <p className="text-on-surface-variant mb-6">
        To generate videos with the Veo model, please select an API key.
      </p>
      <Button onClick={handleSelectKey}>
        Select API Key
      </Button>
      <p className="text-xs text-on-surface-variant/70 mt-4">
        For billing info, visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">official documentation</a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;