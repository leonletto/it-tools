# AutoCAD LLM Sync - Executive Summary

## What Is This?

A browser-based Vue tool that bridges AutoCAD files and Large Language Models (LLMs), enabling AI-assisted CAD geometry editing through a JSON intermediate format.

## Core Workflow

```
DXX/DXF File → Parse → JSON → Edit/LLM Modify → Generate → SCR/DXF File
     ↑                                                           ↓
     └─────────────── File System Sync ──────────────────────────┘
```

## Key Features

### 1. **Bidirectional CAD Conversion**
- **Import**: DXX/DXF → JSON (parse CAD geometry)
- **Export**: JSON → SCR scripts or DXF files
- Supports LINE, INSERT entities (extensible to CIRCLE, POLYLINE, etc.)

### 2. **LLM Integration**
- Send CAD geometry (as JSON) to local or remote LLM
- Natural language instructions: "Move all lines 10 units right"
- LLM returns modified JSON
- Apply changes with visual diff preview

### 3. **File System Sync**
- Uses File System Access API (Chrome/Edge)
- Remembers file location on disk
- Detects external file changes
- Bidirectional sync: import changes or export updates

### 4. **Version History**
- Auto-saves last 5 versions to localStorage
- Visual diff between versions
- One-click restore to previous version
- Version descriptions for tracking changes

### 5. **System Prompt Management**
- Create/edit multiple LLM system prompts
- Version and organize prompts
- Switch between prompts for different use cases
- Export/import prompt libraries

## Technical Architecture

### Technology Stack
- **Framework**: Vue 3 (Composition API)
- **State**: Pinia + VueUse `useStorage`
- **UI**: Naive UI components
- **Editor**: Monaco Editor (JSON syntax highlighting)
- **Parser**: **dxf-parser** npm package (520 stars, battle-tested)
- **Storage**: localStorage (persistent across sessions)
- **File API**: File System Access API (browser native)

### Tool Structure
```
src/tools/autocad-llm-sync/
├── autocad-llm-sync.vue          # Main component (4 tabs)
├── autocad-llm-sync.store.ts     # Pinia store
├── services/
│   ├── dxx-parser.service.ts     # DXX/DXF → JSON
│   ├── scr-generator.service.ts  # JSON → SCR
│   ├── dxf-generator.service.ts  # JSON → DXF
│   └── file-sync.service.ts      # File system operations
└── components/
    ├── FileManager.vue           # Upload/sync/export
    ├── JsonEditor.vue            # Monaco editor
    ├── LlmInterface.vue          # LLM interaction
    ├── SystemPromptEditor.vue    # Prompt management
    └── VersionHistory.vue        # Version control
```

### 4 Main Tabs

1. **File Manager** - Upload, sync, export CAD files
2. **JSON Editor** - Edit geometry with syntax highlighting
3. **LLM Interface** - Send to LLM, receive modifications
4. **System Prompts** - Manage LLM instruction templates

## JSON Schema

```typescript
interface CadDocument {
  entities: Array<{
    type: 'LINE' | 'INSERT' | 'CIRCLE' | 'POLYLINE' | 'UNKNOWN';
    layer: string;
    start?: [x, y, z];      // LINE
    end?: [x, y, z];        // LINE
    block?: string;         // INSERT
    insertion_point?: [x, y, z];  // INSERT
    scale?: [sx, sy, sz];   // INSERT
    rotation?: number;      // INSERT (degrees)
  }>;
}
```

## LocalStorage Schema

```typescript
// Current document
'autocad-llm-sync:current-document': CadDocument

// File handle reference
'autocad-llm-sync:file-handle': {
  name: string;
  path: string;
  lastModified: number;
}

// Version history (max 5)
'autocad-llm-sync:versions': Array<{
  id: string;
  timestamp: number;
  document: CadDocument;
  description: string;
}>

// System prompts
'autocad-llm-sync:system-prompts': Array<{
  id: string;
  name: string;
  content: string;
  createdAt: number;
}>

// LLM settings
'autocad-llm-sync:llm-settings': {
  endpoint: string;  // e.g., 'http://localhost:11434/api/generate'
  model: string;     // e.g., 'llama2'
  temperature: number;
  maxTokens: number;
}
```

## Implementation Phases (8 Phases)

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Core Infrastructure | 2-3 days |
| 2 | DXX/DXF Parsing | 3-4 days |
| 3 | JSON to SCR/DXF | 2-3 days |
| 4 | File System Integration | 2-3 days |
| 5 | Version History | 2 days |
| 6 | System Prompt Management | 1-2 days |
| 7 | LLM Integration | 3-4 days |
| 8 | Polish & Testing | 3-5 days |
| **Total** | **MVP Complete** | **18-26 days** |

## Browser Compatibility

### File System Access API
- ✅ **Chrome 86+** (Full support)
- ✅ **Edge 86+** (Full support)
- ❌ **Firefox** (Not supported - fallback to download/upload)
- ❌ **Safari** (Not supported - fallback to download/upload)

**Fallback**: Traditional file download/upload for unsupported browsers.

## Use Cases

### 1. **Bulk Geometry Modifications**
- "Move all entities on layer 'WALLS' 5 units up"
- "Scale all INSERT blocks by 1.5"
- "Rotate all lines by 45 degrees"

### 2. **Intelligent Filtering**
- "Remove all entities smaller than 1 unit"
- "Extract only circles with radius > 10"
- "List all blocks on layer 'FURNITURE'"

### 3. **Geometry Generation**
- "Create a grid of 10x10 lines spaced 5 units apart"
- "Generate a circular array of 12 blocks around point (0,0)"
- "Add construction lines at 45-degree angles"

### 4. **Data Extraction**
- "Count all entities by type"
- "Calculate total length of all lines"
- "List all unique block names"

## Security & Privacy

- ✅ All processing happens in browser (no server uploads)
- ✅ LocalStorage data stays on user's machine
- ✅ LLM endpoint configurable (local Ollama recommended)
- ✅ File System Access API requires explicit user permission
- ⚠️ User responsible for not sending sensitive data to external LLMs

## Future Enhancements (Post-MVP)

- 3D visualization of geometry (Three.js)
- Support for CIRCLE, POLYLINE, ARC, SPLINE entities
- Batch processing (multiple files)
- Cloud storage integration (Google Drive, Dropbox)
- Export to SVG, PDF formats
- Collaborative editing (WebRTC)
- LLM response streaming
- Custom entity templates
- Macro recording/playback

## Success Metrics

### MVP is complete when:
- ✅ Upload DXX/DXF → Parse to JSON
- ✅ Edit JSON in Monaco Editor
- ✅ Export to SCR and DXF
- ✅ Auto-save to localStorage
- ✅ Track last 5 versions with diff viewer
- ✅ Manage system prompts
- ✅ Send to LLM and apply changes
- ✅ File system sync (Chrome/Edge)
- ✅ All features tested

## Getting Started

1. **Review** full planning document: `autocad-llm-sync-planning.md`
2. **Set up** tool directory structure
3. **Implement** Phase 1 (Core Infrastructure)
4. **Test** basic file upload
5. **Iterate** through remaining phases

## Dependencies

```json
{
  "dependencies": {
    "@monaco-editor/vue": "^4.0.0",  // JSON editor with syntax highlighting
    "dxf-parser": "^1.7.1"            // DXF/DXX parser (520 stars, battle-tested)
  }
}
```

**Why dxf-parser?**
- ✅ Mature library (520 GitHub stars, since 2015)
- ✅ Browser-ready (works in Node.js and browser)
- ✅ Comprehensive entity support (LINE, LWPOLYLINE, CIRCLE, ARC, ELLIPSE, SPLINE, INSERT, TEXT, MTEXT, DIMENSION, etc.)
- ✅ Parses header, tables, blocks, layers, line types, viewports
- ✅ Well-structured output with readable properties
- ✅ Eliminates need for custom parser implementation

Most other functionality uses existing project dependencies (Vue, Pinia, VueUse, Naive UI).

---

# LLM Integration to access ollama

you can access the llm like this:
```bash
curl -X POST "http://192.168.60.155:11434/api/generate" \                                                       ✔ 
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:30b-a3b-instruct-2507-q4_K_M",
    "prompt": "<|im_start|>system\nYou are a helpful assistant. Give brief, direct answers only. Do not explain unless asked.<|im_end|>\n<|im_start|>user\nWhat is 2+2?<|im_end|>\n<|im_start|>assistant\n",
    "stream": false,
    "temperature": 0.1,
    "max_tokens": 50,
    "repetition_penalty": 1.05,
    "stop": ["<|im_end|>", "\n\n"]
  }' | jq '.response'
```

or this (using `/api/chat` endpoint):

```bash
curl -X POST "http://192.168.60.155:11434/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3:30b-a3b-instruct-2507-q4_K_M",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant. Give brief, direct answers only. Do not explain unless asked."},
      {"role": "user", "content": "What is 2+2?"}
    ],
    "stream": false,
    "options": {
      "temperature": 0.1,
      "num_predict": 50,
      "repeat_penalty": 1.05,
      "stop": ["<|im_end|>", "\n\n"]
    }
  }' | jq '.message.content'
```
