
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateBrandIdentity, generateLogo, generateColorPalette, generateTypography, generateBrandAsset } from '../services/geminiService';
import { BrandIdentity, GeneratedImage, ColorPalette, Typography, BrandAsset } from '../types';
import Button from './common/Button';
import Loader from './common/Loader';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useAppContext } from '../App';

const GlassCard: React.FC<{ title: string; children: React.ReactNode, actions?: React.ReactNode, className?: string }> = ({ title, children, actions, className="" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.01 }}
    className={`relative bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-xl shadow-2xl overflow-hidden group ${className}`}
  >
    {/* Gradient border effect */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10"></div>
    
    {/* Subtle corner accent */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50 -z-10"></div>
    
    {/* Animated gradient line at top */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>
    
    <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-xl font-bold font-display text-on-surface bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text">
          {title}
        </h3>
        {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

const BrandKitStudio: React.FC = () => {
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setBrandAccentColor } = useAppContext();
  
  const [businessInfo, setBusinessInfo] = useState('An eco-friendly coffee shop targeting young professionals in urban areas');
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [logos, setLogos] = useState<GeneratedImage[]>([]);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [typography, setTypography] = useState<Typography | null>(null);
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  useEffect(() => {
    if (typography?.headingFont && typography?.bodyFont) {
      const headingFont = typography.headingFont.replace(/\s/g, '+');
      const bodyFont = typography.bodyFont.replace(/\s/g, '+');
      const fontId = `google-font-${headingFont}-${bodyFont}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;700&family=${bodyFont}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [typography]);
  
  useEffect(() => {
    if (colorPalette?.primary?.[0]) {
      setBrandAccentColor(colorPalette.primary[0]);
    }
  }, [colorPalette, setBrandAccentColor]);

  const handleGenerateAll = async () => {
    if (!businessInfo) {
      setError("Please describe your business first.");
      return;
    }
    setIsGeneratingAll(true);
    setError(null);
    setBrandIdentity(null);
    setLogos([]);
    setColorPalette(null);
    setTypography(null);
    setBrandAssets([]);

    try {
      const identity = await generateBrandIdentity(businessInfo);
      setBrandIdentity(identity);
      
      const [palette, typo, imageBytes] = await Promise.all([
         generateColorPalette(identity.personality || businessInfo),
         generateTypography(identity.personality),
         generateLogo(identity.name, businessInfo, "Combination Mark")
      ]);
      
      setColorPalette(palette);
      setTypography(typo);
      const logoSrc = `data:image/png;base64,${imageBytes}`;
      setLogos([{ src: logoSrc, alt: `${identity.name} Logo - Combination Mark` }]);
      
      // Trigger asset generation
      setIsGeneratingAssets(true);
      const logoBase64 = imageBytes;
      const [faviconBytes, profilePicBytes] = await Promise.all([
        generateBrandAsset(logoBase64, 'Favicon'),
        generateBrandAsset(logoBase64, 'Profile Picture')
      ]);
      setBrandAssets([
        { name: 'Favicon', src: `data:image/png;base64,${faviconBytes}`, dimensions: '32x32' },
        { name: 'Profile Picture', src: `data:image/png;base64,${profilePicBytes}`, dimensions: '400x400' },
      ]);
      setIsGeneratingAssets(false);

    } catch (e) {
      setError("Failed to generate the full brand kit. Please try again.");
      console.error(e);
      setIsGeneratingAssets(false);
    }
    setIsGeneratingAll(false);
  };
  
  const handlePrint = () => { window.print(); };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative z-10">
      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-red-300 p-4 rounded-xl shadow-lg flex items-center gap-3"
        >
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span>{error}</span>
        </motion.div>
      )}

      <GlassCard title="Brand Foundation">
        <p className="text-on-surface-variant mb-4">Describe your business, and we'll generate a complete brand kit for you.</p>
        <textarea
          value={businessInfo}
          onChange={(e) => setBusinessInfo(e.target.value)}
          placeholder="e.g., An eco-friendly coffee shop targeting young professionals..."
          className="w-full bg-surface-variant/30 backdrop-blur-sm border border-outline/40 rounded-lg px-4 py-3 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-surface-variant/50 h-24 resize-none transition-all duration-200 hover:border-outline/60"
        />
        <Button onClick={handleGenerateAll} isLoading={isGeneratingAll} className="mt-4">
          {isGeneratingAll ? 'Building Your Brand...' : 'Generate Full Brand Kit'}
        </Button>
      </GlassCard>
      
      {isGeneratingAll && <Loader text="Building your brand... This may take a moment."/>}

      {brandIdentity && (
        <div className="space-y-6">
          <GlassCard title="Brand Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-on-surface">
                <div><strong className="text-on-surface-variant block">Name:</strong> {brandIdentity.name}</div>
                <div><strong className="text-on-surface-variant block">Personality:</strong> {brandIdentity.personality}</div>
                <div className="col-span-1 md:col-span-2"><strong className="text-on-surface-variant block">Voice & Tone:</strong> {brandIdentity.voice}</div>
                <div className="col-span-1 md:col-span-2"><strong className="text-on-surface-variant block">Mission:</strong> {brandIdentity.mission}</div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard title="Logo" className="lg:col-span-2">
             {logos.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-surface/80 to-surface-variant/40 backdrop-blur-sm p-6 rounded-xl group relative border border-outline/20 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    <img src={logos[0].src} alt={logos[0].alt} className="w-full h-auto object-contain aspect-[2/1] rounded-lg"/>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <DownloadAction dataUrl={logos[0].src} filename={`${brandIdentity.name}-logo.png`} />
                        <ShareAction dataUrl={logos[0].src} filename={`${brandIdentity.name}-logo.png`} title={`${brandIdentity.name} Logo`} />
                    </div>
                </motion.div>
             ): <div className="flex items-center justify-center h-48"><Loader text="Generating logo..." /></div>}
            </GlassCard>
            <div className="space-y-6">
                <GlassCard title="Brand Assets">
                    {isGeneratingAssets && <Loader text="Generating assets..." />}
                    {!isGeneratingAssets && brandAssets.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {brandAssets.map(asset => (
                                    <motion.div 
                                      key={asset.name} 
                                      className="text-center group"
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                    <div className="bg-gradient-to-br from-surface/80 to-surface-variant/40 backdrop-blur-sm p-3 rounded-xl aspect-square flex items-center justify-center relative border border-outline/20 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg">
                                        <img src={asset.src} alt={asset.name} className="w-full h-full object-contain rounded-lg" />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                                            <DownloadAction dataUrl={asset.src} filename={`${brandIdentity.name}-${asset.name.toLowerCase()}.png`} />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold mt-2 text-on-surface-variant">{asset.name}</p>
                                    <p className="text-xs text-on-surface-variant/70">{asset.dimensions}</p>
                                </motion.div>
                            ))}
                        </div>
                    ) : !isGeneratingAssets && <div className="text-center text-xs text-on-surface-variant/70 h-full flex items-center justify-center">Assets will appear here.</div>}
                </GlassCard>
                <GlassCard title="Typography">
                {typography ? (
                    <div>
                        <h4 className="text-lg leading-tight" style={{fontFamily: `'${typography.headingFont}', sans-serif`}}>Aa</h4>
                        <p className="text-sm text-on-surface-variant" style={{fontFamily: `'${typography.headingFont}', sans-serif`}}>{typography.headingFont}</p>
                        <hr className="my-3 border-outline/30" />
                        <h4 className="text-lg leading-tight" style={{fontFamily: `'${typography.bodyFont}', sans-serif`}}>Aa</h4>
                        <p className="text-sm text-on-surface-variant" style={{fontFamily: `'${typography.bodyFont}', sans-serif`}}>{typography.bodyFont}</p>
                    </div>
                ) : <div className="flex items-center justify-center h-24"><Loader text="" /></div>}
               </GlassCard>
            </div>
          </div>
          
          <GlassCard title="Color Palette">
            {colorPalette ? (
                <div className="space-y-4">
                    {Object.entries(colorPalette).map(([name, colors]) => (
                        <div key={name}>
                            <h4 className="font-semibold capitalize text-on-surface-variant mb-2">{name}</h4>
                            <div className="flex flex-wrap gap-4">
                                {(colors as string[]).map(color => (
                                    <motion.div 
                                  key={color} 
                                  className="flex flex-col items-center cursor-pointer group" 
                                  onClick={() => copyToClipboard(color)}
                                  whileHover={{ scale: 1.1, y: -4 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                        <div 
                                          style={{ backgroundColor: color }} 
                                          className="w-20 h-20 rounded-xl border-2 border-outline/40 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary/50 relative overflow-hidden"
                                        >
                                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <span className="text-xs mt-2 text-on-surface-variant/80 transition-colors group-hover:text-primary font-medium">{copiedColor === color ? '✓ Copied!' : color}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <div className="flex items-center justify-center h-48"><Loader text="Generating colors..." /></div>}
          </GlassCard>

           <GlassCard title="Export">
                <p className="text-on-surface-variant mb-4">Export your complete brand identity as a professional PDF document.</p>
                <Button onClick={handlePrint}>Print Brand Guidelines</Button>
           </GlassCard>

            <div id="brand-guide-to-print" className="hidden">
                 <style>{`
                    #brand-guide-to-print-content { color: #111827; font-family: sans-serif; }
                    #brand-guide-to-print-content h1, h2, h3 { page-break-after: avoid; }
                    #brand-guide-to-print-content h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
                    #brand-guide-to-print-content h2 { font-size: 1.8rem; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #E5E7EB; padding-bottom: 0.5rem; }
                    #brand-guide-to-print-content h3 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                    #brand-guide-to-print-content p { margin-bottom: 1rem; line-height: 1.6; }
                    #brand-guide-to-print-content .logo-display { max-width: 200px; border: 1px solid #E5E7EB; padding: 1rem; }
                    #brand-guide-to-print-content .color-palette { display: flex; flex-wrap: wrap; gap: 1rem; }
                    #brand-guide-to-print-content .color-swatch { text-align: center; }
                    #brand-guide-to-print-content .color-box { width: 100px; height: 100px; border-radius: 0.25rem; border: 1px solid #D1D5DB; margin-bottom: 0.5rem; }
                 `}</style>
                {brandIdentity && <div id="brand-guide-to-print-content">
                    <h1>Brand Guidelines for {brandIdentity.name}</h1>
                    
                    <h2>Brand Identity</h2>
                    <p><strong>Personality:</strong> {brandIdentity.personality}</p>
                    <p><strong>Voice & Tone:</strong> {brandIdentity.voice}</p>
                    <p><strong>Mission:</strong> {brandIdentity.mission}</p>

                    <h2>Logo</h2>
                    {logos[0] && <img src={logos[0].src} alt={logos[0].alt} className="logo-display"/>}

                    <h2>Color Palette</h2>
                    {colorPalette && Object.entries(colorPalette).map(([name, colors]) => (
                        <div key={name}>
                            <h3>{name.charAt(0).toUpperCase() + name.slice(1)}</h3>
                            <div className="color-palette">
                                {(colors as string[]).map(color => (
                                    <div key={color} className="color-swatch">
                                        <div className="color-box" style={{backgroundColor: color}}></div>
                                        <span>{color}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    <h2>Typography</h2>
                    {typography && (
                        <div>
                             <h3 style={{fontFamily: `'${typography.headingFont}', sans-serif`}}>Heading Font: {typography.headingFont}</h3>
                             <p style={{fontFamily: `'${typography.bodyFont}', sans-serif`}}>Body Font: {typography.bodyFont}</p>
                             <p>{typography.guidelines}</p>
                        </div>
                    )}
                </div>}
            </div>
        </div>
      )}
    </div>
  );
};

export default BrandKitStudio;
