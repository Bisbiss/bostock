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
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label} {optionalLabel && <span className="text-xs text-slate-500 ml-1">({optionalLabel})</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-slate-600"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};