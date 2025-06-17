<template>
  <div class="canvas-container">
    <div class="canvas-header">
      <h3>Proto3 Canvas</h3>
      <div class="canvas-actions">
        <button class="action-btn" @click="addService">+ Service</button>
        <button class="action-btn" @click="addMessage">+ Message</button>
        <button class="action-btn" @click="addEnum">+ Enum</button>
      </div>
    </div>
    
    <div class="canvas-workspace">
      <div v-if="elements.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h4>Start Building Your API</h4>
        <p>Create services to define your API, then add messages for your data structures</p>
        <div class="empty-actions">
          <button class="primary-btn" @click="addService">Create First Service</button>
        </div>
      </div>
      
      <div v-else class="schema-container">
        <!-- Services Section (Top) -->
        <div v-if="services.length > 0" class="schema-section services-section">
          <h4 class="section-title">
            <span class="section-icon">🟩</span>
            Services
          </h4>
          <div class="services-container">
            <div 
              v-for="service in services" 
              :key="service.id" 
              class="service-card"
              :class="{ selected: selectedElement?.id === service.id }"
              draggable="true"
              @dragstart="startDrag($event, service, 'service')"
              @dragover.prevent
              @drop="dropOn($event, service, 'service')"
            >
              <div class="service-header">
                <span class="service-icon">🟩</span>
                <input 
                  v-model="service.name" 
                  class="service-title" 
                  placeholder="Service name"
                  @click.stop
                  @input="validateServiceName(service)"
                />
                <button class="remove-btn" @click.stop="removeElement(service.id)">×</button>
              </div>
              
              <div class="rpc-methods">
                <div class="section-subtitle">RPC Methods</div>
                <div class="methods-list">
                  <div 
                    v-for="method in service.methods" 
                    :key="method.id" 
                    class="rpc-method"
                  >
                    <div class="method-header">
                      <input 
                        v-model="method.name" 
                        class="method-name" 
                        placeholder="Method name"
                        @click.stop
                        @input="validateMethodName(method)"
                      />
                      <div class="validation-status" v-if="getMethodValidationStatus(method)">
                        <span class="validation-icon">⚠️</span>
                        <span class="validation-message">{{ getMethodValidationStatus(method) }}</span>
                      </div>
                      <button class="method-remove" @click.stop="removeMethod(service, method.id)">×</button>
                    </div>
                    
                    <div class="method-signature">
                      <div class="input-section">
                        <label>Request:</label>
                        <select 
                          v-model="method.inputType" 
                          class="message-select"
                          @click.stop
                          @change="validateMethodName(method)"
                        >
                          <option value="">Select message...</option>
                          <option v-for="msg in messages" :key="msg.id" :value="msg.name">
                            {{ msg.name }}
                          </option>
                        </select>
                      </div>
                      
                      <div class="arrow">→</div>
                      
                      <div class="output-section">
                        <label>Response:</label>
                        <select 
                          v-model="method.outputType" 
                          class="message-select"
                          @click.stop
                          @change="validateMethodName(method)"
                        >
                          <option value="">Select message...</option>
                          <option v-for="msg in messages" :key="msg.id" :value="msg.name">
                            {{ msg.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="streaming-options">
                      <label class="stream-option">
                        <input type="checkbox" v-model="method.clientStreaming" @click.stop />
                        <span>Client streaming</span>
                      </label>
                      <label class="stream-option">
                        <input type="checkbox" v-model="method.serverStreaming" @click.stop />
                        <span>Server streaming</span>
                      </label>
                    </div>
                  </div>
                  
                  <button class="add-method-btn" @click.stop="addMethod(service)">
                    + Add RPC Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Messages Section (Below Services) -->
        <div v-if="messages.length > 0" class="schema-section messages-section">
          <h4 class="section-title">
            <span class="section-icon">🟦</span>
            Messages
          </h4>
          <div class="messages-grid">
            <div 
              v-for="message in messages" 
              :key="message.id" 
              class="message-card"
              :class="{ selected: selectedElement?.id === message.id }"
              @click="selectElement(message)"
              draggable="true"
              @dragstart="startDrag($event, message, 'message')"
              @dragover.prevent
              @drop="dropOn($event, message, 'message')"
            >
              <div class="message-header">
                <span class="message-icon">🟦</span>
                <input 
                  v-model="message.name" 
                  class="message-title" 
                  placeholder="Message name"
                  @click.stop
                />
                <button class="remove-btn" @click.stop="removeElement(message.id)">×</button>
              </div>
              
              <div class="message-content">
                <div class="fields-section">
                  <div class="section-subtitle">Fields</div>
                  <div class="fields-list">
                    <div 
                      v-for="field in message.fields" 
                      :key="field.id" 
                      class="field-item"
                    >
                      <span class="field-number">{{ field.number }}</span>
                      <select 
                        v-model="field.type" 
                        class="field-type-select"
                        @click.stop
                      >
                        <optgroup label="Scalar Types">
                          <option value="string">string</option>
                          <option value="int32">int32</option>
                          <option value="int64">int64</option>
                          <option value="bool">bool</option>
                          <option value="double">double</option>
                          <option value="float">float</option>
                          <option value="bytes">bytes</option>
                        </optgroup>
                        <optgroup label="Messages" v-if="messages.length > 0">
                          <option v-for="msg in messages" :key="msg.id" :value="msg.name">
                            {{ msg.name }}
                          </option>
                        </optgroup>
                        <optgroup label="Enums" v-if="enums.length > 0">
                          <option v-for="enumItem in enums" :key="enumItem.id" :value="enumItem.name">
                            {{ enumItem.name }}
                          </option>
                        </optgroup>
                      </select>
                      <input 
                        v-model="field.name" 
                        class="field-name-input" 
                        placeholder="Field name"
                        @click.stop
                      />
                      <button class="field-remove" @click.stop="removeField(message, field.id)">×</button>
                    </div>
                    <button class="add-field-btn" @click.stop="addField(message)">
                      + Add Field
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Enums Section -->
        <div v-if="enums.length > 0" class="schema-section enums-section">
          <h4 class="section-title">
            <span class="section-icon">🟧</span>
            Enums
          </h4>
          <div class="enums-grid">
            <div 
              v-for="enumElement in enums" 
              :key="enumElement.id" 
              class="enum-card"
              :class="{ selected: selectedElement?.id === enumElement.id }"
              @click="selectElement(enumElement)"
              draggable="true"
              @dragstart="startDrag($event, enumElement, 'enum')"
              @dragover.prevent
              @drop="dropOn($event, enumElement, 'enum')"
            >
              <div class="enum-header">
                <span class="enum-icon">🟧</span>
                <input 
                  v-model="enumElement.name" 
                  class="enum-title" 
                  placeholder="Enum name"
                  @click.stop
                />
                <button class="remove-btn" @click.stop="removeElement(enumElement.id)">×</button>
              </div>
              
              <div class="enum-content">
                <div class="values-section">
                  <div class="section-subtitle">Values</div>
                  <div class="values-list">
                    <div 
                      v-for="value in enumElement.values" 
                      :key="value.id" 
                      class="value-item"
                    >
                      <span class="value-number">{{ value.number }}</span>
                      <input 
                        v-model="value.name" 
                        class="value-name-input" 
                        placeholder="Value name"
                        @click.stop
                      />
                      <button class="value-remove" @click.stop="removeValue(enumElement, value.id)">×</button>
                    </div>
                    <button class="add-value-btn" @click.stop="addValue(enumElement)">
                      + Add Value
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSchemaStore } from '../store/schema';
import type { Message, Enum, Service, TopLevelElement } from '../store/schema';
import { storeToRefs } from 'pinia';

const schema = useSchemaStore();
const { elements } = storeToRefs(schema);

const selectedElement = ref<TopLevelElement | null>(null);
const draggedElement = ref<{ element: TopLevelElement; type: string } | null>(null);

// Computed properties to filter elements by type
const messages = computed(() => elements.value.filter(el => 'fields' in el) as Message[]);
const services = computed(() => elements.value.filter(el => 'methods' in el) as Service[]);
const enums = computed(() => elements.value.filter(el => 'values' in el) as Enum[]);

// Drag and drop functionality
function startDrag(event: DragEvent, element: TopLevelElement, type: string) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', element.id);
    draggedElement.value = { element, type };
  }
}

function dropOn(event: DragEvent, targetElement: TopLevelElement, targetType: string) {
  event.preventDefault();
  if (!draggedElement.value) return;
  
  const { element: draggedEl, type: draggedType } = draggedElement.value;
  
  // Only allow reordering within the same type
  if (draggedType === targetType && draggedEl.id !== targetElement.id) {
    const draggedIndex = elements.value.findIndex(el => el.id === draggedEl.id);
    const targetIndex = elements.value.findIndex(el => el.id === targetElement.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newElements = [...elements.value];
      const [movedElement] = newElements.splice(draggedIndex, 1);
      newElements.splice(targetIndex, 0, movedElement);
      schema.$patch({ elements: newElements });
    }
  }
  
  draggedElement.value = null;
}

// Proto linting and validation
function validateServiceName(service: Service) {
  // Service names should be PascalCase
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
  if (!pascalCaseRegex.test(service.name)) {
    return 'Service names should be PascalCase';
  }
  return null;
}

function validateMethodName(method: any) {
  const methodName = method.name;
  const inputType = method.inputType;
  const outputType = method.outputType;
  
  // Check if method name follows RPC naming convention
  if (methodName && inputType && outputType) {
    const expectedRequestName = `${methodName}Request`;
    const expectedResponseName = `${methodName}Response`;
    
    if (inputType !== expectedRequestName) {
      return `Request message should be named "${expectedRequestName}"`;
    }
    
    if (outputType !== expectedResponseName) {
      return `Response message should be named "${expectedResponseName}"`;
    }
  }
  
  // Check if referenced messages exist
  if (inputType && !messages.value.find(m => m.name === inputType)) {
    return `Request message "${inputType}" does not exist`;
  }
  
  if (outputType && !messages.value.find(m => m.name === outputType)) {
    return `Response message "${outputType}" does not exist`;
  }
  
  return null;
}

function getMethodValidationStatus(method: any) {
  return validateMethodName(method);
}

// Element creation functions
function addService() {
  const service: Service = {
    id: `svc-${Date.now()}`,
    name: 'NewService',
    methods: [],
    comment: ''
  };
  schema.addElement(service);
  selectedElement.value = service;
}

function addMessage() {
  const message: Message = {
    id: `msg-${Date.now()}`,
    name: 'NewMessage',
    fields: [],
    messages: [],
    enums: [],
    comment: ''
  };
  schema.addElement(message);
  selectedElement.value = message;
}

function addEnum() {
  const enumElement: Enum = {
    id: `enum-${Date.now()}`,
    name: 'NewEnum',
    values: [],
    comment: ''
  };
  schema.addElement(enumElement);
  selectedElement.value = enumElement;
}

// Field management
function addField(message: Message) {
  const nextNum = message.fields.length ? Math.max(...message.fields.map(f => f.number)) + 1 : 1;
  message.fields.push({
    id: `field-${Date.now()}`,
    name: `field${nextNum}`,
    type: 'string',
    number: nextNum,
    label: undefined,
    comment: ''
  });
}

function removeField(message: Message, fieldId: string) {
  const index = message.fields.findIndex(f => f.id === fieldId);
  if (index > -1) {
    message.fields.splice(index, 1);
  }
}

// Method management
function addMethod(service: Service) {
  service.methods.push({
    id: `rpc-${Date.now()}`,
    name: `Method${service.methods.length + 1}`,
    inputType: '',
    outputType: '',
    clientStreaming: false,
    serverStreaming: false,
    comment: ''
  });
}

function removeMethod(service: Service, methodId: string) {
  const index = service.methods.findIndex(m => m.id === methodId);
  if (index > -1) {
    service.methods.splice(index, 1);
  }
}

// Value management
function addValue(enumElement: Enum) {
  const nextNum = enumElement.values.length ? Math.max(...enumElement.values.map(v => v.number)) + 1 : 0;
  enumElement.values.push({
    id: `value-${Date.now()}`,
    name: `VALUE_${nextNum}`,
    number: nextNum,
    comment: ''
  });
}

function removeValue(enumElement: Enum, valueId: string) {
  const index = enumElement.values.findIndex(v => v.id === valueId);
  if (index > -1) {
    enumElement.values.splice(index, 1);
  }
}

// Element selection and removal
function selectElement(element: TopLevelElement) {
  selectedElement.value = element;
}

function removeElement(elementId: string) {
  schema.removeElement(elementId);
  if (selectedElement.value?.id === elementId) {
    selectedElement.value = null;
  }
}
</script>

<style scoped>
.canvas-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  width: 100%;
  box-sizing: border-box;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
}

.canvas-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.canvas-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #2563eb;
}

.canvas-workspace {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.primary-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #2563eb;
}

.schema-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.schema-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.services-section {
  border-left: 4px solid #10b981;
}

.messages-section {
  border-left: 4px solid #3b82f6;
}

.enums-section {
  border-left: 4px solid #f59e0b;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
}

.section-icon {
  font-size: 1.25rem;
}

.services-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.service-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: move;
  width: 100%;
  box-sizing: border-box;
}

.service-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.service-card.selected {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.service-icon {
  font-size: 1.25rem;
}

.service-title {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
}

.service-title:focus {
  background: #f1f5f9;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
}

.rpc-methods {
  margin-top: 1rem;
}

.section-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rpc-method {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.method-name {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  min-width: 150px;
}

.method-name:focus {
  background: #f1f5f9;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.validation-icon {
  font-size: 0.875rem;
}

.validation-message {
  white-space: nowrap;
}

.method-signature {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.input-section, .output-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 150px;
}

.input-section label, .output-section label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.message-select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: white;
  outline: none;
}

.message-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.arrow {
  color: #64748b;
  font-weight: bold;
  font-size: 1.25rem;
}

.streaming-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stream-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
}

.stream-option input[type="checkbox"] {
  margin: 0;
}

.messages-grid, .enums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.message-card, .enum-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.message-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.message-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.enum-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
}

.enum-card.selected {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.message-header, .enum-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.message-icon, .enum-icon {
  font-size: 1.25rem;
}

.message-title, .enum-title {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
}

.message-title:focus, .enum-title:focus {
  background: #f1f5f9;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: #fef2f2;
}

.message-content, .enum-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fields-list, .values-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-item, .value-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.875rem;
}

.field-number, .value-number {
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

.field-type-select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: white;
  outline: none;
  min-width: 80px;
}

.field-type-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.field-name-input, .value-name-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  min-width: 0;
}

.field-name-input:focus, .value-name-input:focus {
  background: white;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem -0.5rem;
}

.field-remove, .value-remove, .method-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 2px;
  transition: background 0.2s;
}

.field-remove:hover, .value-remove:hover, .method-remove:hover {
  background: #fef2f2;
}

.add-field-btn, .add-value-btn, .add-method-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-field-btn:hover, .add-value-btn:hover, .add-method-btn:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
  color: #475569;
}
</style> 