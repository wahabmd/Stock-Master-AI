
export interface VectorMetadata {
  title: string;
  description: string;
  tags: string[];
}

export interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  metadata?: VectorMetadata;
  prompt?: string;
  error?: string;
}

export enum AppTab {
  VECTOR_TOOL = 'vector',
  PROMPT_TOOL = 'prompt'
}
