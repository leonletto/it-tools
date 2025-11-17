import type { CadDocument, CadEntity } from './autocad-llm-sync.types';

/**
 * Convert JSON CAD document to DXF format
 */
export function jsonToDxf(document: CadDocument): string {
  const sections: string[] = [];
  
  // Header section
  sections.push(dxfHeader());
  
  // Tables section (layers)
  sections.push(dxfTables(document));
  
  // Entities section
  sections.push(dxfEntities(document.entities));
  
  // EOF
  sections.push('0\nEOF\n');
  
  return sections.join('');
}

/**
 * Generate DXF header section
 */
function dxfHeader(): string {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
0
0
ENDSEC
`;
}

/**
 * Generate DXF tables section with layers
 */
function dxfTables(document: CadDocument): string {
  // Collect unique layers
  const layers = new Set<string>();
  layers.add('0'); // Default layer
  
  for (const entity of document.entities) {
    if (entity.layer) {
      layers.add(entity.layer);
    }
  }
  
  let tables = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
${layers.size}
`;
  
  // Add each layer
  for (const layer of layers) {
    tables += `0
LAYER
2
${layer}
70
0
62
7
6
CONTINUOUS
`;
  }
  
  tables += `0
ENDTAB
0
ENDSEC
`;
  
  return tables;
}

/**
 * Generate DXF entities section
 */
function dxfEntities(entities: CadEntity[]): string {
  let section = `0
SECTION
2
ENTITIES
`;
  
  for (const entity of entities) {
    const dxf = entityToDxf(entity);
    if (dxf) {
      section += dxf;
    }
  }
  
  section += `0
ENDSEC
`;
  
  return section;
}

/**
 * Convert a single entity to DXF format
 */
function entityToDxf(entity: CadEntity): string | null {
  switch (entity.type) {
    case 'LINE':
      return lineToDxf(entity);
    case 'INSERT':
      return insertToDxf(entity);
    case 'CIRCLE':
      return circleToDxf(entity);
    default:
      return null; // Unsupported entity type
  }
}

/**
 * Convert LINE entity to DXF
 */
function lineToDxf(entity: CadEntity): string {
  const start = entity.start || [0, 0, 0];
  const end = entity.end || [0, 0, 0];
  const layer = entity.layer || '0';
  
  return `0
LINE
8
${layer}
10
${start[0]}
20
${start[1]}
30
${start[2]}
11
${end[0]}
21
${end[1]}
31
${end[2]}
`;
}

/**
 * Convert INSERT entity to DXF
 */
function insertToDxf(entity: CadEntity): string {
  const insertionPoint = entity.insertion_point || [0, 0, 0];
  const scale = entity.scale || [1, 1, 1];
  const rotation = entity.rotation || 0;
  const blockName = entity.block || 'UNKNOWN';
  const layer = entity.layer || '0';
  
  return `0
INSERT
2
${blockName}
8
${layer}
10
${insertionPoint[0]}
20
${insertionPoint[1]}
30
${insertionPoint[2]}
41
${scale[0]}
42
${scale[1]}
43
${scale[2]}
50
${rotation}
`;
}

/**
 * Convert CIRCLE entity to DXF
 */
function circleToDxf(entity: CadEntity): string {
  const center = entity.center || { x: 0, y: 0, z: 0 };
  const radius = entity.radius || 1;
  const layer = entity.layer || '0';
  
  return `0
CIRCLE
8
${layer}
10
${center.x}
20
${center.y}
30
${center.z}
40
${radius}
`;
}

