import { useRef, useState } from "react";
import { ALLOWED_IMAGE_EXTENSIONS } from "../api/products";

const ACCEPT_ATTR = ALLOWED_IMAGE_EXTENSIONS.join(",");

/**
 * Unified multi-image uploader and manager for Create / Edit Product forms.
 * Supports removing existing images, adding multiple new images alongside kept
 * existing images, reordering primary image, and drag-and-drop selection.
 */
export default function ProductImagesInput({
  images,
  onAddFiles,
  onRemoveImage,
  onSetPrimary,
  onClearAll,
  onResetSaved,
  canResetSaved = false,
  imageError,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileInputChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAddFiles(files);
    }
    // Reset input value so picking again appends more files seamlessly
    e.target.value = "";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      onAddFiles(files);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Product Images ({images.length})
        </label>
        <span className="text-[11px] text-slate-500">
          Allowed: {ALLOWED_IMAGE_EXTENSIONS.join(", ")}
        </span>
      </div>

      {/* Dropzone & Multi-File Picker */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-4 text-center transition ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/70"
            : "border-slate-300 bg-slate-50/70 hover:border-indigo-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700">
              {images.length > 0
                ? "Add more images or drag & drop files here"
                : "Select or drag & drop product images"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose multiple files at once or add them one by one. First image
              is the primary thumbnail.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            + Add Images
          </button>
        </div>
      </div>

      {imageError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {imageError}
        </div>
      )}

      {/* Unified Previews Grid (Existing Saved + Newly Added) */}
      {images.length > 0 && (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {images.length} {images.length === 1 ? "image" : "images"} selected
            </span>
            <div className="flex items-center gap-3">
              {canResetSaved && onResetSaved && (
                <button
                  type="button"
                  onClick={onResetSaved}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Reset saved
                </button>
              )}
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="relative aspect-square bg-slate-900">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {index === 0 ? (
                    <span className="absolute top-1.5 left-1.5 rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetPrimary(item.id)}
                      title="Make primary image"
                      className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/80 hover:bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white transition cursor-pointer"
                    >
                      Set Primary
                    </button>
                  )}

                  <span
                    className={`absolute bottom-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold shadow ${
                      item.kind === "existing"
                        ? "bg-slate-900/75 text-slate-200"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {item.kind === "existing" ? "Saved" : "New"}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveImage(item.id)}
                    aria-label={`Remove ${item.name}`}
                    title="Remove image"
                    className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="px-1.5 py-1 text-[10px] text-slate-600 truncate border-t border-slate-100">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
