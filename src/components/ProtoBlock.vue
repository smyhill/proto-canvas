<template>
  <div 
    :class="['proto-block', typeClass, { 'proto-block-nested': level > 0 }]" 
    :style="{ marginLeft: `${level * 24}px` }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    :data-element-type="elementType"
    :data-element-id="element.id"
  >
    <div class="proto-block-header">
      <span class="proto-block-icon">{{ typeIcon }}</span>
      <input v-model="element.name" class="proto-block-title" />
      <span class="proto-block-type-label">{{ typeLabel }}</span>
      <button class="remove-btn" @click="$emit('remove', element.id, element.parentId)">✕</button>
    </div>
    
    <!-- Drop zone indicator -->
    <div v-if="showDropZone" class="drop-zone-indicator">
      <span class="drop-zone-text">Drop here to add {{ dropZoneType }}</span>
    </div>
    
    <div v-if="isMessage" class="proto-block-content">
      <div class="proto-block-section">
        <h5>Fields</h5>
        <div class="proto-block-fields">
          <div v-for="(field, idx) in element.fields" :key="field.id" class="proto-block-field">
            <input v-model="field.name" placeholder="name" class="field-input" />
            <select v-model="field.type" class="field-type-select">
              <option v-for="type in allFieldTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <input v-model.number="field.number" type="number" min="1" placeholder="#" class="field-num-input" />
            <button class="remove-btn small" @click="element.fields.splice(idx,1)">🗑️</button>
          </div>
        </div>
        <button class="add-btn" @click="addField">Add Field</button>
      </div>
      
      <div class="proto-block-section">
        <h5>Nested Messages</h5>
        <div class="proto-block-nested-container">
          <ProtoBlock 
            v-for="msg in element.messages" 
            :key="msg.id" 
            :element="msg" 
            :all-elements="allElements" 
            :level="level+1" 
            @remove="$emit('remove', $event, element.id)" 
            @add="$emit('add', $event, element.id)" 
          />
        </div>
        <button class="add-btn" @click="addNestedMessage">Add Message</button>
      </div>
      
      <div class="proto-block-section">
        <h5>Enums</h5>
        <div class="proto-block-nested-container">
          <ProtoBlock 
            v-for="en in element.enums" 
            :key="en.id" 
            :element="en" 
            :all-elements="allElements" 
            :level="level+1" 
            @remove="$emit('remove', $event, element.id)" 
            @add="$emit('add', $event, element.id)" 
          />
        </div>
        <button class="add-btn" @click="addEnum">Add Enum</button>
      </div>
    </div>
    
    <div v-else-if="isService" class="proto-block-content">
      <div class="proto-block-section">
        <h5>RPC Methods</h5>
        <div class="proto-block-nested-container">
          <ProtoBlock 
            v-for="rpc in element.methods" 
            :key="rpc.id" 
            :element="rpc" 
            :all-elements="allElements" 
            :level="level+1" 
            @remove="$emit('remove', $event, element.id)" 
            @add="$emit('add', $event, element.id)" 
          />
        </div>
        <button class="add-btn" @click="addRPC">Add RPC</button>
      </div>
    </div>
    
    <div v-else-if="isEnum" class="proto-block-content">
      <div class="proto-block-section">
        <h5>Values</h5>
        <div class="proto-block-fields">
          <div v-for="(value, idx) in element.values" :key="value.id" class="proto-block-field">
            <input v-model="value.name" placeholder="name" class="field-input" />
            <input v-model.number="value.number" type="number" min="0" placeholder="#" class="field-num-input" />
            <button class="remove-btn small" @click="element.values.splice(idx,1)">🗑️</button>
          </div>
        </div>
        <button class="add-btn" @click="addEnumValue">Add Value</button>
      </div>
    </div>
    
    <div v-else-if="isRPC" class="proto-block-content">
      <div class="proto-block-section">
        <h5>RPC Details</h5>
        <div class="proto-block-rpc-details">
          <div class="rpc-io">
            <input v-model="element.inputType" placeholder="InputType" class="rpc-type-input" />
            <span class="rpc-arrow">→</span>
            <input v-model="element.outputType" placeholder="OutputType" class="rpc-type-input" />
          </div>
          <div class="rpc-options">
            <label class="rpc-option">
              <input type="checkbox" v-model="element.clientStreaming" />
              <span>client stream</span>
            </label>
            <label class="rpc-option">
              <input type="checkbox" v-model="element.serverStreaming" />
              <span>server stream</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
const props = defineProps(['element', 'allElements', 'level']);
const emit = defineEmits(['remove', 'add']);

const showDropZone = ref(false);
const dropZoneType = ref('');

const isMessage = computed(() => 'fields' in props.element && 'messages' in props.element && 'enums' in props.element);
const isEnum = computed(() => 'values' in props.element);
const isService = computed(() => 'methods' in props.element);
const isRPC = computed(() => 'inputType' in props.element && 'outputType' in props.element);

const elementType = computed(() => {
  if (isMessage.value) return 'message';
  if (isEnum.value) return 'enum';
  if (isService.value) return 'service';
  if (isRPC.value) return 'rpc';
  return '';
});

const typeClass = computed(() => {
  if (isMessage.value) return 'proto-block-message';
  if (isEnum.value) return 'proto-block-enum';
  if (isService.value) return 'proto-block-service';
  if (isRPC.value) return 'proto-block-rpc';
  return '';
});
const typeIcon = computed(() => {
  if (isMessage.value) return '🟦';
  if (isEnum.value) return '🟧';
  if (isService.value) return '🟩';
  if (isRPC.value) return '📡';
  return '';
});
const typeLabel = computed(() => {
  if (isMessage.value) return 'Message';
  if (isEnum.value) return 'Enum';
  if (isService.value) return 'Service';
  if (isRPC.value) return 'RPC';
  return '';
});

const allFieldTypes = computed(() => {
  // All scalar types + all message/enum names in the schema
  const scalars = [
    'double','float','int32','int64','uint32','uint64','sint32','sint64','fixed32','fixed64','sfixed32','sfixed64','bool','string','bytes'
  ];
  const collectNames = (arr: any[]): string[] => {
    let names: string[] = [];
    for (const el of arr) {
      if ('fields' in el && 'messages' in el && 'enums' in el) {
        names.push(el.name);
        names = names.concat(collectNames(el.messages));
        names = names.concat(collectNames(el.enums));
      } else if ('values' in el) {
        names.push(el.name);
      }
    }
    return names;
  };
  return scalars.concat(collectNames(props.allElements));
});

function onDragOver(event: DragEvent) {
  const dragType = event.dataTransfer?.getData('application/x-proto-type');
  if (!dragType) return;
  
  // Determine what can be dropped on this element
  if (isMessage.value) {
    if (dragType === 'field' || dragType === 'message' || dragType === 'enum') {
      showDropZone.value = true;
      dropZoneType.value = dragType === 'field' ? 'field' : dragType;
      event.dataTransfer!.dropEffect = 'copy';
    }
  } else if (isService.value) {
    if (dragType === 'rpc') {
      showDropZone.value = true;
      dropZoneType.value = 'RPC method';
      event.dataTransfer!.dropEffect = 'copy';
    }
  } else if (isRPC.value) {
    if (dragType === 'message') {
      showDropZone.value = true;
      dropZoneType.value = 'request/response message';
      event.dataTransfer!.dropEffect = 'copy';
    }
  }
}

function onDragLeave(event: DragEvent) {
  // Only hide if leaving the entire element
  if (!(event.currentTarget as Element)?.contains(event.relatedTarget as Node)) {
    showDropZone.value = false;
  }
}

function onDrop(event: DragEvent) {
  showDropZone.value = false;
  const dragType = event.dataTransfer?.getData('application/x-proto-type');
  if (!dragType) return;
  
  if (isMessage.value) {
    if (dragType === 'field') {
      const fieldType = event.dataTransfer?.getData('application/x-proto-field-type');
      if (fieldType) {
        addFieldWithType(fieldType);
      }
    } else if (dragType === 'message') {
      addNestedMessage();
    } else if (dragType === 'enum') {
      addEnum();
    }
  } else if (isService.value) {
    if (dragType === 'rpc') {
      const rpcData = event.dataTransfer?.getData('application/x-proto-rpc-data');
      if (rpcData) {
        addRPCFromData(JSON.parse(rpcData));
      } else {
        addRPC();
      }
    }
  } else if (isRPC.value) {
    if (dragType === 'message') {
      // Create a message and update the RPC's input/output types
      const message = {
        id: `msg-${Date.now()}`,
        name: 'Message',
        fields: [],
        messages: [],
        enums: [],
        comment: '',
        parentId: props.element.parentId
      };
      emit('add', message, props.element.parentId);
      // Update RPC type (could be input or output - for now, update input)
      props.element.inputType = message.name;
    }
  }
}

function addFieldWithType(type: string) {
  const nextNum = props.element.fields.length ? Math.max(...props.element.fields.map((f: any) => f.number)) + 1 : 1;
  props.element.fields.push({
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `field${nextNum}`,
    type: type,
    number: nextNum,
    label: undefined,
    comment: ''
  });
}

function addRPCFromData(rpcData: any) {
  props.element.methods.push({
    id: `rpc-${Date.now()}`,
    name: rpcData.label,
    inputType: rpcData.inputType,
    outputType: rpcData.outputType,
    clientStreaming: rpcData.clientStreaming || false,
    serverStreaming: rpcData.serverStreaming || false,
    comment: ''
  });
}

function addField() {
  const nextNum = props.element.fields.length ? Math.max(...props.element.fields.map((f: any) => f.number)) + 1 : 1;
  props.element.fields.push({
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `field${nextNum}`,
    type: 'string',
    number: nextNum,
    label: undefined,
    comment: ''
  });
}
function addNestedMessage() {
  emit('add', {
    id: `msg-${Date.now()}`,
    name: 'Message',
    fields: [],
    messages: [],
    enums: [],
    comment: '',
    parentId: props.element.id
  }, props.element.id);
}
function addEnum() {
  emit('add', {
    id: `enum-${Date.now()}`,
    name: 'Enum',
    values: [],
    comment: '',
    parentId: props.element.id
  }, props.element.id);
}
function addRPC() {
  props.element.methods.push({
    id: `rpc-${Date.now()}`,
    name: `Method${props.element.methods.length + 1}`,
    inputType: 'Request',
    outputType: 'Response',
    clientStreaming: false,
    serverStreaming: false,
    comment: ''
  });
}
function addEnumValue() {
  props.element.values.push({
    id: `enumval-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `VALUE_${props.element.values.length}`,
    number: props.element.values.length,
    comment: ''
  });
}
</script>

<style scoped>
.proto-block {
  background: var(--color-bg-contrast);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--color-border);
  min-width: 280px;
  max-width: 400px;
  margin-bottom: 1rem;
  padding: 1rem;
  position: relative;
  transition: all 0.2s ease;
}

.proto-block-nested {
  border-width: 1.5px;
  margin-left: 1.5rem;
  position: relative;
}

.proto-block-nested::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 1.5rem;
  width: 1rem;
  height: 1px;
  background: var(--color-border);
}

.proto-block-message { border-color: var(--color-message); }
.proto-block-enum { border-color: var(--color-enum); }
.proto-block-service { border-color: var(--color-service); }
.proto-block-rpc { 
  border-color: #8b5cf6; 
  background: rgba(139, 92, 246, 0.05);
  border-width: 1.5px;
}

.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(37, 99, 235, 0.1);
  border: 2px dashed var(--color-accent);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.drop-zone-text {
  background: var(--color-accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 600;
}

.proto-block-header {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
  margin-bottom: 0.8rem;
}

.proto-block-icon {
  font-size: 1.3em;
  flex-shrink: 0;
}

.proto-block-title {
  font-size: 1.1em;
  font-weight: 700;
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  color: var(--color-text);
  min-width: 0;
}

.proto-block-type-label {
  font-size: 0.85em;
  font-weight: 600;
  margin-left: auto;
  color: #888;
  background: #f3f3f3;
  border-radius: 4px;
  padding: 0.2em 0.6em;
  flex-shrink: 0;
}

.proto-block-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.proto-block-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.proto-block-section h5 {
  font-size: 0.9em;
  font-weight: 600;
  color: #666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.proto-block-fields {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.proto-block-field {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem;
  background: rgba(0,0,0,0.02);
  border-radius: 4px;
  flex-wrap: wrap;
}

.field-input, .field-type-select, .field-num-input {
  font-size: 0.9em;
  padding: 0.3em 0.5em;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: white;
  min-width: 0;
}

.field-input { flex: 1; min-width: 80px; }
.field-type-select { width: 90px; }
.field-num-input { width: 50px; }

.proto-block-nested-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.proto-block-rpc-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.proto-block-rpc-details {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.rpc-io {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rpc-type-input {
  font-size: 0.85em;
  padding: 0.2em 0.4em;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  background: white;
  min-width: 80px;
}

.rpc-arrow {
  color: #8b5cf6;
  font-weight: bold;
}

.rpc-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.rpc-option {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8em;
  color: #666;
  cursor: pointer;
}

.rpc-option input[type="checkbox"] {
  margin: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #c00;
  font-size: 1em;
  cursor: pointer;
  padding: 0.2em;
  border-radius: 3px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(204, 0, 0, 0.1);
}

.remove-btn.small {
  font-size: 0.8em;
  padding: 0.1em;
}

.add-btn {
  background: var(--color-accent2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4em 0.8em;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.add-btn:hover {
  background: var(--color-accent);
}
</style> 