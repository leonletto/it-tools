<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { NCard, NTabs, NTabPane, NButton, NSpace, NAlert, NSplit, NTag } from 'naive-ui';
import { useStyleStore } from '@/stores/style.store';
import { parseDxfToJson } from './dxf-parser.service';
import { jsonToScr } from './json-to-scr.service';
import { jsonToDxf } from './json-to-dxf.service';
import type { CadDocument } from './autocad-llm-sync.types';
import {
  checkFileSystemSupport,
  requestFileHandle,
  writeFileToHandle,
  readFileFromHandle,
  checkFileModified,
} from './file-system.service';
import {
  saveFileMetadata,
  loadFileMetadata,
  clearFileMetadata,
  createFileMetadata,
  formatFileSize,
  formatTimestamp,
  getTimeSinceSync,
  updateLastSyncTime,
} from './file-storage.service';

// Monaco Editor workers are now handled by vite-plugin-monaco-editor
// This enables JSON syntax highlighting and validation

// State
const currentDocument = ref<CadDocument | null>(null);
const jsonContent = ref<string>('');
const scrContent = ref<string>('');
const dxfContent = ref<string>('');
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const activeTab = ref('json'); // Track active tab for editor recreation

// File System Access API state
const fileSystemSupported = ref(false);
const currentFileHandle = ref<FileSystemFileHandle | null>(null);
const fileMetadata = ref(loadFileMetadata());
const isCheckingForChanges = ref(false);

// Monaco Editor refs
const jsonEditorContainer = ref<HTMLElement | null>(null);
const scrEditorContainer = ref<HTMLElement | null>(null);
const dxfEditorContainer = ref<HTMLElement | null>(null);

let jsonEditor: monaco.editor.IStandaloneCodeEditor | null = null;
let scrEditor: monaco.editor.IStandaloneCodeEditor | null = null;
let dxfEditor: monaco.editor.IStandaloneCodeEditor | null = null;

// Theme setup
monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

// Initialize Monaco Editors
function initializeEditors() {
  if (jsonEditorContainer.value && !jsonEditor) {
    jsonEditor = monaco.editor.create(jsonEditorContainer.value, {
      value: jsonContent.value,
      language: 'json', // JSON language with syntax highlighting and validation
      theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
      minimap: { enabled: false },
      automaticLayout: true,
      readOnly: false,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
    });

    // Listen for changes in JSON editor
    jsonEditor.onDidChangeModelContent(() => {
      const value = jsonEditor?.getValue() || '';
      jsonContent.value = value;

      // Try to parse and regenerate SCR/DXF
      try {
        const doc = JSON.parse(value);
        currentDocument.value = doc;
        scrContent.value = jsonToScr(doc);
        dxfContent.value = jsonToDxf(doc);

        // Update other editors
        scrEditor?.setValue(scrContent.value);
        dxfEditor?.setValue(dxfContent.value);
      }
      catch (err) {
        // Invalid JSON, ignore
      }
    });
  }

  if (scrEditorContainer.value && !scrEditor) {
    scrEditor = monaco.editor.create(scrEditorContainer.value, {
      value: scrContent.value,
      language: 'plaintext',
      theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
      minimap: { enabled: false },
      automaticLayout: true,
      readOnly: true,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
    });
  }

  if (dxfEditorContainer.value && !dxfEditor) {
    dxfEditor = monaco.editor.create(dxfEditorContainer.value, {
      value: dxfContent.value,
      language: 'plaintext',
      theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
      minimap: { enabled: false },
      automaticLayout: true,
      readOnly: true,
      wordWrap: 'on',
      scrollBeyondLastLine: false,
    });
  }
}

// File handling
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  try {
    errorMessage.value = '';
    successMessage.value = '';
    const content = await file.text();

    // Parse DXF to JSON
    const document = parseDxfToJson(content);
    currentDocument.value = document;

    // Update JSON view
    jsonContent.value = JSON.stringify(document, null, 2);

    // Generate SCR
    scrContent.value = jsonToScr(document);

    // Generate DXF
    dxfContent.value = jsonToDxf(document);

    // Save file metadata
    fileMetadata.value = createFileMetadata(file);
    saveFileMetadata(fileMetadata.value);

    // Editors will be updated automatically by watchers
  }
  catch (err: any) {
    errorMessage.value = `Error parsing file: ${err.message}`;
    console.error('File parsing error:', err);
  }
}

// File System Access API: Open file with handle
async function openFileWithHandle() {
  try {
    errorMessage.value = '';
    successMessage.value = '';

    const result = await requestFileHandle();
    if (!result) {
      // User cancelled
      return;
    }

    const { handle, file } = result;
    currentFileHandle.value = handle;

    // Read and parse file
    const content = await file.text();
    const document = parseDxfToJson(content);
    currentDocument.value = document;

    // Update views
    jsonContent.value = JSON.stringify(document, null, 2);
    scrContent.value = jsonToScr(document);
    dxfContent.value = jsonToDxf(document);

    // Save metadata
    fileMetadata.value = createFileMetadata(file);
    saveFileMetadata(fileMetadata.value);

    // Editors will be updated automatically by watchers
    successMessage.value = `Opened file: ${file.name}`;
  }
  catch (err: any) {
    errorMessage.value = `Error opening file: ${err.message}`;
    console.error('File open error:', err);
  }
}

// Save current JSON back to disk
async function saveToDisk() {
  if (!currentFileHandle.value) {
    errorMessage.value = 'No file handle available. Please open a file using "Open with File Access" button.';
    return;
  }

  try {
    errorMessage.value = '';
    successMessage.value = '';

    // Write DXF content to file
    await writeFileToHandle(currentFileHandle.value, dxfContent.value);

    // Update metadata
    const file = await readFileFromHandle(currentFileHandle.value);
    fileMetadata.value = createFileMetadata(file);
    saveFileMetadata(fileMetadata.value);
    updateLastSyncTime();

    successMessage.value = `Saved to ${currentFileHandle.value.name}`;
  }
  catch (err: any) {
    errorMessage.value = `Error saving file: ${err.message}`;
    console.error('File save error:', err);
  }
}

// Reload file from disk
async function reloadFromDisk() {
  if (!currentFileHandle.value) {
    errorMessage.value = 'No file handle available. Please open a file using "Open with File Access" button.';
    return;
  }

  try {
    errorMessage.value = '';
    successMessage.value = '';
    isCheckingForChanges.value = true;

    const file = await readFileFromHandle(currentFileHandle.value);

    // Check if file was modified
    if (fileMetadata.value && file.lastModified <= fileMetadata.value.lastModified) {
      successMessage.value = 'File is up to date (no changes detected)';
      isCheckingForChanges.value = false;
      return;
    }

    // Read and parse file
    const content = await file.text();
    const document = parseDxfToJson(content);
    currentDocument.value = document;

    // Update views
    jsonContent.value = JSON.stringify(document, null, 2);
    scrContent.value = jsonToScr(document);
    dxfContent.value = jsonToDxf(document);

    // Update metadata
    fileMetadata.value = createFileMetadata(file);
    saveFileMetadata(fileMetadata.value);

    // Editors will be updated automatically by watchers
    successMessage.value = `Reloaded from ${file.name}`;
    isCheckingForChanges.value = false;
  }
  catch (err: any) {
    errorMessage.value = `Error reloading file: ${err.message}`;
    console.error('File reload error:', err);
    isCheckingForChanges.value = false;
  }
}

// Download handlers
function downloadJson() {
  if (!jsonContent.value) {
    return;
  }
  
  const blob = new Blob([jsonContent.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cad-document.json';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadScr() {
  if (!scrContent.value) {
    return;
  }
  
  const blob = new Blob([scrContent.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cad-script.scr';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadDxf() {
  if (!dxfContent.value) {
    return;
  }

  const blob = new Blob([dxfContent.value], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cad-document.dxf';
  a.click();
  URL.revokeObjectURL(url);
}

// Clear all data
function clearAll() {
  currentDocument.value = null;
  jsonContent.value = '';
  scrContent.value = '';
  dxfContent.value = '';
  errorMessage.value = '';
  successMessage.value = '';
  currentFileHandle.value = null;
  fileMetadata.value = null;
  clearFileMetadata();

  // Editors will be cleared automatically by watchers
}

// Lifecycle hooks
onMounted(() => {
  // Check File System Access API support
  const support = checkFileSystemSupport();
  fileSystemSupported.value = support.supported;

  // Initialize editors after DOM is ready
  nextTick(() => {
    initializeEditors();
  });
});

onBeforeUnmount(() => {
  jsonEditor?.dispose();
  scrEditor?.dispose();
  dxfEditor?.dispose();
});

// Watch for document changes to initialize editors when first document is loaded
// This ensures editors are created after the tab panes are rendered
watch(currentDocument, (newDoc) => {
  if (newDoc && (!jsonEditor || !scrEditor || !dxfEditor)) {
    nextTick(() => {
      initializeEditors();
    });
  }
});

// Watch for content changes and update editors if they exist
watch(jsonContent, (newContent) => {
  if (jsonEditor && jsonEditor.getValue() !== newContent) {
    const position = jsonEditor.getPosition();
    jsonEditor.setValue(newContent);
    if (position) {
      jsonEditor.setPosition(position);
    }
  }
});

watch(scrContent, (newContent) => {
  if (scrEditor && scrEditor.getValue() !== newContent) {
    scrEditor.setValue(newContent);
  }
});

watch(dxfContent, (newContent) => {
  if (dxfEditor && dxfEditor.getValue() !== newContent) {
    dxfEditor.setValue(newContent);
  }
});

// Handle tab changes - recreate editors when switching tabs
// This is necessary because Naive UI destroys inactive tab DOM elements
function handleTabChange(tabName: string) {
  activeTab.value = tabName;

  // Wait for DOM to be ready, then recreate the editor for the active tab
  nextTick(() => {
    if (tabName === 'json' && jsonEditorContainer.value) {
      // Dispose old editor if it exists
      if (jsonEditor) {
        jsonEditor.dispose();
        jsonEditor = null;
      }
      // Recreate JSON editor
      jsonEditor = monaco.editor.create(jsonEditorContainer.value, {
        value: jsonContent.value,
        language: 'json',
        theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: false,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      });

      // Re-attach change listener
      jsonEditor.onDidChangeModelContent(() => {
        const value = jsonEditor?.getValue() || '';
        jsonContent.value = value;

        try {
          const doc = JSON.parse(value);
          currentDocument.value = doc;
          scrContent.value = jsonToScr(doc);
          dxfContent.value = jsonToDxf(doc);
        }
        catch (err) {
          // Invalid JSON, ignore
        }
      });
    }
    else if (tabName === 'scr' && scrEditorContainer.value) {
      // Dispose old editor if it exists
      if (scrEditor) {
        scrEditor.dispose();
        scrEditor = null;
      }
      // Recreate SCR editor
      scrEditor = monaco.editor.create(scrEditorContainer.value, {
        value: scrContent.value,
        language: 'plaintext',
        theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      });
    }
    else if (tabName === 'dxf' && dxfEditorContainer.value) {
      // Dispose old editor if it exists
      if (dxfEditor) {
        dxfEditor.dispose();
        dxfEditor = null;
      }
      // Recreate DXF editor
      dxfEditor = monaco.editor.create(dxfEditorContainer.value, {
        value: dxfContent.value,
        language: 'plaintext',
        theme: styleStore.isDarkTheme ? 'it-tools-dark' : 'it-tools-light',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      });
    }
  });
}
</script>

<template>
  <div>
    <n-card title="AutoCAD LLM Sync">
      <n-space vertical>
        <!-- File Upload -->
        <n-card title="Load DXF File" size="small">
          <n-space vertical>
            <!-- Traditional file upload -->
            <n-space>
              <input
                type="file"
                accept=".dxf,.dxx"
                @change="handleFileUpload"
              >
              <n-button v-if="currentDocument" secondary @click="clearAll">
                Clear
              </n-button>
            </n-space>

            <!-- File System Access API option -->
            <n-space v-if="fileSystemSupported">
              <n-button type="primary" @click="openFileWithHandle">
                Open with File Access (Recommended)
              </n-button>
              <n-alert type="info" style="flex: 1;">
                Use File Access to save changes back to the original file
              </n-alert>
            </n-space>
            <n-alert v-else type="warning">
              File System Access API not supported in this browser. Use Chrome, Edge, or Opera for full functionality.
            </n-alert>
          </n-space>
        </n-card>

        <!-- File Info -->
        <n-card v-if="fileMetadata" title="File Information" size="small">
          <n-space vertical size="small">
            <div><strong>Name:</strong> {{ fileMetadata.name }}</div>
            <div><strong>Size:</strong> {{ formatFileSize(fileMetadata.size) }}</div>
            <div><strong>Last Modified:</strong> {{ formatTimestamp(fileMetadata.lastModified) }}</div>
            <div v-if="getTimeSinceSync()"><strong>Last Synced:</strong> {{ getTimeSinceSync() }}</div>
            <n-space v-if="currentFileHandle">
              <n-tag type="success">File Handle Active</n-tag>
              <n-button size="small" @click="saveToDisk">
                Save to Disk
              </n-button>
              <n-button size="small" secondary @click="reloadFromDisk" :loading="isCheckingForChanges">
                Reload from Disk
              </n-button>
            </n-space>
          </n-space>
        </n-card>

        <!-- Error Display -->
        <n-alert v-if="errorMessage" type="error" :title="errorMessage" closable @close="errorMessage = ''" />

        <!-- Success Display -->
        <n-alert v-if="successMessage" type="success" :title="successMessage" closable @close="successMessage = ''" />

        <!-- Tabs for different views -->
        <n-tabs v-if="currentDocument" v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
          <!-- JSON View -->
          <n-tab-pane name="json" tab="JSON (Editable)">
            <n-space vertical>
              <n-space>
                <n-button @click="downloadJson">
                  Download JSON
                </n-button>
                <n-alert type="info" style="flex: 1;">
                  Edit JSON directly - SCR and DXF will update automatically
                </n-alert>
              </n-space>
              <div ref="jsonEditorContainer" style="height: 600px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            </n-space>
          </n-tab-pane>

          <!-- SCR View -->
          <n-tab-pane name="scr" tab="SCR Script">
            <n-space vertical>
              <n-button @click="downloadScr">
                Download SCR
              </n-button>
              <div ref="scrEditorContainer" style="height: 600px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            </n-space>
          </n-tab-pane>

          <!-- DXF View -->
          <n-tab-pane name="dxf" tab="DXF Output">
            <n-space vertical>
              <n-button @click="downloadDxf">
                Download DXF
              </n-button>
              <div ref="dxfEditorContainer" style="height: 600px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-space>
    </n-card>
  </div>
</template>

