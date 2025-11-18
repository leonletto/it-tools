/**
 * File Storage Service
 * 
 * Manages file handles and metadata in localStorage
 * Note: FileSystemFileHandle objects cannot be serialized to localStorage
 * We store metadata and keep the handle in memory during the session
 */

const STORAGE_KEY = 'autocad-llm-sync-file-metadata';

export interface FileMetadata {
  name: string;
  lastModified: number;
  size: number;
  type: string;
  lastSyncTime: number;
}

/**
 * Save file metadata to localStorage
 */
export function saveFileMetadata(metadata: FileMetadata): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to save file metadata:', error);
  }
}

/**
 * Load file metadata from localStorage
 */
export function loadFileMetadata(): FileMetadata | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load file metadata:', error);
    return null;
  }
}

/**
 * Clear file metadata from localStorage
 */
export function clearFileMetadata(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear file metadata:', error);
  }
}

/**
 * Check if we have stored file metadata
 */
export function hasStoredFileMetadata(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Update last sync time
 */
export function updateLastSyncTime(): void {
  const metadata = loadFileMetadata();
  if (metadata) {
    metadata.lastSyncTime = Date.now();
    saveFileMetadata(metadata);
  }
}

/**
 * Create file metadata from a File object
 */
export function createFileMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    lastModified: file.lastModified,
    size: file.size,
    type: file.type,
    lastSyncTime: Date.now(),
  };
}

/**
 * Check if file has been modified since last sync
 */
export function isFileModifiedSinceSync(currentFile: File): boolean {
  const metadata = loadFileMetadata();
  if (!metadata) {
    return false;
  }
  return currentFile.lastModified > metadata.lastModified;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Get time since last sync in human-readable format
 */
export function getTimeSinceSync(): string | null {
  const metadata = loadFileMetadata();
  if (!metadata) {
    return null;
  }

  const now = Date.now();
  const diff = now - metadata.lastSyncTime;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

