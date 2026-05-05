import React from 'react';

// Button that shows a spinner while isLoading is true and disables interaction
const LoadingButton = ({ isLoading, children, className = '', ...props }) => (
  <button
    disabled={isLoading}
    className={`flex items-center justify-center gap-2 font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {isLoading && (
      <svg
        className="animate-spin h-4 w-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )}
    {children}
  </button>
);

export default LoadingButton;
