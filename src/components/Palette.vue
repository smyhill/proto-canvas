<template>
  <aside class="palette-sidebar">
    <h3>Palette</h3>
    <div class="palette-list">
      <div
        v-for="item in items"
        :key="item.type + (item.label || '')"
        class="palette-block"
        :style="{ borderColor: item.color, background: item.bg }"
        draggable="true"
        @dragstart="onDragStart(item.type, $event, item)"
      >
        <span class="palette-icon">{{ item.icon }}</span>
        <input v-if="item.editable" v-model="item.label" class="palette-input" :style="{ color: item.color }" />
        <span v-else class="palette-label" :style="{ color: item.color }">{{ item.label }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const scalarTypes = [
  { type: 'field', label: 'double', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'float', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'int32', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'int64', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'uint32', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'uint64', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'sint32', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'sint64', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'fixed32', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'fixed64', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'sfixed32', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'sfixed64', icon: '🔵', color: '#2563eb', bg: '#eaf1fd' },
  { type: 'field', label: 'bool', icon: '🟢', color: '#10b981', bg: '#e6f9f2' },
  { type: 'field', label: 'string', icon: '🟣', color: '#a855f7', bg: '#f3e8ff' },
  { type: 'field', label: 'bytes', icon: '🟤', color: '#92400e', bg: '#fef3c7' },
];
const items = ref([
  { type: 'message', label: 'Message', icon: '🟦', color: 'var(--color-message)', bg: '#eaf1fd', editable: true },
  { type: 'enum', label: 'Enum', icon: '🟧', color: 'var(--color-enum)', bg: '#fff4e6', editable: true },
  { type: 'service', label: 'Service', icon: '🟩', color: 'var(--color-service)', bg: '#e6f9f2', editable: true },
  ...scalarTypes.map(f => ({ ...f, editable: false })),
]);

function onDragStart(type: string, event: DragEvent, item: any) {
  event.dataTransfer?.setData('application/x-proto-type', type);
  if (type === 'field') {
    event.dataTransfer?.setData('application/x-proto-field-type', item.label);
  }
}
</script>

<style scoped>
.palette-sidebar {
  background: var(--color-bg-contrast);
  border-right: 1.5px solid var(--color-border);
  min-width: 220px;
  padding: 2rem 1rem 2rem 1.5rem;
  height: 100vh;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.palette-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}
.palette-block {
  display: flex;
  align-items: center;
  gap: 0.7em;
  border: 2.5px solid;
  border-radius: var(--radius);
  background: #fff;
  padding: 0.7em 1em;
  width: 100%;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s, border 0.2s;
  cursor: grab;
}
.palette-block:active {
  box-shadow: 0 0 0 2px var(--color-accent2);
}
.palette-icon {
  font-size: 1.5em;
  margin-right: 0.2em;
}
.palette-input {
  border: none;
  background: transparent;
  font-size: 1.1em;
  font-weight: 600;
  outline: none;
  width: 90px;
}
.palette-label {
  font-size: 1.1em;
  font-weight: 600;
  margin-left: 0.2em;
}
</style> 