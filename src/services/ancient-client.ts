// CLIENTE FRONTEND ULTRA EFICIENTE
// Usa los 72 símbolos antiguos para comunicación minimalista

// ═══════════════════════════════════════════════════════════════════
// MAPEO DE OPERACIONES A SÍMBOLOS
// ═══════════════════════════════════════════════════════════════════
const OPS_TO_SYMBOLS: Record<string, string> = {
  // PRIMORDIALES
  'execute': '🜂',
  'flow': '🜄',
  'transmit': '🜁',
  'store': '🜃',
  
  // CELESTIALES
  'illuminate': '☉',
  'reflect': '☽',
  'communicate': '☿',
  'harmonize': '♀',
  'enforce': '♂',
  'expand': '♃',
  'limit': '♄',
  
  // METÁLICOS
  'perfect': '🜚',
  'purify': '🜛',
  'transform': '🜨',
  'conduct': '🜩',
  'strengthen': '🜪',
  'stabilize': '🜫',
  'compress': '🜬',
  
  // GEOMÉTRICOS
  'trinity': '△',
  'receive': '▽',
  'foundation': '□',
  'balance': '◇',
  'harmony': '⬡',
  'structure': '⬢',
  'infinite': '○',
  'center': '◉',
  'cycle': '◎',
  'unite': '⊕',
  'multiply': '⊗',
  'focus': '⊙',
  
  // HEBREOS
  'begin': 'א',
  'build': 'ב',
  'give': 'ג',
  'door': 'ד',
  'reveal': 'ה',
  'connect': 'ו',
  'weapon': 'ז',
  'fence': 'ח',
  'good': 'ט',
  'hand': 'י',
  'palm': 'כ',
  'learn': 'ל',
  'water_h': 'מ',
  'fish': 'נ',
  'support': 'ס',
  'eye': 'ע',
  'mouth': 'פ',
  'righteous': 'צ',
  'holy': 'ק',
  'head': 'ר',
  'tooth': 'ש',
  'mark': 'ת',
  
  // RÚNICOS
  'wealth': 'ᚠ',
  'strength': 'ᚢ',
  'giant': 'ᚦ',
  'god': 'ᚨ',
  'journey': 'ᚱ',
  'torch': 'ᚲ',
  'gift': 'ᚷ',
  'joy': 'ᚹ',
  'hail': 'ᚺ',
  'need': 'ᚾ',
  'ice': 'ᛁ',
  'year': 'ᛃ',
  'yew': 'ᛇ',
  'lot': 'ᛈ',
  'elk': 'ᛉ',
  'sun': 'ᛊ',
  'tyr': 'ᛏ',
  'birch': 'ᛒ',
  'horse': 'ᛖ',
  'man': 'ᛗ'
};

// ═══════════════════════════════════════════════════════════════════
// PROPORCIONES DIVINAS (Cliente)
// ═══════════════════════════════════════════════════════════════════
const PHI = 1.618033988749895;
const PI = 3.141592653589793;

// ═══════════════════════════════════════════════════════════════════
// CLASE CLIENTE ANTIGUA
// ═══════════════════════════════════════════════════════════════════
export class AncientClient {
  private endpoint: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number;

  constructor(endpoint = '/.netlify/functions/ancient-symbols') {
    this.endpoint = endpoint;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // ═══════════════════════════════════════════════════════════════════
  // EJECUTAR OPERACIÓN
  // ═══════════════════════════════════════════════════════════════════
  async execute(operation: string, data?: any): Promise<any> {
    const cacheKey = `${operation}:${JSON.stringify(data)}`;
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, data })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Guardar en cache
      this.cache.set(cacheKey, {
        data: result.result,
        timestamp: Date.now()
      });

      return result.result;
    } catch (error) {
      console.error('Ancient operation failed:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // OPERACIONES PRIMORDIALES
  // ═══════════════════════════════════════════════════════════════════
  async fire(data?: any) { return this.execute('execute', data); }
  async water(data?: any) { return this.execute('flow', data); }
  async air(data?: any) { return this.execute('transmit', data); }
  async earth(data?: any) { return this.execute('store', data); }

  // ═══════════════════════════════════════════════════════════════════
  // OPERACIONES CELESTIALES
  // ═══════════════════════════════════════════════════════════════════
  async sun(data?: any) { return this.execute('illuminate', data); }
  async moon(data?: any) { return this.execute('reflect', data); }
  async mercury(data?: any) { return this.execute('communicate', data); }
  async venus(data?: any) { return this.execute('harmonize', data); }
  async mars(data?: any) { return this.execute('enforce', data); }
  async jupiter(data?: any) { return this.execute('expand', data); }
  async saturn(data?: any) { return this.execute('limit', data); }

  // ═══════════════════════════════════════════════════════════════════
  // OPERACIONES METÁLICAS
  // ═══════════════════════════════════════════════════════════════════
  async gold(data?: any) { return this.execute('perfect', data); }
  async silver(data?: any) { return this.execute('purify', data); }
  async quicksilver(data?: any) { return this.execute('transform', data); }
  async copper(data?: any) { return this.execute('conduct', data); }
  async iron(data?: any) { return this.execute('strengthen', data); }
  async tin(data?: any) { return this.execute('stabilize', data); }
  async lead(data?: any) { return this.execute('compress', data); }

  // ═══════════════════════════════════════════════════════════════════
  // BATCH: Ejecutar múltiples operaciones
  // ═══════════════════════════════════════════════════════════════════
  async batch(operations: Array<{ op: string; data?: any }>): Promise<any[]> {
    return Promise.all(
      operations.map(({ op, data }) => this.execute(op, data))
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // LIMPIAR CACHE
  // ═══════════════════════════════════════════════════════════════════
  clearCache() {
    this.cache.clear();
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBTENER SÍMBOLO
  // ═══════════════════════════════════════════════════════════════════
  getSymbol(operation: string): string {
    return OPS_TO_SYMBOLS[operation] || '?';
  }

  // ═══════════════════════════════════════════════════════════════════
  // CODIFICAR LOCAL (sin servidor)
  // ═══════════════════════════════════════════════════════════════════
  encodeLocal(operation: string, data?: any): string {
    const symbol = OPS_TO_SYMBOLS[operation];
    if (!symbol) throw new Error(`Unknown operation: ${operation}`);
    
    if (data) {
      const json = JSON.stringify(data);
      const compressed = this.compressLocal(json);
      return `${symbol}${compressed}`;
    }
    
    return symbol;
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPRIMIR LOCAL
  // ═══════════════════════════════════════════════════════════════════
  private compressLocal(text: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const compressed: number[] = [];
    
    for (let i = 0; i < bytes.length; i++) {
      const transformed = Math.floor(bytes[i] * PHI) % 256;
      compressed.push(transformed);
    }
    
    return btoa(String.fromCharCode(...compressed));
  }

  // ═══════════════════════════════════════════════════════════════════
  // DESCOMPRIMIR LOCAL
  // ═══════════════════════════════════════════════════════════════════
  private decompressLocal(compressed: string): string {
    const decoded = atob(compressed);
    const bytes = new Uint8Array(decoded.length);
    
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    const decompressed: number[] = [];
    
    for (let i = 0; i < bytes.length; i++) {
      const original = Math.floor(bytes[i] / PHI) % 256;
      decompressed.push(original);
    }
    
    return new TextDecoder().decode(new Uint8Array(decompressed));
  }
}

// ═══════════════════════════════════════════════════════════════════
// INSTANCIA GLOBAL
// ═══════════════════════════════════════════════════════════════════
export const ancient = new AncientClient();

// ═══════════════════════════════════════════════════════════════════
// HELPERS RÁPIDOS (comentados por errores de sintaxis TypeScript)
// ═══════════════════════════════════════════════════════════════════
// Los símbolos Unicode no pueden ser nombres de variables en TypeScript
// Usar: ancient.fire(), ancient.water(), etc.

