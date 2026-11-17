import React, { useState } from 'react';
import { Check, Copy, Trash2, Upload } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { deleteMediaAsset, saveMediaAsset } from '../../services/firestoreService';
import { SafeImage } from '../common/SafeImage';

export const AdminMediaTab: React.FC = () => {
  const { media, user, refreshAll } = useSite();
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setFeedback('');

    try {
      let uploadedUrl = '';
      let provider: 'vercel-blob' | 'data-url' = 'vercel-blob';
      let pathname = file.name;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'x-filename': encodeURIComponent(file.name),
        },
        body: file,
      });

      if (res.ok) {
        const json = (await res.json()) as { url: string; pathname?: string; provider?: 'vercel-blob' | 'data-url' };
        uploadedUrl = json.url;
        pathname = json.pathname || file.name;
        provider = json.provider || 'vercel-blob';
      } else {
        throw new Error('Falha no upload');
      }

      await saveMediaAsset(
        {
          name: file.name,
          url: uploadedUrl,
          pathname,
          contentType: file.type,
          size: file.size,
          storageProvider: provider,
        },
        user.uid
      );
      await refreshAll();
      setFeedback(`Mídia "${file.name}" adicionada com sucesso (${provider}).`);
    } catch {
      // Client-side optimized fallback if backend upload endpoint is unavailable
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string' && reader.result.length < 480000) {
          await saveMediaAsset(
            {
              name: file.name,
              url: reader.result,
              contentType: file.type,
              size: file.size,
              storageProvider: 'data-url',
            },
            user.uid
          );
          await refreshAll();
          setFeedback(`Mídia "${file.name}" salva na biblioteca.`);
        } else {
          setFeedback('Imagem muito grande para fallback local. Configure BLOB_READ_WRITE_TOKEN para arquivos maiores.');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">Biblioteca de Mídia (Vercel Blob)</h2>
          <p className="text-xs text-[#0B1B32]/65">
            Envie imagens para uso nas capas, galerias, logo e landing pages.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer">
          <Upload className="h-4 w-4 text-[#E7C98F]" />
          <span>{uploading ? 'Enviando...' : 'Enviar imagem'}</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {feedback && (
        <p className="rounded-lg border border-[#B8863B]/30 bg-white px-4 py-2.5 text-xs font-medium text-[#0B1B32]">
          {feedback}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-[#0B1B32]/12 bg-white">
            <div className="aspect-[16/10] bg-[#EFEAE2]">
              <SafeImage src={item.url} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-semibold text-[#0B1B32]">{item.name}</p>
              <p className="mt-0.5 text-[11px] text-[#0B1B32]/55">{item.storageProvider}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(item.url);
                    setCopiedId(item.id);
                    setTimeout(() => setCopiedId(''), 2000);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-3 py-1.5 text-xs font-medium text-[#0B1B32] cursor-pointer"
                >
                  {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === item.id ? 'Copiada' : 'Copiar URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteMediaAsset(item.id);
                    await refreshAll();
                  }}
                  className="rounded-lg border border-red-200 p-1.5 text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
