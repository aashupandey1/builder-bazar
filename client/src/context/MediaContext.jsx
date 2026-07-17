// Generic, slot-based registry for non-serializable media assets (File +
// object URL + upload status). Mounted once in App.jsx *above* <AppRoutes/>,
// so it never unmounts on route change — this is what lets a page like
// LivePreview see the same background/logo media the Editor just uploaded,
// even though Editor and LivePreview are separate routes with no shared
// parent route of their own.
//
// This context is deliberately blank slate: it knows nothing about
// "background" or "logo" specifically, and nothing new has to be added
// here to support a future slot (e.g. "watermark", "introClip") — the
// caller just picks a new slot name. Serializable metadata for a slot
// (name/size/mimeType, or whatever a slot needs) still lives wherever it
// always has — editorStore.background, a layer's `data`, etc. — via the
// `onMeta` callback passed to useMediaAsset(). This context only ever
// holds File objects and blob: URLs, which must never enter Zustand.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const MediaContext = createContext(null);

const EMPTY_ASSET = { file: null, url: null, status: 'idle', error: null };

export function MediaProvider({ children }) {
  const [assets, setAssets] = useState({});
  // One object URL per slot, tracked outside React state so it can be
  // revoked synchronously the instant a slot's file changes or is removed —
  // not dependent on effect timing/ordering across an arbitrary number of
  // slots.
  const urlsRef = useRef({});

  const getAsset = useCallback((slot) => assets[slot] || EMPTY_ASSET, [assets]);

  const setSlot = useCallback((slot, partial) => {
    setAssets((prev) => ({ ...prev, [slot]: { ...EMPTY_ASSET, ...prev[slot], ...partial } }));
  }, []);

  const upload = useCallback((slot, file) => {
    if (urlsRef.current[slot]) URL.revokeObjectURL(urlsRef.current[slot]);
    const url = URL.createObjectURL(file);
    urlsRef.current[slot] = url;
    setSlot(slot, { file, url, status: 'loading', error: null });
  }, [setSlot]);

  const remove = useCallback((slot) => {
    if (urlsRef.current[slot]) {
      URL.revokeObjectURL(urlsRef.current[slot]);
      delete urlsRef.current[slot];
    }
    setSlot(slot, EMPTY_ASSET);
  }, [setSlot]);

  const setError = useCallback((slot, message) => {
    setSlot(slot, { status: 'error', error: message });
  }, [setSlot]);

  // Wired to onLoad (image) / onLoadedData (video) by the consuming page.
  const handleReady = useCallback((slot) => setSlot(slot, { status: 'ready' }), [setSlot]);

  // Wired to onError on the rendered <img>/<video> — catches cases where the
  // file passed validation but the browser still can't decode it.
  const handleMediaError = useCallback((slot) => {
    setSlot(slot, { status: 'error', error: 'Failed to load media. Try a different file.' });
  }, [setSlot]);

  // Belt-and-braces cleanup if the provider itself ever unmounts (app
  // teardown) — revoke anything still outstanding.
  useEffect(() => () => {
    Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const value = { getAsset, upload, remove, setError, handleReady, handleMediaError };

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMediaContext() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMediaContext must be used within a MediaProvider');
  return ctx;
}
