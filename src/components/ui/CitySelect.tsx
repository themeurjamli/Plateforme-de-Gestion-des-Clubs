import React, { useEffect, useRef, useState } from 'react';
import TUNISIAN_CITIES from '../../utils/cities';
import './CitySelect.css';

interface CitySelectSingleProps {
  multiple?: false;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string | null | undefined;
  onChange: (city: string) => void;
}

interface CitySelectMultiProps {
  multiple: true;
  label?: string;
  placeholder?: string;
  error?: string;
  values: string[];
  onChange: (cities: string[]) => void;
}

type CitySelectProps = CitySelectSingleProps | CitySelectMultiProps;

export default function CitySelect(props: CitySelectProps) {
  const { label, error } = props;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMulti = props.multiple === true;

  const selectedLabel = isMulti
    ? props.values.length === 0
      ? props.placeholder || 'Sélectionner des villes'
      : props.values.length === 1
      ? props.values[0]
      : `${props.values.length} villes sélectionnées`
    : props.value || props.placeholder || 'Sélectionner une ville';

  const handleSelectSingle = (city: string) => {
    if (!isMulti) {
      props.onChange(city);
      setOpen(false);
    }
  };

  const handleToggleMulti = (city: string) => {
    if (isMulti) {
      const exists = props.values.includes(city);
      const next = exists
        ? props.values.filter((c) => c !== city)
        : [...props.values, city];
      props.onChange(next);
    }
  };

  return (
    <div className="city-select-wrapper" ref={wrapperRef}>
      {label && (
        <label className="city-select-label">
          {label}
          {!isMulti && props.required && <span className="city-select-required">*</span>}
        </label>
      )}

      <button
        type="button"
        className={`city-select-trigger ${error ? 'city-select-trigger-error' : ''} ${open ? 'city-select-trigger-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={(isMulti ? props.values.length === 0 : !props.value) ? 'city-select-placeholder' : ''}>
          📍 {selectedLabel}
        </span>
        <span className="city-select-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {error && <p className="city-select-error">{error}</p>}

      {open && (
        <div className="city-select-panel">
          {TUNISIAN_CITIES.map((city) => {
            const selected = isMulti ? props.values.includes(city) : props.value === city;
            return (
              <button
                type="button"
                key={city}
                className={`city-select-option ${selected ? 'city-select-option-active' : ''}`}
                onClick={() => (isMulti ? handleToggleMulti(city) : handleSelectSingle(city))}
              >
                {isMulti && (
                  <span className={`city-select-checkbox ${selected ? 'city-select-checkbox-checked' : ''}`}>
                    {selected ? '✓' : ''}
                  </span>
                )}
                {city}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}