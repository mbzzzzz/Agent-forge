import React from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export enum ModuleId {
  BRAND_KIT = "brand_kit_studio",
  MOCKUP = "product_mockup_studio",
  POSTER = "poster_design_studio",
  SOCIAL = "social_media_studio",
  VIDEO = "video_studio",
}

export interface CreativeModule {
  id: ModuleId;
  name: string;
  description: string;
  // FIX: The type for a React component, especially one from lucide-react (a ForwardRefExoticComponent),
  // should be more generic. `React.ElementType` correctly represents any renderable component.
  // The previous function type was incorrect for `ForwardRefExoticComponent`.
  icon: React.ElementType;
}

export interface BrandIdentity {
  name: string;
  personality: string;
  voice: string;
  values: string;
  mission: string;
  positioning: string;
}

export interface GeneratedImage {
  src: string;
  alt: string;
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  guidelines: string;
}

export interface BrandAsset {
  name: string;
  src: string;
  dimensions: string;
}