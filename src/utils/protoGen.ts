import type { SchemaElement } from '../store/schema';

export function generateProto3(elements: SchemaElement[]): string {
  let code = 'syntax = "proto3";\n\n';
  for (const el of elements) {
    if ('fields' in el) {
      // Message
      if (el.comment) code += `// ${el.comment}\n`;
      code += `message ${el.name} {\n`;
      for (const field of el.fields) {
        if (field.comment) code += `  // ${field.comment}\n`;
        const label = field.label ? field.label + ' ' : '';
        code += `  ${label}${field.type} ${field.name} = ${field.number};\n`;
      }
      code += '}\n\n';
    } else if ('values' in el) {
      // Enum
      if (el.comment) code += `// ${el.comment}\n`;
      code += `enum ${el.name} {\n`;
      for (const value of el.values) {
        if (value.comment) code += `  // ${value.comment}\n`;
        code += `  ${value.name} = ${value.number};\n`;
      }
      code += '}\n\n';
    } else if ('methods' in el) {
      // Service
      if (el.comment) code += `// ${el.comment}\n`;
      code += `service ${el.name} {\n`;
      for (const method of el.methods) {
        if (method.comment) code += `  // ${method.comment}\n`;
        const client = method.clientStreaming ? 'stream ' : '';
        const server = method.serverStreaming ? 'stream ' : '';
        code += `  rpc ${method.name} (${client}${method.inputType}) returns (${server}${method.outputType});\n`;
      }
      code += '}\n\n';
    }
  }
  return code.trim() + '\n';
} 