import React from 'react';
import { CreativeModule, ModuleId } from './types';
import { SwatchBook, Smartphone, Image, Share2, Clapperboard } from 'lucide-react';

// FIX: Export MockupIcon to be used as a placeholder in MockupStudio
export const MockupIcon = Smartphone;

export const CREATIVE_MODULES: CreativeModule[] = [
  { id: ModuleId.BRAND_KIT, name: "Brand Kit Manager", description: "AI-powered brand identity system", icon: SwatchBook },
  { id: ModuleId.MOCKUP, name: "Product Mockup Generator", description: "Create photorealistic product mockups", icon: Smartphone },
  { id: ModuleId.POSTER, name: "AI Poster Designer", description: "Design stunning posters for any event", icon: Image },
  { id: ModuleId.SOCIAL, name: "Social Media Creator", description: "Generate content with images and captions", icon: Share2 },
  { id: ModuleId.VIDEO, name: "AI Video Creator", description: "Produce professional videos with Veo", icon: Clapperboard },
];

export const LOGO_STYLES = ["Wordmark", "Lettermark", "Brandmark/Symbol", "Combination Mark", "Emblem", "Abstract", "Mascot", "Minimalist"];

export const MOCKUP_CATEGORIES = {
    "Digital Products": ["iPhone mockups", "Android phone mockups", "Laptop mockups", "Website browser mockups"],
    "Print Products": ["Business cards", "Letterheads", "Posters", "Books"],
    "Apparel": ["T-shirts", "Hoodies", "Hats/Caps", "Tote bags"],
    "Packaging": ["Product boxes", "Shopping bags", "Coffee cups", "Bottles"],
};

export const POSTER_TYPES = ["Event posters", "Movie posters", "Product launch posters", "Promotional posters", "Motivational posters"];

export const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "Twitter/X", "LinkedIn", "Pinterest", "TikTok"];