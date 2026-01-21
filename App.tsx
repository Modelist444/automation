
import React, { useState, useRef, useEffect } from 'react';
import { SCRIPT_DATA, FULL_SCRIPT } from './constants';
import { NarrativeCard } from './components/NarrativeCard';
import { generateTTS, decodeBase64, decodeAudioBuffer } from './services/audioService';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [lastGeneratedAudio, setLastGeneratedAudio] = useState<Uint8Array | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleGenerateAndPlay = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setDownloadMessage(null);

      const base64 = await generateTTS(FULL_SCRIPT, 'fenrir'); 
      const audioData = decodeBase64(base64);
      setLastGeneratedAudio(audioData);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const buffer = await decodeAudioBuffer(audioData, audioContextRef.current);

      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        setActiveSection(0);
      };

      startTimeRef.current = audioContextRef.current.currentTime;
      source.start();
      sourceNodeRef.current = source;
      
      setIsPlaying(true);
      setIsGenerating(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "The ancient energies are unstable. Try again.");
      setIsGenerating(false);
    }
  };

  const downloadAudio = () => {
    if (!lastGeneratedAudio) return;
    
    // Creating the RAW blob
    const blob = new Blob([lastGeneratedAudio], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Forbidden_Chronicles_Nephilim.raw';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadMessage("SUCCESS: CHECK YOUR 'DOWNLOADS' FOLDER FOR THE .RAW FILE");
    setTimeout(() => setDownloadMessage(null), 10000);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (!audioContextRef.current) return;
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;

      if (elapsed < 6) setActiveSection(0);
      else if (elapsed < 14) setActiveSection(1);
      else if (elapsed < 26) setActiveSection(2);
      else if (elapsed < 38) setActiveSection(3);
      else if (elapsed < 52) setActiveSection(4);
      else if (elapsed < 62) setActiveSection(5);
      else setActiveSection(6);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 md:p-12 max-w-4xl mx-auto">
      <header className="text-center mb-16 mt-8 space-y-4">
        <h1 className="cinzel text-4xl md:text-6xl text-amber-600 font-bold tracking-tighter">
          FORBIDDEN CHRONICLES
        </h1>
        <p className="text-amber-200/60 cinzel text-sm tracking-[0.3em] uppercase">
          Legacy of the Titans
        </p>
      </header>

      <main className="w-full space-y-8 mb-48">
        {/* DOWNLOAD LOCATION BOX */}
        <div className="p-6 border-2 border-dashed border-amber-600/40 bg-amber-950/10 rounded-xl mb-8">
           <div className="flex items-center space-x-3 mb-3">
             <div className="p-2 bg-amber-600 rounded-lg">
               <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
               </svg>
             </div>
             <h3 className="cinzel text-amber-500 font-bold tracking-widest text-lg">AUTOMATIC DOWNLOAD FOLDER</h3>
           </div>
           <p className="text-amber-100/80 text-sm leading-relaxed">
             Browser Security restricts direct folder selection. When you click <span className="text-amber-400 font-bold">"SAVE .RAW FILE"</span>, 
             the file will be sent to your <span className="underline decoration-amber-500 font-bold">system Downloads folder</span> immediately. 
             You can then copy it from there to any other folder.
           </p>
        </div>

        <div className="mb-8 p-4 bg-black/40 border border-amber-900/30 rounded backdrop-blur-sm">
          <h2 className="cinzel text-amber-500 text-xs mb-3 uppercase tracking-widest opacity-70">Source Audio Script</h2>
          <div className="text-white/70 text-base leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap italic font-serif">
            {FULL_SCRIPT}
          </div>
        </div>

        {SCRIPT_DATA.map((section, idx) => (
          <NarrativeCard 
            key={idx} 
            section={section} 
            isActive={isPlaying ? activeSection === idx : true} 
          />
        ))}
      </main>

      {/* STICKY CONTROL BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/95 to-transparent flex flex-col items-center space-y-6 z-50">
        {error && (
          <div className="bg-red-900/40 border border-red-500/50 px-4 py-2 rounded text-red-200 text-sm animate-pulse">
            {error}
          </div>
        )}

        {downloadMessage && (
          <div className="bg-amber-500 border-2 border-amber-300 px-6 py-4 rounded-xl shadow-[0_0_40px_rgba(217,119,6,0.4)] text-black text-sm mb-4 font-bold cinzel animate-in zoom-in slide-in-from-bottom-4 duration-500">
            {downloadMessage}
          </div>
        )}
        
        <div className="flex items-center space-x-6">
          {!isPlaying ? (
            <button
              onClick={handleGenerateAndPlay}
              disabled={isGenerating}
              className="px-12 py-5 bg-amber-600 hover:bg-amber-500 text-black cinzel font-bold text-xl tracking-widest transition-all rounded-full shadow-[0_0_40px_rgba(217,119,6,0.3)] flex items-center space-x-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>GENERATING...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 fill-current group-hover:scale-125 transition-transform" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span>PLAY NARRATIVE</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopPlayback}
              className="px-12 py-5 bg-red-700 hover:bg-red-600 text-white cinzel font-bold text-xl tracking-widest transition-all rounded-full flex items-center space-x-4 shadow-[0_0_30px_rgba(185,28,28,0.3)]"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
              <span>STOP AUDIO</span>
            </button>
          )}

          {lastGeneratedAudio && !isGenerating && (
            <div className="flex flex-col items-center">
              <button
                onClick={downloadAudio}
                className="p-6 border-4 border-amber-500 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 rounded-full transition-all group shadow-[0_0_30px_rgba(217,119,6,0.5)] animate-pulse hover:animate-none"
                title="Save Forbidden_Chronicles_Nephilim.raw"
              >
                <svg className="w-8 h-8 fill-current group-hover:translate-y-1 transition-transform" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </button>
              <span className="text-[10px] cinzel text-amber-500 mt-2 font-bold tracking-widest">SAVE .RAW FILE</span>
            </div>
          )}
        </div>
        
        <p className="text-[10px] cinzel text-white/20 tracking-[0.5em] uppercase">
          Titan Audio Synthesis • Forbidden_Chronicles_Nephilim.raw
        </p>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden -z-10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,30,0,0.3)_0,transparent_70%)]"></div>
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
          className="w-full h-full object-cover mix-blend-overlay opacity-30 grayscale brightness-50"
          alt=""
        />
      </div>
    </div>
  );
};

export default App;
