import React from 'react';
import { Maximize2, Monitor } from 'lucide-react';

interface PreviewFrameProps {
  children: React.ReactNode;
  urlPath: string;
}

export function PreviewFrame({ children, urlPath }: PreviewFrameProps) {
  return (
    <div className="bg-[#f0f2f5] rounded-t-xl rounded-b-md border border-border shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Browser Chrome */}
      <div className="bg-[#e4e6ea] h-12 flex items-center px-4 gap-4 border-b border-[#d1d5da] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 max-w-xl mx-auto flex items-center justify-center bg-white h-7 rounded-md border border-[#d1d5da] text-[11px] text-[#6e7781] px-3 font-mono shadow-sm">
          https://o2geeks.com{urlPath}
        </div>
        <div className="flex items-center gap-2 text-[#6e7781]">
          <Monitor className="w-4 h-4" />
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>
      
      {/* Viewport */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
        <div className="absolute inset-0">
          {children}
        </div>
      </div>
    </div>
  );
}
