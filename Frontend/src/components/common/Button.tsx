import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-[var(--primary)] hover:bg-[#0458d8] text-white shadow-sm shadow-[rgba(5,103,252,0.12)] [&_svg]:text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow-none [&_svg]:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-[rgba(220,38,38,0.12)] [&_svg]:text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 shadow-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  return (
    <button 
      data-variant={variant}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;