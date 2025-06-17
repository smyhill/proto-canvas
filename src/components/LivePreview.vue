<template>
  <div class="live-preview">
    <div class="tabs">
      <button :class="{active: tab==='proto'}" @click="tab='proto'">Proto3 Code</button>
      <button :class="{active: tab==='mermaid'}" @click="tab='mermaid'">Mermaid Diagram</button>
    </div>
    <div class="preview-content">
      <div v-if="tab==='proto'">
        <div ref="monacoEl" class="monaco-editor" v-show="monacoReady"></div>
        <pre v-if="!monacoReady" class="proto-preview">{{ protoCode }}</pre>
      </div>
      <div v-else>
        <div ref="mermaidEl" class="mermaid-svg"></div>
        <pre v-if="mermaidError" class="mermaid-preview">{{ mermaidCode }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useSchemaStore } from '../store/schema';
import { storeToRefs } from 'pinia';
import { generateProto3 } from '../utils/protoGen';
import { generateMermaid } from '../utils/mermaidGen';

const tab = ref<'proto'|'mermaid'>('proto');
const schema = useSchemaStore();
const { elements } = storeToRefs(schema);

const protoCode = computed(() => generateProto3(elements.value));
const mermaidCode = computed(() => generateMermaid(elements.value));

const monacoEl = ref<HTMLElement | null>(null);
let monacoInstance: any = null;
const monacoReady = ref(false);

const mermaidEl = ref<HTMLElement | null>(null);
const mermaidError = ref(false);

async function mountMonaco() {
  try {
    const monaco = await import('monaco-editor');
    monacoInstance = monaco.editor.create(monacoEl.value!, {
      value: protoCode.value,
      language: 'proto',
      readOnly: true,
      theme: 'vs',
      fontSize: 15,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
    });
    monacoReady.value = true;
    watch(protoCode, (val) => {
      if (monacoInstance) monacoInstance.setValue(val);
    });
  } catch {
    monacoReady.value = false;
  }
}

async function renderMermaid() {
  if (!mermaidEl.value) return;
  try {
    const mermaidMod = await import('mermaid');
    const mermaid = mermaidMod.default;
    mermaidError.value = false;
    mermaidEl.value.innerHTML = '';
    await mermaid.parse(mermaidCode.value);
    const { svg } = await mermaid.render('mermaid-svg', mermaidCode.value);
    if (mermaidEl.value) mermaidEl.value.innerHTML = svg;
  } catch {
    mermaidError.value = true;
  }
}

onMounted(() => {
  if (tab.value === 'proto') mountMonaco();
  if (tab.value === 'mermaid') nextTick(renderMermaid);
});
watch(tab, (val) => {
  if (val === 'proto' && !monacoReady.value) mountMonaco();
  if (val === 'mermaid') nextTick(renderMermaid);
});
watch(mermaidCode, () => {
  if (tab.value === 'mermaid') nextTick(renderMermaid);
});
onBeforeUnmount(() => {
  if (monacoInstance) {
    monacoInstance.dispose();
    monacoInstance = null;
  }
});
</script>

<style scoped>
.live-preview {
  margin: 2rem auto;
  max-width: 900px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem;
}
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border 0.2s;
}
.tabs button.active {
  border-bottom: 2px solid #42b983;
  color: #42b983;
}
.preview-content {
  min-height: 180px;
}
.proto-preview, .mermaid-preview {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 1rem;
  color: #333;
  white-space: pre-wrap;
}
.monaco-editor {
  width: 100%;
  min-height: 220px;
  height: 220px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1em;
}
.mermaid-svg {
  width: 100%;
  min-height: 220px;
  margin-bottom: 1em;
  background: #f9f9f9;
  border-radius: 6px;
  overflow-x: auto;
}
</style> 