<template>
  <div class="import-export">
    <button @click="exportJson">Export as JSON</button>
    <button @click="exportProto">Export as .proto</button>
    <label class="import-label">
      Import JSON
      <input type="file" accept="application/json" @change="importJson" style="display:none" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { useSchemaStore } from '../store/schema';
const schema = useSchemaStore();

function exportJson() {
  const data = JSON.stringify(schema.elements, null, 2);
  downloadFile(data, 'schema.json', 'application/json');
}

function exportProto() {
  // Lazy import to avoid circular deps
  import('../utils/protoGen').then(({ generateProto3, getServiceNameForFile }) => {
    const data = generateProto3(schema.elements);
    const filename = `${getServiceNameForFile(schema.elements)}.proto`;
    downloadFile(data, filename, 'text/plain');
  });
}

function importJson(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const arr = JSON.parse(e.target?.result as string);
      if (Array.isArray(arr)) schema.$patch({ elements: arr });
    } catch {}
  };
  reader.readAsText(file);
}

function downloadFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.import-export {
  display: flex;
  gap: 1rem;
  margin: 2rem 2rem 2rem 2rem;
  justify-content: center;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: calc(100% - 4rem);
}

.import-label {
  background: #42b983;
  color: #fff;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.import-label:hover {
  background: #369e6f;
}

button {
  background: #fff;
  border: 1px solid #42b983;
  color: #42b983;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

button:hover {
  background: #42b983;
  color: #fff;
}
</style> 