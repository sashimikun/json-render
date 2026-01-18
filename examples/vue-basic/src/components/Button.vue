<template>
  <button @click="handleClick" class="btn">
    {{ element.props.label }}
  </button>
</template>

<script setup lang="ts">
import type { ComponentRenderProps } from '@json-render/vue';

const props = defineProps<ComponentRenderProps<{ label: string; action?: string }>>();

const handleClick = () => {
  if (props.element.props.action && props.onAction) {
    props.onAction({ name: props.element.props.action });
  }
};
</script>

<style scoped>
.btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover {
  background-color: #0056b3;
}
</style>
