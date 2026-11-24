import { useState } from 'react';
import { ArrowDown, Check, Pencil, Plus, X } from 'lucide-react';

interface HeroProps {
  brandSubtitle: string;
  onSaveBrandSubtitle: (value: string) => void;
  onExploreApps: () => void;
  onOpenAddModal: () => void;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_apps_hub_1795470685722.jpg';

export function Hero({
  brandSubtitle,
  onSaveBrandSubtitle,
  onExploreApps,
  onOpenAddModal,
}: HeroProps) {
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [draftSubtitle, setDraftSubtitle] = useState(brandSubtitle);
  const [imageError, setImageError] = useState(false);

  const handleStartEdit = () => {
    setDraftSubtitle(brandSubtitle);
    setIsEditingSubtitle(true);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBrandSubtitle(draftSubtitle);
    setIsEditingSubtitle(false);
  };

  const handleCancelEdit = () => {
    setDraftSubtitle(brandSubtitle);
    setIsEditingSubtitle(false);
  };

  return (
    <section
      id="topo"
      className="border-b border-zinc-200 bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: Editorial proposition + editable brand subtitle */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Editable brand subtitle */}
            <div className="mb-5">
              {isEditingSubtitle ? (
                <form
                  onSubmit={handleConfirmEdit}
                  className="flex flex-wrap items-center gap-2"
                >
                  <label htmlFor="brand-subtitle-input" className="sr-only">
                    Subtítulo da marca
                  </label>
                  <input
                    id="brand-subtitle-input"
                    type="text"
                    value={draftSubtitle}
                    onChange={(e) => setDraftSubtitle(e.target.value)}
                    placeholder="Ex.: HUB DE APPS PRO · Sua marca"
                    maxLength={80}
                    autoFocus
                    className="min-h-10 w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
                  />
                  <button
                    type="submit"
                    aria-label="Salvar subtítulo"
                    className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-900"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    aria-label="Cancelar edição do subtítulo"
                    className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-800">{brandSubtitle}</span>
                  <span aria-hidden="true" className="text-zinc-300">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-xs font-medium text-blue-800 transition-colors duration-150 hover:text-blue-950 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Editar subtítulo
                  </button>
                </div>
              )}
            </div>

            <h1 className="font-display text-balance text-[clamp(2.25rem,4vw,3.4rem)] font-bold leading-[1.1] tracking-tight text-zinc-900">
              Ferramentas práticas para destravar seus resultados em minutos.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Escolha o aplicativo ideal para o seu momento, preencha etapas simples com prévia em
              tempo real e receba seu plano ou diagnóstico personalizado.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onExploreApps}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Explorar aplicativos
                <ArrowDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors duration-150 hover:border-zinc-400 hover:bg-zinc-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                <Plus className="h-4 w-4 shrink-0 text-blue-800" aria-hidden="true" />
                Adicionar novo app
              </button>
            </div>
          </div>

          {/* Right column: Editorial visual anchor */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 lg:aspect-auto lg:h-full">
              {!imageError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Mesa de trabalho moderna com notebook e tablet exibindo painéis e diagnósticos em tempo real"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-64 w-full flex-col justify-between bg-gradient-to-br from-zinc-100 via-slate-100 to-blue-50 p-6">
                  <div className="text-xs font-medium text-zinc-500">
                    Central de Aplicativos
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-2/3 rounded bg-zinc-200" />
                    <div className="h-2.5 w-1/2 rounded bg-blue-200" />
                    <div className="h-2.5 w-3/4 rounded bg-zinc-200" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
