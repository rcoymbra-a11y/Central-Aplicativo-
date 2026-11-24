import { useEffect, useRef, useState } from 'react';
import { ImageOff, Trash2, Upload, X } from 'lucide-react';
import {
  APP_CATEGORIES,
  AppCategory,
  AppFormValues,
  AppItem,
  DEFAULT_BUTTON_TEXT,
} from '../types/app';
import {
  isValidImageSource,
  isValidPaymentUrl,
  normalizeImageUrl,
  normalizePaymentUrl,
} from '../utils/storage';

interface AppModalProps {
  isOpen: boolean;
  editingApp: AppItem | null;
  onClose: () => void;
  onSave: (values: AppFormValues, editingId?: string) => void;
}

interface FormErrors {
  name?: string;
  description?: string;
  paymentUrl?: string;
  imageUrl?: string;
}

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        reject(new Error('Arquivo de imagem inválido.'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed.length < result.length ? compressed : result);
        } catch {
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export function AppModal({ isOpen, editingApp, onClose, onSave }: AppModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [category, setCategory] = useState<AppCategory>('Corpo & Performance');
  const [buttonText, setButtonText] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingApp) {
      setName(editingApp.name);
      setDescription(editingApp.description);
      setPaymentUrl(editingApp.paymentUrl);
      setCategory(editingApp.category);
      setButtonText(editingApp.buttonText);
      setBadge(editingApp.badge || '');
      setImageUrl(editingApp.imageUrl || '');
    } else {
      setName('');
      setDescription('');
      setPaymentUrl('');
      setCategory('Corpo & Performance');
      setButtonText('');
      setBadge('');
      setImageUrl('');
    }
    setPreviewError(false);
    setIsProcessingImage(false);
    setErrors({});
  }, [isOpen, editingApp]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Selecione um arquivo de imagem válido (JPG, PNG ou WebP).',
      }));
      return;
    }

    setIsProcessingImage(true);
    setErrors((prev) => ({ ...prev, imageUrl: undefined }));

    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImageUrl(dataUrl);
      setPreviewError(false);
    } catch {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Não foi possível carregar essa imagem. Tente outro arquivo.',
      }));
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setPreviewError(false);
    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const normalizedUrl = normalizePaymentUrl(paymentUrl);
    const trimmedImage = imageUrl.trim();
    const normalizedImage = trimmedImage ? normalizeImageUrl(trimmedImage) : '';

    if (!trimmedName) {
      nextErrors.name = 'Informe o nome do produto.';
    }
    if (!trimmedDescription) {
      nextErrors.description = 'Informe uma descrição clara do que o aplicativo entrega.';
    }
    if (!normalizedUrl) {
      nextErrors.paymentUrl = 'Informe o link direto para pagamento.';
    } else if (!isValidPaymentUrl(normalizedUrl)) {
      nextErrors.paymentUrl = 'Informe uma URL válida (ex.: https://pay.kiwify.com.br/...).';
    }
    if (normalizedImage && !isValidImageSource(normalizedImage)) {
      nextErrors.imageUrl = 'Informe uma URL de imagem válida ou envie um arquivo.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(
      {
        name: trimmedName,
        description: trimmedDescription,
        paymentUrl: normalizedUrl,
        category,
        buttonText: buttonText.trim() || DEFAULT_BUTTON_TEXT,
        badge: badge.trim(),
        imageUrl: normalizedImage,
      },
      editingApp?.id
    );
  };

  const isUploadedDataUrl = imageUrl.startsWith('data:image/');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h2
              id="app-modal-title"
              className="font-display text-xl font-bold tracking-tight text-zinc-900"
            >
              {editingApp ? 'Editar aplicativo' : 'Adicionar novo aplicativo'}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Os dados ficam salvos automaticamente no seu navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Nome do produto */}
          <div>
            <label
              htmlFor="app-name"
              className="block text-sm font-semibold text-zinc-900"
            >
              Nome do produto <span className="text-red-600">*</span>
            </label>
            <input
              id="app-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ex.: Destravando o Oculto"
              required
              className="mt-1.5 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-700">{errors.name}</p>
            )}
          </div>

          {/* Descrição do aplicativo */}
          <div>
            <label
              htmlFor="app-description"
              className="block text-sm font-semibold text-zinc-900"
            >
              Descrição do aplicativo <span className="text-red-600">*</span>
            </label>
            <textarea
              id="app-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Explique o que o app faz, quais etapas possui e qual dor ele resolve."
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-red-700">
                {errors.description}
              </p>
            )}
          </div>

          {/* Link direto para pagamento */}
          <div>
            <label
              htmlFor="app-payment-url"
              className="block text-sm font-semibold text-zinc-900"
            >
              Link direto para pagamento <span className="text-red-600">*</span>
            </label>
            <input
              id="app-payment-url"
              type="url"
              value={paymentUrl}
              onChange={(e) => {
                setPaymentUrl(e.target.value);
                if (errors.paymentUrl)
                  setErrors((prev) => ({ ...prev, paymentUrl: undefined }));
              }}
              onBlur={() => {
                if (paymentUrl.trim()) {
                  setPaymentUrl(normalizePaymentUrl(paymentUrl));
                }
              }}
              placeholder="https://pay.kiwify.com.br/seu-produto"
              required
              className="mt-1.5 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Se você digitar sem &ldquo;https://&rdquo;, adicionamos automaticamente.
            </p>
            {errors.paymentUrl && (
              <p className="mt-1 text-xs font-medium text-red-700">
                {errors.paymentUrl}
              </p>
            )}
          </div>

          {/* Imagem do produto (Upload ou URL) */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="app-image-url"
                className="block text-sm font-semibold text-zinc-900"
              >
                Imagem do produto{' '}
                <span className="font-normal text-zinc-500">(opcional)</span>
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-700 transition-colors duration-150 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remover imagem
                </button>
              )}
            </div>

            <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                id="app-image-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-800 transition-colors duration-150 hover:border-zinc-400 hover:bg-zinc-50 whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <Upload className="h-4 w-4 text-blue-800" aria-hidden="true" />
                {isProcessingImage ? 'Processando...' : 'Enviar do dispositivo'}
              </button>

              <input
                id="app-image-url"
                type="url"
                value={isUploadedDataUrl ? '' : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewError(false);
                  if (errors.imageUrl) {
                    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                  }
                }}
                onBlur={() => {
                  const trimmed = imageUrl.trim();
                  if (trimmed) {
                    setImageUrl(normalizeImageUrl(trimmed));
                  }
                }}
                placeholder={
                  isUploadedDataUrl
                    ? 'Imagem carregada do dispositivo'
                    : 'Ou cole o link da imagem (https://...)'
                }
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
              />
            </div>

            {errors.imageUrl && (
              <p className="mt-1.5 text-xs font-medium text-red-700">
                {errors.imageUrl}
              </p>
            )}

            {imageUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                {!previewError ? (
                  <img
                    src={imageUrl}
                    alt="Prévia da imagem do produto"
                    referrerPolicy="no-referrer"
                    onError={() => setPreviewError(true)}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 bg-zinc-100 px-4 text-center text-zinc-500">
                    <ImageOff className="h-5 w-5" aria-hidden="true" />
                    <span className="text-xs">
                      Não foi possível exibir a prévia deste link. Verifique a URL ou envie um arquivo.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categoria e Selo/Badge */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="app-category"
                className="block text-sm font-semibold text-zinc-900"
              >
                Categoria
              </label>
              <select
                id="app-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
              >
                {APP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="app-badge"
                className="block text-sm font-semibold text-zinc-900"
              >
                Selo / Badge <span className="font-normal text-zinc-500">(opcional)</span>
              </label>
              <input
                id="app-badge"
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex.: Novo, Mais vendido"
                maxLength={28}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
          </div>

          {/* Texto do botão */}
          <div>
            <label
              htmlFor="app-button-text"
              className="block text-sm font-semibold text-zinc-900"
            >
              Texto do botão de pagamento{' '}
              <span className="font-normal text-zinc-500">(opcional)</span>
            </label>
            <input
              id="app-button-text"
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder={DEFAULT_BUTTON_TEXT}
              maxLength={40}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            >
              {editingApp ? 'Salvar alterações' : 'Salvar na vitrine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
