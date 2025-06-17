<template>
  <div :class="['proto-block', typeClass]" :style="{ marginLeft: `${level * 32}px` }">
    <div class="proto-block-header">
      <span class="proto-block-icon">{{ typeIcon }}</span>
      <input v-model="element.name" class="proto-block-title" />
      <span class="proto-block-type-label">{{ typeLabel }}</span>
      <button class="remove-btn" @click="$emit('remove', element.id, element.parentId)">✕</button>
    </div>
    <div v-if="isMessage">
      <div class="proto-block-section">
        <h5>Fields</h5>
        <div v-for="(field, idx) in element.fields" :key="field.id" class="proto-block-field">
          <input v-model="field.name" placeholder="name" class="field-input" />
          <select v-model="field.type" class="field-type-select">
            <option v-for="type in allFieldTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <input v-model.number="field.number" type="number" min="1" placeholder="#" class="field-num-input" />
          <button class="remove-btn" @click="element.fields.splice(idx,1)">🗑️</button>
        </div>
        <button @click="addField">Add Field</button>
      </div>
      <div class="proto-block-section">
        <h5>Nested Messages</h5>
        <ProtoBlock v-for="msg in element.messages" :key="msg.id" :element="msg" :all-elements="allElements" :level="level+1" @remove="$emit('remove', $event, element.id)" @add="$emit('add', $event, element.id)" />
        <button @click="addNestedMessage">Add Message</button>
      </div>
      <div class="proto-block-section">
        <h5>Enums</h5>
        <ProtoBlock v-for="en in element.enums" :key="en.id" :element="en" :all-elements="allElements" :level="level+1" @remove="$emit('remove', $event, element.id)" @add="$emit('add', $event, element.id)" />
        <button @click="addEnum">Add Enum</button>
      </div>
    </div>
    <div v-else-if="isService">
      <div class="proto-block-section">
        <h5>RPC Methods</h5>
        <div v-for="(rpc, idx) in element.methods" :key="rpc.id" class="proto-block-field">
          <input v-model="rpc.name" placeholder="name" class="field-input" />
          <input v-model="rpc.inputType" placeholder="InputType" class="field-type-select" />
          <input v-model="rpc.outputType" placeholder="OutputType" class="field-type-select" />
          <label><input type="checkbox" v-model="rpc.clientStreaming" /> client stream</label>
          <label><input type="checkbox" v-model="rpc.serverStreaming" /> server stream</label>
          <button class="remove-btn" @click="element.methods.splice(idx,1)">🗑️</button>
        </div>
        <button @click="addRPC">Add RPC</button>
      </div>
    </div>
    <div v-else-if="isEnum">
      <div class="proto-block-section">
        <h5>Values</h5>
        <div v-for="(value, idx) in element.values" :key="value.id" class="proto-block-field">
          <input v-model="value.name" placeholder="name" class="field-input" />
          <input v-model.number="value.number" type="number" min="0" placeholder="#" class="field-num-input" />
          <button class="remove-btn" @click="element.values.splice(idx,1)">🗑️</button>
        </div>
        <button @click="addEnumValue">Add Value</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps(['element', 'allElements', 'level']);
const emit = defineEmits(['remove', 'add']);

const isMessage = computed(() => 'fields' in props.element && 'messages' in props.element && 'enums' in props.element);
const isEnum = computed(() => 'values' in props.element);
const isService = computed(() => 'methods' in props.element);

const typeClass = computed(() => {
  if (isMessage.value) return 'proto-block-message';
  if (isEnum.value) return 'proto-block-enum';
  if (isService.value) return 'proto-block-service';
  return '';
});
const typeIcon = computed(() => {
  if (isMessage.value) return '🟦';
  if (isEnum.value) return '🟧';
  if (isService.value) return '🟩';
  return '';
});
const typeLabel = computed(() => {
  if (isMessage.value) return 'Message';
  if (isEnum.value) return 'Enum';
  if (isService.value) return 'Service';
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

function addField() {
  const nextNum = props.element.fields.length ? Math.max(...props.element.fields.map((f: any) => f.number)) + 1 : 1;
  props.element.fields.push({
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `field${nextNum}`,
    type: 'string',
    number: nextNum,
    label: '',
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
  border: 2.5px solid var(--color-border);
  min-width: 220px;
  max-width: 340px;
  margin-bottom: 1.2em;
  padding: 1em 1.2em 0.7em 1.2em;
  position: relative;
}
.proto-block-message { border-color: var(--color-message); }
.proto-block-enum { border-color: var(--color-enum); }
.proto-block-service { border-color: var(--color-service); }
.proto-block-header {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
}
.proto-block-icon {
  font-size: 1.5em;
}
.proto-block-title {
  font-size: 1.1em;
  font-weight: 700;
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  color: var(--color-text);
}
.proto-block-type-label {
  font-size: 0.95em;
  font-weight: 600;
  margin-left: auto;
  color: #888;
  background: #f3f3f3;
  border-radius: 6px;
  padding: 0.2em 0.7em;
}
.remove-btn {
  background: none;
  border: none;
  color: #c00;
  font-size: 1.1em;
  cursor: pointer;
  margin-left: 0.5em;
}
.remove-btn:hover {
  color: #a00;
}
.proto-block-section {
  margin-top: 1em;
}
.proto-block-field {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
}
.field-input, .field-type-select, .field-num-input {
  font-size: 1em;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}
</style> 