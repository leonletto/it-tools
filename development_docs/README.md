# AutoCAD LLM Sync - Development Documentation

---

## ⚠️ CRITICAL: Package Manager

**THIS REPOSITORY USES `pnpm`, NOT `npm`!**

All dependency installation commands MUST use `pnpm`:

```bash
# ✅ CORRECT
pnpm install dxf-parser
pnpm install @monaco-editor/vue
pnpm install

# ❌ WRONG - DO NOT USE
npm install dxf-parser
npm install @monaco-editor/vue
npm install
```

**Why pnpm?**
- This is an it-tools repository standard
- Using npm will cause dependency conflicts
- Always check package manager before running install commands

---

## Documentation Files

### Planning & Architecture
- **[autocad-llm-sync-planning.md](./autocad-llm-sync-planning.md)** - Complete technical specification (955+ lines)
  - 8 implementation phases with detailed tasks
  - Component specifications
  - Service implementations
  - Pinia store structure
  - UI/UX considerations
  - Testing strategy
  - 15-22 day timeline estimate

- **[autocad-llm-sync-architecture.md](./autocad-llm-sync-architecture.md)** - 10 Mermaid diagrams
  - System architecture
  - Data flow diagrams
  - Component relationships
  - State management flow

### Implementation Guides
- **[autocad-llm-sync-quickstart.md](./autocad-llm-sync-quickstart.md)** - Step-by-step setup guide
  - Tool structure creation
  - Code templates for initial files
  - Registration in it-tools

- **[autocad-llm-sync-checklist.md](./autocad-llm-sync-checklist.md)** - Phase-by-phase implementation checklist
  - 8 phases with checkboxes
  - Task breakdown
  - Progress tracking

### Integration & Summary
- **[autocad-llm-sync-dxf-parser-integration.md](./autocad-llm-sync-dxf-parser-integration.md)** - dxf-parser library integration
  - Benefits analysis (saves 3-4 days)
  - Example output structure
  - Entity type coverage (15+ types)
  - Integration patterns

- **[autocad-llm-sync-summary.md](./autocad-llm-sync-summary.md)** - Executive overview
  - Core workflow diagram
  - Key features summary
  - Technology stack
  - JSON schema
  - LocalStorage schema
  - **Ollama API examples** (corrected `/api/chat` endpoint)

### Original Specification
- **[autocad_llm.md](./autocad_llm.md)** - Original Python-based CAD converter workflow
  - LLM-facing workflow definition
  - Simple .scr example
  - Simple ASCII DXF example

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm install dxf-parser
```

### 2. Tool Structure

The tool is located at:
```
src/tools/autocad-llm-sync/
├── index.ts                      # Tool registration
├── autocad-llm-sync.vue          # Main Vue component
├── autocad-llm-sync.types.ts     # TypeScript type definitions
├── dxf-parser.service.ts         # DXF → JSON parser
├── json-to-scr.service.ts        # JSON → SCR converter
└── json-to-dxf.service.ts        # JSON → DXF converter
```

### 3. Implementation Status

**Phase 1: Core Infrastructure** ✅ COMPLETE
- [x] Tool directory structure created
- [x] Type definitions (autocad-llm-sync.types.ts)
- [x] DXF parser service (with dxf-parser fallback)
- [x] JSON to SCR converter
- [x] JSON to DXF converter
- [x] Main Vue component (basic structure)
- [x] Tool registration in src/tools/index.ts
- [x] Translations added to locales/en.yml

**Next Steps:**
- Phase 2: Enhanced UI with Monaco Editor
- Phase 3: File System Integration
- Phase 4: LocalStorage & Version History
- Phase 5: System Prompt Management
- Phase 6: LLM Integration
- Phase 7: Testing & Polish

---

## Technology Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **State Management**: Pinia + VueUse `useStorage`
- **UI Components**: Naive UI (n-card, n-tabs, n-button, etc.)
- **Code Editor**: Monaco Editor (via `monaco-editor` - already installed)
- **DXF Parsing**: **dxf-parser** npm package (520 stars, battle-tested)
- **File System**: File System Access API (Chrome/Edge 86+)

---

## Key Features

1. **DXF/DXX → JSON Parsing** - Convert CAD files to JSON for LLM processing
2. **JSON → SCR/DXF Generation** - Convert LLM-modified JSON back to CAD formats
3. **LocalStorage Auto-save** - Automatic persistence with file pointers
4. **Version History** - Last 5 versions stored in localStorage
5. **File Change Detection** - Detect external file modifications
6. **System Prompt Management** - Editable prompts with versioning
7. **LLM Integration** - Local Ollama support with configurable endpoints

---

## Resources

- **dxf-parser GitHub**: https://github.com/gdsestimating/dxf-parser
- **Ollama API Docs**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **File System Access API**: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

---

## Notes

- Monaco Editor is already installed in this repository (`monaco-editor: ^0.43.0`)
- The tool uses browser-native File System Access API (no server required)
- All processing happens client-side for privacy and speed
- dxf-parser supports 15+ entity types out of the box

