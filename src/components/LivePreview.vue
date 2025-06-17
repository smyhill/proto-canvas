<template>
  <div class="live-preview">
    <div class="tabs">
      <button :class="{active: tab==='proto'}" @click="tab='proto'">Proto3 Code</button>
      <button :class="{active: tab==='mermaid'}" @click="tab='mermaid'">Mermaid Diagram</button>
    </div>
    <div class="preview-content">
      <!-- Proto Preview (always rendered, toggled by CSS) -->
      <div class="proto-tab" :class="{active: tab==='proto', inactive: tab!=='proto'}">
        <div ref="monacoEl" class="monaco-editor" v-show="monacoReady"></div>
        <pre v-if="!monacoReady" class="proto-preview">{{ protoCode }}</pre>
      </div>
      <!-- Mermaid Preview (always rendered, toggled by CSS) -->
      <div class="mermaid-tab" :class="{active: tab==='mermaid', inactive: tab!=='mermaid'}">
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
    if (monacoEl.value && !monacoInstance) {
      monacoInstance = monaco.editor.create(monacoEl.value, {
        value: protoCode.value,
        language: 'proto',
        readOnly: true,
        theme: 'vs',
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        automaticLayout: true,
      });
      monacoReady.value = true;
      // Watch for changes in proto code
      watch(protoCode, (val) => {
        if (monacoInstance) {
          monacoInstance.setValue(val);
        }
      });
    }
  } catch (error) {
    console.warn('Monaco editor failed to load, falling back to text preview');
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
  } catch (error) {
    console.warn('Mermaid failed to render:', error);
    mermaidError.value = true;
  }
}

onMounted(() => {
  // Always start with proto tab
  tab.value = 'proto';
  mountMonaco();
  nextTick(() => renderMermaid());
});

watch(tab, (val) => {
  // Only render mermaid on tab switch, keep monaco always mounted
  if (val === 'mermaid') {
    nextTick(() => renderMermaid());
  }
});

watch(mermaidCode, () => {
  if (tab.value === 'mermaid') {
    nextTick(() => renderMermaid());
  }
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
  margin: 2rem 2rem 2rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
  position: relative;
  min-height: 400px;
  width: calc(100% - 4rem);
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border 0.2s;
  font-weight: 500;
}

.tabs button.active {
  border-bottom: 2px solid #42b983;
  color: #42b983;
}

.tabs button:hover {
  color: #42b983;
}

.preview-content {
  min-height: 350px;
  max-height: 600px;
  overflow-y: auto;
}

.proto-tab, .mermaid-tab {
  height: 100%;
  width: 100%;
  display: none;
}
.proto-tab.active, .mermaid-tab.active {
  display: block;
}
.proto-preview, .mermaid-preview {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Fira Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  color: #333;
  white-space: pre;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  text-align: left;
  margin: 0;
}
.monaco-editor {
  width: 100%;
  min-height: 350px;
  height: 350px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  text-align: left;
}
.mermaid-svg {
  width: 100%;
  min-height: 350px;
  background: #f9f9f9;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 