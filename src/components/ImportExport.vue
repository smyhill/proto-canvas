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
  import('../utils/protoGen').then(({ generateProto3 }) => {
    const data = generateProto3(schema.elements);
    downloadFile(data, 'schema.proto', 'text/plain');
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
  margin: 2rem auto 0 auto;
  justify-content: center;
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