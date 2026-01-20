import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  optionalLabel?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  optionalLabel
}) => {
  return (
    <div className="mb-2 w-full">
      <label htmlFor={id} className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">
        {label} {optionalLabel && <span className="text-[10px] text-slate-600 font-normal normal-case ml-1 border border-slate-700 px-1.5 py-0.5 rounded-full">{optionalLabel}</span>}
      </label>
      <div className="relative group">
        <input
          type={type}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surfaceHighlight/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder-slate-600/50 font-medium group-hover:bg-surfaceHighlight"
          placeholder={placeholder}
          required={required}
        />
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5 opacity-50"></div>
      </div>
    </div>
  );
};