import type { CadDocument, CadEntity } from './autocad-llm-sync.types';

/**
 * Parse DXF file content to JSON
 * Uses dxf-parser library when available, falls back to basic parsing
 */
export function parseDxfToJson(fileContent: string): CadDocument {
  try {
    // Try to use dxf-parser if available
    // @ts-ignore - dxf-parser will be installed later
    if (typeof DxfParser !== 'undefined') {
      // @ts-ignore
      const parser = new DxfParser();
      const dxf = parser.parse(fileContent);
      
      return {
        entities: dxf.entities || [],
        header: dxf.header,
        tables: dxf.tables,
        blocks: dxf.blocks,
        metadata: {
          version: 1,
          lastModified: new Date().toISOString(),
        },
      };
    }
    
    // Fallback: Basic DXF parsing
    return parseBasicDxf(fileContent);
  }
  catch (err: any) {
    throw new Error(`Failed to parse DXF file: ${err.message}`);
  }
}

/**
 * Basic DXF parser (fallback when dxf-parser is not available)
 * Supports LINE and INSERT entities
 */
function parseBasicDxf(fileContent: string): CadDocument {
  const lines = fileContent.split('\n').map(line => line.trim());
  const entities: CadEntity[] = [];
  
  let i = 0;
  let inEntitiesSection = false;
  
  while (i < lines.length) {
    const code = lines[i];
    const value = lines[i + 1];
    
    // Check for ENTITIES section
    if (code === '0' && value === 'SECTION') {
      if (lines[i + 2] === '2' && lines[i + 3] === 'ENTITIES') {
        inEntitiesSection = true;
        i += 4;
        continue;
      }
    }
    
    // Check for end of ENTITIES section
    if (code === '0' && value === 'ENDSEC' && inEntitiesSection) {
      inEntitiesSection = false;
      i += 2;
      continue;
    }
    
    // Parse entities
    if (inEntitiesSection && code === '0') {
      if (value === 'LINE') {
        const entity = parseLine(lines, i);
        if (entity)
          entities.push(entity);
      }
      else if (value === 'INSERT') {
        const entity = parseInsert(lines, i);
        if (entity)
          entities.push(entity);
      }
    }
    
    i += 2;
  }
  
  return {
    entities,
    metadata: {
      version: 1,
      lastModified: new Date().toISOString(),
    },
  };
}

function parseLine(lines: string[], startIndex: number): CadEntity | null {
  const entity: CadEntity = {
    type: 'LINE',
    layer: '0',
    start: [0, 0, 0],
    end: [0, 0, 0],
  };
  
  let i = startIndex + 2;
  while (i < lines.length && lines[i] !== '0') {
    const code = lines[i];
    const value = lines[i + 1];
    
    if (code === '8')
      entity.layer = value;
    else if (code === '10')
      entity.start![0] = Number.parseFloat(value);
    else if (code === '20')
      entity.start![1] = Number.parseFloat(value);
    else if (code === '30')
      entity.start![2] = Number.parseFloat(value);
    else if (code === '11')
      entity.end![0] = Number.parseFloat(value);
    else if (code === '21')
      entity.end![1] = Number.parseFloat(value);
    else if (code === '31')
      entity.end![2] = Number.parseFloat(value);
    
    i += 2;
  }
  
  return entity;
}

function parseInsert(lines: string[], startIndex: number): CadEntity | null {
  const entity: CadEntity = {
    type: 'INSERT',
    layer: '0',
    block: '',
    insertion_point: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: 0,
  };
  
  let i = startIndex + 2;
  while (i < lines.length && lines[i] !== '0') {
    const code = lines[i];
    const value = lines[i + 1];
    
    if (code === '2')
      entity.block = value;
    else if (code === '8')
      entity.layer = value;
    else if (code === '10')
      entity.insertion_point![0] = Number.parseFloat(value);
    else if (code === '20')
      entity.insertion_point![1] = Number.parseFloat(value);
    else if (code === '30')
      entity.insertion_point![2] = Number.parseFloat(value);
    else if (code === '41')
      entity.scale![0] = Number.parseFloat(value);
    else if (code === '42')
      entity.scale![1] = Number.parseFloat(value);
    else if (code === '43')
      entity.scale![2] = Number.parseFloat(value);
    
    i += 2;
  }
  
  return entity;
}

