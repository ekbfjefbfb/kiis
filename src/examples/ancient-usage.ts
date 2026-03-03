// EJEMPLOS DE USO DE INGENIERÍA ANTIGUA

import { 
  AncientOptimizer,
  FractalCompressor,
  GoldenLoadBalancer,
  SpiralCache,
  AlchemicalPipeline
} from '../core/ancient-patterns';

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 1: Optimizar procesamiento de datos
// ═══════════════════════════════════════════════════════════════════

export function optimizeDataProcessing() {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random() * 100,
    processed: false
  }));
  
  const optimized = AncientOptimizer.optimize(
    data,
    item => ({ ...item, processed: true, value: item.value * 2 }),
    item => item.value
  );
  
  console.log('Optimized:', optimized.length, 'items');
  return optimized;
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 2: Cache inteligente con espiral Fibonacci
// ═══════════════════════════════════════════════════════════════════

export function smartCaching() {
  const cache = AncientOptimizer.createCache<string, any>();
  
  // Guardar datos
  cache.set('user:1', { name: 'John', age: 30 });
  cache.set('user:2', { name: 'Jane', age: 25 });
  cache.set('user:3', { name: 'Bob', age: 35 });
  
  // Obtener (acerca al centro automáticamente)
  const user1 = cache.get('user:1');
  console.log('Cached user:', user1);
  
  return cache;
}


// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 3: Memoización Fibonacci (ultra eficiente)
// ═══════════════════════════════════════════════════════════════════

export function fibonacciMemoization() {
  // Función costosa
  const expensiveCalculation = (n: number): number => {
    let result = 0;
    for (let i = 0; i < n * 1000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  };
  
  // Memoizar con patrón Fibonacci
  const memoized = AncientOptimizer.memoize(expensiveCalculation);
  
  console.time('First call');
  memoized(100);
  console.timeEnd('First call');
  
  console.time('Cached call');
  memoized(100);
  console.timeEnd('Cached call');
  
  return memoized;
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 4: Load Balancing con Proporción Áurea
// ═══════════════════════════════════════════════════════════════════

export function goldenLoadBalancing() {
  const balancer = new GoldenLoadBalancer<string>(4);
  
  // Asignar tareas con diferentes pesos
  const tasks = [
    { name: 'Heavy task 1', weight: 10 },
    { name: 'Light task 1', weight: 1 },
    { name: 'Medium task 1', weight: 5 },
    { name: 'Heavy task 2', weight: 10 },
    { name: 'Light task 2', weight: 1 },
    { name: 'Medium task 2', weight: 5 }
  ];
  
  tasks.forEach(task => balancer.assign(task.name, task.weight));
  
  const distribution = balancer.getDistribution();
  console.log('Load distribution:', distribution);
  
  return distribution;
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 5: Pipeline Alquímico (4 etapas)
// ═══════════════════════════════════════════════════════════════════

export function alchemicalTransformation() {
  const rawData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  const result = new AlchemicalPipeline(rawData)
    // Nigredo: Descomponer
    .decompose(data => data.map(n => n * 2))
    // Albedo: Purificar
    .purify(data => data.filter(n => n > 5))
    // Citrinitas: Iluminar
    .illuminate(data => data.map(n => ({ value: n, squared: n * n })))
    // Rubedo: Perfeccionar
    .perfect(data => data.sort((a, b) => b.squared - a.squared))
    .result();
  
  console.log('Alchemical result:', result);
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 6: Compresión Fractal
// ═══════════════════════════════════════════════════════════════════

export function fractalCompression() {
  // Datos con patrón repetido
  const data = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];
  
  const { compressed, ratio } = FractalCompressor.compress(data);
  console.log('Compression ratio:', ratio);
  console.log('Compressed:', compressed);
  
  const decompressed = FractalCompressor.decompress(compressed);
  console.log('Decompressed:', decompressed);
  console.log('Match:', JSON.stringify(data) === JSON.stringify(decompressed));
  
  return { compressed, ratio, decompressed };
}

// ═══════════════════════════════════════════════════════════════════
// EJECUTAR TODOS LOS EJEMPLOS
// ═══════════════════════════════════════════════════════════════════

export function runAllExamples() {
  console.log('\n═══ INGENIERÍA ANTIGUA - EJEMPLOS ═══\n');
  
  console.log('1. Optimización de datos:');
  optimizeDataProcessing();
  
  console.log('\n2. Cache inteligente:');
  smartCaching();
  
  console.log('\n3. Memoización Fibonacci:');
  fibonacciMemoization();
  
  console.log('\n4. Load Balancing Áureo:');
  goldenLoadBalancing();
  
  console.log('\n5. Pipeline Alquímico:');
  alchemicalTransformation();
  
  console.log('\n6. Compresión Fractal:');
  fractalCompression();
}
