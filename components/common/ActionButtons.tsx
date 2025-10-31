
import React from 'react';

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    className="p-2.5 rounded-full bg-glass backdrop-blur-sm text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
  >
    {children}
  </button>
);

export const DownloadAction: React.FC<{ dataUrl: string; filename: string; }> = ({ dataUrl, filename }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ActionButton onClick={handleDownload} title="Download">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    </ActionButton>
  );
};

export const ShareAction: React.FC<{ dataUrl: string; title: string; filename: string; text?: string }> = ({ dataUrl, title, filename, text }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.share) {
      alert('Web Share API is not supported in this browser.');
      return;
    }
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title,
          text: text,
          files: [file],
        });
      } else {
         await navigator.share({ title, text });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!navigator.share) return null;

  return (
    <ActionButton onClick={handleShare} title="Share">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
         <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" />
      </svg>
    </ActionButton>
  );
};