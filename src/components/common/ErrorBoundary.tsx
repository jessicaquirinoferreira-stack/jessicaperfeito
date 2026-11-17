import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Erro inesperado na renderização:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] px-6 text-center text-[#0B1B32]">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#B8863B]/40 bg-[#0B1B32] font-editorial text-xl font-bold text-[#E7C98F]">
            JP
          </span>
          <h1 className="mt-5 font-editorial text-3xl font-semibold">
            Jéssica Perfeito | Imóveis
          </h1>
          <p className="mt-2 max-w-md text-sm text-[#0B1B32]/75">
            Ocorreu uma instabilidade momentânea ao carregar a página. Clique abaixo para atualizar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[#0B1B32] px-6 py-3 text-sm font-semibold text-white hover:bg-[#112645] cursor-pointer"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
