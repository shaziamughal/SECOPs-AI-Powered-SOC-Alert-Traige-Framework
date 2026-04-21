import React from 'react';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  className?: string;
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ label, type = 'neutral', className = '', outline = false }) => {
  const baseStyles = "px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide";
  
  let typeStyles = "";
  if (outline) {
      switch (type) {
        case 'success': typeStyles = "border border-emerald-500 text-emerald-400"; break;
        case 'warning': typeStyles = "border border-amber-500 text-amber-400"; break;
        case 'error': typeStyles = "border border-red-500 text-red-400"; break;
        case 'info': typeStyles = "border border-blue-500 text-blue-400"; break;
        case 'purple': typeStyles = "border border-violet-500 text-violet-400"; break;
        default: typeStyles = "border border-slate-500 text-slate-400";
      }
  } else {
    switch (type) {
        case 'success': typeStyles = "bg-emerald-500/10 text-emerald-400"; break;
        case 'warning': typeStyles = "bg-amber-500/10 text-amber-400"; break;
        case 'error': typeStyles = "bg-red-500/20 text-red-400"; break;
        case 'info': typeStyles = "bg-blue-500/10 text-blue-400"; break;
        case 'purple': typeStyles = "bg-violet-500/20 text-violet-400"; break;
        default: typeStyles = "bg-slate-700 text-slate-300";
      }
  }

  return (
    <span className={`${baseStyles} ${typeStyles} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;