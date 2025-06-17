import type { TopLevelElement, Service } from '../store/schema';

export function generateMermaid(elements: TopLevelElement[]): string {
  let diagram = 'sequenceDiagram\n';
  // For each service, show a client calling each RPC method
  for (const el of elements) {
    if ('methods' in el) {
      const service = el as Service;
      for (const method of service.methods) {
        diagram += `  participant Client\n`;
        diagram += `  participant ${service.name}\n`;
        diagram += `  Client->>${service.name}: ${method.name}(${method.inputType})\n`;
        diagram += `  ${service.name}-->>Client: ${method.outputType}\n`;
      }
    }
  }
  return diagram.trim() + '\n';
} 