# System Architecture Diagram ✅ **PRODUCTION READY**

## High-Level System Overview ✅ **IMPLEMENTED**

```mermaid
graph TB
    subgraph "Electron Application"
        subgraph "Main Process"
            ElectronMain[Electron Main Process]
            BlueskyClient[@atproto/api Client]
            AuthService[Authentication Service]
            IPCHandlers[IPC Request Handlers]
        end
        subgraph "Preload Script"
            PreloadBridge[Preload Script]
            ContextAPI[Context Bridge API]
        end
        subgraph "Renderer Process (Sandboxed)"
            UI[User Interface: TypeScript + CSS]
            SearchUI[Search Interface]
            ProfileModal[Profile Modal System]
            LocalStorage[Username Persistence]
        end
    end
    subgraph "External Services"
        BlueskyAPI[Bluesky AT Protocol API]
    end

    ElectronMain --> BlueskyClient
    BlueskyClient --> BlueskyAPI
    AuthService --> BlueskyAPI
    IPCHandlers --> PreloadBridge
    PreloadBridge --> ContextAPI
    ContextAPI --> UI
    UI --> SearchUI
    UI --> ProfileModal
    UI --> LocalStorage

    UI -.->|IPC Invoke| IPCHandlers
    IPCHandlers -.->|Response| UI
```

## Component Responsibilities ✅ **ALL IMPLEMENTED**

### Main Process Layer ✅

- **✅ Electron Main Process**: Window management, lifecycle, security configuration
- **✅ Bluesky API Client**: Direct integration with @atproto/api v0.15.27 for all data operations
- **✅ Authentication Service**: Secure login handling, session management, credential validation
- **✅ IPC Request Handlers**: Secure communication bridge for login, search, and profile requests

### Security & Communication ✅

- **✅ Preload Script**: Safe API exposure via contextBridge with no Node.js access in renderer
- **✅ Context Bridge API**: Secure interface for login, search, getUserProfile, and status checking
- **✅ Process Isolation**: Complete separation between main process (API calls) and renderer (UI only)
- **✅ Content Security Policy**: Configured to allow HTTPS images while blocking inline scripts

### User Interface Layer ✅

- **✅ Modern UI System**: Responsive TypeScript + CSS interface with professional styling
- **✅ Search Interface**: Three filter modes (Combined, Profiles Only, Content Only) with intelligent result display
- **✅ Profile Modal System**: Interactive user profile viewer with recent posts and detailed information
- **✅ Username Persistence**: localStorage integration for remembering login credentials across sessions

## Technology Integration Points

### Boost Libraries Integration

```mermaid
graph LR
    App[Application Code] --> Boost[Boost Libraries]
    Boost --> FileSystem[boost::filesystem]
    Boost --> System[boost::system]
    Boost --> Thread[boost::thread]
    Boost --> Network[boost::asio]

    FileSystem --> FileOps[File Operations]
    System --> ErrorHandling[Error Handling]
    Thread --> Concurrency[Threading]
    Network --> IO[Network I/O]
```

### Build System Architecture

```mermaid
graph TD
    CMakeLists[CMakeLists.txt] --> Presets[CMakePresets.json]
    CMakeLists --> FetchContent[FetchContent Dependencies]
    CMakeLists --> FindPackage[Find Package Modules]

    Presets --> Configs[Build Configurations]
    FetchContent --> Dependencies[Dependency Management]
    FindPackage --> SystemLibs[System Libraries]

    Configs --> MSVC[MSVC Build]
    Configs --> Clang[Clang Build]
    Configs --> GCC[GCC Build]

    Dependencies --> BoostLibs[Boost Libraries]
    Dependencies --> GitRepos[Git Repository Dependencies]
    Dependencies --> SourceBuilds[Source-built Libraries]
    SystemLibs --> PreInstalled[Pre-installed Libraries]

    MSVC --> Executable[Windows Executable]
    Clang --> CrossPlatform[Cross-platform Binary]
    GCC --> LinuxBinary[Linux Binary]
```

## Dependency Management Strategy

### FetchContent-Based Dependencies

```mermaid
graph TB
    CMake[CMakeLists.txt] --> FetchContent[FetchContent_Declare]
    FetchContent --> GitRepo[Git Repository]
    FetchContent --> Archive[Source Archive]

    GitRepo --> Clone[Clone & Configure]
    Archive --> Download[Download & Extract]

    Clone --> Build[Build from Source]
    Download --> Build

    Build --> Target[CMake Target]
    Target --> Link[Link to Application]

    CMake --> FindPackage[find_package]
    FindPackage --> SystemLib[System Libraries]
    SystemLib --> Link
```

### Dependency Resolution Order

1. **System-installed packages** via `find_package()`
2. **FetchContent for header-only libraries** (immediate availability)
3. **FetchContent for compiled libraries** (built as part of main build)
4. **Manual build fallback** for complex dependencies

## Data Flow Patterns

### Request Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Validator
    participant Service
    participant Processor
    participant Storage

    User->>App: Input Request
    App->>Validator: Validate Input
    Validator-->>App: Validation Result

    alt Valid Input
        App->>Service: Process Request
        Service->>Processor: Transform Data
        Processor->>Storage: Store/Retrieve
        Storage-->>Processor: Data Response
        Processor-->>Service: Processed Data
        Service-->>App: Result
        App-->>User: Success Response
    else Invalid Input
        App-->>User: Error Response
    end
```

## Error Handling Strategy

```mermaid
graph TD
    Exception[Exception Thrown] --> Handler[Exception Handler]
    Handler --> Logger[Log Error]
    Handler --> Recovery[Recovery Strategy]

    Recovery --> Retry[Retry Operation]
    Recovery --> Fallback[Use Fallback]
    Recovery --> Abort[Graceful Abort]

    Logger --> FileLog[File Logging]
    Logger --> Console[Console Output]
    Logger --> Remote[Remote Logging]
```

## Threading Model

```mermaid
graph TB
    MainThread[Main Thread] --> UIThread[UI Thread]
    MainThread --> WorkerPool[Worker Thread Pool]
    MainThread --> IOThread[I/O Thread]

    WorkerPool --> Task1[Processing Task 1]
    WorkerPool --> Task2[Processing Task 2]
    WorkerPool --> TaskN[Processing Task N]

    IOThread --> FileIO[File Operations]
    IOThread --> NetworkIO[Network Operations]

    Task1 --> SharedData[Shared Data Structure]
    Task2 --> SharedData
    TaskN --> SharedData

    SharedData --> Mutex[Thread Synchronization]
```
