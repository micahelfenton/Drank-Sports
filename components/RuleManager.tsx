
import React, { useState, useEffect } from 'react';
import { Rule } from '../types';

interface RuleManagerProps {
  rules: Rule[];
  onUpdate: (rules: Rule[]) => void;
}

export const RuleManager: React.FC<RuleManagerProps> = ({ rules, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localRules, setLocalRules] = useState<Rule[]>(rules);

  useEffect(() => {
    if (!isEditing) {
      setLocalRules(rules);
    }
  }, [rules, isEditing]);

  const toggleRule = (id: string) => {
    const updated = localRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setLocalRules(updated);
    if (!isEditing) onUpdate(updated);
  };

  const addRule = () => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Rule',
      action: 'Drink',
      value: 2,
      unit: 'sips',
      target: 'Last to React',
      enabled: true
    };
    const updated = [...localRules, newRule];
    setLocalRules(updated);
    setIsEditing(true); 
  };

  const deleteRule = (id: string) => {
    const updated = localRules.filter(r => r.id !== id);
    setLocalRules(updated);
    if (!isEditing) onUpdate(updated);
  };

  const handleSave = () => {
    onUpdate(localRules);
    setIsEditing(false);
  };

  const updateLocalRule = (id: string, field: keyof Rule, value: any) => {
    setLocalRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-brand text-2xl text-indigo-400 italic">RULE SET</h3>
        <button 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isEditing ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {isEditing ? '✓ SAVE CHANGES' : '✎ EDIT RULES'}
        </button>
      </div>

      <div className="space-y-4">
        {localRules.map(rule => (
          <div key={rule.id} className={`p-5 rounded-[2rem] border-2 transition-all ${rule.enabled ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-30'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={rule.label} 
                      onChange={(e) => updateLocalRule(rule.id, 'label', e.target.value)}
                      className="w-full bg-black/60 border-2 border-indigo-500/30 rounded-xl p-3 text-lg font-bold outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Event (e.g. Free Throw Missed)"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">PUNISHMENT:</span>
                      <input 
                        type="number" 
                        value={rule.value} 
                        onChange={(e) => updateLocalRule(rule.id, 'value', parseInt(e.target.value) || 0)}
                        className="bg-black/60 w-14 text-center rounded-xl text-sm p-2 border border-white/10"
                      />
                      <input 
                        type="text" 
                        value={rule.unit} 
                        onChange={(e) => updateLocalRule(rule.id, 'unit', e.target.value)}
                        className="bg-black/60 flex-1 text-center rounded-xl text-sm p-2 border border-white/10"
                        placeholder="sips"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-brand text-xl text-white uppercase tracking-tight break-words leading-none">{rule.label}</div>
                    <div className="text-xs font-black text-rose-500 uppercase italic tracking-widest">
                      {rule.action} {rule.value} {rule.unit}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                {isEditing ? (
                  <button onClick={() => deleteRule(rule.id)} className="bg-rose-500/20 text-rose-500 p-2 rounded-xl border border-rose-500/30">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`w-12 h-7 rounded-full transition-all relative ${rule.enabled ? 'bg-indigo-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${rule.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addRule}
          className="w-full py-8 border-4 border-dashed border-indigo-500/20 rounded-[2.5rem] text-indigo-400 font-brand text-xl hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3 group"
        >
          <span className="text-3xl group-hover:scale-125 transition-transform">+</span>
          <span>ADD NEW RULE</span>
        </button>
      </div>
    </div>
  );
};
