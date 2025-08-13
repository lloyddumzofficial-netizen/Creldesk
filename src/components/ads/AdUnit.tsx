import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

interface AdUnitProps {
  placement: 'header' | 'sidebar' | 'footer' | 'interstitial';
  size: '728x90' | '300x250' | '320x50' | '320x100';
  className?: string;
  label?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ 
  placement, 
  size, 
  className,
  label = 'Advertisement'
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize AdSense when component mounts
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle as any[]).push({});
      } catch (error) {
        console.warn('AdSense initialization failed:', error);
      }
    }
  }, []);

  const sizeClasses = {
    '728x90': 'h-[90px] min-h-[90px]',
    '300x250': 'h-[250px] min-h-[250px] w-[300px]',
    '320x50': 'h-[50px] min-h-[50px]',
    '320x100': 'h-[100px] min-h-[100px]'
  };

  const placementClasses = {
    header: 'w-full max-w-[728px] mx-auto',
    sidebar: 'w-[300px]',
    footer: 'w-full max-w-[728px] mx-auto',
    interstitial: 'w-full max-w-[300px] mx-auto'
  };

  return (
    <div className={cn(
      "adsense-container relative bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 my-6",
      placementClasses[placement],
      className
    )}>
      <span className="absolute -top-2 left-4 bg-slate-50 dark:bg-slate-800 px-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      
      <div 
        ref={adRef}
        className={cn(
          "w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm border border-slate-200 dark:border-slate-600",
          sizeClasses[size]
        )}
      >
        {/* Placeholder content - replace with actual AdSense code in production */}
        <div className="text-center">
          <div className="text-xs opacity-75 mb-1">{label}</div>
          <div className="text-xs opacity-50">{size}</div>
        </div>
      </div>
      
      {/* This is where actual AdSense code would go in production */}
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            // Production AdSense implementation would be here
            // (adsbygoogle = window.adsbygoogle || []).push({});
          `
        }}
      />
    </div>
  );
};

// Type declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}