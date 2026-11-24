import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw, Search, X } from 'lucide-react';
import { AppCard } from './components/AppCard';
import { AppModal } from './components/AppModal';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import {
  AppFormValues,
  AppItem,
  CATEGORY_FILTERS,
  CategoryFilter,
} from './types/app';
import {
  loadApps,
  loadBrandSubtitle,
  resetDefaultApps,
  sanitizeAppsList,
  saveApps,
  saveBrandSubtitle,
} from './utils/storage';

interface CatalogApiResponse {
  apps?: unknown;
  brandSubtitle?: string;
}

export default function App() {
  const [apps, setApps] = useState<AppItem[]>(() => loadApps());
  const [brandSubtitle, setBrandSubtitle] = useState<string>(() => loadBrandSubtitle());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showcaseRef = useRef<HTMLElement | null>(null);

  // Sync shared catalog from server so all visitors see the latest products and photos
  useEffect(() => {
    let active = true;

    async function fetchSharedCatalog() {
      try {
        const response = await fetch('/api/catalog', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as CatalogApiResponse;
        if (!active) return;

        if (Array.isArray(data.apps)) {
          const sanitized = sanitizeAppsList(data.apps);
          setApps(sanitized);
          saveApps(sanitized);
        }
        if (typeof data.brandSubtitle === 'string' && data.brandSubtitle.trim()) {
          const cleaned = saveBrandSubtitle(data.brandSubtitle);
          setBrandSubtitle(cleaned);
        }
      } catch {
        // Fallback silently to localStorage cache if API is unavailable
      }
    }

    fetchSharedCatalog();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    saveApps(apps);
  }, [apps]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const scrollToShowcase = () => {
    showcaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleViewAllApps = () => {
    setSelectedCategory('Todos');
    setSearchQuery('');
    scrollToShowcase();
  };

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: AppItem) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleSaveApp = async (values: AppFormValues, editingId?: string) => {
    if (editingId) {
      const optimisticUpdated: AppItem | undefined = apps.find(
        (item) => item.id === editingId
      );
      setApps((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: values.name,
                description: values.description,
                paymentUrl: values.paymentUrl,
                category: values.category,
                buttonText: values.buttonText,
                badge: values.badge || undefined,
                imageUrl: values.imageUrl || undefined,
              }
            : item
        )
      );
      setFeedbackMessage(`"${values.name}" foi atualizado.`);
      setIsModalOpen(false);
      setEditingApp(null);

      try {
        const response = await fetch(`/api/apps/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...optimisticUpdated,
            name: values.name,
            description: values.description,
            paymentUrl: values.paymentUrl,
            category: values.category,
            buttonText: values.buttonText,
            badge: values.badge || '',
            imageUrl: values.imageUrl || '',
          }),
        });
        if (response.ok) {
          const data = (await response.json()) as { catalog?: CatalogApiResponse };
          if (data.catalog && Array.isArray(data.catalog.apps)) {
            const synced = sanitizeAppsList(data.catalog.apps);
            setApps(synced);
            saveApps(synced);
          }
        }
      } catch {
        // Local state already updated
      }
      return;
    }

    const newId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newApp: AppItem = {
      id: newId,
      name: values.name,
      description: values.description,
      paymentUrl: values.paymentUrl,
      category: values.category,
      buttonText: values.buttonText,
      badge: values.badge || undefined,
      imageUrl: values.imageUrl || undefined,
      isDefault: false,
      createdAt: Date.now(),
    };

    setApps((prev) => [newApp, ...prev]);

    if (selectedCategory !== 'Todos' && selectedCategory !== values.category) {
      setSelectedCategory('Todos');
    }
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
    setFeedbackMessage(`"${values.name}" foi adicionado à vitrine.`);
    setIsModalOpen(false);
    setEditingApp(null);

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (response.ok) {
        const data = (await response.json()) as { catalog?: CatalogApiResponse };
        if (data.catalog && Array.isArray(data.catalog.apps)) {
          const synced = sanitizeAppsList(data.catalog.apps);
          setApps(synced);
          saveApps(synced);
        }
      }
    } catch {
      // Local state already updated
    }
  };

  const handleDeleteApp = async (id: string) => {
    const target = apps.find((item) => item.id === id);
    setApps((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      setFeedbackMessage(`"${target.name}" foi removido da vitrine.`);
    }

    try {
      const response = await fetch(`/api/apps/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = (await response.json()) as { catalog?: CatalogApiResponse };
        if (data.catalog && Array.isArray(data.catalog.apps)) {
          const synced = sanitizeAppsList(data.catalog.apps);
          setApps(synced);
          saveApps(synced);
        }
      }
    } catch {
      // Local state already updated
    }
  };

  const handleRestoreDefaults = async () => {
    const defaults = resetDefaultApps();
    setApps(defaults);
    setSelectedCategory('Todos');
    setSearchQuery('');
    setConfirmingRestore(false);
    setFeedbackMessage('Aplicativos padrão restaurados.');

    try {
      const response = await fetch('/api/catalog/reset', { method: 'POST' });
      if (response.ok) {
        const data = (await response.json()) as { catalog?: CatalogApiResponse };
        if (data.catalog && Array.isArray(data.catalog.apps)) {
          const synced = sanitizeAppsList(data.catalog.apps);
          setApps(synced);
          saveApps(synced);
        }
      }
    } catch {
      // Local state already updated
    }
  };

  const handleSaveBrandSubtitle = async (nextSubtitle: string) => {
    const saved = saveBrandSubtitle(nextSubtitle);
    setBrandSubtitle(saved);
    setFeedbackMessage('Subtítulo da marca atualizado.');

    try {
      const response = await fetch('/api/brand-subtitle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandSubtitle: saved }),
      });
      if (response.ok) {
        const data = (await response.json()) as { brandSubtitle?: string };
        if (typeof data.brandSubtitle === 'string' && data.brandSubtitle.trim()) {
          const cleaned = saveBrandSubtitle(data.brandSubtitle);
          setBrandSubtitle(cleaned);
        }
      }
    } catch {
      // Local state already updated
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      Todos: apps.length,
      'Corpo & Performance': 0,
      'Dinheiro & Bloqueios': 0,
      'Emoções & Rotina': 0,
      'Em breve': 0,
    };
    for (const app of apps) {
      counts[app.category] = (counts[app.category] || 0) + 1;
    }
    return counts;
  }, [apps]);

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'Todos' || app.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      return (
        app.name.toLowerCase().includes(normalizedQuery) ||
        app.description.toLowerCase().includes(normalizedQuery) ||
        app.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [apps, searchQuery, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-zinc-900">
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onViewAllApps={handleViewAllApps}
      />

      <main className="flex-1">
        <Hero
          brandSubtitle={brandSubtitle}
          onSaveBrandSubtitle={handleSaveBrandSubtitle}
          onExploreApps={scrollToShowcase}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Vitrine de Aplicativos */}
        <section
          id="aplicativos"
          ref={showcaseRef}
          className="scroll-mt-16 py-14 sm:py-16 lg:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Section heading & quick action */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-balance text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                  Vitrine de Aplicativos
                </h2>
                <p className="mt-2 text-base text-zinc-600">
                  Selecione um aplicativo por categoria ou pesquise pelo nome e objetivo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {confirmingRestore ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
                    <span className="text-xs font-medium text-zinc-700">
                      Restaurar padrão?
                    </span>
                    <button
                      type="button"
                      onClick={handleRestoreDefaults}
                      className="inline-flex min-h-8 cursor-pointer items-center rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white transition-colors duration-150 hover:bg-zinc-800"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRestore(false)}
                      className="inline-flex min-h-8 cursor-pointer items-center rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingRestore(true)}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Restaurar padrões
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Adicionar aplicativo
                </button>
              </div>
            </div>

            {/* Feedback message */}
            {feedbackMessage && (
              <div
                role="status"
                aria-live="polite"
                className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-950"
              >
                <span>{feedbackMessage}</span>
                <button
                  type="button"
                  onClick={() => setFeedbackMessage(null)}
                  aria-label="Fechar aviso"
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Search bar + Category filters */}
            <div className="mt-8 flex flex-col gap-4 border-b border-zinc-200 pb-6">
              <div className="relative w-full max-w-md">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <label htmlFor="search-apps" className="sr-only">
                  Buscar aplicativo por nome ou descrição
                </label>
                <input
                  id="search-apps"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar aplicativo por nome ou descrição..."
                  className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-10 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar busca"
                    className="absolute top-1/2 right-2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Category filter buttons */}
              <div
                role="tablist"
                aria-label="Filtrar aplicativos por categoria"
                className="flex flex-wrap items-center gap-1.5"
              >
                {CATEGORY_FILTERS.map((category) => {
                  const isActive = selectedCategory === category;
                  const count = categoryCounts[category] ?? 0;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
                        isActive
                          ? 'bg-zinc-900 text-white'
                          : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      <span>{category}</span>
                      <span
                        className={`tabular-nums text-xs ${
                          isActive ? 'text-zinc-300' : 'text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards grid or empty state */}
            {filteredApps.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteApp}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center">
                <h3 className="font-display text-lg font-bold text-zinc-900">
                  Nenhum aplicativo encontrado
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
                  {searchQuery.trim()
                    ? `Não encontramos resultados para "${searchQuery.trim()}". Limpe a busca ou cadastre um novo aplicativo.`
                    : `Ainda não há aplicativos cadastrados na categoria "${selectedCategory}".`}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {(searchQuery.trim() || selectedCategory !== 'Todos') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Todos');
                      }}
                      className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50"
                    >
                      Ver todos os apps
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Adicionar aplicativo
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer brandSubtitle={brandSubtitle} />

      <AppModal
        isOpen={isModalOpen}
        editingApp={editingApp}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
      />
    </div>
  );
}
