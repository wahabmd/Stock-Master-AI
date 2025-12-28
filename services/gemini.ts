import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VectorMetadata } from "../types";

// Always initialize GoogleGenAI with a named parameter for apiKey using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a file to a base64 string for Gemini input.
 * Automatically rasterizes SVG files to JPEG because Gemini vision models 
 * do not currently support the image/svg+xml MIME type.
 */
export const fileToDataPart = async (file: File) => {
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // 1024px is sufficient for visual analysis while keeping payload size small
          const maxDim = 1024;
          const width = img.naturalWidth || img.width || 1024;
          const height = img.naturalHeight || img.height || 1024;
          const scale = Math.min(1, maxDim / Math.max(width, height));
          
          canvas.width = width * scale;
          canvas.height = height * scale;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Failed to get canvas context'));
          
          // White background is necessary for transparent SVGs
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Export as JPEG
          const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          });
        };
        img.onerror = () => reject(new Error('Failed to render SVG for analysis. Check if the file is a valid vector.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || "image/jpeg",
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Generates Adobe Stock metadata for a vector image
 */
export async function generateVectorMetadata(filePart: any): Promise<VectorMetadata> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        filePart,
        { text: "Analyze this vector illustration and generate Adobe Stock metadata. You must provide exactly: 1. A descriptive title (max 70 chars). 2. A description. 3. Exactly 40 highly relevant keywords/tags (max 49 total allowed, so 40 is a safe target). Return the response strictly in JSON format." }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "tags"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}

/**
 * Generates a high-quality AI prompt from an image
 */
export async function generateImagePrompt(filePart: any): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        filePart,
        { text: "Describe this image in meticulous detail to create a high-quality text-to-image prompt. Focus on composition, lighting, camera angle, textures, colors, and the specific artistic style. Do not use conversational filler, just the prompt text." }
      ],
    },
  });

  return response.text || "Failed to generate prompt.";
}