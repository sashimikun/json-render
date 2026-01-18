# @json-render/vue

Vue renderer for the `@json-render/core` library. Transform JSON into fully functional Vue components.

## Installation

```bash
npm install @json-render/vue @json-render/core
# or
pnpm add @json-render/vue @json-render/core
# or
yarn add @json-render/vue @json-render/core
```

## Usage

### Basic Usage

```vue
<template>
  <JSONUIProvider :registry="registry">
    <Renderer :tree="tree" :registry="registry" />
  </JSONUIProvider>
</template>

<script setup lang="ts">
import { Renderer, JSONUIProvider } from '@json-render/vue';
import type { UITree } from '@json-render/core';
import { registry } from './components';

const tree: UITree = {
  root: 'root',
  elements: {
    root: {
      key: 'root',
      type: 'card',
      props: { title: 'Hello World' },
      children: [],
      visible: true,
    }
  }
};
</script>
```

### Creating Components

Components used in the registry must accept `ComponentRenderProps`.

```vue
<template>
  <div class="card">
    <h3>{{ element.props.title }}</h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { ComponentRenderProps } from '@json-render/vue';

defineProps<ComponentRenderProps<{ title: string }>>();
</script>
```

### Streaming UI

Use `useUIStream` to stream UI from an AI endpoint.

```vue
<script setup lang="ts">
import { useUIStream } from '@json-render/vue';

const { tree, send, isStreaming } = useUIStream({
  api: '/api/generate-ui',
});

const handleSubmit = (prompt: string) => {
  send(prompt);
};
</script>
```

## License

Apache-2.0
