<template>
  <div class="proto-canvas-app">
    <Palette />
    <div class="proto-canvas-main">
      <Canvas />
      <LivePreview />
      <ImportExport />
    </div>
  </div>
</template>

<script setup lang="ts">
import Palette from './Palette.vue';
import Canvas from './Canvas.vue';
import LivePreview from './LivePreview.vue';
import ImportExport from './ImportExport.vue';
</script>

<style scoped>
.proto-canvas-app {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background: var(--color-bg);
}
.proto-canvas-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
}
</style>
