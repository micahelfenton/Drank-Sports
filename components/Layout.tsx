
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, scrollable = true }) => {
  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-indigo-950 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full"></div>
      
      {/* Scrollable Container */}
      <div className={`w-full max-w-2xl z-10 flex flex-col h-full ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <div className="w-full p-4 flex flex-col min-h-full">
          {children}
        </div>
      </div>
      
      {/* Aesthetic border for non-scrolling "Live" feel */}
      {!scrollable && (
        <div className="absolute inset-0 pointer-events-none border-[6px] border-white/5 z-50 rounded-[2rem] m-2"></div>
      )}
    </div>
  );
};
