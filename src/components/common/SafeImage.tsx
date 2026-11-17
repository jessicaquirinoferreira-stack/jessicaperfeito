import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn, resolveAssetUrl } from '../../lib/utils';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackTitle,
  priority = false,
}) => {
  const resolvedSrc = resolveAssetUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1B32] via-[#132A4B] to-[#1D3B66] p-6 text-center text-white/85',
          className
        )}
      >
        <Building2 className="h-8 w-8 text-[#E7C98F]" />
        <span className="mt-2 text-xs font-medium tracking-wide text-white/75">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
