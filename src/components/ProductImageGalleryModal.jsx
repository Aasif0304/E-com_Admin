import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getProductImageUrls } from "../api/products";

/**
 * Admin modal displaying a product's details and full image gallery.
 */
export default function ProductImageGalleryModal({
  product,
  categoryName,
  onClose,
  onEdit,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageUrls = getProductImageUrls(product);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const safeIndex =
    activeIndex >= 0 && activeIndex < imageUrls.length ? activeIndex : 0;
  const activeUrl = imageUrls[safeIndex] || "";

  function showPrev() {
    setActiveIndex((idx) => (idx <= 0 ? imageUrls.length - 1 : idx - 1));
  }

  function showNext() {
    setActiveIndex((idx) => (idx >= imageUrls.length - 1 ? 0 : idx + 1));
  }

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title={`Product #${product.id} — ${product.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Main Image Viewer */}
        {imageUrls.length > 0 ? (
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center">
              <img
                src={activeUrl}
                alt={`${product.name} (${safeIndex + 1} of ${imageUrls.length})`}
                className="w-full h-full object-contain"
              />

              {safeIndex === 0 && (
                <span className="absolute top-3 left-3 rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white shadow">
                  Primary Image
                </span>
              )}

              <span className="absolute top-3 right-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white">
                {safeIndex + 1} / {imageUrls.length}
              </span>

              {imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white font-bold flex items-center justify-center transition cursor-pointer"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {imageUrls.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {imageUrls.map((url, index) => {
                  const isActive = index === safeIndex;
                  return (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer bg-slate-900 ${
                        isActive
                          ? "border-indigo-600 ring-2 ring-indigo-500/30"
                          : "border-slate-200 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-[9px] font-bold text-white text-center py-0.5">
                          Primary
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 text-sm">
            <div className="text-3xl mb-1">📦</div>
            No images uploaded for this product.
          </div>
        )}

        {/* Product Details Summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              {categoryName || "General"}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Stock: {product.stock ?? 0} units
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Edit Product
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

