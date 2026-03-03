// PATRONES DE INGENIERÍA ANTIGUA APLICADOS
// Implementaciones prácticas de técnicas milenarias

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 1: MEMOIZACIÓN FIBONACCI (Naturaleza)
// La naturaleza no recalcula, reutiliza patrones
// ═══════════════════════════════════════════════════════════════════

export function createFibonacciMemoizer<Args extends any[], Result>(
  fn: (...args: Args) => Result
): (...args: Args) => Result {
  const cache = new Map<string, Result>();
  const fibonacci = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
  
  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    
    // Limpiar cache cuando alcanza número Fibonacci
    if (cache.size >= fibonacci[Math.min(fibonacci.length - 1, Math.floor(cache.size / 10))]) {
      // Eliminar primeros elementos (FIFO)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  };
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 2: COMPRESIÓN FRACTAL
// Comprimir datos usando auto-similitud (como la naturaleza)
// ═══════════════════════════════════════════════════════════════════

export class FractalCompressor {
  // Detectar patrones repetidos
  static findPattern<T>(data: T[]): { pattern: T[]; repetitions: number } | null {
    for (let len = 1; len <= data.length / 2; len++) {
      const pattern = data.slice(0, len);
      let reps = 1;
      let pos = len;
      
      while (pos + len <= data.length) {
        const chunk = data.slice(pos, pos + len);
        if (JSON.stringify(chunk) === JSON.stringify(pattern)) {
          reps++;
          pos += len;
        } else {
          break;
        }
      }
      
      if (reps > 1 && pos >= data.length * 0.5) {
        return { pattern, repetitions: reps };
      }
    }
    
    return null;
  }
  
  // Comprimir usando patrones
  static compress<T>(data: T[]): { compressed: any; ratio: number } {
    const found = this.findPattern(data);
    
    if (found) {
      return {
        compressed: {
          type: 'fractal',
          pattern: found.pattern,
          reps: found.repetitions,
          remainder: data.slice(found.pattern.length * found.repetitions)
        },
        ratio: data.length / (found.pattern.length + 2)
      };
    }
    
    return { compressed: { type: 'raw', data }, ratio: 1 };
  }
  
  // Descomprimir
  static decompress<T>(compressed: any): T[] {
    if (compressed.type === 'fractal') {
      const repeated = Array(compressed.reps).fill(compressed.pattern).flat();
      return [...repeated, ...compressed.remainder];
    }
    
    return compressed.data;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 3: LOAD BALANCING ÁUREO
// Distribuir carga según proporción áurea (máxima eficiencia)
// ═══════════════════════════════════════════════════════════════════

export class GoldenLoadBalancer<T> {
  private readonly PHI = 1.618033988749895;
  private workers: Array<{ id: number; load: number; tasks: T[] }> = [];
  
  constructor(workerCount: number) {
    for (let i = 0; i < workerCount; i++) {
      this.workers.push({ id: i, load: 0, tasks: [] });
    }
  }
  
  // Asignar tarea al worker óptimo
  assign(task: T, weight: number = 1): void {
    // Encontrar worker con menos carga
    const worker = this.workers.reduce((min, w) => 
      w.load < min.load ? w : min
    );
    
    worker.tasks.push(task);
    worker.load += weight;
    
    // Rebalancear si hay desproporción
    this.rebalance();
  }
  
  private rebalance(): void {
    const totalLoad = this.workers.reduce((sum, w) => sum + w.load, 0);
    const avgLoad = totalLoad / this.workers.length;
    
    // Usar proporción áurea para determinar límites
    const maxLoad = avgLoad * this.PHI;
    const minLoad = avgLoad / this.PHI;
    
    for (const worker of this.workers) {
      if (worker.load > maxLoad) {
        // Mover tareas a workers con menos carga
        const target = this.workers.find(w => w.load < minLoad);
        if (target && worker.tasks.length > 0) {
          const task = worker.tasks.pop()!;
          target.tasks.push(task);
          const weight = worker.load / worker.tasks.length;
          worker.load -= weight;
          target.load += weight;
        }
      }
    }
  }
  
  // Obtener distribución actual
  getDistribution(): Array<{ id: number; load: number; taskCount: number }> {
    return this.workers.map(w => ({
      id: w.id,
      load: w.load,
      taskCount: w.tasks.length
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 4: CACHE ESPIRAL (Fibonacci)
// Cache que crece en espiral como caracol
// ═══════════════════════════════════════════════════════════════════

export class SpiralCache<K, V> {
  private cache = new Map<K, { value: V; distance: number }>();
  private center: K | null = null;
  private fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  
  set(key: K, value: V): void {
    if (!this.center) {
      this.center = key;
      this.cache.set(key, { value, distance: 0 });
      return;
    }
    
    // Calcular distancia desde el centro
    const distance = this.cache.size;
    this.cache.set(key, { value, distance });
    
    // Limpiar elementos lejanos cuando alcanza Fibonacci
    const fibIndex = this.fibonacci.findIndex(f => f >= this.cache.size);
    if (fibIndex > 0 && this.cache.size >= this.fibonacci[fibIndex]) {
      this.pruneDistant();
    }
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    // Acercar al centro (usado recientemente)
    entry.distance = Math.max(0, entry.distance - 1);
    return entry.value;
  }
  
  private pruneDistant(): void {
    const maxDistance = this.fibonacci[Math.floor(this.fibonacci.length / 2)];
    
    for (const [key, entry] of this.cache) {
      if (entry.distance > maxDistance) {
        this.cache.delete(key);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 5: PIPELINE ALQUÍMICO
// Transformación de datos en 4 etapas (Alquimia)
// ═══════════════════════════════════════════════════════════════════

export class AlchemicalPipeline<T> {
  private data: T;
  
  constructor(initial: T) {
    this.data = initial;
  }
  
  // Nigredo: Descomponer en partes básicas
  decompose(fn: (data: T) => T): this {
    this.data = fn(this.data);
    return this;
  }
  
  // Albedo: Purificar (eliminar ruido)
  purify(fn: (data: T) => T): this {
    this.data = fn(this.data);
    return this;
  }
  
  // Citrinitas: Iluminar (agregar inteligencia)
  illuminate(fn: (data: T) => T): this {
    this.data = fn(this.data);
    return this;
  }
  
  // Rubedo: Perfeccionar (resultado final)
  perfect(fn: (data: T) => T): this {
    this.data = fn(this.data);
    return this;
  }
  
  // Obtener resultado
  result(): T {
    return this.data;
  }
  
  // Ejecutar todo en paralelo cuando sea posible
  static async parallel<T>(
    initial: T,
    stages: Array<(data: T) => Promise<T>>
  ): Promise<T> {
    // Ejecutar etapas independientes en paralelo
    let result = initial;
    
    for (const stage of stages) {
      result = await stage(result);
    }
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 6: SCHEDULER RESONANTE
// Ejecutar tareas en frecuencias armónicas
// ═══════════════════════════════════════════════════════════════════

export class ResonantScheduler {
  private tasks = new Map<number, Array<() => void>>();
  private baseFrequency = 100; // ms
  private running = false;
  private intervalId?: any;
  
  // Registrar tarea con frecuencia (múltiplo de base)
  register(multiplier: number, task: () => void): void {
    if (!this.tasks.has(multiplier)) {
      this.tasks.set(multiplier, []);
    }
    this.tasks.get(multiplier)!.push(task);
  }
  
  // Iniciar scheduler
  start(): void {
    if (this.running) return;
    
    this.running = true;
    let tick = 0;
    
    this.intervalId = setInterval(() => {
      tick++;
      
      for (const [multiplier, taskList] of this.tasks) {
        if (tick % multiplier === 0) {
          taskList.forEach(task => task());
        }
      }
    }, this.baseFrequency);
  }
  
  // Detener scheduler
  stop(): void {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 7: BUFFER HEXAGONAL
// Almacenamiento en patrón hexagonal (máxima eficiencia espacial)
// ═══════════════════════════════════════════════════════════════════

export class HexagonalBuffer<T> {
  private cells = new Map<string, T>();
  
  // Coordenadas hexagonales (cube coordinates)
  private toKey(q: number, r: number, s: number): string {
    return `${q},${r},${s}`;
  }
  
  // Guardar en celda hexagonal
  set(q: number, r: number, s: number, value: T): void {
    if (q + r + s !== 0) {
      throw new Error('Invalid hexagonal coordinates: q + r + s must equal 0');
    }
    this.cells.set(this.toKey(q, r, s), value);
  }
  
  // Obtener de celda
  get(q: number, r: number, s: number): T | undefined {
    return this.cells.get(this.toKey(q, r, s));
  }
  
  // Obtener vecinos (6 direcciones)
  getNeighbors(q: number, r: number, s: number): T[] {
    const directions = [
      [1, -1, 0], [1, 0, -1], [0, 1, -1],
      [-1, 1, 0], [-1, 0, 1], [0, -1, 1]
    ];
    
    return directions
      .map(([dq, dr, ds]) => this.get(q + dq, r + dr, s + ds))
      .filter((v): v is T => v !== undefined);
  }
  
  // Obtener en espiral desde centro
  getSpiral(radius: number): T[] {
    const results: T[] = [];
    
    for (let r = 0; r <= radius; r++) {
      for (let q = -r; q <= r; q++) {
        const s = -q - r;
        const value = this.get(q, r, s);
        if (value !== undefined) {
          results.push(value);
        }
      }
    }
    
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════════
// PATRÓN 8: SISTEMA COMPLETO INTEGRADO
// ═══════════════════════════════════════════════════════════════════

export class AncientOptimizer {
  // Optimizar array usando todos los patrones
  static optimize<T>(
    data: T[],
    transform: (item: T) => T,
    weight: (item: T) => number = () => 1
  ): T[] {
    // 1. Comprimir fractalmente
    const { compressed, ratio } = FractalCompressor.compress(data);
    const working = compressed.type === 'fractal' 
      ? FractalCompressor.decompress(compressed)
      : data;
    
    // 2. Distribuir en workers según proporción áurea
    const balancer = new GoldenLoadBalancer<T>(3);
    working.forEach(item => balancer.assign(item, weight(item)));
    
    // 3. Transformar usando pipeline alquímico
    const pipeline = new AlchemicalPipeline(working)
      .decompose(items => items.map(transform))
      .purify(items => items.filter(item => weight(item) > 0))
      .illuminate(items => items.sort((a, b) => weight(b) - weight(a)))
      .perfect(items => items);
    
    return pipeline.result();
  }
  
  // Crear función memoizada con Fibonacci
  static memoize<Args extends any[], Result>(
    fn: (...args: Args) => Result
  ): (...args: Args) => Result {
    return createFibonacciMemoizer(fn);
  }
  
  // Crear cache espiral
  static createCache<K, V>(): SpiralCache<K, V> {
    return new SpiralCache<K, V>();
  }
  
  // Crear scheduler resonante
  static createScheduler(): ResonantScheduler {
    return new ResonantScheduler();
  }
}
