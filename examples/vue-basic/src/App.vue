<template>
  <div>
    <h1>Vue Basic Example</h1>
    <div style="margin-bottom: 20px;">
      <button @click="loadTree">Load UI</button>
      <button @click="clear" style="margin-left: 10px;">Clear</button>
    </div>

    <div v-if="tree">
        <JSONUIProvider :registry="registry" :actionHandlers="actionHandlers">
            <Renderer :tree="tree" :registry="registry" />
        </JSONUIProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Renderer, JSONUIProvider } from '@json-render/vue';
import type { UITree } from '@json-render/core';
import { registry } from './components';

const tree = ref<UITree | null>(null);

const loadTree = () => {
  tree.value = {
    root: 'root',
    elements: {
      root: {
        key: 'root',
        type: 'card',
        props: { title: 'Hello World' },
        children: ['text1', 'btn1'],
        visible: true,
      },
      text1: {
        key: 'text1',
        type: 'text',
        props: { text: 'This is a dynamically rendered UI.' },
        visible: true,
      },
      btn1: {
        key: 'btn1',
        type: 'button',
        props: { label: 'Click Me', action: 'sayHello' },
        visible: true,
      },
    },
  };
};

const clear = () => {
  tree.value = null;
};

const actionHandlers = {
  sayHello: () => {
    alert('Hello from Vue!');
  },
};
</script>

<style>
body {
  font-family: sans-serif;
  padding: 20px;
}
</style>
