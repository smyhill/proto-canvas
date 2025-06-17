import type { TopLevelElement } from '../store/schema';

export function generateProto3(elements: TopLevelElement[]): string {
  let code = 'syntax = "proto3";\n\n';
  
  // Sort elements: services first, then messages, then enums
  const services = elements.filter(el => 'methods' in el);
  const messages = elements.filter(el => 'fields' in el);
  const enums = elements.filter(el => 'values' in el);
  
  // Generate services first
  for (const el of services) {
    if (el.comment) code += `// ${el.comment}\n`;
    code += `service ${el.name} {\n`;
    for (const method of el.methods) {
      if (method.comment) code += `  // ${method.comment}\n`;
      const client = method.clientStreaming ? 'stream ' : '';
      const server = method.serverStreaming ? 'stream ' : '';
      const inputType = method.inputType || 'google.protobuf.Empty';
      const outputType = method.outputType || 'google.protobuf.Empty';
      code += `  rpc ${method.name} (${client}${inputType}) returns (${server}${outputType});\n`;
    }
    code += '}\n\n';
  }
  
  // Generate messages
  for (const el of messages) {
    if (el.comment) code += `// ${el.comment}\n`;
    code += `message ${el.name} {\n`;
    for (const field of el.fields) {
      if (field.comment) code += `  // ${field.comment}\n`;
      const label = field.label ? field.label + ' ' : '';
      code += `  ${label}${field.type} ${field.name} = ${field.number};\n`;
    }
    code += '}\n\n';
  }
  
  // Generate enums
  for (const el of enums) {
    if (el.comment) code += `// ${el.comment}\n`;
    code += `enum ${el.name} {\n`;
    for (const value of el.values) {
      if (value.comment) code += `  // ${value.comment}\n`;
      code += `  ${value.name} = ${value.number};\n`;
    }
    code += '}\n\n';
  }
  
  return code.trim() + '\n';
}

export function getServiceNameForFile(elements: TopLevelElement[]): string {
  const services = elements.filter(el => 'methods' in el);
  if (services.length === 0) return 'schema';
  
  // Use the first service name, convert to snake_case
  const serviceName = services[0].name;
  return serviceName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '') // Remove leading underscore
    .replace(/__+/g, '_'); // Replace multiple underscores with single
} 