import React from 'react';

export function Logo({ className = '' }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-400/30">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3L28 27H22.2L16 14.2L9.8 27H4L16 3Z" fill="#10B981" />
          <path d="M11.5 20.5H20.5L22.2 24H9.8L11.5 20.5Z" fill="#ECFDF5" />
          <circle cx="16" cy="3.5" r="2" fill="#A7F3D0" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-base sm:text-lg font-bold tracking-wider text-white leading-none">
          ADVANCED <span className="text-emerald-400">IT</span> SOLUTIONS
        </span>
      </div>
    </div>
  );
}