import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [isKeyAvailable, setIsKeyAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const checkApiKey = async () => {
    setIsChecking(true);
    try {
      // Check aistudio API key selector
      if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (hasKey) {
          setIsKeyAvailable(true);
          setIsChecking(false);
          return;
        }
      }

      // Check environment variable
      const envKey = process.env.API_KEY || process.env.HF_TOKEN;
      if (envKey) {
        setIsKeyAvailable(true);
        setIsChecking(false);
        return;
      }

      setIsKeyAvailable(false);
    } catch (error) {
      console.error('Error checking API key:', error);
      setIsKeyAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiKey();

    const handleKeyChange = () => checkApiKey();
    window.addEventListener('aistudio_key_selected', handleKeyChange);
    
    return () => {
      window.removeEventListener('aistudio_key_selected', handleKeyChange);
    };
  }, []);

  return { isKeyAvailable, isChecking, checkApiKey };
};

