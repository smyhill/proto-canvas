<template>
  <div class="canvas-modern" @dragover.prevent @drop="onDropCanvas">
    <h3>Canvas</h3>
    <div v-if="elements.length === 0" class="canvas-placeholder">
      Drag proto3 elements here to start designing your schema.
    </div>
    <div v-else class="canvas-elements">
      <template v-for="el in elements" :key="el.id">
        <ProtoBlock :element="el" :all-elements="elements" :level="0" @remove="removeElement" @add="addElement" />
      </template>
    </div>
    <div v-if="contextMenu.visible" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul>
        <li @click="startRename(contextMenu.element)">Rename</li>
        <li @click="deleteElement(contextMenu.element)">Delete</li>
        <li @click="editDetails(contextMenu.element)">Edit Details</li>
      </ul>
    </div>
    <div v-if="showDetailsDialog && detailsElement" class="details-dialog">
      <div class="dialog-content">
        <h4>Edit {{ getTypeLabel(detailsElement) }}: {{ detailsElement.name }}</h4>
        <textarea v-model="detailsElement.comment" placeholder="Comment (optional)" rows="2" style="width:100%;margin-bottom:1em;"></textarea>
        <template v-if="isMessage(detailsElement)">
          <h5>Fields</h5>
          <div v-for="(field, idx) in detailsElement.fields" :key="field.id" class="edit-row">
            <input v-model="field.name" placeholder="name" style="width:90px" />
            <select v-model="field.type" style="width:90px">
              <option v-for="type in scalarTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <input v-model.number="field.number" type="number" min="1" placeholder="#" style="width:50px" />
            <select v-model="field.label" style="width:80px">
              <option value="">(none)</option>
              <option value="optional">optional</option>
              <option value="repeated">repeated</option>
            </select>
            <input v-model="field.comment" placeholder="Comment" style="width:120px" />
            <button @click="detailsElement.fields.splice(idx,1)">🗑️</button>
          </div>
          <button @click="addField(detailsElement)">Add Field</button>
        </template>
        <template v-else-if="isEnum(detailsElement)">
          <h5>Values</h5>
          <div v-for="(value, idx) in detailsElement.values" :key="value.id" class="edit-row">
            <input v-model="value.name" placeholder="name" style="width:90px" />
            <input v-model.number="value.number" type="number" min="0" placeholder="#" style="width:50px" />
            <input v-model="value.comment" placeholder="Comment" style="width:120px" />
            <button @click="detailsElement.values.splice(idx,1)">🗑️</button>
          </div>
          <button @click="addEnumValue(detailsElement)">Add Value</button>
        </template>
        <template v-else-if="isService(detailsElement)">
          <h5>Methods</h5>
          <div v-for="(method, idx) in detailsElement.methods" :key="method.id" class="edit-row">
            <input v-model="method.name" placeholder="name" style="width:90px" />
            <input v-model="method.inputType" placeholder="InputType" style="width:90px" />
            <input v-model="method.outputType" placeholder="OutputType" style="width:90px" />
            <label><input type="checkbox" v-model="method.clientStreaming" /> client stream</label>
            <label><input type="checkbox" v-model="method.serverStreaming" /> server stream</label>
            <input v-model="method.comment" placeholder="Comment" style="width:120px" />
            <button @click="detailsElement.methods.splice(idx,1)">🗑️</button>
          </div>
          <button @click="addMethod(detailsElement)">Add Method</button>
        </template>
        <div style="margin-top:1.5em;text-align:right">
          <button @click="closeDetailsDialog">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSchemaStore, Message, Enum, Service, SchemaElement, ScalarType, TopLevelElement } from '../store/schema';
import { storeToRefs } from 'pinia';
import ProtoBlock from './ProtoBlock.vue';

const schema = useSchemaStore();
const { elements } = storeToRefs(schema);

const editingId = ref<string | null>(null);
const editName = ref('');
const contextMenu = ref({ visible: false, x: 0, y: 0, element: null as SchemaElement | null });
const showDetailsDialog = ref(false);
const detailsElement = ref<SchemaElement | null>(null);

const scalarTypes: ScalarType[] = [
  'double', 'float', 'int32', 'int64', 'uint32', 'uint64',
  'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64',
  'bool', 'string', 'bytes'
];

function onDropCanvas(event: DragEvent) {
  const type = event.dataTransfer?.getData('application/x-proto-type');
  if (!type) return;
  if (type === 'message') {
    schema.addElement({ id: `msg-${Date.now()}`, name: 'Message', fields: [], messages: [], enums: [], comment: '' });
  } else if (type === 'enum') {
    schema.addElement({ id: `enum-${Date.now()}`, name: 'Enum', values: [], comment: '' });
  } else if (type === 'service') {
    schema.addElement({ id: `svc-${Date.now()}`, name: 'Service', methods: [], comment: '' });
  }
}

function removeElement(id: string, parentId?: string) {
  schema.removeElement(id, parentId);
}

function addElement(element: any, parentId: string) {
  schema.addElement(element, parentId);
}

function getTypeLabel(el: Message | Enum | Service) {
  if ('fields' in el) return 'Message';
  if ('values' in el) return 'Enum';
  if ('methods' in el) return 'Service';
  return '';
}

function openContextMenu(event: MouseEvent, element: SchemaElement) {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    element,
  };
  document.addEventListener('click', closeContextMenu);
}
function closeContextMenu() {
  contextMenu.value.visible = false;
  document.removeEventListener('click', closeContextMenu);
}
function startRename(element: SchemaElement) {
  editingId.value = element.id;
  editName.value = element.name;
  closeContextMenu();
}
function saveEdit(element: SchemaElement) {
  if (editName.value.trim()) {
    element.name = editName.value.trim();
  }
  editingId.value = null;
}
function deleteElement(element: SchemaElement) {
  schema.removeElement(element.id);
  closeContextMenu();
}
function editDetails(element: SchemaElement) {
  detailsElement.value = element;
  showDetailsDialog.value = true;
  closeContextMenu();
}
function closeDetailsDialog() {
  showDetailsDialog.value = false;
  detailsElement.value = null;
}
function isMessage(el: SchemaElement): el is Message {
  return 'fields' in el;
}
function isEnum(el: SchemaElement): el is Enum {
  return 'values' in el;
}
function isService(el: SchemaElement): el is Service {
  return 'methods' in el;
}
function addField(msg: Message) {
  const nextNum = msg.fields.length ? Math.max(...msg.fields.map(f => f.number)) + 1 : 1;
  msg.fields.push({
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `field${nextNum}`,
    type: 'string',
    number: nextNum,
    label: '',
    comment: ''
  });
}
function addEnumValue(en: Enum) {
  const nextNum = en.values.length ? Math.max(...en.values.map(v => v.number)) + 1 : 0;
  en.values.push({
    id: `enumval-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `VALUE_${nextNum}`,
    number: nextNum,
    comment: ''
  });
}
function addMethod(svc: Service) {
  svc.methods.push({
    id: `rpc-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    name: `Method${svc.methods.length + 1}`,
    inputType: 'Request',
    outputType: 'Response',
    clientStreaming: false,
    serverStreaming: false,
    comment: ''
  });
}
function getTypeClass(el: Message | Enum | Service) {
  if ('fields' in el) return 'canvas-card-message';
  if ('values' in el) return 'canvas-card-enum';
  if ('methods' in el) return 'canvas-card-service';
  return '';
}
function getTypeIcon(el: Message | Enum | Service) {
  if ('fields' in el) return '🟦';
  if ('values' in el) return '🟧';
  if ('methods' in el) return '🟩';
  return '';
}
</script>

<style scoped>
.canvas-modern {
  background: repeating-linear-gradient(135deg, #f7f9fb, #f7f9fb 30px, #f0f4f8 30px, #f0f4f8 60px);
  border-radius: var(--radius);
  padding: 2rem 2.5rem 2rem 2.5rem;
  min-height: 600px;
  box-shadow: var(--shadow);
  flex: 1;
  margin-bottom: 2rem;
}
.canvas-placeholder {
  color: #888;
  text-align: center;
  margin-top: 2rem;
}
.canvas-elements {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1.5rem;
}
.canvas-card-modern {
  background: var(--color-bg-contrast);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 2.5px solid var(--color-border);
  min-width: 220px;
  max-width: 320px;
  padding: 1.2em 1.2em 1em 1.2em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: border 0.2s, box-shadow 0.2s;
  position: relative;
}
.canvas-card-message { border-color: var(--color-message); }
.canvas-card-enum { border-color: var(--color-enum); }
.canvas-card-service { border-color: var(--color-service); }
.canvas-card-header {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
}
.canvas-card-icon {
  font-size: 1.5em;
}
.canvas-card-title {
  font-size: 1.15em;
  font-weight: 700;
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  color: var(--color-text);
}
.canvas-card-type-label {
  font-size: 0.95em;
  font-weight: 600;
  margin-left: auto;
  color: #888;
  background: #f3f3f3;
  border-radius: 6px;
  padding: 0.2em 0.7em;
}
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 1000;
  min-width: 120px;
}
.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}
.context-menu li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.context-menu li:hover {
  background: #f4f4f4;
}
.details-dialog {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.dialog-content {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  min-width: 300px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  text-align: center;
}
.edit-row {
  display: flex;
  gap: 0.5em;
  align-items: center;
  margin-bottom: 0.5em;
}
.edit-row input, .edit-row select {
  font-size: 1em;
  padding: 0.2em 0.4em;
}
.edit-row button {
  background: none;
  border: none;
  color: #c00;
  font-size: 1.1em;
  cursor: pointer;
}
.edit-row button:hover {
  color: #a00;
}
</style> 