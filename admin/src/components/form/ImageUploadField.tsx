/**
 * ImageUploadField — single image upload with preview.
 *
 * - Shows existing image URL as a thumbnail (for edit mode)
 * - Local preview via URL.createObjectURL when a new file is selected
 * - "Clear" button removes the current selection before submit
 *
 * Backend: cover_image: UploadFile | None = File(None)
 * Allowed: .jpg, .jpeg, .png, .webp, .gif
 */
import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';

interface ImageUploadFieldProps {
 label: string;
 currentImageUrl?: string | null;
 onFileChange: (file: File | null) => void;
 onRemoveChange?: (isRemoved: boolean) => void;
 disabled?: boolean;
}

export function ImageUploadField({
 label,
 currentImageUrl,
 onFileChange,
 onRemoveChange,
 disabled = false,
}: ImageUploadFieldProps) {
 const inputRef = useRef<HTMLInputElement>(null);
 const [preview, setPreview] = useState<string | null>(null);
 const [isRemoved, setIsRemoved] = useState(false);

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0] ?? null;
 if (!file) return;
 const objectUrl = URL.createObjectURL(file);
 setPreview(objectUrl);
 setIsRemoved(false);
 onFileChange(file);
 onRemoveChange?.(false);
 };

 const handleClear = () => {
 setPreview(null);
 setIsRemoved(true);
 onFileChange(null);
 onRemoveChange?.(true);
 if (inputRef.current) inputRef.current.value = '';
 };

 const displayImage = preview ?? (isRemoved ? null : resolveImageUrl(currentImageUrl));

 return (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium text-foreground">{label}</label>

 {displayImage ? (
 <div className="relative w-full max-w-xs">
 <img
 src={displayImage}
 alt="Preview"
 className="h-36 w-full rounded-lg object-cover border border-border"
 />
 {!disabled && (
 <button
 type="button"
 onClick={handleClear}
 className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white hover:opacity-90 transition-colors"
 title="Remove image"
 >
 <X size={12} />
 </button>
 )}
 {!disabled && (
 <button
 type="button"
 onClick={() => inputRef.current?.click()}
 className="mt-2 rounded bg-accent px-2.5 py-1 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
 >
 Replace image
 </button>
 )}
 </div>
 ) : (
 <button
 type="button"
 onClick={() => inputRef.current?.click()}
 disabled={disabled}
 className={[
 'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed',
 'border-border h-36 w-full max-w-xs text-muted-foreground text-sm',
 'hover:border-primary hover:text-primary transition-colors',
 disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
 ].join(' ')}
 >
 <Upload size={20} />
 <span>Upload image</span>
 <span className="text-xs">JPG, PNG, WebP, GIF</span>
 </button>
 )}

 <input
 ref={inputRef}
 type="file"
 accept=".jpg,.jpeg,.png,.webp,.gif"
 className="hidden"
 onChange={handleFileSelect}
 disabled={disabled}
 />
 </div>
 );
}
