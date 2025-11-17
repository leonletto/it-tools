# AutoCAD LLM Sync - Architecture Diagrams

## System Architecture

```mermaid
graph TB
    subgraph "Browser Environment"
        subgraph "Vue Components"
            Main[autocad-llm-sync.vue<br/>Main Component]
            FM[FileManager.vue]
            JE[JsonEditor.vue]
            LI[LlmInterface.vue]
            SP[SystemPromptEditor.vue]
            VH[VersionHistory.vue]
        end

        subgraph "Pinia Store"
            Store[autocad-llm-sync.store.ts<br/>State Management]
        end

        subgraph "Services"
            DXXParser[dxx-parser.service.ts<br/>DXX/DXF → JSON]
            SCRGen[scr-generator.service.ts<br/>JSON → SCR]
            DXFGen[dxf-generator.service.ts<br/>JSON → DXF]
            FileSync[file-sync.service.ts<br/>File System API]
        end

        subgraph "Storage"
            LS[localStorage<br/>Persistent Data]
        end

        Main --> FM
        Main --> JE
        Main --> LI
        Main --> SP
        Main --> VH

        FM --> Store
        JE --> Store
        LI --> Store
        SP --> Store
        VH --> Store

        FM --> DXXParser
        FM --> SCRGen
        FM --> DXFGen
        FM --> FileSync

        Store --> LS
    end

    subgraph "External"
        Disk[Local File System<br/>DXX/DXF/SCR Files]
        LLM[LLM Endpoint<br/>Ollama/OpenAI]
    end

    FileSync <--> Disk
    LI --> LLM
```

## Data Flow - File Upload to Export

```mermaid
sequenceDiagram
    participant User
    participant FileManager
    participant DXXParser
    participant Store
    participant JsonEditor
    participant SCRGen
    participant Browser

    User->>FileManager: Upload DXX/DXF file
    FileManager->>DXXParser: Parse file content
    DXXParser->>DXXParser: Extract entities
    DXXParser-->>FileManager: Return CadDocument
    FileManager->>Store: Save currentDocument
    Store->>localStorage: Persist data
    Store->>JsonEditor: Update display
    JsonEditor-->>User: Show JSON

    User->>JsonEditor: Edit JSON
    JsonEditor->>Store: Update currentDocument
    Store->>localStorage: Auto-save

    User->>FileManager: Click "Export as SCR"
    FileManager->>Store: Get currentDocument
    FileManager->>SCRGen: Convert to SCR
    SCRGen-->>FileManager: Return SCR string
    FileManager->>Browser: Trigger download
    Browser-->>User: Download .scr file
```

## Data Flow - LLM Interaction

```mermaid
sequenceDiagram
    participant User
    participant LlmInterface
    participant Store
    participant LLM
    participant JsonEditor

    User->>LlmInterface: Enter instruction<br/>"Move all lines 10 units right"
    LlmInterface->>Store: Get currentDocument
    LlmInterface->>Store: Get activePrompt
    LlmInterface->>LlmInterface: Construct prompt<br/>(system + user + JSON)
    LlmInterface->>LLM: POST request
    LLM-->>LlmInterface: Return modified JSON
    LlmInterface->>LlmInterface: Validate response
    LlmInterface-->>User: Show diff preview
    User->>LlmInterface: Click "Apply Changes"
    LlmInterface->>Store: Update currentDocument
    LlmInterface->>Store: Save version
    Store->>localStorage: Persist
    Store->>JsonEditor: Update display
    JsonEditor-->>User: Show updated JSON
```

## Component Hierarchy

```mermaid
graph TD
    App[App.vue]
    Router[Vue Router]
    Main[autocad-llm-sync.vue]
    Tabs[n-tabs]

    Tab1[Tab: File Manager]
    Tab2[Tab: JSON Editor]
    Tab3[Tab: LLM Interface]
    Tab4[Tab: System Prompts]

    FM[FileManager.vue]
    FU[c-file-upload]
    FB[File Buttons]

    JE[JsonEditor.vue]
    Monaco[Monaco Editor]

    LI[LlmInterface.vue]
    Settings[LLM Settings Panel]
    Input[Instruction Input]
    Diff[Diff Viewer]

    SP[SystemPromptEditor.vue]
    List[Prompt List]
    Editor[Prompt Editor]

    VH[VersionHistory.vue]
    Timeline[Version Timeline]
    Compare[Comparison View]

    App --> Router
    Router --> Main
    Main --> Tabs

    Tabs --> Tab1
    Tabs --> Tab2
    Tabs --> Tab3
    Tabs --> Tab4

    Tab1 --> FM
    FM --> FU
    FM --> FB
    FM --> VH

    Tab2 --> JE
    JE --> Monaco

    Tab3 --> LI
    LI --> Settings
    LI --> Input
    LI --> Diff

    Tab4 --> SP
    SP --> List
    SP --> Editor
```

## LocalStorage Schema

```mermaid
erDiagram
    CURRENT_DOCUMENT {
        array entities
        object metadata
    }

    FILE_HANDLE_REF {
        string name
        string path
        number lastModified
    }

    VERSION {
        string id
        number timestamp
        object document
        string description
        object fileHandle
    }

    SYSTEM_PROMPT {
        string id
        string name
        string content
        number createdAt
        number lastModified
    }

    LLM_SETTINGS {
        string endpoint
        string model
        number temperature
        number maxTokens
    }

    CURRENT_DOCUMENT ||--o{ VERSION : "has versions"
    FILE_HANDLE_REF ||--o{ VERSION : "referenced by"
    SYSTEM_PROMPT ||--|| LLM_SETTINGS : "used with"
```

## File System Sync Flow

```mermaid
stateDiagram-v2
    [*] --> NoFile: Initial State

    NoFile --> FileSelected: User uploads file
    FileSelected --> Parsing: Parse DXX/DXF
    Parsing --> Synced: Parse successful
    Parsing --> Error: Parse failed

    Synced --> Modified: User edits JSON
    Modified --> Synced: Save to disk
    Modified --> Checking: Check disk changes

    Checking --> Conflict: File modified externally
    Checking --> Synced: No changes

    Conflict --> Synced: User imports changes
    Conflict --> Modified: User keeps local

    Error --> NoFile: Reset
    Synced --> NoFile: Close file
```

## Version History Management

```mermaid
graph LR
    subgraph "Version History (Max 5)"
        V1[Version 1<br/>Oldest]
        V2[Version 2]
        V3[Version 3]
        V4[Version 4]
        V5[Version 5<br/>Current]
    end

    NewSave[New Save]
    NewSave -->|Push| V5
    V5 -->|Becomes| V4
    V4 -->|Becomes| V3
    V3 -->|Becomes| V2
    V2 -->|Becomes| V1
    V1 -->|Deleted| Trash[Removed]

    V1 -.->|Restore| Current[Current Document]
    V2 -.->|Restore| Current
    V3 -.->|Restore| Current
    V4 -.->|Restore| Current
    V5 -.->|Restore| Current
```

## LLM Prompt Construction

```mermaid
graph TD
    SP[System Prompt<br/>From activePrompt]
    UI[User Instruction<br/>From input field]
    JSON[Current CAD JSON<br/>From currentDocument]

    Construct[Construct Full Prompt]

    SP --> Construct
    UI --> Construct
    JSON --> Construct

    Construct --> Format[Format as:<br/>SYSTEM: ...<br/>USER: ...<br/>JSON: ...]

    Format --> Send[Send to LLM]
    Send --> Response[LLM Response]
    Response --> Extract[Extract JSON]
    Extract --> Validate[Validate Schema]

    Validate -->|Valid| Apply[Apply Changes]
    Validate -->|Invalid| Error[Show Error]

    Apply --> NewVersion[Create Version]
    NewVersion --> Update[Update currentDocument]
```

## Entity Type Support (Extensible)

```mermaid
graph TD
    Entity[CadEntity Base]

    Entity --> LINE
    Entity --> INSERT
    Entity --> CIRCLE
    Entity --> POLYLINE
    Entity --> UNKNOWN

    LINE --> LineProps[start: x,y,z<br/>end: x,y,z<br/>layer: string]
    INSERT --> InsertProps[block: string<br/>insertion_point: x,y,z<br/>scale: sx,sy,sz<br/>rotation: degrees<br/>layer: string]
    CIRCLE --> CircleProps[center: x,y,z<br/>radius: number<br/>layer: string]
    POLYLINE --> PolyProps[points: Array<br/>closed: boolean<br/>layer: string]
    UNKNOWN --> UnknownProps[layer: string<br/>raw_data: any]

    style LINE fill:#90EE90
    style INSERT fill:#90EE90
    style CIRCLE fill:#FFD700
    style POLYLINE fill:#FFD700
    style UNKNOWN fill:#FFA07A
```

## Browser Compatibility Strategy

```mermaid
graph TD
    Start[User Opens Tool]
    Check{File System<br/>Access API<br/>Supported?}

    Start --> Check

    Check -->|Yes| FullFeatures[Full Features<br/>Chrome/Edge 86+]
    Check -->|No| Fallback[Fallback Mode<br/>Firefox/Safari]

    FullFeatures --> FSA[File System Access API<br/>- Remember file location<br/>- Detect changes<br/>- Bidirectional sync]

    Fallback --> Traditional[Traditional File API<br/>- Upload via input<br/>- Download via blob<br/>- No sync]

    FSA --> Works[All Features Work]
    Traditional --> Limited[Limited Features<br/>Show warning banner]
```

---

**Legend:**
- 🟢 Green: Implemented in MVP
- 🟡 Yellow: Post-MVP enhancement
- 🔴 Red: Fallback/error state

