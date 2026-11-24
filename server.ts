import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const CATALOG_FILE = path.resolve(DATA_DIR, 'catalog.json');

interface ServerAppItem {
  id: string;
  name: string;
  description: string;
  paymentUrl: string;
  category:
    | 'Corpo & Performance'
    | 'Dinheiro & Bloqueios'
    | 'Emoções & Rotina'
    | 'Em breve';
  buttonText: string;
  badge?: string;
  imageUrl?: string;
  isDefault?: boolean;
  createdAt: number;
}

interface CatalogData {
  apps: ServerAppItem[];
  brandSubtitle: string;
}

const VALID_CATEGORIES = new Set([
  'Corpo & Performance',
  'Dinheiro & Bloqueios',
  'Emoções & Rotina',
  'Em breve',
]);

const DEFAULT_BRAND_SUBTITLE = 'HUB DE APPS PRO · Ferramentas digitais da sua marca';

const DEFAULT_APPS: ServerAppItem[] = [
  {
    id: 'shapecalc-pro',
    name: 'ShapeCalc Pro',
    category: 'Corpo & Performance',
    badge: 'Mais acessado',
    description:
      'Monte seu protocolo personalizado de dieta, treino e cardio em 3 passos com cálculo em tempo real e relatório completo em PDF.',
    buttonText: 'Acessar pagamento →',
    paymentUrl: 'https://SEU-LINK-PAGAMENTO-SHAPECALC.com',
    imageUrl: '/src/assets/images/product_shapecalc_pro_1795487933938.jpg',
    isDefault: true,
    createdAt: 1700000001000,
  },
  {
    id: 'destravando-o-oculto',
    name: 'Destravando o Oculto',
    category: 'Dinheiro & Bloqueios',
    badge: 'Novo',
    description:
      'Descubra a trava emocional invisível que sabota sua relação com o dinheiro e receba um dossiê com plano prático de 7 dias.',
    buttonText: 'Acessar pagamento →',
    paymentUrl: 'https://SEU-LINK-PAGAMENTO-DESTRAVANDO.com',
    imageUrl: '/src/assets/images/product_destravando_oculto_1795487933476.jpg',
    isDefault: true,
    createdAt: 1700000002000,
  },
];

function ensureStorageDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function persistImageIfDataUrl(imageUrl: unknown, appId: string): string | undefined {
  if (typeof imageUrl !== 'string') return undefined;
  const trimmed = imageUrl.trim();
  if (!trimmed) return undefined;

  const dataUrlMatch = trimmed.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
  if (!dataUrlMatch) {
    return trimmed;
  }

  const rawExt = dataUrlMatch[1].toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const base64Data = dataUrlMatch[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Guard max 4MB image upload
  if (buffer.length > 4 * 1024 * 1024) {
    throw new Error('Imagem excede o limite máximo de 4 MB.');
  }

  ensureStorageDirs();
  const safeId = appId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || 'app';
  const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 12);
  const filename = `${safeId}-${hash}.${ext}`;
  const filePath = path.resolve(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buffer);
  }

  return `/uploads/${filename}`;
}

function sanitizeAppInput(raw: unknown): ServerAppItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  const id =
    typeof item.id === 'string' && item.id.trim()
      ? item.id.trim()
      : crypto.randomUUID();
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const description = typeof item.description === 'string' ? item.description.trim() : '';
  const paymentUrl = typeof item.paymentUrl === 'string' ? item.paymentUrl.trim() : '';

  if (!name || !description || !paymentUrl) return null;

  const category =
    typeof item.category === 'string' && VALID_CATEGORIES.has(item.category)
      ? (item.category as ServerAppItem['category'])
      : 'Corpo & Performance';

  const buttonText =
    typeof item.buttonText === 'string' && item.buttonText.trim()
      ? item.buttonText.trim()
      : 'Comprar / Acessar agora →';

  const badge =
    typeof item.badge === 'string' && item.badge.trim() ? item.badge.trim() : undefined;

  const defaultImg = DEFAULT_APPS.find((d) => d.id === id)?.imageUrl;
  const imageUrl = persistImageIfDataUrl(item.imageUrl, id) || defaultImg;

  return {
    id,
    name,
    description,
    paymentUrl,
    category,
    buttonText,
    badge,
    imageUrl,
    isDefault: Boolean(item.isDefault),
    createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
  };
}

function readCatalog(): CatalogData {
  ensureStorageDirs();

  if (!fs.existsSync(CATALOG_FILE)) {
    const initial: CatalogData = {
      apps: DEFAULT_APPS,
      brandSubtitle: DEFAULT_BRAND_SUBTITLE,
    };
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CatalogData>;
    const apps = Array.isArray(parsed.apps)
      ? parsed.apps
          .map((item) => sanitizeAppInput(item))
          .filter((item): item is ServerAppItem => item !== null)
      : DEFAULT_APPS;

    const brandSubtitle =
      typeof parsed.brandSubtitle === 'string' && parsed.brandSubtitle.trim()
        ? parsed.brandSubtitle.trim()
        : DEFAULT_BRAND_SUBTITLE;

    return { apps, brandSubtitle };
  } catch {
    return {
      apps: DEFAULT_APPS,
      brandSubtitle: DEFAULT_BRAND_SUBTITLE,
    };
  }
}

function writeCatalog(data: CatalogData): CatalogData {
  ensureStorageDirs();
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

async function startServer(): Promise<void> {
  ensureStorageDirs();

  const app = express();
  app.use(express.json({ limit: '6mb' }));

  // Serve uploaded product photos to all visitors
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      maxAge: '7d',
      fallthrough: true,
    })
  );

  // Public catalog read endpoint (shared across all visitors)
  app.get('/api/catalog', (_req, res) => {
    const catalog = readCatalog();
    res.json(catalog);
  });

  // Create new app
  app.post('/api/apps', (req, res) => {
    try {
      const catalog = readCatalog();
      const newApp = sanitizeAppInput({
        ...req.body,
        id:
          typeof req.body?.id === 'string' && req.body.id.trim()
            ? req.body.id.trim()
            : crypto.randomUUID(),
        isDefault: false,
        createdAt: Date.now(),
      });

      if (!newApp) {
        res.status(400).json({ error: 'Dados do aplicativo inválidos.' });
        return;
      }

      const nextCatalog = writeCatalog({
        ...catalog,
        apps: [newApp, ...catalog.apps],
      });

      res.status(201).json({ app: newApp, catalog: nextCatalog });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao salvar aplicativo.',
      });
    }
  });

  // Update existing app
  app.put('/api/apps/:id', (req, res) => {
    try {
      const catalog = readCatalog();
      const targetId = req.params.id;
      const existing = catalog.apps.find((item) => item.id === targetId);

      if (!existing) {
        res.status(404).json({ error: 'Aplicativo não encontrado.' });
        return;
      }

      const updatedApp = sanitizeAppInput({
        ...existing,
        ...req.body,
        id: targetId,
        createdAt: existing.createdAt,
      });

      if (!updatedApp) {
        res.status(400).json({ error: 'Dados do aplicativo inválidos.' });
        return;
      }

      // Allow explicitly clearing imageUrl when editing
      if (req.body?.imageUrl === '' || req.body?.imageUrl === null) {
        updatedApp.imageUrl = undefined;
      }

      const nextCatalog = writeCatalog({
        ...catalog,
        apps: catalog.apps.map((item) => (item.id === targetId ? updatedApp : item)),
      });

      res.json({ app: updatedApp, catalog: nextCatalog });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar aplicativo.',
      });
    }
  });

  // Delete app
  app.delete('/api/apps/:id', (req, res) => {
    const catalog = readCatalog();
    const targetId = req.params.id;
    const nextCatalog = writeCatalog({
      ...catalog,
      apps: catalog.apps.filter((item) => item.id !== targetId),
    });
    res.json({ catalog: nextCatalog });
  });

  // Reset default apps
  app.post('/api/catalog/reset', (_req, res) => {
    const current = readCatalog();
    const nextCatalog = writeCatalog({
      apps: DEFAULT_APPS,
      brandSubtitle: current.brandSubtitle,
    });
    res.json({ catalog: nextCatalog });
  });

  // Update editable brand subtitle
  app.put('/api/brand-subtitle', (req, res) => {
    const catalog = readCatalog();
    const nextSubtitle =
      typeof req.body?.brandSubtitle === 'string' && req.body.brandSubtitle.trim()
        ? req.body.brandSubtitle.trim().slice(0, 80)
        : DEFAULT_BRAND_SUBTITLE;

    const nextCatalog = writeCatalog({
      ...catalog,
      brandSubtitle: nextSubtitle,
    });

    res.json({ brandSubtitle: nextCatalog.brandSubtitle, catalog: nextCatalog });
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
