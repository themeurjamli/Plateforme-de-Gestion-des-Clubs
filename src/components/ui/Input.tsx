import React from 'react';
import './Input.css';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <div className="input-group">

      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required"> *</span>}
        </label>
      )}

      <input
        type={type}
        className={`input-field ${error ? 'input-field-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      {error && <span className="input-error-text">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}

    </div>
  );
}



interface TextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  hint,
}: TextareaProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <textarea
        className="input-field input-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  );
}



interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: SelectProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select
        className="input-field input-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <span className="input-hint">{hint}</span>}
    </div>
  );
}