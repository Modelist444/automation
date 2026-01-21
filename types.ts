
export interface ScriptSection {
  timeframe: string;
  label: string;
  text: string;
}

export interface AudioState {
  isPlaying: boolean;
  progress: number;
  isGenerating: boolean;
  error: string | null;
}
