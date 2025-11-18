<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { NCard, NTabs, NTabPane, NButton, NSpace, NAlert, NSplit } from 'naive-ui';
import { useStyleStore } from '@/stores/style.store';
import { parseDxfToJson } from './dxf-parser.service';
import { jsonToScr } from './json-to-scr.service';
import { jsonToDxf } from './json-to-dxf.service';
import type { CadDocument } from './autocad-llm-sync.types';

// Configure Monaco Editor environment for Vite
// This prevents the "Unexpected usage" error
(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    // For JSON language support
    if (label === 'json') {
      return new Worker(
        new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url),
        { type: 'module' }
      );
    }
    // For other languages (CSS, HTML, TypeScript)
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new Worker(
        new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(
        new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url),
        { type: 'module' }
      );
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url),
        { type: 'module' }
      );
    }
    // Default editor worker
    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
      { type: 'module' }
    );
  },
};

// State
const currentDocument = ref<CadDocument | null>(null);
const jsonContent = ref<string>('');
const scrContent = ref<string>('');
const dxfContent = ref<string>('');
const errorMessage = ref<string>('');

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
      language: 'json',
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

    // Update Monaco editors
    nextTick(() => {
      jsonEditor?.setValue(jsonContent.value);
      scrEditor?.setValue(scrContent.value);
      dxfEditor?.setValue(dxfContent.value);
    });
  }
  catch (err: any) {
    errorMessage.value = `Error parsing file: ${err.message}`;
    console.error('File parsing error:', err);
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

// Lifecycle hooks
onMounted(() => {
  initializeEditors();
});

onBeforeUnmount(() => {
  jsonEditor?.dispose();
  scrEditor?.dispose();
  dxfEditor?.dispose();
});

// Watch for tab changes to ensure editors are initialized
watch(currentDocument, () => {
  nextTick(() => {
    initializeEditors();
  });
});
</script>

<template>
  <div>
    <n-card title="AutoCAD LLM Sync">
      <n-space vertical>
        <!-- File Upload -->
        <n-card title="Upload DXF File" size="small">
          <n-space>
            <input
              type="file"
              accept=".dxf,.dxx"
              @change="handleFileUpload"
            >
            <n-button v-if="currentDocument" secondary @click="currentDocument = null">
              Clear
            </n-button>
          </n-space>
        </n-card>

        <!-- Error Display -->
        <n-alert v-if="errorMessage" type="error" :title="errorMessage" />

        <!-- Tabs for different views -->
        <n-tabs v-if="currentDocument" type="line" animated>
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

