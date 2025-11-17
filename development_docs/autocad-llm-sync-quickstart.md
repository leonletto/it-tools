# AutoCAD LLM Sync - Quick Start Guide

## Step 1: Create Tool Directory

```bash
cd src/tools
mkdir autocad-llm-sync
cd autocad-llm-sync
```

## Step 2: Create Initial Files

### File: `index.ts`
```typescript
import { FileCode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.autocad-llm-sync.title'),
  path: '/autocad-llm-sync',
  description: translate('tools.autocad-llm-sync.description'),
  keywords: ['autocad', 'cad', 'dxf', 'dxx', 'scr', 'llm', 'ai', 'json', 'geometry'],
  component: () => import('./autocad-llm-sync.vue'),
  icon: FileCode,
  createdAt: new Date('2024-01-15'),
});
```

### File: `autocad-llm-sync.types.ts`
```typescript
export interface CadEntity {
  type: 'LINE' | 'INSERT' | 'CIRCLE' | 'POLYLINE' | 'UNKNOWN';
  layer: string;
  // LINE-specific
  start?: [number, number, number];
  end?: [number, number, number];
  // INSERT-specific
  block?: string;
  insertion_point?: [number, number, number];
  scale?: [number, number, number];
  rotation?: number;
  // CIRCLE-specific
  center?: [number, number, number];
  radius?: number;
  // POLYLINE-specific
  points?: Array<[number, number, number]>;
  closed?: boolean;
}

export interface CadDocument {
  entities: CadEntity[];
  metadata?: {
    filename?: string;
    lastModified?: string;
    version?: number;
  };
}

export interface FileHandleRef {
  name: string;
  path?: string;
  lastModified: number;
}

export interface DocumentVersion {
  id: string;
  timestamp: number;
  document: CadDocument;
  description: string;
  fileHandle?: FileHandleRef;
}

export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  lastModified: number;
}

export interface LlmSettings {
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
}
```

### File: `autocad-llm-sync.vue` (Minimal Starter)
```vue
<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('file-manager');
</script>

<template>
  <div>
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="file-manager" tab="File Manager">
        <c-card title="File Manager">
          <p>Upload and manage CAD files</p>
        </c-card>
      </n-tab-pane>

      <n-tab-pane name="json-editor" tab="JSON Editor">
        <c-card title="JSON Editor">
          <p>Edit CAD geometry as JSON</p>
        </c-card>
      </n-tab-pane>

      <n-tab-pane name="llm-interface" tab="LLM Interface">
        <c-card title="LLM Interface">
          <p>Send JSON to LLM for modifications</p>
        </c-card>
      </n-tab-pane>

      <n-tab-pane name="system-prompts" tab="System Prompts">
        <c-card title="System Prompts">
          <p>Manage LLM system prompts</p>
        </c-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
```

## Step 3: Register Tool

Edit `src/tools/index.ts`:

```typescript
// Add import
import { tool as autocadLlmSync } from './autocad-llm-sync';

// Add to appropriate category (e.g., Development)
export const toolsByCategory: ToolCategory[] = [
  // ... existing categories
  {
    name: 'Development',
    components: [
      // ... existing tools
      autocadLlmSync,
    ],
  },
];
```

## Step 4: Add Translations

Edit `locales/en.yml`:

```yaml
tools:
  autocad-llm-sync:
    title: 'AutoCAD LLM Sync'
    description: 'Convert CAD files (DXX/DXF) to JSON, edit with LLM assistance, and export back to SCR/DXF formats'
```

## Step 5: Create Pinia Store

Create `autocad-llm-sync.store.ts`:

```typescript
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { CadDocument, DocumentVersion, SystemPrompt, LlmSettings } from './autocad-llm-sync.types';

export const useAutocadLlmSyncStore = defineStore('autocad-llm-sync', () => {
  const currentDocument = useStorage<CadDocument>(
    'autocad-llm-sync:current-document',
    { entities: [] }
  );

  const versions = useStorage<DocumentVersion[]>(
    'autocad-llm-sync:versions',
    []
  );

  const systemPrompts = useStorage<SystemPrompt[]>(
    'autocad-llm-sync:system-prompts',
    []
  );

  const activePromptId = useStorage<string>(
    'autocad-llm-sync:active-prompt-id',
    ''
  );

  const llmSettings = useStorage<LlmSettings>(
    'autocad-llm-sync:llm-settings',
    {
      endpoint: 'http://localhost:11434/api/generate',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 2048
    }
  );

  function saveVersion(description: string = '') {
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      document: JSON.parse(JSON.stringify(currentDocument.value)),
      description
    };

    versions.value.unshift(version);

    if (versions.value.length > 5) {
      versions.value = versions.value.slice(0, 5);
    }
  }

  return {
    currentDocument,
    versions,
    systemPrompts,
    activePromptId,
    llmSettings,
    saveVersion
  };
});
```

## Step 6: Test Basic Setup

```bash
npm run dev
```

Navigate to `http://localhost:5173/autocad-llm-sync` and verify:
- Tool appears in navigation
- 4 tabs are visible
- Basic UI renders

## Step 7: Install dxf-parser

```bash
npm install dxf-parser @monaco-editor/vue
```

## Step 8: Implement Phase 2 - DXF Parser (Using dxf-parser library)

Create `services/dxf-parser.service.ts`:

```typescript
import DxfParser from 'dxf-parser';
import type { CadDocument } from '../autocad-llm-sync.types';

export function parseDxfToJson(fileContent: string): CadDocument {
  const parser = new DxfParser();

  try {
    const dxf = parser.parse(fileContent);

    // dxf-parser returns a well-structured object:
    // {
    //   header: { $ACADVER, $EXTMIN, $EXTMAX, ... },
    //   tables: {
    //     lineType: { lineTypes: {...} },
    //     layer: { layers: {...} },
    //     ...
    //   },
    //   blocks: { ... },
    //   entities: [
    //     { type: 'LINE', vertices: [...], layer: '...', ... },
    //     { type: 'CIRCLE', center: {...}, radius: ..., ... },
    //     { type: 'LWPOLYLINE', vertices: [...], ... },
    //     ...
    //   ]
    // }

    // Use dxf-parser output directly
    return dxf as CadDocument;

  } catch (err) {
    console.error('DXF parsing error:', err);
    throw new Error(`Failed to parse DXF file: ${err.message}`);
  }
}

// Helper to get entity count by type
export function getEntityStats(document: CadDocument): Record<string, number> {
  const stats: Record<string, number> = {};

  for (const entity of document.entities || []) {
    const type = entity.type || 'UNKNOWN';
    stats[type] = (stats[type] || 0) + 1;
  }

  return stats;
}
```

**Benefits of using dxf-parser:**
- ✅ Handles 15+ entity types (LINE, LWPOLYLINE, CIRCLE, ARC, ELLIPSE, SPLINE, INSERT, TEXT, MTEXT, DIMENSION, etc.)
- ✅ Parses header, tables (layers, line types), blocks, viewports
- ✅ Battle-tested (520 GitHub stars, actively maintained since 2015)
- ✅ Works in browser and Node.js
- ✅ No need to write custom parser from scratch

## Next Steps

1. ✅ Complete Phase 1 (above)
2. ⏭️ Implement file upload in FileManager component
3. ⏭️ Integrate DXX parser
4. ⏭️ Add JSON editor (Monaco)
5. ⏭️ Continue with remaining phases

## Useful Commands

```bash
# Run dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Type check
npm run type-check
```

## Resources

- **Full Planning**: `autocad-llm-sync-planning.md`
- **Summary**: `autocad-llm-sync-summary.md`
- **Original Spec**: `autocad_llm.md`

