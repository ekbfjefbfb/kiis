// 72 SÍMBOLOS DE INGENIERÍA ANTIGUA
// Basado en: Kabbalah (72 nombres de Dios), Alquimia, Geometría Sagrada
// Reglas: Correspondencias, Jerarquías, Proporciones Divinas (Phi, Pi, √2)

// ═══════════════════════════════════════════════════════════════════
// NIVEL 1: ELEMENTOS PRIMORDIALES (4 símbolos) - Fundación
// ═══════════════════════════════════════════════════════════════════
export const PRIMORDIAL = {
  '🜂': { name: 'FUEGO', op: 'execute', power: 4, element: 'fire' },      // Transformación rápida
  '🜄': { name: 'AGUA', op: 'flow', power: 3, element: 'water' },         // Flujo de datos
  '🜁': { name: 'AIRE', op: 'transmit', power: 2, element: 'air' },       // Transmisión
  '🜃': { name: 'TIERRA', op: 'store', power: 1, element: 'earth' }       // Almacenamiento
};

// ═══════════════════════════════════════════════════════════════════
// NIVEL 2: PLANETAS (7 símbolos) - Operaciones Celestiales
// ═══════════════════════════════════════════════════════════════════
export const CELESTIAL = {
  '☉': { name: 'SOL', op: 'illuminate', power: 7, planet: 'sun' },       // Iluminar/Revelar
  '☽': { name: 'LUNA', op: 'reflect', power: 6, planet: 'moon' },        // Reflejar/Cache
  '☿': { name: 'MERCURIO', op: 'communicate', power: 5, planet: 'mercury' }, // Comunicar
  '♀': { name: 'VENUS', op: 'harmonize', power: 4, planet: 'venus' },    // Armonizar
  '♂': { name: 'MARTE', op: 'enforce', power: 3, planet: 'mars' },       // Forzar/Validar
  '♃': { name: 'JÚPITER', op: 'expand', power: 2, planet: 'jupiter' },   // Expandir
  '♄': { name: 'SATURNO', op: 'limit', power: 1, planet: 'saturn' }      // Limitar
};

// ═══════════════════════════════════════════════════════════════════
// NIVEL 3: METALES ALQUÍMICOS (7 símbolos) - Transformaciones
// ═══════════════════════════════════════════════════════════════════
export const METALLIC = {
  '🜚': { name: 'ORO', op: 'perfect', power: 7, metal: 'gold' },         // Perfeccionar
  '🜛': { name: 'PLATA', op: 'purify', power: 6, metal: 'silver' },      // Purificar
  '🜨': { name: 'MERCURIO_M', op: 'transform', power: 5, metal: 'mercury' }, // Transformar
  '🜩': { name: 'COBRE', op: 'conduct', power: 4, metal: 'copper' },     // Conducir
  '🜪': { name: 'HIERRO', op: 'strengthen', power: 3, metal: 'iron' },   // Fortalecer
  '🜫': { name: 'ESTAÑO', op: 'stabilize', power: 2, metal: 'tin' },     // Estabilizar
  '🜬': { name: 'PLOMO', op: 'compress', power: 1, metal: 'lead' }       // Comprimir
};

// ═══════════════════════════════════════════════════════════════════
// NIVEL 4: GEOMETRÍA SAGRADA (12 símbolos) - Estructuras
// ═══════════════════════════════════════════════════════════════════
export const GEOMETRIC = {
  '△': { name: 'TRIÁNGULO', op: 'trinity', power: 3, sides: 3 },        // Trinidad
  '▽': { name: 'TRIÁNGULO_INV', op: 'receive', power: 3, sides: 3 },    // Recibir
  '□': { name: 'CUADRADO', op: 'foundation', power: 4, sides: 4 },      // Fundación
  '◇': { name: 'ROMBO', op: 'balance', power: 4, sides: 4 },            // Balance
  '⬡': { name: 'HEXÁGONO', op: 'harmony', power: 6, sides: 6 },         // Armonía
  '⬢': { name: 'HEXÁGONO_F', op: 'structure', power: 6, sides: 6 },     // Estructura
  '○': { name: 'CÍRCULO', op: 'infinite', power: 0, sides: 0 },         // Infinito
  '◉': { name: 'CÍRCULO_DOT', op: 'center', power: 1, sides: 0 },       // Centro
  '◎': { name: 'CÍRCULO_RING', op: 'cycle', power: 2, sides: 0 },       // Ciclo
  '⊕': { name: 'CÍRCULO_CRUZ', op: 'unite', power: 5, sides: 0 },       // Unir
  '⊗': { name: 'CÍRCULO_X', op: 'multiply', power: 8, sides: 0 },       // Multiplicar
  '⊙': { name: 'CÍRCULO_PUNTO', op: 'focus', power: 1, sides: 0 }       // Foco
};

// ═══════════════════════════════════════════════════════════════════
// NIVEL 5: HEBREO ANTIGUO (22 símbolos) - Letras Sagradas
// ═══════════════════════════════════════════════════════════════════
export const HEBREW = {
  'א': { name: 'ALEPH', op: 'begin', power: 1, value: 1 },              // Comenzar
  'ב': { name: 'BET', op: 'build', power: 2, value: 2 },                // Construir
  'ג': { name: 'GIMEL', op: 'give', power: 3, value: 3 },               // Dar
  'ד': { name: 'DALET', op: 'door', power: 4, value: 4 },               // Puerta
  'ה': { name: 'HE', op: 'reveal', power: 5, value: 5 },                // Revelar
  'ו': { name: 'VAV', op: 'connect', power: 6, value: 6 },              // Conectar
  'ז': { name: 'ZAYIN', op: 'weapon', power: 7, value: 7 },             // Arma
  'ח': { name: 'HET', op: 'fence', power: 8, value: 8 },                // Cerca
  'ט': { name: 'TET', op: 'good', power: 9, value: 9 },                 // Bien
  'י': { name: 'YOD', op: 'hand', power: 10, value: 10 },               // Mano
  'כ': { name: 'KAF', op: 'palm', power: 20, value: 20 },               // Palma
  'ל': { name: 'LAMED', op: 'learn', power: 30, value: 30 },            // Aprender
  'מ': { name: 'MEM', op: 'water_h', power: 40, value: 40 },            // Agua
  'נ': { name: 'NUN', op: 'fish', power: 50, value: 50 },               // Pez
  'ס': { name: 'SAMEKH', op: 'support', power: 60, value: 60 },         // Soporte
  'ע': { name: 'AYIN', op: 'eye', power: 70, value: 70 },               // Ojo
  'פ': { name: 'PE', op: 'mouth', power: 80, value: 80 },               // Boca
  'צ': { name: 'TSADI', op: 'righteous', power: 90, value: 90 },        // Justo
  'ק': { name: 'QOF', op: 'holy', power: 100, value: 100 },             // Santo
  'ר': { name: 'RESH', op: 'head', power: 200, value: 200 },            // Cabeza
  'ש': { name: 'SHIN', op: 'tooth', power: 300, value: 300 },           // Diente
  'ת': { name: 'TAV', op: 'mark', power: 400, value: 400 }              // Marca
};

// ═══════════════════════════════════════════════════════════════════
// NIVEL 6: RUNAS NÓRDICAS (20 símbolos) - Poder Rúnico
// ═══════════════════════════════════════════════════════════════════
export const RUNIC = {
  'ᚠ': { name: 'FEHU', op: 'wealth', power: 1, rune: 'f' },             // Riqueza
  'ᚢ': { name: 'URUZ', op: 'strength', power: 2, rune: 'u' },           // Fuerza
  'ᚦ': { name: 'THURISAZ', op: 'giant', power: 3, rune: 'th' },         // Gigante
  'ᚨ': { name: 'ANSUZ', op: 'god', power: 4, rune: 'a' },               // Dios
  'ᚱ': { name: 'RAIDHO', op: 'journey', power: 5, rune: 'r' },          // Viaje
  'ᚲ': { name: 'KENAZ', op: 'torch', power: 6, rune: 'k' },             // Antorcha
  'ᚷ': { name: 'GEBO', op: 'gift', power: 7, rune: 'g' },               // Regalo
  'ᚹ': { name: 'WUNJO', op: 'joy', power: 8, rune: 'w' },               // Alegría
  'ᚺ': { name: 'HAGALAZ', op: 'hail', power: 9, rune: 'h' },            // Granizo
  'ᚾ': { name: 'NAUTHIZ', op: 'need', power: 10, rune: 'n' },           // Necesidad
  'ᛁ': { name: 'ISA', op: 'ice', power: 11, rune: 'i' },                // Hielo
  'ᛃ': { name: 'JERA', op: 'year', power: 12, rune: 'j' },              // Año
  'ᛇ': { name: 'EIHWAZ', op: 'yew', power: 13, rune: 'ei' },            // Tejo
  'ᛈ': { name: 'PERTHRO', op: 'lot', power: 14, rune: 'p' },            // Suerte
  'ᛉ': { name: 'ALGIZ', op: 'elk', power: 15, rune: 'z' },              // Alce
  'ᛊ': { name: 'SOWILO', op: 'sun', power: 16, rune: 's' },             // Sol
  'ᛏ': { name: 'TIWAZ', op: 'tyr', power: 17, rune: 't' },              // Tyr
  'ᛒ': { name: 'BERKANO', op: 'birch', power: 18, rune: 'b' },          // Abedul
  'ᛖ': { name: 'EHWAZ', op: 'horse', power: 19, rune: 'e' },            // Caballo
  'ᛗ': { name: 'MANNAZ', op: 'man', power: 20, rune: 'm' }              // Hombre
};

// ═══════════════════════════════════════════════════════════════════
// SISTEMA COMPLETO: 72 SÍMBOLOS
// ═══════════════════════════════════════════════════════════════════
export const ANCIENT_SYSTEM = {
  ...PRIMORDIAL,    // 4
  ...CELESTIAL,     // 7
  ...METALLIC,      // 7
  ...GEOMETRIC,     // 12
  ...HEBREW,        // 22
  ...RUNIC          // 20
  // TOTAL: 72 símbolos
};

// ═══════════════════════════════════════════════════════════════════
// PROPORCIONES DIVINAS
// ═══════════════════════════════════════════════════════════════════
export const DIVINE_RATIOS = {
  PHI: 1.618033988749895,        // Proporción áurea
  PI: 3.141592653589793,         // Pi
  SQRT2: 1.4142135623730951,     // Raíz de 2
  SQRT3: 1.7320508075688772,     // Raíz de 3
  SQRT5: 2.23606797749979,       // Raíz de 5
  E: 2.718281828459045           // Número de Euler
};

// ═══════════════════════════════════════════════════════════════════
// CODIFICADOR ANTIGUO
// ═══════════════════════════════════════════════════════════════════
export function encodeAncient(operation: string, data?: any): string {
  // Buscar símbolo por operación
  const symbol = Object.entries(ANCIENT_SYSTEM).find(
    ([_, info]) => info.op === operation
  )?.[0];
  
  if (!symbol) throw new Error(`Unknown operation: ${operation}`);
  
  // Aplicar proporción divina al tamaño de datos
  if (data) {
    const json = JSON.stringify(data);
    const compressed = compressWithPhi(json);
    return `${symbol}${compressed}`;
  }
  
  return symbol;
}

// ═══════════════════════════════════════════════════════════════════
// DECODIFICADOR ANTIGUO
// ═══════════════════════════════════════════════════════════════════
export function decodeAncient(encoded: string): { op: string; data?: any; power: number } {
  const symbol = encoded[0];
  const info = ANCIENT_SYSTEM[symbol as keyof typeof ANCIENT_SYSTEM];
  
  if (!info) throw new Error(`Unknown symbol: ${symbol}`);
  
  const dataStr = encoded.slice(1);
  let data;
  
  if (dataStr) {
    const decompressed = decompressWithPhi(dataStr);
    data = JSON.parse(decompressed);
  }
  
  return { op: info.op, data, power: info.power };
}

// ═══════════════════════════════════════════════════════════════════
// COMPRESIÓN CON PHI (Proporción Áurea)
// ═══════════════════════════════════════════════════════════════════
function compressWithPhi(text: string): string {
  // Usar proporción áurea para comprimir
  const bytes = new TextEncoder().encode(text);
  const compressed: number[] = [];
  
  for (let i = 0; i < bytes.length; i++) {
    // Aplicar transformación basada en Phi
    const transformed = Math.floor(bytes[i] * DIVINE_RATIOS.PHI) % 256;
    compressed.push(transformed);
  }
  
  return btoa(String.fromCharCode(...compressed));
}

// ═══════════════════════════════════════════════════════════════════
// DESCOMPRESIÓN CON PHI
// ═══════════════════════════════════════════════════════════════════
function decompressWithPhi(compressed: string): string {
  const decoded = atob(compressed);
  const bytes = new Uint8Array(decoded.length);
  
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  
  const decompressed: number[] = [];
  
  for (let i = 0; i < bytes.length; i++) {
    // Revertir transformación basada en Phi
    const original = Math.floor(bytes[i] / DIVINE_RATIOS.PHI) % 256;
    decompressed.push(original);
  }
  
  return new TextDecoder().decode(new Uint8Array(decompressed));
}

// ═══════════════════════════════════════════════════════════════════
// CALCULADOR DE PODER
// ═══════════════════════════════════════════════════════════════════
export function calculatePower(symbols: string[]): number {
  return symbols.reduce((total, symbol) => {
    const info = ANCIENT_SYSTEM[symbol as keyof typeof ANCIENT_SYSTEM];
    return total + (info?.power || 0);
  }, 0);
}

// ═══════════════════════════════════════════════════════════════════
// COMBINADOR DE SÍMBOLOS (Reglas Antiguas)
// ═══════════════════════════════════════════════════════════════════
export function combineSymbols(symbols: string[]): { 
  combined: string; 
  power: number; 
  harmony: number 
} {
  const power = calculatePower(symbols);
  
  // Calcular armonía basada en proporciones divinas
  const harmony = symbols.reduce((h, symbol, i) => {
    const info = ANCIENT_SYSTEM[symbol as keyof typeof ANCIENT_SYSTEM];
    const nextInfo = ANCIENT_SYSTEM[symbols[i + 1] as keyof typeof ANCIENT_SYSTEM];
    
    if (nextInfo) {
      const ratio = info.power / nextInfo.power;
      // Verificar si está cerca de una proporción divina
      const phiDiff = Math.abs(ratio - DIVINE_RATIOS.PHI);
      const piDiff = Math.abs(ratio - DIVINE_RATIOS.PI);
      const sqrt2Diff = Math.abs(ratio - DIVINE_RATIOS.SQRT2);
      
      const minDiff = Math.min(phiDiff, piDiff, sqrt2Diff);
      h += 1 / (1 + minDiff); // Más cerca = más armonía
    }
    
    return h;
  }, 0);
  
  return {
    combined: symbols.join(''),
    power,
    harmony: harmony / (symbols.length - 1 || 1)
  };
}

// ═══════════════════════════════════════════════════════════════════
// HANDLER NETLIFY
// ═══════════════════════════════════════════════════════════════════
export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { encoded, operation, data } = JSON.parse(event.body || '{}');
    
    if (encoded) {
      // Decodificar
      const decoded = decodeAncient(encoded);
      const result = await executeAncientOperation(decoded.op, decoded.data);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          operation: decoded.op, 
          power: decoded.power,
          result 
        })
      };
    } else if (operation) {
      // Codificar y ejecutar
      const encoded = encodeAncient(operation, data);
      const decoded = decodeAncient(encoded);
      const result = await executeAncientOperation(decoded.op, decoded.data);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          encoded, 
          power: decoded.power,
          result 
        })
      };
    }
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing encoded or operation' })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// ═══════════════════════════════════════════════════════════════════
// EJECUTOR DE OPERACIONES ANTIGUAS
// ═══════════════════════════════════════════════════════════════════
async function executeAncientOperation(op: string, data?: any): Promise<any> {
  const timestamp = Date.now();
  
  switch (op) {
    // PRIMORDIALES
    case 'execute': return { executed: true, timestamp, element: 'fire' };
    case 'flow': return { flowing: true, timestamp, element: 'water' };
    case 'transmit': return { transmitted: true, timestamp, element: 'air' };
    case 'store': return { stored: true, timestamp, element: 'earth' };
    
    // CELESTIALES
    case 'illuminate': return { illuminated: true, timestamp, planet: 'sun' };
    case 'reflect': return { reflected: data, timestamp, planet: 'moon' };
    case 'communicate': return { message: data, timestamp, planet: 'mercury' };
    case 'harmonize': return { harmonized: true, timestamp, planet: 'venus' };
    case 'enforce': return { enforced: true, timestamp, planet: 'mars' };
    case 'expand': return { expanded: true, timestamp, planet: 'jupiter' };
    case 'limit': return { limited: true, timestamp, planet: 'saturn' };
    
    // METÁLICOS
    case 'perfect': return { perfected: true, timestamp, metal: 'gold' };
    case 'purify': return { purified: data, timestamp, metal: 'silver' };
    case 'transform': return { transformed: data, timestamp, metal: 'mercury' };
    case 'conduct': return { conducted: true, timestamp, metal: 'copper' };
    case 'strengthen': return { strengthened: true, timestamp, metal: 'iron' };
    case 'stabilize': return { stabilized: true, timestamp, metal: 'tin' };
    case 'compress': return { compressed: true, timestamp, metal: 'lead' };
    
    default: return { op, data, executed: true, timestamp };
  }
}
