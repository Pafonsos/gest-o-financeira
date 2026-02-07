import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log only to console to avoid breaking the UI
    console.error("Erro inesperado:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
            <h1 className="text-2xl font-semibold text-slate-800">Algo deu errado</h1>
            <p className="mt-3 text-slate-600">
              Ocorreu um erro inesperado. Recarregue a página para tentar novamente.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
