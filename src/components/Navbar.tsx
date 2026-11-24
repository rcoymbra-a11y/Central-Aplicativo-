import { useState } from 'react';
import { Menu, Plus, X } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onViewAllApps: () => void;
}

export function Navbar({ onOpenAddModal, onViewAllApps }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNav = (action?: () => void) => {
    setMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#topo"
          className="font-display text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
        >
          Central de Aplicativos
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <a
            href="#aplicativos"
            className="whitespace-nowrap shrink-0 py-2 transition-colors duration-150 hover:text-zinc-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
          >
            Aplicativos
          </a>
          <a
            href="#como-funciona"
            className="whitespace-nowrap shrink-0 py-2 transition-colors duration-150 hover:text-zinc-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
          >
            Como funciona
          </a>
          <button
            type="button"
            onClick={onViewAllApps}
            className="whitespace-nowrap shrink-0 cursor-pointer py-2 transition-colors duration-150 hover:text-zinc-900 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
          >
            Ver todos os apps
          </button>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Adicionar aplicativo</span>
            <span className="sm:hidden">Adicionar</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navegação mobile"
          className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <a
              href="#aplicativos"
              onClick={() => handleMobileNav()}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Aplicativos
            </a>
            <a
              href="#como-funciona"
              onClick={() => handleMobileNav()}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Como funciona
            </a>
            <button
              type="button"
              onClick={() => handleMobileNav(onViewAllApps)}
              className="flex min-h-11 w-full cursor-pointer items-center rounded-lg px-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Ver todos os apps
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
