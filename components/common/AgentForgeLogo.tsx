import React from 'react';

const AgentForgeLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Anvil/Hammer representing "Forge" */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C3B6FF" />
          <stop offset="100%" stopColor="#C8C3DC" />
        </linearGradient>
      </defs>
      
      {/* Gear/Spark representing AI/Creativity */}
      <circle cx="12" cy="12" r="10" stroke="url(#logoGradient)" strokeWidth="1.5" fill="none" opacity="0.3" />
      
      {/* Central creative spark/star */}
      <path
        d="M12 4 L14 10 L20 10 L15 14 L17 20 L12 16 L7 20 L9 14 L4 10 L10 10 Z"
        fill="url(#logoGradient)"
        stroke="url(#logoGradient)"
        strokeWidth="0.5"
      />
      
      {/* Small orbiting elements representing agents */}
      <circle cx="12" cy="6" r="1.5" fill="url(#logoGradient)" opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="18" cy="12" r="1.5" fill="url(#logoGradient)" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="12" cy="18" r="1.5" fill="url(#logoGradient)" opacity="0.7">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="6" cy="12" r="1.5" fill="url(#logoGradient)" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default AgentForgeLogo;

