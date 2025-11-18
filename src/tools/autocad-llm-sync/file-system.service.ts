/**
 * File System Access API Service
 * 
 * Provides wrapper functions for the File System Access API to:
 * - Request file handles from user
 * - Read files from handles
 * - Write files to handles
 * - Check file modification times
 * 
 * Browser Support: Chrome/Edge 86+, Opera 72+
 * Not supported: Firefox, Safari (as of 2025)
 */

export interface FileSystemSupport {
  supported: boolean;
  reason?: string;
}

/**
 * Check if File System Access API is supported
 */
export function checkFileSystemSupport(): FileSystemSupport {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'Not in browser environment' };
  }

  if (!('showOpenFilePicker' in window)) {
    return { 
      supported: false, 
      reason: 'File System Access API not supported in this browser. Please use Chrome, Edge, or Opera.' 
    };
  }

  return { supported: true };
}

/**
 * Request a file handle from the user via file picker
 * Returns the file handle and the file content
 */
export async function requestFileHandle(acceptedTypes: string[] = ['.dxf', '.dxx']): Promise<{
  handle: FileSystemFileHandle;
  file: File;
} | null> {
  try {
    const support = checkFileSystemSupport();
    if (!support.supported) {
      throw new Error(support.reason);
    }

    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'AutoCAD Files',
          accept: {
            'application/dxf': acceptedTypes,
          },
        },
      ],
      multiple: false,
    });

    const file = await fileHandle.getFile();
    return { handle: fileHandle, file };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled the picker
      return null;
    }
    throw error;
  }
}

/**
 * Read file content from a file handle
 */
export async function readFileFromHandle(handle: FileSystemFileHandle): Promise<File> {
  return await handle.getFile();
}

/**
 * Write content to a file handle
 */
export async function writeFileToHandle(
  handle: FileSystemFileHandle,
  content: string | Blob,
): Promise<void> {
  // Request write permission if needed
  const permission = await handle.queryPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    const newPermission = await handle.requestPermission({ mode: 'readwrite' });
    if (newPermission !== 'granted') {
      throw new Error('Write permission denied');
    }
  }

  // Create a writable stream
  const writable = await handle.createWritable();

  // Write the content
  if (typeof content === 'string') {
    await writable.write(content);
  } else {
    await writable.write(content);
  }

  // Close the stream
  await writable.close();
}

/**
 * Check if file has been modified since last read
 * Returns true if file has been modified
 */
export async function checkFileModified(
  handle: FileSystemFileHandle,
  lastModified: number,
): Promise<boolean> {
  const file = await handle.getFile();
  return file.lastModified > lastModified;
}

/**
 * Get file modification time
 */
export async function getFileModificationTime(handle: FileSystemFileHandle): Promise<number> {
  const file = await handle.getFile();
  return file.lastModified;
}

/**
 * Serialize file handle for storage
 * Note: File handles cannot be directly serialized to localStorage
 * We store the file name and path for reference only
 */
export function serializeFileHandle(handle: FileSystemFileHandle): string {
  return JSON.stringify({
    name: handle.name,
    kind: handle.kind,
  });
}

/**
 * Check if we have permission to read/write a file handle
 */
export async function checkHandlePermission(
  handle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'read',
): Promise<boolean> {
  const permission = await handle.queryPermission({ mode });
  return permission === 'granted';
}

/**
 * Request permission for a file handle
 */
export async function requestHandlePermission(
  handle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite',
): Promise<boolean> {
  const permission = await handle.requestPermission({ mode });
  return permission === 'granted';
}

