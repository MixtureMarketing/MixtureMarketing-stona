import React, { useState, useEffect, useRef } from 'react';

const RedisTerminal = () => {
  const [lines, setLines] = useState([
    { type: 'info', text: 'Redis CLI v7.0.5' },
    { type: 'info', text: 'Podłączono do 127.0.0.1:6379' },
    { type: 'info', text: "Wpisz 'SET klucz wartosc' lub 'GET klucz' aby przetestować." },
  ]);
  const [input, setInput] = useState('');
  const [db, setDb] = useState<{ [key: string]: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const op = parts[0].toUpperCase();
    const newLines = [...lines, { type: 'input', text: `> ${cmd}` }];
    let response = '';
    if (op === 'SET' && parts.length >= 3) {
      setDb((prev) => ({ ...prev, [parts[1]]: parts.slice(2).join(' ') }));
      response = 'OK';
    } else if (op === 'GET' && parts.length === 2) {
      const val = db[parts[1]];
      response = val ? `"${val}"` : '(nil)';
    } else if (op === 'KEYS') {
      const keys = Object.keys(db);
      response = keys.length ? keys.join('\n') : '(empty list or set)';
    } else if (op === 'DEL' && parts.length === 2) {
      if (db[parts[1]]) {
        const newDb = { ...db };
        delete newDb[parts[1]];
        setDb(newDb);
        response = '(integer) 1';
      } else response = '(integer) 0';
    } else if (op === 'FLUSHALL') {
      setDb({});
      response = 'OK';
    } else response = `(error) ERR unknown command '${parts[0]}'`;
    newLines.push({ type: 'output', text: response });
    setLines(newLines);
    setInput('');
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-800 font-mono text-sm overflow-hidden h-[400px] flex flex-col">
      <div className="bg-[#252526] px-4 py-2 border-b border-[#333] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <span className="text-gray-600 text-xs ml-2">redis-cli</span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 scroll-smooth"
        onClick={() => document.getElementById('cli-input')?.focus()}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${line.type === 'input' ? 'text-white font-bold' : line.type === 'info' ? 'text-gray-700' : 'text-[#A6E22E]'}`}
          >
            <pre className="whitespace-pre-wrap font-mono">{line.text}</pre>
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="p-4 bg-[#252526] border-t border-[#333] flex gap-2">
        <span className="text-primary font-bold">127.0.0.1:6379&gt;</span>
        <input
          id="cli-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white font-mono"
          autoComplete="off"
          placeholder="Wpisz komendę..."
        />
      </form>
    </div>
  );
};

export default RedisTerminal;
