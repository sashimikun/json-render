<template>
  <div>
    <p>{{ element.props.text }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ComponentRenderProps } from '@json-render/vue';

defineProps<ComponentRenderProps<{ text: string }>>();
</script>
