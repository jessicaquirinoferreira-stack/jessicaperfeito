import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || 'application/octet-stream';
    const rawBuffer = Buffer.from(await request.arrayBuffer());

    if (!rawBuffer.length) {
      return Response.json({ error: 'Arquivo vazio.' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return Response.json(
        { error: 'BLOB_READ_WRITE_TOKEN não configurado; utilizando fallback local.' },
        { status: 501 }
      );
    }

    const rawNameHeader = request.headers.get('x-filename');
    const rawName = rawNameHeader ? decodeURIComponent(rawNameHeader) : 'upload.jpg';
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filename = `imoveis/${Date.now()}-${safeName}`;

    const blob = await put(filename, rawBuffer, {
      access: 'public',
      token,
      contentType,
    });

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
      provider: 'vercel-blob',
    });
  } catch (error) {
    console.error('Vercel upload error:', error);
    return Response.json({ error: 'Falha ao processar upload.' }, { status: 500 });
  }
}
