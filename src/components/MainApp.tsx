import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Camera, Loader2, Image as ImageIcon, Settings2, Wand2, Download } from 'lucide-react';
import { Dish, PhotoStyle, ImageSize, PhotoAngle, LightingStyle } from '../types';

const STYLE_PROMPTS: Record<PhotoStyle, string> = {
  'Rustic/Dark': 'Rustic, dark moody lighting, wooden table, dramatic shadows, highly detailed food photography, 85mm lens, f/1.8.',
  'Bright/Modern': 'Bright, modern, airy, white marble background, soft natural lighting, clean composition, high key food photography.',
  'Social Media': 'Top-down flat lay, vibrant colors, trendy social media style, hard flash lighting, sharp focus, colorful background.'
};

export function MainApp() {
  const [menuText, setMenuText] = useState('');
  const [style, setStyle] = useState<PhotoStyle>('Rustic/Dark');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [lighting, setLighting] = useState<LightingStyle>('Soft Natural Window');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseMenu = async () => {
    if (!menuText.trim()) return;
    
    setIsParsing(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract the individual dishes from the following menu. For each dish, provide its name and a brief visual description based on its ingredients or typical presentation.\n\nMenu:\n${menuText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "description"],
            },
          },
        },
      });
      
      const parsedDishes = JSON.parse(response.text || '[]');
      const newDishes: Dish[] = parsedDishes.map((d: any) => ({
        id: Math.random().toString(36).substring(7),
        name: d.name,
        description: d.description,
        status: 'idle'
      }));
      
      setDishes(newDishes);
      
      // Start generating images for all dishes
      generateImagesForDishes(newDishes);
      
    } catch (err) {
      console.error("Failed to parse menu:", err);
      setError("Failed to parse the menu. Please try again or check your input.");
    } finally {
      setIsParsing(false);
    }
  };

  const generateImagesForDishes = async (dishesToProcess: Dish[]) => {
    for (const dish of dishesToProcess) {
      await generateImageForDish(dish.id, dish.name, dish.description);
    }
  };

  const generateImageForDish = async (id: string, name: string, description: string, angle?: PhotoAngle, currentLighting?: LightingStyle) => {
    const activeLighting = currentLighting || lighting;
    setDishes(prev => prev.map(d => d.id === id ? { ...d, status: 'generating', error: undefined, angle, lighting: activeLighting } : d));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const anglePrompt = angle ? `Camera Angle: ${angle}. ` : '';
      const prompt = `A realistic, high-end food photography shot of ${name}. ${description}. ${STYLE_PROMPTS[style]} ${anglePrompt}Lighting: ${activeLighting}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          },
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (imageUrl) {
        setDishes(prev => prev.map(d => d.id === id ? { ...d, status: 'done', imageUrl } : d));
      } else {
        throw new Error("No image data returned");
      }
      
    } catch (err) {
      console.error(`Failed to generate image for ${name}:`, err);
      setDishes(prev => prev.map(d => d.id === id ? { ...d, status: 'error', error: "Failed to generate image" } : d));
    }
  };

  const handleRegenerate = (dish: Dish, angle?: PhotoAngle) => {
    generateImageForDish(dish.id, dish.name, dish.description, angle || dish.angle, dish.lighting || lighting);
  };

  return (
    <div className="min-h-screen bg-bg font-sans text-text-main flex flex-col">
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-black" />
            </div>
            <h1 className="font-serif text-[20px] italic tracking-[1px] text-accent">Virtual Food Photographer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1px] bg-border">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 bg-bg p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-text-dim mb-2 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Configuration
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-text-dim mb-2">
                    Menu Text
                  </label>
                  <textarea
                    value={menuText}
                    onChange={(e) => setMenuText(e.target.value)}
                    placeholder="Paste your menu items here... e.g.&#10;- Truffle Mushroom Risotto&#10;- Seared Scallops with Corn Purée"
                    className="w-full h-[300px] p-4 bg-card border border-border rounded-[4px] text-text-main font-sans text-[14px] leading-[1.6] resize-none focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-text-dim mb-2">
                    Photography Style
                  </label>
                  <div className="flex flex-col gap-3">
                    {(['Rustic/Dark', 'Bright/Modern', 'Social Media'] as PhotoStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`bg-transparent border p-4 rounded-[4px] text-left cursor-pointer flex flex-col gap-1 ${
                          style === s 
                            ? 'border-accent bg-accent/5' 
                            : 'border-border text-text-main'
                        }`}
                      >
                        <span className="text-[13px] font-semibold text-text-main">{s}</span>
                        <span className="text-[11px] text-text-dim">
                          {s === 'Rustic/Dark' ? 'Chiaroscuro lighting, wooden surfaces, deep shadows.' : s === 'Bright/Modern' ? 'High-key lighting, minimalist white marble, clean lines.' : 'Top-down flat lay, colorful props, vibrant saturation.'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-text-dim mb-2">
                    Image Resolution
                  </label>
                  <div className="flex bg-card p-1 rounded-[4px] border border-border">
                    {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setImageSize(s)}
                        className={`flex-1 py-2 text-[13px] font-semibold rounded-[4px] transition-all ${
                          imageSize === s 
                            ? 'bg-accent/10 text-accent' 
                            : 'text-text-dim hover:text-text-main'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-text-dim mb-2">
                    Lighting Preset
                  </label>
                  <select
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value as LightingStyle)}
                    className="w-full bg-card border border-border rounded-[4px] text-text-main text-[13px] p-3 focus:outline-none focus:border-accent"
                  >
                    {(['Dramatic Spotlight', 'Soft Natural Window', 'Golden Hour Glow', 'Studio Macro'] as LightingStyle[]).map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={parseMenu}
                  disabled={isParsing || !menuText.trim()}
                  className="w-full bg-accent text-black p-3 rounded-[4px] font-semibold text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Menu...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Photos
                    </>
                  )}
                </button>
                
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 bg-bg p-6">
            {dishes.length === 0 ? (
              <div className="h-full min-h-[400px] bg-card rounded-[8px] border border-border border-dashed flex flex-col items-center justify-center text-text-dim p-8 text-center">
                <div className="text-[24px] mb-2 opacity-50">+</div>
                <h3 className="text-[14px] font-medium text-text-main mb-2">No photos yet</h3>
                <p className="max-w-sm text-[11px] uppercase">Paste your menu on the left and click generate to see your virtual food photography.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg">
                {dishes.map((dish) => (
                  <div key={dish.id} className="relative bg-card rounded-[8px] overflow-hidden border border-border flex flex-col">
                    <div className="aspect-square relative bg-gradient-to-tr from-[#1c1c1e] to-[#2c2c2e] flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,195,132,0.05),transparent)] pointer-events-none"></div>
                      {dish.status === 'idle' || dish.status === 'generating' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-text-dim z-10">
                          <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent" />
                          <span className="text-sm font-medium">
                            {dish.status === 'generating' ? 'Shooting...' : 'Waiting...'}
                          </span>
                        </div>
                      ) : dish.status === 'error' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-6 text-center z-10">
                          <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
                          <span className="text-sm font-medium text-red-400 mb-3">{dish.error}</span>
                          <button 
                            onClick={() => handleRegenerate(dish)}
                            className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-[4px] font-medium hover:bg-red-500/20"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : (
                        <img 
                          src={dish.imageUrl} 
                          alt={dish.name} 
                          className="w-full h-full object-cover relative z-10"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="p-3 px-4 bg-card flex-1 flex flex-col">
                      <h3 className="text-[14px] font-medium text-text-main mb-1">{dish.name}</h3>
                      <p className="text-[11px] text-text-dim uppercase line-clamp-2 mb-4 flex-1">{dish.description}</p>
                      
                      {dish.status === 'done' && (
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleRegenerate(dish)}
                              className="text-[11px] uppercase font-medium text-text-dim hover:text-accent transition-colors"
                            >
                              Regenerate
                            </button>
                            <span className="text-border">|</span>
                            <select
                              value={dish.angle || ''}
                              onChange={(e) => handleRegenerate(dish, e.target.value as PhotoAngle)}
                              className="bg-transparent text-[11px] uppercase font-medium text-text-dim hover:text-accent transition-colors focus:outline-none cursor-pointer max-w-[100px] truncate"
                            >
                              <option value="" disabled>Angle...</option>
                              {(['Close-up Macro', 'Three-Quarter View', 'Overhead Shot', 'Environment Shot'] as PhotoAngle[]).map((a) => (
                                <option key={a} value={a} className="bg-card text-text-main">{a}</option>
                              ))}
                            </select>
                          </div>
                          <a 
                            href={dish.imageUrl} 
                            download={`${dish.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                            className="flex items-center gap-1.5 text-[11px] uppercase font-medium text-black bg-accent px-3 py-1.5 rounded-[4px] hover:bg-accent/90 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Save
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </main>

      <footer className="h-8 px-6 bg-card flex items-center justify-between text-[11px] text-text-dim border-t border-border mt-auto">
        <div className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full shadow-[0_0_10px_rgba(52,199,89,0.4)]"></span>
          AI ENGINE: READY
        </div>
        <div>MODEL: GEMINI-3-PRO-IMAGE</div>
        <div>SYSTEM LATENCY: 24MS</div>
      </footer>
    </div>
  );
}
