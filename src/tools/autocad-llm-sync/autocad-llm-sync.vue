<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NTabs, NTabPane, NButton, NSpace, NAlert } from 'naive-ui';
import { parseDxfToJson } from './dxf-parser.service';
import { jsonToScr } from './json-to-scr.service';
import { jsonToDxf } from './json-to-dxf.service';
import type { CadDocument } from './autocad-llm-sync.types';

// State
const currentDocument = ref<CadDocument | null>(null);
const jsonContent = ref<string>('');
const scrContent = ref<string>('');
const dxfContent = ref<string>('');
const errorMessage = ref<string>('');

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
</script>

<template>
  <div>
    <n-card title="AutoCAD LLM Sync">
      <n-space vertical>
        <!-- File Upload -->
        <n-card title="Upload DXF File" size="small">
          <input
            type="file"
            accept=".dxf,.dxx"
            @change="handleFileUpload"
          >
        </n-card>

        <!-- Error Display -->
        <n-alert v-if="errorMessage" type="error" :title="errorMessage" />

        <!-- Tabs for different views -->
        <n-tabs v-if="currentDocument" type="line" animated>
          <!-- JSON View -->
          <n-tab-pane name="json" tab="JSON">
            <n-space vertical>
              <n-button @click="downloadJson">
                Download JSON
              </n-button>
              <pre style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 16px; border-radius: 4px;">{{ jsonContent }}</pre>
            </n-space>
          </n-tab-pane>

          <!-- SCR View -->
          <n-tab-pane name="scr" tab="SCR Script">
            <n-space vertical>
              <n-button @click="downloadScr">
                Download SCR
              </n-button>
              <pre style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 16px; border-radius: 4px;">{{ scrContent }}</pre>
            </n-space>
          </n-tab-pane>

          <!-- DXF View -->
          <n-tab-pane name="dxf" tab="DXF Output">
            <n-space vertical>
              <n-button @click="downloadDxf">
                Download DXF
              </n-button>
              <pre style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 16px; border-radius: 4px;">{{ dxfContent }}</pre>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-space>
    </n-card>
  </div>
</template>

