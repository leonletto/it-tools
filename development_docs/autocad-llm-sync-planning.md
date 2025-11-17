# AutoCAD LLM Sync - Vue Tool Planning Document

## 1. Overview

This document outlines the implementation plan for **autocad-llm-sync**, a Vue-based tool that enables bidirectional synchronization between CAD files (DXX/DXF/SCR) and JSON representations, with LLM integration capabilities. The tool will run entirely in the browser with local file system integration.

### Core Concept
Adapt the Python-based CAD converter workflow into a browser-based Vue tool that:
- Parses DXX/DXF files to JSON
- Converts JSON to SCR scripts or DXF files
- Provides LLM integration with system prompt management
- Auto-saves to localStorage with version history
- Syncs with local file system using File System Access API

---

## 2. Architecture Overview

### 2.1 Technology Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia store + VueUse `useStorage`
- **UI Components**: Naive UI (existing in project)
- **File System**: File System Access API (browser native)
- **Parsing**: **dxf-parser** npm package (520 stars, battle-tested)
- **Storage**: localStorage for persistence

### 2.2 Tool Structure
```
src/tools/autocad-llm-sync/
├── index.ts                          # Tool registration
├── autocad-llm-sync.vue              # Main component with tabs
├── autocad-llm-sync.types.ts         # TypeScript interfaces
├── autocad-llm-sync.store.ts         # Pinia store for state management
├── services/
│   ├── dxx-parser.service.ts         # DXX/DXF → JSON parser
│   ├── scr-generator.service.ts      # JSON → SCR converter
│   ├── dxf-generator.service.ts      # JSON → DXF converter
│   └── file-sync.service.ts          # File system sync logic
├── components/
│   ├── FileManager.vue               # File upload/sync/version management
│   ├── JsonEditor.vue                # JSON editing with Monaco/CodeMirror
│   ├── SystemPromptEditor.vue        # LLM system prompt management
│   ├── LlmInterface.vue              # LLM interaction panel
│   └── VersionHistory.vue            # Version comparison/restore
└── utils/
    ├── geometry-schema.ts            # JSON schema definitions
    └── version-manager.ts            # Version history utilities
```

---

## 3. Feature Breakdown

### 3.1 Tab Structure
The main component will use Naive UI's `n-tabs` with 4 tabs:

1. **File Manager** - Upload, sync, and manage CAD files
2. **JSON Editor** - Edit geometry JSON with syntax highlighting
3. **LLM Interface** - Send JSON to LLM, receive modifications
4. **System Prompts** - Manage and version LLM system prompts

### 3.2 File Management Features

#### File Upload & Parsing
- Drag-and-drop or file picker for DXX/DXF files
- Parse to JSON using custom parser
- Auto-save to localStorage with metadata

#### File System Sync
- Use File System Access API to get file handle
- Store file handle reference in localStorage (serialized)
- Detect file changes on disk (via periodic checks or manual refresh)
- Prompt user to import changes if file modified externally
- Export JSON back to SCR or DXF formats

#### Version History (Last 5 Versions)
- Store array of versions in localStorage
- Each version includes:
  - Timestamp
  - JSON content
  - File handle reference (if available)
  - Change description (optional user input)
- Version comparison view (diff viewer)
- Restore previous version functionality

### 3.3 JSON Schema

Following the markdown specification, implement this schema:

```typescript
interface CadEntity {
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

interface CadDocument {
  entities: CadEntity[];
  metadata?: {
    filename?: string;
    lastModified?: string;
    version?: number;
  };
}
```

---

## 4. LocalStorage Schema

### 4.1 Storage Keys
```typescript
// Current active document
'autocad-llm-sync:current-document': CadDocument

// File handle reference (serialized)
'autocad-llm-sync:file-handle': {
  name: string;
  path: string; // if available
  lastModified: number;
}

// Version history (max 5)
'autocad-llm-sync:versions': Array<{
  id: string;
  timestamp: number;
  document: CadDocument;
  description: string;
  fileHandle?: { name: string; path: string; lastModified: number };
}>

// System prompts
'autocad-llm-sync:system-prompts': Array<{
  id: string;
  name: string;
  content: string;
  createdAt: number;
  lastModified: number;
}>

// Active system prompt ID
'autocad-llm-sync:active-prompt-id': string

// LLM settings
'autocad-llm-sync:llm-settings': {
  endpoint: string; // e.g., 'http://localhost:11434/api/generate'
  model: string;    // e.g., 'llama2'
  temperature: number;
  maxTokens: number;
}
```

---

## 5. Implementation Phases

### Phase 1: Core Infrastructure (Foundation)
**Goal**: Set up tool structure and basic file handling

**Tasks**:
- [ ] Create tool directory structure
- [ ] Register tool in `src/tools/index.ts`
- [ ] Create main component with tab layout
- [ ] Implement Pinia store with localStorage persistence
- [ ] Create TypeScript interfaces and types
- [ ] Implement basic file upload component

**Deliverables**:
- Tool appears in navigation
- Basic UI with 4 tabs
- File upload works (stores File object)

### Phase 2: DXX/DXF Parsing (Core Feature) - SIMPLIFIED WITH dxf-parser
**Goal**: Parse CAD files to JSON using dxf-parser library

**Tasks**:
- [ ] Install dxf-parser: `npm install dxf-parser`
- [ ] Create DXX/DXF parser service wrapper
  - [ ] Import DxfParser from 'dxf-parser'
  - [ ] Instantiate parser: `const parser = new DxfParser()`
  - [ ] Call `parser.parse(fileText)` to get structured object
  - [ ] Transform dxf-parser output to our CadDocument schema (if needed)
  - [ ] Handle parse errors gracefully
- [ ] Create JSON editor component with syntax highlighting
- [ ] Display parsed JSON in editor
- [ ] Auto-save parsed JSON to localStorage

**Deliverables**:
- Upload DXX/DXF → see JSON in editor
- JSON persists in localStorage
- Supports all entity types that dxf-parser handles (LINE, LWPOLYLINE, CIRCLE, ARC, ELLIPSE, SPLINE, INSERT, TEXT, MTEXT, DIMENSION, etc.)

**Note**: Using dxf-parser eliminates the need to write a custom parser from scratch. The library is mature (520 stars), actively maintained, and handles complex DXF structures including blocks, layers, line types, and viewports.

### Phase 3: JSON to SCR/DXF Generation
**Goal**: Convert JSON back to CAD formats

**Tasks**:
- [ ] Implement SCR generator service
  - [ ] LINE → `_LINE x1,y1 x2,y2` 
  - [ ] INSERT → `_-INSERT "BlockName" X,Y ScaleX ScaleY Rotation`
- [ ] Implement DXF generator service
  - [ ] Generate minimal ASCII DXF
  - [ ] Header, TABLES, ENTITIES, EOF sections
- [ ] Add export buttons (Download SCR / Download DXF)
- [ ] Use browser download API

**Deliverables**:
- JSON → Download .scr file
- JSON → Download .dxf file

### Phase 4: File System Integration
**Goal**: Sync with local file system using File System Access API

**Tasks**:
- [ ] Implement File System Access API integration
  - [ ] Request file handle on upload
  - [ ] Store file handle reference in localStorage
  - [ ] Implement file change detection
  - [ ] Prompt user when external changes detected
- [ ] Create file sync service
  - [ ] Read file from handle
  - [ ] Write file to handle
  - [ ] Compare timestamps
- [ ] Add "Sync from Disk" button
- [ ] Add "Save to Disk" button

**Deliverables**:
- Tool remembers file location
- Detects external file changes
- Can save JSON back to original file

### Phase 5: Version History
**Goal**: Track last 5 versions with comparison

**Tasks**:
- [ ] Implement version manager utility
  - [ ] Add version on save
  - [ ] Maintain max 5 versions (FIFO)
  - [ ] Generate version IDs
- [ ] Create VersionHistory component
  - [ ] List all versions with timestamps
  - [ ] Diff viewer (JSON comparison)
  - [ ] Restore version functionality
- [ ] Add version description input
- [ ] Integrate with file manager

**Deliverables**:
- Last 5 versions stored
- Visual diff between versions
- One-click restore

### Phase 6: System Prompt Management
**Goal**: Manage LLM system prompts with versioning

**Tasks**:
- [ ] Create SystemPromptEditor component
  - [ ] Textarea with syntax highlighting
  - [ ] Save/Load prompts
  - [ ] Name and description fields
- [ ] Implement prompt versioning
  - [ ] Store multiple prompts
  - [ ] Set active prompt
  - [ ] Clone/duplicate prompts
- [ ] Add default system prompt template
- [ ] Export/Import prompts (JSON)

**Deliverables**:
- Create/edit system prompts
- Switch between prompts
- Export/import prompt library

### Phase 7: LLM Integration
**Goal**: Send JSON to LLM and receive modifications

**Tasks**:
- [ ] Create LlmInterface component
  - [ ] LLM settings form (endpoint, model, params)
  - [ ] User instruction input
  - [ ] Send button
  - [ ] Response display
- [ ] Implement LLM service
  - [ ] Support local Ollama API
  - [ ] Support OpenAI-compatible APIs
  - [ ] Construct prompt with system + user + JSON
  - [ ] Parse LLM response (extract JSON)
- [ ] Add "Apply Changes" button
  - [ ] Validate LLM response JSON
  - [ ] Update current document
  - [ ] Create new version
- [ ] Error handling and validation

**Deliverables**:
- Send JSON + instruction to LLM
- Receive modified JSON
- Apply changes to document

### Phase 8: Polish & Testing
**Goal**: Refine UI/UX and ensure reliability

**Tasks**:
- [ ] Add loading states and spinners
- [ ] Implement error boundaries
- [ ] Add user notifications (success/error toasts)
- [ ] Validate JSON schema on edit
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo (beyond version history)
- [ ] Add help/documentation tab
- [ ] Write unit tests for parsers/generators
- [ ] Write integration tests
- [ ] Performance optimization (large files)

**Deliverables**:
- Polished, production-ready tool
- Comprehensive error handling
- Test coverage

---

## 6. Detailed Component Specifications

### 6.1 FileManager.vue

**Purpose**: Central hub for file operations

**Features**:
- File upload (drag-drop or picker)
- Current file info display (name, size, last modified)
- Sync status indicator
- Action buttons:
  - "Upload New File"
  - "Sync from Disk" (if file handle exists)
  - "Save to Disk" (export current JSON)
  - "Export as SCR"
  - "Export as DXF"
- File change notification banner

**State**:
```typescript
const currentFile = ref<File | null>(null);
const fileHandle = ref<FileSystemFileHandle | null>(null);
const syncStatus = ref<'synced' | 'modified' | 'conflict' | 'none'>('none');
const lastSyncTime = ref<number | null>(null);
```

### 6.2 JsonEditor.vue

**Purpose**: Edit CAD geometry as JSON

**Features**:
- Monaco Editor or CodeMirror integration
- JSON syntax highlighting
- Schema validation (real-time)
- Auto-save on change (debounced)
- Format/prettify button
- Entity count display
- Search/replace functionality

**Props**:
```typescript
interface Props {
  modelValue: CadDocument;
  readonly?: boolean;
}
```

**Events**:
```typescript
const emit = defineEmits<{
  'update:modelValue': [value: CadDocument];
  'save': [];
}>();
```

### 6.3 SystemPromptEditor.vue

**Purpose**: Manage LLM system prompts

**Features**:
- Prompt library sidebar (list of saved prompts)
- Active prompt indicator
- Textarea for editing
- Metadata fields (name, description)
- Action buttons:
  - "Save Prompt"
  - "New Prompt"
  - "Duplicate"
  - "Delete"
  - "Set as Active"
  - "Export All"
  - "Import"
- Default prompt template

**Default System Prompt Template**:
```
You are an expert CAD assistant. You receive CAD geometry in JSON format and modify it according to user instructions.

RULES:
1. Always return valid JSON matching the input schema
2. Preserve entity types and required fields
3. Use precise numeric values for coordinates
4. Maintain layer organization
5. Document changes in comments if possible

INPUT SCHEMA:
{
  "entities": [
    {
      "type": "LINE" | "INSERT" | "CIRCLE" | "POLYLINE" | "UNKNOWN",
      "layer": "string",
      "start": [x, y, z],
      "end": [x, y, z],
      ...
    }
  ]
}

OUTPUT: Return ONLY the modified JSON, no explanations.
```

### 6.4 LlmInterface.vue

**Purpose**: Interact with LLM for geometry modifications

**Features**:
- LLM settings panel (collapsible):
  - Endpoint URL
  - Model name
  - Temperature slider
  - Max tokens input
  - Test connection button
- User instruction textarea
- Current JSON preview (read-only, collapsible)
- Send button
- Response display area
- Diff viewer (original vs. LLM response)
- Action buttons:
  - "Apply Changes"
  - "Discard"
  - "Edit Response"
- Request/response history (last 5)

**LLM Request Flow**:
1. User enters instruction (e.g., "Move all lines 10 units to the right")
2. Construct prompt:
   ```
   SYSTEM: {active system prompt}
   USER: {user instruction}

   Current CAD JSON:
   {current document JSON}
   ```
3. Send to LLM endpoint
4. Parse response (extract JSON)
5. Validate against schema
6. Show diff
7. User applies or discards

### 6.5 VersionHistory.vue

**Purpose**: View and manage document versions

**Features**:
- Timeline view of versions (newest first)
- Version cards showing:
  - Timestamp
  - Description
  - Entity count
  - File size
- Action buttons per version:
  - "View"
  - "Restore"
  - "Compare with Current"
  - "Delete"
- Diff viewer modal
- Restore confirmation dialog

**Version Card Example**:
```
┌─────────────────────────────────────┐
│ Version 5 (Current)                 │
│ 2024-01-15 14:32:18                 │
│ "Added circle entities"             │
│ 47 entities • 12.3 KB               │
│ [View] [Compare]                    │
└─────────────────────────────────────┘
```

---

## 7. Service Implementations

### 7.1 dxf-parser.service.ts (Wrapper for dxf-parser library)

**Core Function**:
```typescript
import DxfParser from 'dxf-parser';
import type { CadDocument } from '../autocad-llm-sync.types';

export function parseDxfToJson(fileContent: string): CadDocument {
  const parser = new DxfParser();

  try {
    const dxf = parser.parse(fileContent);

    // dxf-parser returns:
    // {
    //   header: { $ACADVER, $EXTMIN, $EXTMAX, ... },
    //   tables: { lineType, layer, ... },
    //   blocks: { ... },
    //   entities: [ { type: 'LINE', vertices: [...], ... }, ... ]
    // }

    // Option 1: Use dxf-parser output directly (recommended)
    return dxf as CadDocument;

    // Option 2: Transform to our schema if needed
    // return transformDxfParserOutput(dxf);

  } catch (err) {
    console.error('DXF parsing error:', err);
    throw new Error(`Failed to parse DXF file: ${err.message}`);
  }
}

// Optional: Transform dxf-parser output to match our CadDocument schema
function transformDxfParserOutput(dxf: any): CadDocument {
  return {
    entities: dxf.entities || [],
    metadata: {
      filename: '',
      lastModified: new Date().toISOString(),
      version: 1,
      header: dxf.header,
      tables: dxf.tables,
      blocks: dxf.blocks
    }
  };
}
```

**Benefits of using dxf-parser:**
- Handles all DXF entity types (LINE, LWPOLYLINE, CIRCLE, ARC, ELLIPSE, SPLINE, INSERT, TEXT, MTEXT, DIMENSION, etc.)
- Parses header, tables (layers, line types), blocks, and viewports
- Battle-tested with 520 GitHub stars
- Actively maintained since 2015
- Works in both Node.js and browser
- Returns well-structured JavaScript objects

### 7.2 scr-generator.service.ts

**Core Function**:
```typescript
export function jsonToScr(document: CadDocument): string {
  const commands: string[] = [];

  for (const entity of document.entities) {
    if (entity.type === 'LINE' && entity.start && entity.end) {
      const [x1, y1] = entity.start;
      const [x2, y2] = entity.end;
      commands.push(`_LINE ${x1},${y1} ${x2},${y2}\n`);
    } else if (entity.type === 'INSERT' && entity.insertion_point) {
      const [x, y] = entity.insertion_point;
      const [sx, sy] = entity.scale || [1, 1, 1];
      const rotation = entity.rotation || 0;
      commands.push(`_-INSERT "${entity.block}" ${x},${y} ${sx} ${sy} ${rotation}\n`);
    }
  }

  return commands.join('');
}
```

### 7.3 dxf-generator.service.ts

**Core Function**:
```typescript
export function jsonToDxf(document: CadDocument): string {
  const sections: string[] = [];

  // Header
  sections.push('0\nSECTION\n2\nHEADER\n0\nENDSEC\n');

  // Tables (layers)
  sections.push('0\nSECTION\n2\nTABLES\n0\nENDSEC\n');

  // Entities
  sections.push('0\nSECTION\n2\nENTITIES\n');

  for (const entity of document.entities) {
    if (entity.type === 'LINE') {
      sections.push(generateLineEntity(entity));
    } else if (entity.type === 'INSERT') {
      sections.push(generateInsertEntity(entity));
    }
  }

  sections.push('0\nENDSEC\n');

  // EOF
  sections.push('0\nEOF\n');

  return sections.join('');
}

function generateLineEntity(entity: CadEntity): string {
  return `0\nLINE\n8\n${entity.layer}\n10\n${entity.start![0]}\n20\n${entity.start![1]}\n30\n${entity.start![2]}\n11\n${entity.end![0]}\n21\n${entity.end![1]}\n31\n${entity.end![2]}\n`;
}
```

### 7.4 file-sync.service.ts

**Core Functions**:
```typescript
export async function requestFileHandle(): Promise<FileSystemFileHandle | null> {
  if (!('showOpenFilePicker' in window)) {
    console.error('File System Access API not supported');
    return null;
  }

  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'CAD Files',
        accept: { 'text/plain': ['.dxx', '.dxf', '.scr'] }
      }
    ]
  });

  return handle;
}

export async function readFileFromHandle(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFileToHandle(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function checkFileModified(
  handle: FileSystemFileHandle,
  lastModified: number
): Promise<boolean> {
  const file = await handle.getFile();
  return file.lastModified > lastModified;
}
```

---

## 8. Pinia Store Structure

```typescript
// autocad-llm-sync.store.ts
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export const useAutocadLlmSyncStore = defineStore('autocad-llm-sync', () => {
  // Current document
  const currentDocument = useStorage<CadDocument>(
    'autocad-llm-sync:current-document',
    { entities: [] }
  );

  // File handle reference
  const fileHandleRef = useStorage<FileHandleRef | null>(
    'autocad-llm-sync:file-handle',
    null
  );

  // Version history
  const versions = useStorage<DocumentVersion[]>(
    'autocad-llm-sync:versions',
    []
  );

  // System prompts
  const systemPrompts = useStorage<SystemPrompt[]>(
    'autocad-llm-sync:system-prompts',
    [getDefaultSystemPrompt()]
  );

  const activePromptId = useStorage<string>(
    'autocad-llm-sync:active-prompt-id',
    systemPrompts.value[0].id
  );

  // LLM settings
  const llmSettings = useStorage<LlmSettings>(
    'autocad-llm-sync:llm-settings',
    {
      endpoint: 'http://localhost:11434/api/generate',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 2048
    }
  );

  // Actions
  function saveVersion(description: string = '') {
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      document: JSON.parse(JSON.stringify(currentDocument.value)),
      description,
      fileHandle: fileHandleRef.value
    };

    versions.value.unshift(version);

    // Keep only last 5 versions
    if (versions.value.length > 5) {
      versions.value = versions.value.slice(0, 5);
    }
  }

  function restoreVersion(versionId: string) {
    const version = versions.value.find(v => v.id === versionId);
    if (version) {
      currentDocument.value = JSON.parse(JSON.stringify(version.document));
      saveVersion(`Restored from version ${new Date(version.timestamp).toLocaleString()}`);
    }
  }

  function updateDocument(newDocument: CadDocument) {
    currentDocument.value = newDocument;
  }

  function addSystemPrompt(prompt: Omit<SystemPrompt, 'id' | 'createdAt' | 'lastModified'>) {
    const newPrompt: SystemPrompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    systemPrompts.value.push(newPrompt);
    return newPrompt.id;
  }

  function updateSystemPrompt(id: string, updates: Partial<SystemPrompt>) {
    const index = systemPrompts.value.findIndex(p => p.id === id);
    if (index !== -1) {
      systemPrompts.value[index] = {
        ...systemPrompts.value[index],
        ...updates,
        lastModified: Date.now()
      };
    }
  }

  function deleteSystemPrompt(id: string) {
    systemPrompts.value = systemPrompts.value.filter(p => p.id !== id);
    if (activePromptId.value === id && systemPrompts.value.length > 0) {
      activePromptId.value = systemPrompts.value[0].id;
    }
  }

  const activePrompt = computed(() =>
    systemPrompts.value.find(p => p.id === activePromptId.value)
  );

  return {
    // State
    currentDocument,
    fileHandleRef,
    versions,
    systemPrompts,
    activePromptId,
    llmSettings,

    // Computed
    activePrompt,

    // Actions
    saveVersion,
    restoreVersion,
    updateDocument,
    addSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt
  };
});
```

---

## 9. UI/UX Considerations

### 9.1 Layout
- Use Naive UI's `n-layout` with sidebar for navigation
- Main content area with `n-tabs` for different views
- Responsive design (mobile-friendly)

### 9.2 Color Coding
- **Synced**: Green indicator
- **Modified**: Yellow indicator
- **Conflict**: Red indicator
- **No file**: Gray indicator

### 9.3 Keyboard Shortcuts
- `Ctrl+S`: Save current document
- `Ctrl+E`: Export as SCR
- `Ctrl+Shift+E`: Export as DXF
- `Ctrl+Z`: Undo (version restore)
- `Ctrl+L`: Focus LLM instruction input

### 9.4 Notifications
- Success: "File parsed successfully"
- Error: "Failed to parse DXF file: Invalid format"
- Warning: "File modified on disk. Sync to update."
- Info: "Version saved"

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Parser functions (DXX → JSON)
- Generator functions (JSON → SCR/DXF)
- Version manager utilities
- Schema validation

### 10.2 Integration Tests
- File upload → Parse → Display
- Edit JSON → Export → Download
- LLM interaction flow
- Version save/restore

### 10.3 E2E Tests
- Complete workflow: Upload → Edit → LLM → Export
- File sync workflow
- Version history workflow

---

## 11. Browser Compatibility

### File System Access API Support
- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

**Fallback Strategy**:
- Detect API availability
- If not available, use traditional file download/upload
- Show warning message to users

---

## 12. Performance Considerations

### Large Files
- Implement virtual scrolling for entity lists
- Lazy load Monaco Editor
- Debounce auto-save (500ms)
- Use Web Workers for parsing (if needed)

### LocalStorage Limits
- Monitor storage usage
- Warn user when approaching 5MB limit
- Implement storage cleanup (delete old versions)

---

## 13. Security Considerations

### File System Access
- Request permissions explicitly
- Validate file types
- Sanitize file content before parsing

### LLM Integration
- Validate LLM responses before applying
- Sanitize user input
- Support CORS for local LLM endpoints
- No sensitive data in prompts (user responsibility)

---

## 14. Future Enhancements (Post-MVP)

- [ ] Support for CIRCLE, POLYLINE, ARC entities
- [ ] 3D visualization of geometry
- [ ] Collaborative editing (WebRTC)
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Export to other formats (SVG, PDF)
- [ ] Batch processing (multiple files)
- [ ] LLM response streaming
- [ ] Custom entity templates
- [ ] Macro recording/playback
- [ ] Integration with AutoCAD Web API

---

## 15. Success Criteria

### MVP Complete When:
- ✅ Can upload DXX/DXF files
- ✅ Parse to JSON correctly (LINE, INSERT)
- ✅ Edit JSON in Monaco Editor
- ✅ Export to SCR and DXF
- ✅ Auto-save to localStorage
- ✅ Track last 5 versions
- ✅ Manage system prompts
- ✅ Send JSON to LLM and apply changes
- ✅ File system sync works (Chrome/Edge)
- ✅ All core features tested

---

## 16. Development Timeline Estimate

| Phase | Estimated Time | Priority |
|-------|---------------|----------|
| Phase 1: Core Infrastructure | 2-3 days | High |
| Phase 2: DXX/DXF Parsing | 3-4 days | High |
| Phase 3: JSON to SCR/DXF | 2-3 days | High |
| Phase 4: File System Integration | 2-3 days | Medium |
| Phase 5: Version History | 2 days | Medium |
| Phase 6: System Prompt Management | 1-2 days | Medium |
| Phase 7: LLM Integration | 3-4 days | High |
| Phase 8: Polish & Testing | 3-5 days | High |
| **Total** | **18-26 days** | |

---

## 17. Dependencies to Install

```json
{
  "dependencies": {
    "@monaco-editor/vue": "^4.0.0",  // JSON editor with syntax highlighting
    "dxf-parser": "^1.7.1"            // DXF/DXX parser (520 stars, actively maintained)
  }
}
```

**Note about dxf-parser:**
- **Mature library**: 520 GitHub stars, actively maintained since 2015
- **Browser-ready**: Works in both Node.js and browser environments
- **Comprehensive**: Supports Header, Layers, LineTypes, Blocks, VPorts, Text, MTEXT, XData
- **Entity support**: LINE, LWPOLYLINE, CIRCLE, ARC, ELLIPSE, SPLINE, INSERT, TEXT, MTEXT, DIMENSION, and more
- **Output structure**: Returns well-structured JavaScript object with readable properties
- **No need for custom parser**: Eliminates Phase 2 implementation complexity

**Usage:**
```typescript
import DxfParser from 'dxf-parser';

const parser = new DxfParser();
const dxf = parser.parse(fileText);
// Returns: { header, tables, blocks, entities }
```

Note: Most other functionality uses existing dependencies (Vue, Pinia, VueUse, Naive UI).

---

## 18. Getting Started Checklist

- [ ] Review this planning document
- [ ] Set up tool directory structure
- [ ] Create TypeScript interfaces
- [ ] Implement Phase 1 (Core Infrastructure)
- [ ] Test basic file upload
- [ ] Proceed to Phase 2

---

**END OF PLANNING DOCUMENT**

