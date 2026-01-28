
const fs = require('fs');
const path = require('path');

const TRACE_DIR = path.join(__dirname, '../perf-traces');

function formatDuration(micros) {
  if (!micros) return '0ms';
  return (micros / 1000).toFixed(2) + 'ms';
}

function analyzeFile(filePath) {
  console.log(`\n🔍 Analiza pliku: ${path.basename(filePath)}`);
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const trace = JSON.parse(data);
    const events = trace.traceEvents || [];

    if (events.length === 0) {
      console.log('   ⚠️  Brak zdarzeń w pliku.');
      return;
    }

    // Filtrujemy zdarzenia, które mają czas trwania (dur)
    // Czas w trace events jest w mikrosekundach (us). 1000us = 1ms.
    const durationEvents = events.filter(e => e.dur && e.dur > 0);

    // 1. Long Tasks (> 50ms = 50,000us)
    const longTasks = durationEvents.filter(e => e.dur > 50000);
    const totalBlockingTime = longTasks.reduce((acc, e) => acc + e.dur, 0);

    // 2. Najdłuższe pojedyncze zdarzenie
    const maxEvent = durationEvents.reduce((prev, current) => (prev.dur > current.dur) ? prev : current, { dur: 0 });

    // 3. Grupowanie kategorii (np. v8, blink, cc)
    const categoryStats = {};
    durationEvents.forEach(e => {
        const cat = e.cat || 'other';
        if (!categoryStats[cat]) categoryStats[cat] = 0;
        categoryStats[cat] += e.dur;
    });

    // Sortowanie kategorii
    const sortedCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

    console.log(`   📊 Statystyki:`);
    console.log(`      - Liczba zdarzeń: ${events.length}`);
    console.log(`      - Długie zadania (>50ms): ${longTasks.length}`);
    console.log(`      - Całkowity czas blokowania (TBT est.): ${formatDuration(totalBlockingTime)}`);
    console.log(`      - Najdłuższe zadanie: ${maxEvent.name} (${formatDuration(maxEvent.dur)})`);
    
    if (longTasks.length > 0) {
        console.log(`      ⚠️  Top 3 Długie Zadania:`);
        longTasks.sort((a, b) => b.dur - a.dur).slice(0, 3).forEach(task => {
            console.log(`          • ${task.name}: ${formatDuration(task.dur)} (cat: ${task.cat})`);
        });
    }

  } catch (err) {
    console.error(`   ❌ Błąd analizy: ${err.message}`);
  }
}

function run() {
  if (!fs.existsSync(TRACE_DIR)) {
    console.log('Katalog perf-traces nie istnieje.');
    return;
  }

  const files = fs.readdirSync(TRACE_DIR).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('Brak plików .json w katalogu perf-traces.');
    return;
  }

  console.log('=============================================');
  console.log(' RAPORT WYDAJNOŚCI (Na podstawie Trace JSON)');
  console.log('=============================================');
  
  files.forEach(file => {
    analyzeFile(path.join(TRACE_DIR, file));
  });
}

run();
