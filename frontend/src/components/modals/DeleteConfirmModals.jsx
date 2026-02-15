import React from 'react';
import { AlertCircle } from 'lucide-react';

const DeleteConfirmModals = ({
  isSingleOpen,
  selectedClientName,
  onCancelSingle,
  onConfirmSingle,
  isAllOpen,
  onCancelAll,
  onConfirmAll
}) => {
  return (
    <>
      {isSingleOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h2>
                <p className="text-sm text-gray-600">
                  Tem certeza que deseja excluir o cliente <span className="font-medium">{selectedClientName}</span>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onCancelSingle}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmSingle}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {isAllOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h2>
                <p className="text-sm text-gray-600">
                  Tem certeza que deseja excluir todos os clientes? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onCancelAll}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir Todos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteConfirmModals;
