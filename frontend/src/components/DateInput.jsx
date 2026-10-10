import React from "react";

function DateInput({
  label,
  ariaLabel,
  value,
  onChange,
  className = "",
  inputRef,
}) {
  return (
    <div className={className}>
      {label && <label>{label}</label>}

      <input
        ref={inputRef}
        type="date"
        value={value}
        aria-label={ariaLabel || label || "Date"}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

export default DateInput;