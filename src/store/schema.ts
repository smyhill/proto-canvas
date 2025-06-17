import { defineStore } from 'pinia';

// Proto3 schema types
export type ScalarType =
  | 'double' | 'float' | 'int32' | 'int64' | 'uint32' | 'uint64'
  | 'sint32' | 'sint64' | 'fixed32' | 'fixed64' | 'sfixed32' | 'sfixed64'
  | 'bool' | 'string' | 'bytes';

export interface Field {
  id: string;
  name: string;
  type: ScalarType | string; // string for message/enum references
  number: number;
  label?: 'optional' | 'repeated';
  options?: Record<string, any>;
  comment?: string;
}

export interface EnumValue {
  id: string;
  name: string;
  number: number;
  comment?: string;
}

export interface Enum {
  id: string;
  name: string;
  values: EnumValue[];
  comment?: string;
  parentId?: string; // for nesting inside messages
}

export interface Message {
  id: string;
  name: string;
  fields: Field[];
  messages: Message[]; // nested messages
  enums: Enum[]; // nested enums
  comment?: string;
  parentId?: string; // for nesting inside messages
}

export interface RPCMethod {
  id: string;
  name: string;
  inputType: string;
  outputType: string;
  clientStreaming?: boolean;
  serverStreaming?: boolean;
  comment?: string;
  parentId?: string; // for nesting inside services
}

export interface Service {
  id: string;
  name: string;
  methods: RPCMethod[];
  comment?: string;
  parentId?: string; // for future extensibility
}

export type TopLevelElement = Message | Enum | Service | RPCMethod;

export const useSchemaStore = defineStore('schema', {
  state: () => ({
    elements: [] as TopLevelElement[],
  }),
  actions: {
    addElement(element: TopLevelElement, parentId?: string) {
      if (parentId) {
        // Add as nested element
        const parent = this.findElementById(parentId);
        if (parent && 'messages' in parent && elementHasType(element, 'message')) {
          parent.messages.push(element as Message);
        } else if (parent && 'enums' in parent && elementHasType(element, 'enum')) {
          parent.enums.push(element as Enum);
        } else if (parent && 'methods' in parent && elementHasType(element, 'rpcMethod')) {
          parent.methods.push(element as RPCMethod);
        }
      } else {
        this.elements.push(element);
      }
    },
    removeElement(id: string, parentId?: string) {
      if (parentId) {
        const parent = this.findElementById(parentId);
        if (parent && 'messages' in parent) {
          parent.messages = parent.messages.filter(m => m.id !== id);
        }
        if (parent && 'enums' in parent) {
          parent.enums = parent.enums.filter(e => e.id !== id);
        }
        if (parent && 'methods' in parent) {
          parent.methods = parent.methods.filter(m => m.id !== id);
        }
      } else {
        this.elements = this.elements.filter(e => e.id !== id);
      }
    },
    findElementById(id: string): TopLevelElement | undefined {
      // Search top-level
      let found = this.elements.find(e => e.id === id);
      if (found) return found;
      // Search nested messages/enums recursively
      function searchNested(arr: any[]): any | undefined {
        for (const el of arr) {
          if (el.id === id) return el;
          if ('messages' in el) {
            const m = searchNested(el.messages);
            if (m) return m;
          }
          if ('enums' in el) {
            const en = searchNested(el.enums);
            if (en) return en;
          }
          if ('methods' in el) {
            const m = searchNested(el.methods);
            if (m) return m;
          }
        }
        return undefined;
      }
      return searchNested(this.elements);
    },
    reset() {
      this.elements = [];
    },
  },
});

function elementHasType(el: TopLevelElement, type: 'message' | 'enum' | 'service' | 'rpcMethod') {
  if (type === 'message') return 'fields' in el && 'messages' in el && 'enums' in el;
  if (type === 'enum') return 'values' in el;
  if (type === 'service') return 'methods' in el;
  if (type === 'rpcMethod') return 'inputType' in el && 'outputType' in el;
  return false;
} 