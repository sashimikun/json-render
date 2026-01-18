<template>
  <div class="card">
    <h3>{{ element.props.title }}</h3>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentRenderProps } from '@json-render/vue';

defineProps<ComponentRenderProps<{ title: string }>>();
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}
.content {
  margin-top: 8px;
}
</style>
