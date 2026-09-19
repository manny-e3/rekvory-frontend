import React from 'react';

export default function CurrencyInput({
  value,
  onChange,
  placeholder = '0.00',
  id,
  name,
  required = false,
  disabled = false,
  min
}) {
  const handleChange = (e) => {
    // Only allow numbers and decimal point
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    onChange(rawVal);
  };

  return (
    <div className="currency-input-wrapper">
      <div className="currency-prefix" aria-hidden="true">
        ₦
      </div>
      <input
        type="text"
        inputMode="decimal"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        autoComplete="off"
      />
    </div>
  );
}
