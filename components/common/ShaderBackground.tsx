import React from 'react';
import { ShaderAnimation } from '../ui/shader-animation';

interface ShaderBackgroundProps {
  intensity?: number;
  speed?: number;
  className?: string;
}

/**
 * ShaderBackground - Animated shader background component
 * Can be used as a full-screen background or container background
 */
export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ 
  intensity = 0.6, 
  speed = 0.8,
  className = "" 
}) => {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <ShaderAnimation intensity={intensity} speed={speed} />
      {/* Subtle overlay to blend with existing gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/60 pointer-events-none z-[1]"></div>
    </div>
  );
};

export default ShaderBackground;

