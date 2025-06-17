# WIP Drag and Drop Proto3 Generator

**Project Name:** ProtoCanvas

**Overview:**
ProtoCanvas is a web-based application that provides an intuitive drag-and-drop interface for designing Protocol Buffers version 3 (proto3) schemas. It targets users ranging from backend developers to product architects who prefer a visual schema-building experience. The app will allow the creation, import, visualization, and export of proto3 files, complete with structured comments and syntax validation. Additionally, the app will visualize inter-service communication and data flow using Mermaid-style sequence diagrams.

---

**Core Features:**

### 1. **Drag-and-Drop Interface for proto3 Generation**

* Visual editor to drag and drop:

  * Messages
  * Enums
  * Fields (with support for all scalar types, repeated fields, maps, etc.)
  * Services
  * RPC Methods (with input/output types, streaming options)
* Auto-linking of references between messages and RPCs
* Context menus for field options like `optional`, `deprecated`, and custom options
* Real-time syntax validation
* Comment box per element to annotate

### 2. **Code Generation**

* Upon clicking "Generate Proto":

  * Full `.proto` file is created with syntax highlighting and formatted with structured comments
  * Option to download or copy to clipboard
  * Live preview of the proto3 file in a read-only editor panel

### 3. **Visual Sequence Diagram Generation**

* From the designed services and RPC methods, automatically generate:

  * MermaidJS-compatible sequence diagrams
  * Lifelines for clients and services
  * Arrows showing RPC invocations, inputs, outputs
  * Annotated flow (e.g., for streaming RPCs, repeated requests)
* Export options: copy Mermaid code, download diagram as image, or embed HTML snippet

### 4. **Proto3 Upload and Reverse Visualization**

* Upload `.proto` files to:

  * Parse and render existing schemas in the drag-and-drop interface
  * Auto-generate sequence diagrams based on service definitions
  * Provide editing capabilities post-import

### 5. **Advanced Features**

* Multi-tab/multi-file editing
* Export/import project as JSON to preserve UI state
* Auto-save with localStorage

---

**Technology Stack:**

### Frontend:

* Framework: Vue.js
* State Management: Pinia or VueX
* Drag-and-Drop: Vue Draggable or custom drag logic with Vue
* Syntax Highlighting: Monaco Editor (used in VS Code)
* Diagramming: Mermaid.js
* Code Formatting: Prettier for proto syntax

### Backend:

* Not required — static SPA deployed via Vercel, Netlify, GitHub Pages, etc.
* All storage and parsing handled in-browser using localStorage and JavaScript libraries (e.g., `protobufjs`)

---

**User Journey:**

1. **New Project:**

   * User lands on dashboard
   * Clicks "New Proto Schema"
   * Starts dragging components to canvas

2. **Schema Design:**

   * User builds out services and messages
   * Comments are added inline
   * Validation alerts appear in real-time

3. **Generate & Export:**

   * User clicks "Generate Proto"
   * Full code preview and download button shown
   * Sequence diagram preview appears below

4. **Import Existing:**

   * User uploads a `.proto` file
   * Visual representation rendered instantly
   * Can edit or just visualize

---

**Stretch Goals:**

* Dark mode
* AI-assisted code suggestions
* gRPC mock server generation from schema
* Interactive walkthroughs / tutorials for proto3 newcomers

---

**Summary:**
ProtoCanvas aims to bridge the gap between schema design and developer experience by making Protocol Buffers easier to visualize, write, and share. It turns a technical task into an intuitive workflow, with live visual feedback and diagrammatic outputs that help teams understand complex interactions quickly — all in a static, serverless frontend application.



