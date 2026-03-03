// DEMO: Sistema de 72 Símbolos Antiguos
// Muestra cómo usar el sistema ultra eficiente

import { ancient } from './services/ancient-client';

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 1: Operaciones Básicas
// ═══════════════════════════════════════════════════════════════════
async function basicOperations() {
  console.log('═══ OPERACIONES BÁSICAS ═══');
  
  // Fuego: Ejecutar rápido
  const fireResult = await ancient.fire({ action: 'process', data: [1, 2, 3] });
  console.log('🜂 Fuego:', fireResult);
  
  // Agua: Flujo de datos
  const waterResult = await ancient.water({ stream: true, data: 'flowing' });
  console.log('🜄 Agua:', waterResult);
  
  // Sol: Iluminar/Revelar
  const sunResult = await ancient.sun({ query: 'show me data' });
  console.log('☉ Sol:', sunResult);
  
  // Luna: Reflejar/Cache
  const moonResult = await ancient.moon({ cache: true, key: 'user_data' });
  console.log('☽ Luna:', moonResult);
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 2: Batch Operations (Ultra Rápido)
// ═══════════════════════════════════════════════════════════════════
async function batchOperations() {
  console.log('\n═══ OPERACIONES BATCH ═══');
  
  const results = await ancient.batch([
    { op: 'execute', data: { task: 1 } },
    { op: 'flow', data: { task: 2 } },
    { op: 'illuminate', data: { task: 3 } },
    { op: 'reflect', data: { task: 4 } }
  ]);
  
  console.log('Batch results:', results);
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 3: Codificación Local (Sin servidor)
// ═══════════════════════════════════════════════════════════════════
function localEncoding() {
  console.log('\n═══ CODIFICACIÓN LOCAL ═══');
  
  const encoded1 = ancient.encodeLocal('execute', { user: 'john' });
  console.log('Encoded execute:', encoded1);
  
  const encoded2 = ancient.encodeLocal('illuminate');
  console.log('Encoded illuminate:', encoded2);
  
  const encoded3 = ancient.encodeLocal('transform', { from: 'A', to: 'B' });
  console.log('Encoded transform:', encoded3);
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 4: Símbolos Visuales
// ═══════════════════════════════════════════════════════════════════
function showSymbols() {
  console.log('\n═══ 72 SÍMBOLOS ANTIGUOS ═══');
  
  const operations = [
    'execute', 'flow', 'transmit', 'store',
    'illuminate', 'reflect', 'communicate', 'harmonize',
    'perfect', 'purify', 'transform', 'conduct',
    'trinity', 'receive', 'foundation', 'balance',
    'begin', 'build', 'give', 'door',
    'wealth', 'strength', 'giant', 'god'
  ];
  
  operations.forEach(op => {
    const symbol = ancient.getSymbol(op);
    console.log(`${symbol} → ${op}`);
  });
}

// ═══════════════════════════════════════════════════════════════════
// EJEMPLO 5: Uso en UI (Minimalista)
// ═══════════════════════════════════════════════════════════════════
export function createAncientUI() {
  const container = document.createElement('div');
  container.className = 'ancient-ui';
  container.innerHTML = `
    <div style="font-family: monospace; padding: 20px; background: #000; color: #0f0;">
      <h2>🜂 Sistema de 72 Símbolos Antiguos</h2>
      
      <div style="margin: 20px 0;">
        <h3>Primordiales</h3>
        <button onclick="window.testFire()">🜂 Fuego</button>
        <button onclick="window.testWater()">🜄 Agua</button>
        <button onclick="window.testAir()">🜁 Aire</button>
        <button onclick="window.testEarth()">🜃 Tierra</button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Celestiales</h3>
        <button onclick="window.testSun()">☉ Sol</button>
        <button onclick="window.testMoon()">☽ Luna</button>
        <button onclick="window.testMercury()">☿ Mercurio</button>
        <button onclick="window.testVenus()">♀ Venus</button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Metálicos</h3>
        <button onclick="window.testGold()">🜚 Oro</button>
        <button onclick="window.testSilver()">🜛 Plata</button>
        <button onclick="window.testQuicksilver()">🜨 Mercurio</button>
      </div>
      
      <div id="result" style="margin-top: 20px; padding: 10px; background: #111; border: 1px solid #0f0;">
        Resultado aparecerá aquí...
      </div>
    </div>
  `;
  
  return container;
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES GLOBALES PARA UI
// ═══════════════════════════════════════════════════════════════════
(window as any).testFire = async () => {
  const result = await ancient.fire({ test: 'fire' });
  showResult('🜂 Fuego', result);
};

(window as any).testWater = async () => {
  const result = await ancient.water({ test: 'water' });
  showResult('🜄 Agua', result);
};

(window as any).testSun = async () => {
  const result = await ancient.sun({ test: 'sun' });
  showResult('☉ Sol', result);
};

(window as any).testMoon = async () => {
  const result = await ancient.moon({ test: 'moon' });
  showResult('☽ Luna', result);
};

(window as any).testGold = async () => {
  const result = await ancient.gold({ test: 'gold' });
  showResult('🜚 Oro', result);
};

(window as any).testSilver = async () => {
  const result = await ancient.silver({ test: 'silver' });
  showResult('🜛 Plata', result);
};

(window as any).testQuicksilver = async () => {
  const result = await ancient.quicksilver({ test: 'quicksilver' });
  showResult('🜨 Mercurio', result);
};

(window as any).testMercury = async () => {
  const result = await ancient.mercury({ test: 'mercury' });
  showResult('☿ Mercurio', result);
};

(window as any).testVenus = async () => {
  const result = await ancient.venus({ test: 'venus' });
  showResult('♀ Venus', result);
};

function showResult(operation: string, result: any) {
  const resultDiv = document.getElementById('result');
  if (resultDiv) {
    resultDiv.innerHTML = `
      <strong>${operation}</strong><br>
      <pre>${JSON.stringify(result, null, 2)}</pre>
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════
// EJECUTAR DEMOS
// ═══════════════════════════════════════════════════════════════════
export async function runAllDemos() {
  await basicOperations();
  await batchOperations();
  localEncoding();
  showSymbols();
}

// Auto-ejecutar si es módulo principal
if (typeof window !== 'undefined') {
  (window as any).runAncientDemos = runAllDemos;
  (window as any).createAncientUI = createAncientUI;
}
