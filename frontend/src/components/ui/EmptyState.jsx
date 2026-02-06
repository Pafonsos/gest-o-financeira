import React from "react";

const EmptyState = ({ title = "Sem dados", message }) => (
  <div className="min-h-[200px] flex flex-col items-center justify-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-6">
    <p className="text-base font-semibold">{title}</p>
    {message && <p className="text-sm text-gray-500 text-center">{message}</p>}
  </div>
);

export default EmptyState;











