import React, { useState } from 'react';
import { Server, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '../../../common/Button';

const SentinelNode = ({
  label,
  isMaster,
  isDown,
}: {
  label: string;
  isMaster: boolean;
  isDown: boolean;
}) => (
  <div
    className={`relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-500 ${isDown ? 'bg-red-100 border-red-500 opacity-50' : isMaster ? 'bg-emerald-50 border-emerald-500 shadow-lg' : 'bg-blue-50 border-blue-200'}`}
  >
    <Server
      size={32}
      className={isDown ? 'text-red-500' : isMaster ? 'text-emerald-600' : 'text-blue-400'}
    />
    <span className="text-xs font-bold mt-2 text-gray-600">{label}</span>
    {isMaster && !isDown && (
      <div className="absolute -top-3 bg-emerald-500 text-white text-xxs px-2 py-0.5 rounded-full font-bold uppercase">
        Master
      </div>
    )}
    {isDown && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
        <XCircle className="text-red-600" size={40} />
      </div>
    )}
  </div>
);

const SentinelDemo = () => {
  const [masterAlive, setMasterAlive] = useState(true);
  const [activeMaster, setActiveMaster] = useState(0);
  const [logs, setLogs] = useState<string[]>(['[System] Cluster Healthy. Master: Node-0']);

  const killMaster = () => {
    if (!masterAlive) return;
    setMasterAlive(false);
    addLog('[Alert] Master Node-0 Down!');
    addLog('[Sentinel] Detecting failure...');
    setTimeout(() => {
      addLog('[Sentinel] Quorum reached. Failover started.');
      setTimeout(() => {
        setActiveMaster(1);
        addLog('[Sentinel] Elected Node-1 as new Master.');
        addLog('[System] Reconfiguration complete.');
      }, 1500);
    }, 1000);
  };

  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4">
          <Button
            onClick={killMaster}
            disabled={!masterAlive}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <AlertTriangle size={16} className="mr-2" /> Symuluj Awarię
          </Button>
          <Button
            onClick={() => {
              setMasterAlive(true);
              setActiveMaster(0);
              setLogs(['[System] Cluster Reset. Master: Node-0']);
            }}
            disabled={masterAlive}
            variant="outline"
          >
            <RotateCcw size={16} className="mr-2" /> Reset
          </Button>
        </div>
        <div className="text-xs font-mono text-gray-600">Redis Sentinel Mode</div>
      </div>
      <div className="flex justify-center gap-8 md:gap-16 mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        <SentinelNode
          label="Node-0"
          isMaster={activeMaster === 0}
          isDown={!masterAlive && activeMaster !== 0}
        />
        <SentinelNode label="Node-1" isMaster={activeMaster === 1} isDown={false} />
        <SentinelNode label="Node-2" isMaster={activeMaster === 2} isDown={false} />
      </div>
      <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default SentinelDemo;
