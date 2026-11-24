import { useEffect, useState } from 'react';
import { ArrowUpRight, ImageOff, Pencil, Trash2 } from 'lucide-react';
import { AppItem } from '../types/app';

interface AppCardProps {
  app: AppItem;
  onEdit: (app: AppItem) => void;
  onDelete: (id: string) => void;
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [app.imageUrl]);

  return (
    <article className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors duration-150 hover:border-zinc-300">
      <div>
        {app.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-zinc-200 bg-zinc-100">
            {!imageError ? (
              <img
                src={app.imageUrl}
                alt={`Capa do aplicativo ${app.name}`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-zinc-100 to-zinc-200/70 px-4 text-center text-zinc-500">
                <ImageOff className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium">{app.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="px-6 pt-6">
          {/* Zero-pill metadata line: category + optional badge */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-600">{app.category}</span>
            {app.badge && (
              <>
                <span aria-hidden="true" className="text-zinc-300">
                  ·
                </span>
                <span className="font-semibold text-blue-800">{app.badge}</span>
              </>
            )}
          </div>

          <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-zinc-900">
            {app.name}
          </h3>

          <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-600">
            {app.description}
          </p>
        </div>
      </div>

      <div className="mt-6 px-6 pb-6">
        <div className="border-t border-zinc-100 pt-5">
          {confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-700">
                Excluir este aplicativo?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(app.id)}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-800"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <a
                href={app.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                <span className="truncate">{app.buttonText}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit(app)}
                  aria-label={`Editar ${app.name}`}
                  title="Editar aplicativo"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  aria-label={`Excluir ${app.name}`}
                  title="Excluir aplicativo"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
