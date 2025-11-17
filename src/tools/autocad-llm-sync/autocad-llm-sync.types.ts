// Type definitions for AutoCAD LLM Sync tool

export interface CadEntity {
  type: 'LINE' | 'INSERT' | 'CIRCLE' | 'POLYLINE' | 'LWPOLYLINE' | 'ARC' | 'ELLIPSE' | 'SPLINE' | 'TEXT' | 'MTEXT' | 'DIMENSION' | 'UNKNOWN';
  layer: string;
  
  // LINE properties
  start?: [number, number, number];
  end?: [number, number, number];
  
  // INSERT properties
  block?: string;
  insertion_point?: [number, number, number];
  scale?: [number, number, number];
  rotation?: number;
  
  // CIRCLE properties
  center?: { x: number; y: number; z: number };
  radius?: number;
  
  // POLYLINE/LWPOLYLINE properties
  vertices?: Array<{ x: number; y: number; z?: number; bulge?: number }>;
  shape?: boolean;
  
  // TEXT properties
  text?: string;
  position?: { x: number; y: number; z: number };
  height?: number;
  
  // Generic properties
  handle?: string;
  ownerHandle?: string;
  [key: string]: any; // Allow additional properties from dxf-parser
}

export interface CadDocument {
  entities: CadEntity[];
  metadata?: {
    filename?: string;
    lastModified?: string;
    version?: number;
  };
  header?: any;
  tables?: any;
  blocks?: any;
}

export interface DocumentVersion {
  id: string;
  timestamp: number;
  document: CadDocument;
  description: string;
}

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface LlmSettings {
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

export interface FileHandleRef {
  name: string;
  lastModified: number;
}

