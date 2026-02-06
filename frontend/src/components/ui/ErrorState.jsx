import React from "react";

const ErrorState = ({ title = "Algo deu errado", message, onRetry }) => (
  <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 text-red-700 bg-red-50 border border-red-200 rounded-xl p-6">
    <p className="text-base font-semibold">{title}</p>
    {message && <p className="text-sm text-red-600">{message}</p>}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

export default ErrorState;











