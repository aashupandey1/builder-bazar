// Generic media-asset hook: File + object URL + status for one named slot
// (e.g. 'background', 'logo', or any future slot) — backed by MediaContext,
// which is mounted above the router so the asset survives navigation
// between pages like Editor and LivePreview.
//
// Validation (which mime types/extensions are acceptable for this slot) and
// where the resulting serializable metadata gets written (editorStore's
// `background` field, a layer's `data`, or anything else) are both left to
// the caller via `accept` and `onMeta`. This hook has zero built-in
// knowledge of what a slot is *for* — adding a new media slot elsewhere in
// the app never means touching this file, which is the whole point of it
// replacing separate per-slot hooks (useBackgroundMedia/useLogoMedia).
import { useCallback } from 'react';
import { useMediaContext } from '../context/MediaContext';

function detectType(file, accept) {
  const name = file.name?.toLowerCase() || '';
  for (const [type, { mimes = [], exts = [] }] of Object.entries(accept)) {
    if (mimes.includes(file.type) || exts.some((ext) => name.endsWith(ext))) return type;
  }
  return null;
}

/**
 * @param {string} slot - unique name for this media asset, e.g. 'background', 'logo'.
 * @param {object} [options]
 * @param {object} [options.accept] - map of type -> { mimes, exts }. Omit to accept any file.
 * @param {(meta: {type, name, size, mimeType} | null) => void} [options.onMeta] - called with
 *   serializable metadata on successful upload, or `null` on remove.
 * @param {string} [options.unsupportedMessage] - shown when a file doesn't match `accept`.
 */
export function useMediaAsset(slot, { accept, onMeta, unsupportedMessage } = {}) {
  const { getAsset, upload: ctxUpload, remove: ctxRemove, setError, handleReady: ctxHandleReady, handleMediaError: ctxHandleMediaError } = useMediaContext();
  const asset = getAsset(slot);

  const upload = useCallback((file) => {
    if (!file) return;

    const type = accept ? detectType(file, accept) : 'file';
    if (accept && !type) {
      setError(slot, unsupportedMessage || 'Unsupported file type.');
      return;
    }

    ctxUpload(slot, file);
    onMeta?.({ type, name: file.name, size: file.size, mimeType: file.type || null });
  }, [slot, accept, unsupportedMessage, ctxUpload, setError, onMeta]);

  const remove = useCallback(() => {
    ctxRemove(slot);
    onMeta?.(null);
  }, [slot, ctxRemove, onMeta]);

  const handleReady = useCallback(() => ctxHandleReady(slot), [slot, ctxHandleReady]);
  const handleMediaError = useCallback(() => ctxHandleMediaError(slot), [slot, ctxHandleMediaError]);

  return { ...asset, upload, remove, handleReady, handleMediaError };
}
