import React from 'react';

// Style map for each alert type
const styles = {
  success: 'bg-green-50 text-green-800 border border-green-200',
  error:   'bg-red-50 text-red-800 border border-red-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  info:    'bg-blue-50 text-blue-800 border border-blue-200',
};

// Inline alert banner — pass type, message, and optional onClose handler
const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100 font-bold"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
