<template>
  <div class="proto-canvas-app">
    <div class="proto-canvas-main">
      <Canvas />
      <LivePreview />
      <ImportExport />
    </div>
  </div>
</template>

<script setup lang="ts">
import Canvas from './Canvas.vue';
import LivePreview from './LivePreview.vue';
import ImportExport from './ImportExport.vue';
</script>

<style scoped>
.proto-canvas-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
}

.proto-canvas-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}
</style>
