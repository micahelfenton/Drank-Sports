
import React, { useEffect, useState } from 'react';
import { Rule } from '../types';

interface EventPopupProps {
  rule: Rule;
  onClose: () => void;
}

export const EventPopup: React.FC<EventPopupProps> = ({ rule, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 rounded-2xl shadow-2xl border-4 border-white animate-pop text-center min-w-[300px]">
        <h2 className="font-brand text-2xl mb-1">{rule.label}</h2>
        <div className="text-xl font-bold flex items-center justify-center gap-2">
          <span className="bg-white/20 px-3 py-1 rounded-full">{rule.action} {rule.value > 0 ? rule.value : ''} {rule.unit}</span>
        </div>
      </div>
    </div>
  );
};
