
import { GoogleGenAI, Modality } from "@google/genai";

export async function generateTTS(text: string, voice: string = 'fenrir'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ 
      parts: [{ 
        text: `ACT AS AN ANCIENT NARRATOR. 
        Voice: The 'Titan' style. 
        Tone: Powerful, resonant, and cinematic. 
        Instructions: Speak with immense authority and a touch of ancient weariness. Use deliberate pacing and allow the resonance of the voice to fill the space between sentences.
        
        Script to read:
        ${text}` 
      }] 
    }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // 'fenrir' provides a powerful, cinematic profile often called the Titan voice.
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data returned from Gemini API");
  }
  return base64Audio;
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
