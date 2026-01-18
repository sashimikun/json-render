# @json-render/adapter-a2ui

Adapter to use Google A2UI (Agent-to-UI) message format with `json-render`.

## Installation

```bash
npm install @json-render/adapter-a2ui
```

## Usage

This adapter provides a function `a2uiToPatches` that converts A2UI messages (`createSurface`, `updateComponents`) into `json-render` patches.

You can use it to process A2UI streams and render them using `json-render`.

```typescript
import { a2uiToPatches } from "@json-render/adapter-a2ui";
import { useUIStream } from "@json-render/react";

// Example of processing A2UI messages
function processA2UIStream(stream) {
  for await (const message of stream) {
    // message is an object like { createSurface: ... } or { updateComponents: ... }

    // Convert to patches
    const patches = a2uiToPatches(message);

    // Apply patches to your json-render tree
    // Note: useUIStream expects a stream of patches.
    // You might need to adapt your streaming logic to feed these patches to the renderer.
  }
}
```

### Supported Messages

- `createSurface`: Sets the root component.
- `updateComponents`: Adds or replaces components in the tree.
- `explicitList`: Automatically converts `{ explicitList: [...] }` to plain arrays `[...]`.
- Children: Automatically extracts `props.children` (if it is a list of IDs) to the element's `children` property.

## License

Apache-2.0
