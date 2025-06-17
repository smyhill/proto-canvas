<template>
  <aside class="palette-sidebar">
    <h3>Palette</h3>
    
    <!-- Main Elements -->
    <div class="palette-section">
      <h4>Elements</h4>
      <div class="palette-grid">
        <div
          v-for="item in mainElements"
          :key="item.type"
          class="palette-block"
          :style="{ borderColor: item.color, background: item.bg }"
          draggable="true"
          @dragstart="onDragStart(item.type, $event, item)"
        >
          <span class="palette-icon">{{ item.icon }}</span>
          <span class="palette-label" :style="{ color: item.color }">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- RPC Methods -->
    <div class="palette-section">
      <h4>RPC Methods</h4>
      <div class="palette-grid">
        <div
          v-for="item in rpcMethods"
          :key="item.type + item.label"
          class="palette-block palette-block-rpc"
          :style="{ borderColor: item.color, background: item.bg }"
          draggable="true"
          @dragstart="onDragStart(item.type, $event, item)"
        >
          <span class="palette-icon">{{ item.icon }}</span>
          <span class="palette-label" :style="{ color: item.color }">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Scalar Types -->
    <div class="palette-section">
      <h4>Scalar Types</h4>
      <div class="palette-grid compact">
        <div
          v-for="item in scalarTypes"
          :key="item.type + item.label"
          class="palette-block palette-block-scalar"
          :style="{ borderColor: item.color, background: item.bg }"
          draggable="true"
          @dragstart="onDragStart(item.type, $event, item)"
        >
          <span class="palette-icon">{{ item.icon }}</span>
          <span class="palette-label" :style="{ color: item.color }">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mainElements = ref([
  { type: 'message', label: 'Message', icon: '🟦', color: 'var(--color-message)', bg: '#eaf1fd' },
  { type: 'enum', label: 'Enum', icon: '🟧', color: 'var(--color-enum)', bg: '#fff4e6' },
  { type: 'service', label: 'Service', icon: '🟩', color: 'var(--color-service)', bg: '#e6f9f2' },
]);

const rpcMethods = ref([
  { type: 'rpc', label: 'Unary', icon: '📡', color: '#8b5cf6', bg: '#f3e8ff', inputType: 'Request', outputType: 'Response' },
  { type: 'rpc', label: 'Server Stream', icon: '📡', color: '#8b5cf6', bg: '#f3e8ff', inputType: 'Request', outputType: 'Response', serverStreaming: true },
  { type: 'rpc', label: 'Client Stream', icon: '📡', color: '#8b5cf6', bg: '#f3e8ff', inputType: 'Request', outputType: 'Response', clientStreaming: true },
  { type: 'rpc', label: 'Bidirectional', icon: '📡', color: '#8b5cf6', bg: '#f3e8ff', inputType: 'Request', outputType: 'Response', clientStreaming: true, serverStreaming: true },
]);

const scalarTypes = ref([
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
]);

function onDragStart(type: string, event: DragEvent, item: any) {
  event.dataTransfer?.setData('application/x-proto-type', type);
  if (type === 'field') {
    event.dataTransfer?.setData('application/x-proto-field-type', item.label);
  } else if (type === 'rpc') {
    event.dataTransfer?.setData('application/x-proto-rpc-data', JSON.stringify(item));
  }
}
</script>

<style scoped>
.palette-sidebar {
  background: var(--color-bg-contrast);
  border-right: 1.5px solid var(--color-border);
  min-width: 200px;
  max-width: 220px;
  padding: 1.5rem 1rem;
  height: 100vh;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.palette-section {
  margin-bottom: 1.5rem;
}

.palette-section h4 {
  font-size: 0.9em;
  font-weight: 600;
  color: #666;
  margin: 0 0 0.8rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.palette-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.palette-grid.compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.palette-block {
  display: flex;
  align-items: center;
  gap: 0.5em;
  border: 2px solid;
  border-radius: var(--radius);
  background: #fff;
  padding: 0.5em 0.7em;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s, border 0.2s, transform 0.1s;
  cursor: grab;
  font-size: 0.9em;
}

.palette-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.palette-block:active {
  cursor: grabbing;
  box-shadow: 0 0 0 2px var(--color-accent2);
}

.palette-block-rpc {
  border-width: 1.5px;
  padding: 0.4em 0.6em;
}

.palette-block-scalar {
  border-width: 1px;
  padding: 0.3em 0.5em;
  font-size: 0.8em;
}

.palette-icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.palette-label {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 