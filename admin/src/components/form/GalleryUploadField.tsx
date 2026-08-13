/**
 * GalleryUploadField — multi-image upload with preview grid.
 *
 * - Shows existing image URLs from the backend (edit mode)
 * - Allows removing individual existing images
 * - Allows adding new images without replacing existing ones
 *
 * Backend: gallery: list[UploadFile] | None = File(None)
 * existing_gallery: str | None = Form(None)
 */
import { useRef, useState, useEffect } from 'react';
import { Images, X } from 'lucide-react';
import { resolveImageUrl } from '@/utils/utils';

interface GalleryUploadFieldProps {
  currentGalleryUrls?: string[] | null;
  onGalleryChange: (data: { existingUrls: string[]; newFiles: File[] }) => void;
  disabled?: boolean;
}

export function GalleryUploadField({
  currentGalleryUrls,
  onGalleryChange,
  disabled = false,
}: GalleryUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newPreviews, setNewPreviews] = useState<{ file: File; url: string }[]>([]);
  const [keptUrls, setKeptUrls] = useState<string[]>([]);

  const galleryUrlsString = JSON.stringify(currentGalleryUrls);

  // Sync state whenever the external gallery URLs change (e.g., after a restore)
  useEffect(() => {
    setKeptUrls(currentGalleryUrls || []);
  }, [currentGalleryUrls, galleryUrlsString]);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    const updatedPreviews = [...newPreviews, ...newItems];
    setNewPreviews(updatedPreviews);
    onGalleryChange({
      existingUrls: keptUrls,
      newFiles: updatedPreviews.map((p) => p.file),
    });
    // Reset input so the same files can be selected again if needed
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClearAll = () => {
    setNewPreviews([]);
    setKeptUrls([]);
    onGalleryChange({ existingUrls: [], newFiles: [] });
  };

  const handleRemoveExisting = (index: number) => {
    const updated = keptUrls.filter((_, i) => i !== index);
    setKeptUrls(updated);
    onGalleryChange({ existingUrls: updated, newFiles: newPreviews.map((p) => p.file) });
  };

  const handleRemoveNew = (index: number) => {
    const updated = newPreviews.filter((_, i) => i !== index);
    setNewPreviews(updated);
    onGalleryChange({ existingUrls: keptUrls, newFiles: updated.map((p) => p.file) });
  };

  const totalCount = keptUrls.length + newPreviews.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Gallery Images {totalCount > 0 ? <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-primary">({totalCount})</span> : ''}
        </label>
        {totalCount > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-destructive hover:text-destructive transition-colors"
          >
            Clear Gallery
          </button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {keptUrls.map((url, i) => (
            <div key={`existing-${i}`} className="relative group">
              <img
                src={resolveImageUrl(url) ?? ''}
                alt={`Existing Gallery ${i + 1}`}
                className="h-24 w-full rounded-lg object-cover border border-border"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(i)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white opacity-0 group-hover:opacity-100 hover:opacity-90 transition-all shadow-md"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {newPreviews.map((item, i) => (
            <div key={`new-${i}`} className="relative group">
              <img
                src={item.url}
                alt={`New Gallery ${i + 1}`}
                className="h-24 w-full rounded-lg object-cover border border-primary"
              />
              <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveNew(i)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white opacity-0 group-hover:opacity-100 hover:opacity-90 transition-all shadow-md"
                  title="Remove new image"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={[
            'flex items-center justify-center gap-2 rounded-lg border-2 border-dashed',
            'border-border py-3 text-muted-foreground text-sm',
            'hover:border-primary hover:text-primary transition-colors cursor-pointer',
          ].join(' ')}
        >
          <Images size={16} />
          <span>Add gallery images</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        multiple
        className="hidden"
        onChange={handleFilesSelect}
        disabled={disabled}
      />
    </div>
  );
}
