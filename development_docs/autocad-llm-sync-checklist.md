# AutoCAD LLM Sync - Implementation Checklist

## Phase 1: Core Infrastructure ✅ (2-3 days)

### Setup
- [ ] Create `src/tools/autocad-llm-sync/` directory
- [ ] Create `index.ts` (tool registration)
- [ ] Create `autocad-llm-sync.types.ts` (TypeScript interfaces)
- [ ] Create `autocad-llm-sync.vue` (main component)
- [ ] Create `autocad-llm-sync.store.ts` (Pinia store)
- [ ] Register tool in `src/tools/index.ts`
- [ ] Add translations to `locales/en.yml`

### Main Component
- [ ] Implement 4-tab layout using `n-tabs`
- [ ] Create tab placeholders (File Manager, JSON Editor, LLM Interface, System Prompts)
- [ ] Add basic styling and layout

### Pinia Store
- [ ] Define `currentDocument` state (localStorage)
- [ ] Define `versions` state (localStorage)
- [ ] Define `systemPrompts` state (localStorage)
- [ ] Define `activePromptId` state (localStorage)
- [ ] Define `llmSettings` state (localStorage)
- [ ] Implement `saveVersion()` action
- [ ] Implement `restoreVersion()` action
- [ ] Implement `updateDocument()` action

### Testing
- [ ] Tool appears in navigation
- [ ] All 4 tabs render correctly
- [ ] Store persists to localStorage
- [ ] No console errors

---

## Phase 2: DXX/DXF Parsing ✅ (3-4 days)

### Parser Service
- [ ] Create `services/dxx-parser.service.ts`
- [ ] Implement `parseDxxToJson()` function
- [ ] Implement `parseLine()` helper
- [ ] Implement `parseInsert()` helper
- [ ] Handle group codes: 0, 8, 10, 20, 30, 11, 21, 31, 2, 41, 42, 43, 50
- [ ] Handle UNKNOWN entity types
- [ ] Add error handling for malformed files

### File Upload Component
- [ ] Create `components/FileManager.vue`
- [ ] Integrate `c-file-upload` component
- [ ] Accept `.dxx`, `.dxf` file types
- [ ] Read file content as text
- [ ] Call parser service
- [ ] Display parse results (entity count, file info)

### JSON Editor Component
- [ ] Create `components/JsonEditor.vue`
- [ ] Install `@monaco-editor/vue` dependency
- [ ] Integrate Monaco Editor
- [ ] Set language to JSON
- [ ] Enable syntax highlighting
- [ ] Bind to `currentDocument` from store
- [ ] Implement auto-save (debounced 500ms)

### Testing
- [ ] Upload sample DXX file → see JSON
- [ ] JSON displays in Monaco Editor
- [ ] JSON persists to localStorage
- [ ] Parse LINE entities correctly
- [ ] Parse INSERT entities correctly
- [ ] Handle invalid files gracefully

---

## Phase 3: JSON to SCR/DXF Generation ✅ (2-3 days)

### SCR Generator Service
- [ ] Create `services/scr-generator.service.ts`
- [ ] Implement `jsonToScr()` function
- [ ] Generate `_LINE x1,y1 x2,y2` commands
- [ ] Generate `_-INSERT "BlockName" X,Y ScaleX ScaleY Rotation` commands
- [ ] Handle empty entities array
- [ ] Add comments for unsupported entity types

### DXF Generator Service
- [ ] Create `services/dxf-generator.service.ts`
- [ ] Implement `jsonToDxf()` function
- [ ] Generate HEADER section
- [ ] Generate TABLES section (layers)
- [ ] Generate ENTITIES section
- [ ] Generate LINE entities (group codes: 0, 8, 10, 20, 30, 11, 21, 31)
- [ ] Generate INSERT entities (group codes: 0, 8, 2, 10, 20, 30, 41, 42, 43, 50)
- [ ] Generate EOF marker

### Export Functionality
- [ ] Add "Export as SCR" button to FileManager
- [ ] Add "Export as DXF" button to FileManager
- [ ] Implement browser download (create blob, trigger download)
- [ ] Set correct file extensions
- [ ] Show success notification

### Testing
- [ ] JSON → Download .scr file
- [ ] JSON → Download .dxf file
- [ ] SCR file opens in AutoCAD
- [ ] DXF file opens in AutoCAD
- [ ] Round-trip: DXF → JSON → DXF preserves geometry

---

## Phase 4: File System Integration ✅ (2-3 days)

### File Sync Service
- [ ] Create `services/file-sync.service.ts`
- [ ] Implement `requestFileHandle()` (File System Access API)
- [ ] Implement `readFileFromHandle()`
- [ ] Implement `writeFileToHandle()`
- [ ] Implement `checkFileModified()`
- [ ] Handle API not supported (fallback)

### File Manager Enhancements
- [ ] Store file handle reference in localStorage
- [ ] Add "Sync from Disk" button
- [ ] Add "Save to Disk" button
- [ ] Implement file change detection
- [ ] Show sync status indicator (synced/modified/conflict)
- [ ] Display file info (name, size, last modified)
- [ ] Show notification when file changed externally

### Browser Compatibility
- [ ] Detect File System Access API support
- [ ] Show warning banner for unsupported browsers
- [ ] Implement fallback (traditional download/upload)

### Testing
- [ ] Upload file → file handle stored
- [ ] "Sync from Disk" imports external changes
- [ ] "Save to Disk" writes JSON back to file
- [ ] File change detection works
- [ ] Fallback works in Firefox/Safari

---

## Phase 5: Version History ✅ (2 days)

### Version Manager Utility
- [ ] Create `utils/version-manager.ts`
- [ ] Implement `addVersion()` function
- [ ] Implement FIFO logic (max 5 versions)
- [ ] Generate unique version IDs
- [ ] Store timestamps

### Version History Component
- [ ] Create `components/VersionHistory.vue`
- [ ] Display version timeline (newest first)
- [ ] Show version cards (timestamp, description, entity count)
- [ ] Add "View" button per version
- [ ] Add "Restore" button per version
- [ ] Add "Compare with Current" button per version
- [ ] Add "Delete" button per version

### Diff Viewer
- [ ] Implement JSON diff comparison
- [ ] Show side-by-side or unified diff
- [ ] Highlight additions/deletions
- [ ] Use Naive UI modal for diff view

### Integration
- [ ] Auto-save version on document change
- [ ] Prompt for version description (optional)
- [ ] Restore version updates currentDocument
- [ ] Restoring creates new version

### Testing
- [ ] Make 5 edits → 5 versions stored
- [ ] 6th edit removes oldest version
- [ ] Restore version works
- [ ] Diff viewer shows changes correctly
- [ ] Delete version works

---

## Phase 6: System Prompt Management ✅ (1-2 days)

### System Prompt Editor Component
- [ ] Create `components/SystemPromptEditor.vue`
- [ ] Display prompt library sidebar
- [ ] Show active prompt indicator
- [ ] Implement prompt editor (textarea)
- [ ] Add metadata fields (name, description)
- [ ] Add "Save Prompt" button
- [ ] Add "New Prompt" button
- [ ] Add "Duplicate" button
- [ ] Add "Delete" button
- [ ] Add "Set as Active" button
- [ ] Add "Export All" button (JSON)
- [ ] Add "Import" button (JSON)

### Default Prompt
- [ ] Create default system prompt template
- [ ] Include CAD-specific instructions
- [ ] Include JSON schema reference
- [ ] Include output format rules

### Store Actions
- [ ] Implement `addSystemPrompt()`
- [ ] Implement `updateSystemPrompt()`
- [ ] Implement `deleteSystemPrompt()`
- [ ] Implement `setActivePrompt()`
- [ ] Implement `exportPrompts()`
- [ ] Implement `importPrompts()`

### Testing
- [ ] Create new prompt
- [ ] Edit existing prompt
- [ ] Switch active prompt
- [ ] Delete prompt
- [ ] Export/import prompts
- [ ] Default prompt loads on first use

---

## Phase 7: LLM Integration ✅ (3-4 days)

### LLM Interface Component
- [ ] Create `components/LlmInterface.vue`
- [ ] Add LLM settings panel (collapsible)
- [ ] Add endpoint URL input
- [ ] Add model name input
- [ ] Add temperature slider
- [ ] Add max tokens input
- [ ] Add "Test Connection" button
- [ ] Add user instruction textarea
- [ ] Add current JSON preview (read-only, collapsible)
- [ ] Add "Send to LLM" button
- [ ] Add response display area
- [ ] Add diff viewer (original vs. LLM response)
- [ ] Add "Apply Changes" button
- [ ] Add "Discard" button
- [ ] Add "Edit Response" button

### LLM Service
- [ ] Create `services/llm.service.ts`
- [ ] Implement `sendToLlm()` function
- [ ] Support Ollama API format
- [ ] Support OpenAI-compatible APIs
- [ ] Construct prompt (system + user + JSON)
- [ ] Parse LLM response (extract JSON)
- [ ] Validate response against schema
- [ ] Handle errors (network, parsing, validation)

### Prompt Construction
- [ ] Combine active system prompt
- [ ] Add user instruction
- [ ] Add current CAD JSON
- [ ] Format as structured prompt

### Response Handling
- [ ] Extract JSON from LLM response
- [ ] Validate against CadDocument schema
- [ ] Show diff preview
- [ ] Apply changes to currentDocument
- [ ] Create new version on apply

### Testing
- [ ] Send simple instruction → receive response
- [ ] LLM modifies JSON correctly
- [ ] Apply changes updates document
- [ ] Invalid response shows error
- [ ] Network error handled gracefully
- [ ] Test with local Ollama
- [ ] Test with OpenAI API (if available)

---

## Phase 8: Polish & Testing ✅ (3-5 days)

### UI/UX Polish
- [ ] Add loading spinners (file upload, LLM request)
- [ ] Add progress indicators
- [ ] Implement error boundaries
- [ ] Add success/error toast notifications
- [ ] Add confirmation dialogs (delete, restore)
- [ ] Improve responsive design (mobile)
- [ ] Add keyboard shortcuts (Ctrl+S, Ctrl+E, etc.)
- [ ] Add tooltips and help text
- [ ] Improve accessibility (ARIA labels)

### Validation
- [ ] Validate JSON schema on edit (real-time)
- [ ] Show validation errors in editor
- [ ] Prevent export of invalid JSON
- [ ] Validate LLM settings before send

### Error Handling
- [ ] Handle file read errors
- [ ] Handle parse errors (malformed DXX/DXF)
- [ ] Handle localStorage quota exceeded
- [ ] Handle File System API errors
- [ ] Handle LLM API errors
- [ ] Show user-friendly error messages

### Performance
- [ ] Optimize large file parsing
- [ ] Debounce auto-save
- [ ] Lazy load Monaco Editor
- [ ] Implement virtual scrolling (if needed)
- [ ] Monitor localStorage usage

### Documentation
- [ ] Add help/documentation tab
- [ ] Include usage examples
- [ ] Add FAQ section
- [ ] Document keyboard shortcuts
- [ ] Add troubleshooting guide

### Testing
- [ ] Write unit tests for parsers
- [ ] Write unit tests for generators
- [ ] Write unit tests for version manager
- [ ] Write integration tests (file upload → export)
- [ ] Write E2E tests (complete workflow)
- [ ] Test with large files (1000+ entities)
- [ ] Test with edge cases (empty file, invalid JSON)
- [ ] Test in Chrome, Edge, Firefox, Safari
- [ ] Test on mobile devices

---

## Final Checklist ✅

### MVP Complete When:
- [ ] ✅ Upload DXX/DXF → Parse to JSON
- [ ] ✅ Edit JSON in Monaco Editor
- [ ] ✅ Export to SCR and DXF
- [ ] ✅ Auto-save to localStorage
- [ ] ✅ Track last 5 versions with diff viewer
- [ ] ✅ Manage system prompts
- [ ] ✅ Send to LLM and apply changes
- [ ] ✅ File system sync (Chrome/Edge)
- [ ] ✅ All features tested
- [ ] ✅ No critical bugs
- [ ] ✅ Documentation complete

### Post-MVP Enhancements
- [ ] Support CIRCLE, POLYLINE, ARC entities
- [ ] 3D visualization (Three.js)
- [ ] Batch processing
- [ ] Cloud storage integration
- [ ] Export to SVG, PDF
- [ ] Collaborative editing
- [ ] LLM response streaming
- [ ] Custom entity templates
- [ ] Macro recording

---

**Progress Tracking**: Mark items as complete with ✅ as you implement them!

