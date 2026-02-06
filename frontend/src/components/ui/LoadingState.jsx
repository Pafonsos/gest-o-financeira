import React from "react";

const LoadingState = ({ message = "Carregando..." }) => (
  <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 text-gray-600">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default LoadingState;











