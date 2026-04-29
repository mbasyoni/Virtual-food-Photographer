import { Camera } from 'lucide-react';

interface ApiKeyScreenProps {
  onKeySelected: () => void;
}

export function ApiKeyScreen({ onKeySelected }: ApiKeyScreenProps) {
  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      onKeySelected();
    } catch (e) {
      console.error('Failed to select API key:', e);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-card p-10 rounded-[8px] border border-border text-center">
        <div className="w-16 h-16 bg-border rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-[20px] font-serif italic tracking-[1px] text-accent mb-4">Virtual Food Photographer</h1>
        <p className="text-[14px] text-text-dim mb-8 leading-[1.6]">
          To generate high-quality 4K food photography, this application requires a paid Google Cloud API key.
          <br /><br />
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noreferrer"
            className="text-text-main underline decoration-border hover:decoration-accent transition-colors"
          >
            Learn more about billing
          </a>
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-accent text-black p-3 rounded-[4px] font-semibold text-[14px] cursor-pointer hover:bg-accent/90 transition-colors"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
}
