export interface Dish {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  error?: string;
  angle?: PhotoAngle;
  lighting?: LightingStyle;
}

export type PhotoStyle = 'Rustic/Dark' | 'Bright/Modern' | 'Social Media';
export type ImageSize = '1K' | '2K' | '4K';
export type PhotoAngle = 'Close-up Macro' | 'Three-Quarter View' | 'Overhead Shot' | 'Environment Shot';
export type LightingStyle = 'Dramatic Spotlight' | 'Soft Natural Window' | 'Golden Hour Glow' | 'Studio Macro';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
