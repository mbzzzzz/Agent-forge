
import React, { useState, useEffect } from 'react';
import { generateBrandIdentity, generateLogo, generateColorPalette, generateTypography, generateBrandAsset } from '../services/geminiService';
import { BrandIdentity, GeneratedImage, ColorPalette, Typography, BrandAsset } from '../types';
import Button from './common/Button';
import Loader from './common/Loader';
import { DownloadAction, ShareAction } from './common/ActionButtons';
import { useAppContext } from '../App';

const GlassCard: React.FC<{ title: string; children: React.ReactNode, actions?: React.ReactNode, className?: string }> = ({ title, children, actions, className="" }) => (
  <div className={`bg-glass backdrop-blur-[var(--glass-blur)] border var(--glass-border) p-6 rounded-lg ${className}`}>
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold font-display text-on-surface">{title}</h3>
        {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    {children}
  </div>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-md">{error}</div>}

      <GlassCard title="Brand Foundation">
        <p className="text-on-surface-variant mb-4">Describe your business, and we'll generate a complete brand kit for you.</p>
        <textarea
          value={businessInfo}
          onChange={(e) => setBusinessInfo(e.target.value)}
          placeholder="e.g., An eco-friendly coffee shop targeting young professionals..."
          className="w-full bg-surface-variant/40 border border-outline/50 rounded-md px-4 py-3 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none transition"
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
                <div className="bg-surface p-4 rounded-md group relative">
                    <img src={logos[0].src} alt={logos[0].alt} className="w-full h-auto object-contain aspect-[2/1]"/>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DownloadAction dataUrl={logos[0].src} filename={`${brandIdentity.name}-logo.png`} />
                        <ShareAction dataUrl={logos[0].src} filename={`${brandIdentity.name}-logo.png`} title={`${brandIdentity.name} Logo`} />
                    </div>
                </div>
             ): <div className="flex items-center justify-center h-48"><Loader text="Generating logo..." /></div>}
            </GlassCard>
            <div className="space-y-6">
                <GlassCard title="Brand Assets">
                    {isGeneratingAssets && <Loader text="Generating assets..." />}
                    {!isGeneratingAssets && brandAssets.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {brandAssets.map(asset => (
                                <div key={asset.name} className="text-center group">
                                    <div className="bg-surface p-2 rounded-md aspect-square flex items-center justify-center relative">
                                        <img src={asset.src} alt={asset.name} className="w-full h-full object-contain" />
                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DownloadAction dataUrl={asset.src} filename={`${brandIdentity.name}-${asset.name.toLowerCase()}.png`} />
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold mt-2 text-on-surface-variant">{asset.name}</p>
                                    <p className="text-xs text-on-surface-variant/70">{asset.dimensions}</p>
                                </div>
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
                                    <div key={color} className="flex flex-col items-center cursor-pointer group" onClick={() => copyToClipboard(color)}>
                                        <div style={{ backgroundColor: color }} className="w-20 h-20 rounded-md border-2 border-outline/30 shadow-lg transition-transform group-hover:scale-105"/>
                                        <span className="text-xs mt-2 text-on-surface-variant/80 transition-colors group-hover:text-primary">{copiedColor === color ? 'Copied!' : color}</span>
                                    </div>
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
