import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const COMPRESSIBLE_RE = /text\/|javascript|ecmascript|json|xml|svg/i;
const SKIP_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif|woff2?|ico|mp4|webm)(\?|$)/i;

function fastGzipMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.headers.range || SKIP_EXT_RE.test(req.url)) return next();
  const accept = String(req.headers['accept-encoding'] || '');
  if (!accept.includes('gzip')) return next();

  const origWriteHead = res.writeHead.bind(res);
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  let decided = false;
  let gzipStream: zlib.Gzip | null = null;

  const startGzipStream = () => {
    const gz = zlib.createGzip({ level: zlib.constants.Z_BEST_SPEED });
    gz.on('data', (chunk: Buffer) => {
      origWrite(chunk);
    });
    gz.on('end', () => {
      origEnd();
    });
    gzipStream = gz;
  };

  const shouldCompress = (status: number, contentType: string, encoding: unknown): boolean => {
    if (status >= 300 || status === 204 || encoding) return false;
    return COMPRESSIBLE_RE.test(contentType);
  };

  res.writeHead = ((
    statusCode: number,
    reasonOrHeaders?: string | Record<string, string | string[] | number>,
    maybeHeaders?: Record<string, string | string[] | number>
  ) => {
    if (!decided) {
      decided = true;
      const headersObj =
        typeof reasonOrHeaders === 'object' && reasonOrHeaders !== null
          ? reasonOrHeaders
          : maybeHeaders;
      let contentType = String(res.getHeader('content-type') || '');
      let existingEncoding = res.getHeader('content-encoding');

      if (headersObj) {
        for (const [k, v] of Object.entries(headersObj)) {
          const lower = k.toLowerCase();
          if (lower === 'content-type') contentType = String(v);
          if (lower === 'content-encoding') existingEncoding = v;
        }
      }

      if (shouldCompress(statusCode, contentType, existingEncoding)) {
        res.removeHeader('content-length');
        if (headersObj) {
          for (const k of Object.keys(headersObj)) {
            if (k.toLowerCase() === 'content-length') delete headersObj[k];
          }
          headersObj['Content-Encoding'] = 'gzip';
          headersObj['Vary'] = 'Accept-Encoding';
        } else {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
        }
        startGzipStream();
      }
    }

    if (typeof reasonOrHeaders === 'string') {
      return origWriteHead(statusCode, reasonOrHeaders, maybeHeaders as never);
    }
    return origWriteHead(statusCode, reasonOrHeaders as never);
  }) as typeof res.writeHead;

  const initOnBody = (): boolean => {
    if (decided) return Boolean(gzipStream);
    decided = true;
    const status = res.statusCode || 200;
    const contentType = String(res.getHeader('content-type') || '');
    const existingEncoding = res.getHeader('content-encoding');

    if (!shouldCompress(status, contentType, existingEncoding)) {
      return false;
    }

    res.removeHeader('content-length');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    startGzipStream();
    return true;
  };

  res.write = ((chunk: unknown, encoding?: unknown, cb?: unknown) => {
    if (!decided) {
      initOnBody();
    }
    if (gzipStream) {
      return gzipStream.write(chunk as Buffer, encoding as BufferEncoding, cb as () => void);
    }
    return origWrite(chunk as Buffer, encoding as BufferEncoding, cb as () => void);
  }) as typeof res.write;

  res.end = ((chunk?: unknown, encoding?: unknown, cb?: unknown) => {
    if (!decided) {
      if (chunk === undefined || chunk === null) {
        decided = true;
        return origEnd(encoding as BufferEncoding, cb as () => void);
      }
      if (initOnBody() && gzipStream) {
        gzipStream.write(chunk as Buffer, encoding as BufferEncoding);
        gzipStream.end(cb as () => void);
        return res;
      }
      return origEnd(chunk as Buffer, encoding as BufferEncoding, cb as () => void);
    }
    if (gzipStream) {
      if (chunk !== undefined && chunk !== null) {
        gzipStream.write(chunk as Buffer, encoding as BufferEncoding);
      }
      gzipStream.end(cb as () => void);
      return res;
    }
    return origEnd(chunk as Buffer, encoding as BufferEncoding, cb as () => void);
  }) as typeof res.end;

  next();
}

async function startServer() {
  const app = express();
  app.use(fastGzipMiddleware);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'jessica-perfeito-imoveis' });
  });

  // Dynamic SEO robots.txt & sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const staticPaths = [
      '/',
      '/comprar',
      '/empreendimentos',
      '/empreendimento/residencial-heitor-dos-prazeres',
      '/empreendimento/porto-maravilha-residencial',
      '/imovel/apartamento-2-quartos-porto-maravilha-rj',
      '/imovel/studios-para-investidores-porto-maravilha-rj',
      '/imovel/unidade-residencial-heitor-dos-prazeres-rj',
      '/oportunidade/porto-maravilha',
      '/oportunidade/heitor-dos-prazeres',
      '/campanha/novo-lar',
      '/sobre',
      '/contato',
      '/privacidade',
    ];
    const urls = staticPaths
      .map((p) => `<url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq></url>`)
      .join('');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
    );
  });

  // Vercel Blob Upload Endpoint (raw body / multipart fallback)
  app.post('/api/upload', express.raw({ type: '*/*', limit: '6mb' }), async (req, res) => {
    try {
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      const rawBody = req.body as Buffer;
      if (!rawBody || rawBody.length === 0) {
        return res.status(400).json({ error: 'Arquivo vazio.' });
      }

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const rawName = typeof req.headers['x-filename'] === 'string'
          ? decodeURIComponent(req.headers['x-filename'])
          : 'upload.jpg';
        const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filename = `imoveis/${Date.now()}-${safeName}`;
        const blob = await put(filename, rawBody, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType,
        });
        return res.json({ url: blob.url, pathname: blob.pathname, provider: 'vercel-blob' });
      }

      return res.status(501).json({
        error: 'BLOB_READ_WRITE_TOKEN não configurado; utilizando fallback local.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Falha ao processar upload.' });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true as const },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      '/src/assets/images',
      express.static(path.resolve(__dirname, 'src/assets/images'), { maxAge: '7d' })
    );
    app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '30d', immutable: true }));
    app.use(express.static(distDir, { maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
