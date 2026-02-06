import React from "react";

const AccessDenied = ({ message = "Você não tem permissão para acessar esta página." }) => (
  <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-900">
    <p className="text-base font-semibold">Acesso negado</p>
    <p className="text-sm text-yellow-800 text-center">{message}</p>
  </div>
);

export default AccessDenied;











