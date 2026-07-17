import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { useEditorStore } from '../../store/editorStore';
import { useMediaAsset } from '../../hooks/useMediaAsset';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { BACKGROUND_MEDIA_ACCEPT, LOGO_MEDIA_ACCEPT } from '../../constants';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import './LivePreview.css';

const LOGO_GALLERY_KEY = 'bb_logo_gallery';

function loadLogoGallery() {
  try {
    return JSON.parse(localStorage.getItem(LOGO_GALLERY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToLogoGallery(dataUrl) {
  const gallery = loadLogoGallery();
  const next = [{ id: Date.now(), dataUrl }, ...gallery].slice(0, 20);
  localStorage.setItem(LOGO_GALLERY_KEY, JSON.stringify(next));
  return next;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl, filename = 'logo.png') {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getContrastColor(hex) {
  const c = (hex || '').replace('#', '');
  if (c.length !== 6) return '#000000';
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#000000' : '#ffffff';
}

const TEXT_FONT_OPTIONS = [
  { id: 'olivia', label: 'Olivia', fontFamily: "'Brush Script MT', cursive" },
  { id: 'modern', label: 'Modern', fontFamily: "'Arial Black', sans-serif" },
  { id: 'classic', label: 'Classic', fontFamily: 'inherit' },
  { id: 'signature', label: 'Signature', fontFamily: "'Segoe Script', cursive" },
  { id: 'poppins', label: 'Poppins', fontFamily: "'Poppins', sans-serif" },
  { id: 'inter', label: 'Inter', fontFamily: "'Inter', sans-serif" },
  { id: 'roboto', label: 'Roboto', fontFamily: "'Roboto', sans-serif" },
  { id: 'montserrat', label: 'Montserrat', fontFamily: "'Montserrat', sans-serif" },
  { id: 'raleway', label: 'Raleway', fontFamily: "'Raleway', sans-serif" },
  { id: 'oswald', label: 'Oswald', fontFamily: "'Oswald', sans-serif" },
  { id: 'anton', label: 'Anton', fontFamily: "'Anton', sans-serif" },
  { id: 'bebasneue', label: 'Bebas Neue', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'playfair', label: 'Playfair', fontFamily: "'Playfair Display', serif" },
  { id: 'dancingscript', label: 'Dancing Script', fontFamily: "'Dancing Script', cursive" },
  { id: 'pacifico', label: 'Pacifico', fontFamily: "'Pacifico', cursive" },
  { id: 'lobster', label: 'Lobster', fontFamily: "'Lobster', cursive" },
  { id: 'greatvibes', label: 'Great Vibes', fontFamily: "'Great Vibes', cursive" },
  { id: 'cinzel', label: 'Cinzel', fontFamily: "'Cinzel', serif" },
  { id: 'archivoblack', label: 'Archivo Black', fontFamily: "'Archivo Black', sans-serif" },
  { id: 'abrilfatface', label: 'Abril Fatface', fontFamily: "'Abril Fatface', cursive" },
  { id: 'caveat', label: 'Caveat', fontFamily: "'Caveat', cursive" },
  { id: 'satisfy', label: 'Satisfy', fontFamily: "'Satisfy', cursive" },
  { id: 'permanentmarker', label: 'Permanent Marker', fontFamily: "'Permanent Marker', cursive" },
  { id: 'fredoka', label: 'Fredoka', fontFamily: "'Fredoka', sans-serif" },
];

const TEXT_ALIGN_CYCLE = ['center', 'left', 'right'];
const TEXT_STYLE_CYCLE = ['plain', 'outline', 'background', 'bubble'];

const TEXT_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'neon', label: 'Neon' },
  { id: 'glow', label: 'Glow' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'shimmer', label: 'Shimmer' },
  { id: 'lift', label: 'Lift' },
  { id: 'outlineGlow', label: 'Outline Glow' },
];

const COLOR_PALETTES = [
  ['#ffffff', '#000000', '#1c4b56', '#d9a441', '#e0c454', '#f0d95a', '#8a5a2b', '#2f5fe0', '#5b6fef'],
  ['#ffffff', '#000000', '#2f7dd8', '#4caf50', '#f2c94c', '#f2994a', '#eb5757', '#c2185b', '#8e24aa'],
  ['#e53935', '#ef9a9a', '#fbc4c4', '#f5cd8e', '#f4b96b', '#c98a4b', '#a9713f', '#4a2c1d', '#1b5e20'],
];

const DEFAULT_TEXT_STYLE = {
  font: 'classic',
  size: 28,
  color: '#ffffff',
  align: 'center',
  textStyle: 'plain',
  effect: 'none',
  weight: 400,
  letterSpacing: 'normal',
  opacity: 1,
};

const MIN_LAYER_WIDTH = 1;
const MIN_LAYER_HEIGHT = 1;
const TEXT_MAX_WIDTH = 280;

function ResizeHandle() {
  return (
    <div className="livepreview__resize-handle-hit">
      <div className="livepreview__resize-handle-circle">⤢</div>
    </div>
  );
}

export default function LivePreview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selectedMedia = state?.media;
  const selectedType = state?.type;
  const elements = useEditorStore((s) => s.elements);
  const backgroundMeta = useEditorStore((s) => s.background);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const updateLayerData = useEditorStore((s) => s.updateLayerData);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const deselectAll = useEditorStore((s) => s.deselectAll);
  const activeFilter = useEditorStore((s) => s.activeFilter);
  const loadProject = useEditorStore((s) => s.loadProject);
  const textLayers = elements.filter((l) => l.type === 'text');

  const [projectId, setProjectId] = useState(state?.projectId ?? null);
  const [saving, setSaving] = useState(false);

  // Load an existing project's saved layer-state when opened from My Studio.
  useEffect(() => {
    if (!state?.projectId) return;
    axiosClient.get(`${ENDPOINTS.PROJECTS}/${state.projectId}`)
      .then((res) => loadProject(res.data.data.data))
      .catch(() => { });
  }, [state?.projectId, loadProject]);

  const handleSaveDraft = async () => {
    if (saving) return;
    setSaving(true);
    const data = { elements, activeFilter, background: backgroundMeta };
    try {
      if (projectId) {
        await axiosClient.put(`${ENDPOINTS.PROJECTS}/${projectId}`, { data });
      } else {
        const res = await axiosClient.post(ENDPOINTS.PROJECTS, {
          template_id: state?.id,
          title: state?.title,
          data,
        });
        setProjectId(res.data.data.id);
      }
    } catch {
      // ponytail: silent fail on draft save, add a toast if users report lost saves
    } finally {
      setSaving(false);
    }
  };

  const background = useMediaAsset('background', { accept: BACKGROUND_MEDIA_ACCEPT });
  const logo = useMediaAsset('logo', { accept: LOGO_MEDIA_ACCEPT });
  const [logoGallery, setLogoGallery] = useState(() => loadLogoGallery());
  const [logoBox, setLogoBox] = useState({ x: 16, y: 16, width: 64, height: 64 });
  const logoFileInputRef = useRef(null);

  const handleLogoFileChosen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    logo.upload(file);
    const dataUrl = await fileToDataUrl(file);
    setLogoGallery(saveToLogoGallery(dataUrl));
    e.target.value = '';
  };

  const handleLogoGallerySelect = (item) => {
    logo.upload(dataUrlToFile(item.dataUrl));
  };

  const handleLogoGalleryDelete = (id) => {
    const next = logoGallery.filter((item) => item.id !== id);
    setLogoGallery(next);
    localStorage.setItem(LOGO_GALLERY_KEY, JSON.stringify(next));
  };
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    resetForNewSource,
    videoEvents,
  } = useVideoPlayer();

  useEffect(() => { resetForNewSource(); }, [background.url, resetForNewSource]);

  const isImage = backgroundMeta.type === 'image' && !!background.url;
  const isVideo = backgroundMeta.type === 'video' && !!background.url;
  const progressPct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  const [activeTool, setActiveTool] = useState(null);
  const isTextMode = activeTool === 'text';

  const [activeLayerId, setActiveLayerId] = useState(null);
  const activeLayer = textLayers.find((l) => l.id === activeLayerId) || null;
  const activeStyle = { ...DEFAULT_TEXT_STYLE, ...(activeLayer?.data?.style || {}) };
  const activeText = activeLayer?.data?.text ?? '';
  const hasText = activeText.trim().length > 0;

  const patchActiveStyle = (partial) => {
    if (!activeLayerId) return;
    updateLayerData(activeLayerId, { style: { ...activeStyle, ...partial } });
  };

  const cycleTextStyle = () => {
    const idx = TEXT_STYLE_CYCLE.indexOf(activeStyle.textStyle);
    patchActiveStyle({ textStyle: TEXT_STYLE_CYCLE[(idx + 1) % TEXT_STYLE_CYCLE.length] });
    setActiveSubPanel(null);
  };

  const cycleAlign = () => {
    const idx = TEXT_ALIGN_CYCLE.indexOf(activeStyle.align);
    patchActiveStyle({ align: TEXT_ALIGN_CYCLE[(idx + 1) % TEXT_ALIGN_CYCLE.length] });
    setActiveSubPanel(null);
  };

  const textOutlined = activeStyle.textStyle === 'outline';
  const textBoxed = activeStyle.textStyle === 'background';
  const textBubble = activeStyle.textStyle === 'bubble';

  const [activeSubPanel, setActiveSubPanel] = useState('font');
  const [palettePage, setPalettePage] = useState(0);
  const colorScrollRef = useRef(null);

  const handleColorScroll = () => {
    const el = colorScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setPalettePage(idx);
  };

  const [isEditingText, setIsEditingText] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sheetDragOffset, setSheetDragOffset] = useState(0);
  const sheetDragRef = useRef({ startY: 0, dragging: false, moved: false });

  const SHEET_COLLAPSED_VH = 45;
  const SHEET_EXPANDED_VH = 85;

  const handleSheetHandlePointerDown = (e) => {
    sheetDragRef.current = { startY: e.clientY, dragging: true, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleSheetHandlePointerMove = (e) => {
    if (!sheetDragRef.current.dragging) return;
    const delta = sheetDragRef.current.startY - e.clientY;
    if (Math.abs(delta) > 4) sheetDragRef.current.moved = true;
    setSheetDragOffset(delta);
  };

  const handleSheetHandlePointerUp = () => {
    if (!sheetDragRef.current.dragging) return;
    const { moved } = sheetDragRef.current;
    sheetDragRef.current.dragging = false;

    if (!moved) {
      setSheetExpanded((v) => !v);
    } else {
      const draggedUp = sheetDragOffset > 60;
      const draggedDown = sheetDragOffset < -60;
      if (draggedUp) setSheetExpanded(true);
      else if (draggedDown) setSheetExpanded(false);
    }
    setSheetDragOffset(0);
  };
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const containerRef = useRef(null);
  const mediaRef = useRef(null);
  const measureRef = useRef(null);

  const layerNodeRefs = useRef(new Map());
  const layerRefCallbacks = useRef(new Map());
  const registerLayerNode = useCallback((id) => {
    if (!layerRefCallbacks.current.has(id)) {
      layerRefCallbacks.current.set(id, (node) => {
        if (node) layerNodeRefs.current.set(id, node);
        else layerNodeRefs.current.delete(id);
      });
    }
    return layerRefCallbacks.current.get(id);
  }, []);

  const textSizeSignature = textLayers
    .map((l) => `${l.id}:${l.data?.text ?? ''}:${JSON.stringify(l.data?.style || {})}`)
    .join('|');

  // Sirf abhi jo layer edit ho raha hai usko hi auto-grow karo — static/untouched
  // template layers ko yahan se touch mat karo, warna unka mount hote hi
  // width/height/x/y "correct" ho jaata hai aur poora template layout bigad jaata hai.
  useLayoutEffect(() => {
    if (!activeLayerId) return;
    const layer = textLayers.find((l) => l.id === activeLayerId);
    const node = measureRef.current;
    if (!layer || !node) return;

    const w = Math.max(Math.ceil(node.scrollWidth), MIN_LAYER_WIDTH);
    const h = Math.max(Math.ceil(node.scrollHeight), MIN_LAYER_HEIGHT);

    if (Math.abs((layer.width || 0) - w) > 1 || Math.abs((layer.height || 0) - h) > 1) {
      const centerX = layer.x + (layer.width || 0) / 2;
      const centerY = layer.y + (layer.height || 0) / 2;
      const { x, y } = clampToCanvas(centerX - w / 2, centerY - h / 2, w, h);
      updateLayer(layer.id, { width: w, height: h, x, y });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textSizeSignature, activeLayerId]);

  const handleTextFocus = () => setIsEditingText(true);
  const handleTextBlur = () => {
    window.setTimeout(() => {
      if (
        containerRef.current &&
        document.activeElement &&
        containerRef.current.contains(document.activeElement)
      ) {
        return;
      }
      setIsEditingText(false);
    }, 0);
  };

  useEffect(() => {
    if (!isEditingText) {
      setKeyboardOffset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;

    const updateOffset = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, Math.round(offset)));
    };

    updateOffset();
    vv.addEventListener('resize', updateOffset);
    vv.addEventListener('scroll', updateOffset);
    return () => {
      vv.removeEventListener('resize', updateOffset);
      vv.removeEventListener('scroll', updateOffset);
    };
  }, [isEditingText]);

  useEffect(() => {
    if (isEditingText) {
      layerNodeRefs.current.get(activeLayerId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditingText, keyboardOffset, activeLayerId]);

  useEffect(() => {
    if (!isTextMode || !activeLayerId) return;
    const node = layerNodeRefs.current.get(activeLayerId);
    if (!node) return;
    if (node.textContent !== activeText) node.textContent = activeText;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayerId, isTextMode]);

  const clampToCanvas = useCallback((x, y, w, h) => {
    const el = mediaRef.current;
    if (!el) return { x, y };
    const maxX = Math.max(0, el.clientWidth - w);
    const maxY = Math.max(0, el.clientHeight - h);
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  }, []);

  const handleScrubClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const handleAddNewText = () => {
    if (!mediaRef.current) return;

    const rect = mediaRef.current.getBoundingClientRect();
    const width = 120;
    const height = 40;
    const x = (rect.width - width) / 2;
    const y = (rect.height - height) / 2;

    const id = addTextLayer(
      { text: '', editable: true, style: { ...DEFAULT_TEXT_STYLE } },
      { x, y, width, height }
    );

    setActiveLayerId(id);
    selectLayer(id);
    setActiveTool('text');
    setIsEditingText(true);
  };

  const handleSelectLayer = (layer) => {
    selectLayer(layer.id);
    setActiveLayerId(layer.id);
    setActiveTool('text');
    setIsEditingText(true);
  };

  const closeTool = () => {
    layerNodeRefs.current.get(activeLayerId)?.blur();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (activeLayer && !activeLayer.data?.text?.trim()) {
      deleteLayer(activeLayer.id);
    }
    deselectAll();
    setActiveLayerId(null);
    setActiveTool(null);
    setIsEditingText(false);
  };

  const handleDeleteSelected = () => {
    if (!activeLayerId) return;
    deleteLayer(activeLayerId);
    setActiveLayerId(null);
    setActiveTool(null);
    setIsEditingText(false);
  };

  const textareaStyle = {
    fontFamily: TEXT_FONT_OPTIONS.find((f) => f.id === activeStyle.font)?.fontFamily,
    fontSize: `${activeStyle.size}px`,
    fontWeight: activeStyle.weight,
    letterSpacing: activeStyle.letterSpacing,
    opacity: activeStyle.opacity,
    color: activeStyle.color,
    textAlign: activeStyle.align,
    WebkitTextStroke: textOutlined ? `1px ${activeStyle.color === '#000000' ? '#fff' : '#000'}` : undefined,
    background: textBoxed ? 'rgba(0,0,0,0.55)' : textBubble ? activeStyle.color : 'transparent',
    ...(textBubble ? { color: getContrastColor(activeStyle.color) } : null),
    padding: textBoxed ? '6px 12px' : textBubble ? '8px 18px' : 0,
    borderRadius: textBoxed ? '8px' : textBubble ? '999px' : 0,
  };

  const mirrorStyle = {
    fontFamily: textareaStyle.fontFamily,
    fontSize: `${activeStyle.size}px`,
    fontWeight: activeStyle.weight,
    letterSpacing: activeStyle.letterSpacing,
    padding: textareaStyle.padding,
  };

  const effectClass = activeStyle.effect !== 'none' ? `livepreview__texteditor-input--fx-${activeStyle.effect}` : '';

  const renderStaticLayerStyle = (layer) => {
    const style = { ...DEFAULT_TEXT_STYLE, ...(layer.data?.style || {}) };
    const font = TEXT_FONT_OPTIONS.find((f) => f.id === style.font)?.fontFamily;
    const isOutlined = style.textStyle === 'outline';
    const isBoxed = style.textStyle === 'background';
    const isBubble = style.textStyle === 'bubble';
    return {
      fontFamily: font,
      fontSize: `${style.size}px`,
      fontWeight: style.weight,
      letterSpacing: style.letterSpacing,
      opacity: style.opacity,
      color: isBubble ? getContrastColor(style.color) : style.color,
      textAlign: style.align,
      WebkitTextStroke: isOutlined ? `1px ${style.color === '#000000' ? '#fff' : '#000'}` : undefined,
      background: isBoxed ? 'rgba(0,0,0,0.55)' : isBubble ? style.color : 'transparent',
      padding: isBoxed ? '6px 12px' : isBubble ? '8px 18px' : 0,
      borderRadius: isBoxed ? '8px' : isBubble ? '999px' : 0,
      width: 'fit-content',
      height: 'fit-content',
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      lineHeight: 1.3,
      cursor: 'pointer',
    };
  };

  const staticEffectClass = (layer) => {
    const style = { ...DEFAULT_TEXT_STYLE, ...(layer.data?.style || {}) };
    return style.effect !== 'none' ? `livepreview__texteditor-input--fx-${style.effect}` : '';
  };

  return (
    <div className="livepreview" ref={containerRef}>
      <div className="livepreview__header">
        <button className="livepreview__icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="livepreview__title">Live Preview</h1>
        <button
          className={`livepreview__icon-btn livepreview__icon-btn--done ${activeTool ? 'is-active' : ''}`}
          aria-label="Done"
          onClick={closeTool}
        >
          Done
        </button>
      </div>

      <div className="livepreview__media" ref={mediaRef}>
        {selectedType === "image" ? (
          <img src={selectedMedia} alt="" className="livepreview__bg-media" />
        ) : (
          <video
            ref={videoRef}
            src={selectedMedia}
            className="livepreview__bg-media"
            muted
            loop
            playsInline
            autoPlay
            {...videoEvents}
          />
        )}

        {isTextMode && <div className="livepreview__text-scrim" onClick={closeTool} />}

        {isTextMode && activeLayerId && (
          <div
            ref={measureRef}
            aria-hidden="true"
            className="livepreview__text-mirror"
            style={{ ...mirrorStyle, maxWidth: TEXT_MAX_WIDTH }}
          >
            {activeText || ' '}
          </div>
        )}

        <Rnd
          size={{ width: logoBox.width, height: logoBox.height }}
          position={{ x: logoBox.x, y: logoBox.y }}
          bounds="parent"
          enableResizing={activeTool === 'logo'}
          disableDragging={activeTool !== 'logo'}
          onDragStop={(e, d) => setLogoBox((b) => ({ ...b, x: d.x, y: d.y }))}
          onResizeStop={(e, dir, ref, delta, pos) =>
            setLogoBox({ x: pos.x, y: pos.y, width: ref.offsetWidth, height: ref.offsetHeight })
          }
          style={{ zIndex: 5 }}
        >
          <div
            className="livepreview__logo"
            style={{ opacity: isTextMode ? 0.4 : 1, width: '100%', height: '100%', cursor: 'pointer' }}
            onClick={() => setActiveTool('logo')}
          >
            {logo.url ? (
              <img src={logo.url} alt="Logo" className="livepreview__logo-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <>YOUR<br />LOGO</>
            )}
          </div>
        </Rnd>

        {textLayers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <Rnd
              key={layer.id}
              size={{ width: layer.width ?? MIN_LAYER_WIDTH, height: layer.height ?? MIN_LAYER_HEIGHT }}
              onResize={(e, dir, ref) => {
                updateLayer(layer.id, { width: ref.offsetWidth, height: ref.offsetHeight });
              }}
              position={{ x: layer.x, y: layer.y }}
              bounds="parent"
              minWidth={MIN_LAYER_WIDTH}
              minHeight={MIN_LAYER_HEIGHT}
              enableResizing={isActive ? { bottomRight: true } : false}
              resizeHandleComponent={{ bottomRight: <ResizeHandle /> }}
              cancel=".livepreview__free-layer-input"
              style={{ zIndex: 10 + (layer.zIndex || 0) }}
              className={`livepreview__free-layer ${isActive ? 'is-selected' : ''}`}
              onDragStop={(e, d) => {
                const clamped = clampToCanvas(d.x, d.y, layer.width || 0, layer.height || 0);
                updateLayer(layer.id, { x: clamped.x, y: clamped.y });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const w = parseInt(ref.style.width, 10);
                const h = parseInt(ref.style.height, 10);
                const clamped = clampToCanvas(position.x, position.y, w, h);
                updateLayer(layer.id, { width: w, height: h, x: clamped.x, y: clamped.y });
              }}
            >
              {isActive ? (
                <div
                  ref={registerLayerNode(layer.id)}
                  contentEditable="plaintext-only"
                  suppressContentEditableWarning
                  spellCheck={false}
                  onClick={(e) => e.stopPropagation()}
                  className={`livepreview__texteditor-input livepreview__free-layer-input ${effectClass}`}
                  onInput={(e) => updateLayerData(layer.id, { text: e.currentTarget.textContent })}
                  onFocus={handleTextFocus}
                  onBlur={handleTextBlur}
                  style={{
                    ...textareaStyle,
                    width: 'fit-content',
                    maxWidth: TEXT_MAX_WIDTH,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    outline: 'none',
                  }}
                />
              ) : (
                <div
                  ref={registerLayerNode(layer.id)}
                  className={staticEffectClass(layer)}
                  style={{ ...renderStaticLayerStyle(layer), width: 'fit-content', minWidth: '1ch' }}
                  onClick={() => handleSelectLayer(layer)}
                >
                  {layer.data?.text}
                </div>
              )}
              {isActive && (
                <button
                  className="livepreview__layer-delete"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleDeleteSelected}
                >
                  ✕
                </button>
              )}
            </Rnd>
          );
        })}

        {!isTextMode && isVideo && (
          <div className="livepreview__scrub">
            <button
              type="button"
              className="livepreview__play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <span>{formatTime(currentTime)}</span>
            <div className="livepreview__scrub-bar" onClick={handleScrubClick}>
              <div className="livepreview__scrub-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {isTextMode && (
        <div
          className={`livepreview__texteditor-panel ${isEditingText && keyboardOffset > 0 ? 'is-visible' : ''}`}
          style={{ bottom: `calc(${keyboardOffset}px + env(safe-area-inset-bottom, 0px))` }}
        >
          {activeSubPanel === 'color' && (
            <div className="livepreview__colorpanel">
              <button className="livepreview__eyedropper" aria-label="Custom color">
                🖌️
                <input
                  type="color"
                  className="livepreview__texteditor-colorinput"
                  value={activeStyle.color}
                  onChange={(e) => patchActiveStyle({ color: e.target.value })}
                />
              </button>

              <div className="livepreview__color-scroll" ref={colorScrollRef} onScroll={handleColorScroll}>
                {COLOR_PALETTES.map((palette, pageIdx) => (
                  <div className="livepreview__color-page" key={pageIdx}>
                    {palette.map((c) => (
                      <button
                        key={c}
                        className={`livepreview__texteditor-swatch ${activeStyle.color === c ? 'is-active' : ''}`}
                        style={{ background: c }}
                        onClick={() => patchActiveStyle({ color: c })}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubPanel === 'font' && (
            <div className="livepreview__texteditor-fonts">
              {TEXT_FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  className={`livepreview__texteditor-pill ${activeStyle.font === f.id ? 'is-active' : ''}`}
                  style={{ fontFamily: f.fontFamily }}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => patchActiveStyle({ font: f.id })}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {activeSubPanel === 'effects' && (
            <div className="livepreview__texteditor-fonts">
              {TEXT_EFFECTS.map((fx) => (
                <button
                  key={fx.id}
                  className={`livepreview__texteditor-pill ${activeStyle.effect === fx.id ? 'is-active' : ''}`}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => patchActiveStyle({ effect: fx.id })}
                >
                  {fx.label}
                </button>
              ))}
            </div>
          )}

          {activeSubPanel === 'color' && (
            <div className="livepreview__color-dots">
              {COLOR_PALETTES.map((_, i) => (
                <span key={i} className={`livepreview__color-dot ${palettePage === i ? 'is-active' : ''}`} />
              ))}
            </div>
          )}

          <div className="livepreview__texteditor-tools">
            <button
              className={`livepreview__texteditor-icon ${activeSubPanel === 'font' ? 'is-active' : ''} ${!hasText ? 'is-disabled' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setActiveSubPanel('font')}
              aria-label="Font"
              disabled={!hasText}
            >
              Aa
            </button>

            <button
              className={`livepreview__texteditor-icon ${activeSubPanel === 'color' ? 'is-active' : ''} ${!hasText ? 'is-disabled' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setActiveSubPanel('color')}
              aria-label="Color"
              disabled={!hasText}
            >
              <span className="livepreview__texteditor-colorwheel" />
            </button>

            <button
              className={`livepreview__texteditor-icon livepreview__texteditor-icon--align ${!hasText ? 'is-disabled' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={cycleAlign}
              aria-label={`Text alignment: ${activeStyle.align}`}
              disabled={!hasText}
            >
              <span className={`livepreview__align-bars align-${activeStyle.align}`}>
                <i /><i /><i />
              </span>
            </button>

            <button
              className={`livepreview__texteditor-icon livepreview__texteditor-icon--style is-${activeStyle.textStyle} ${activeStyle.textStyle !== 'plain' ? 'is-active' : ''} ${!hasText ? 'is-disabled' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={cycleTextStyle}
              aria-label={`Text style: ${activeStyle.textStyle}`}
              disabled={!hasText}
            >
              Aa
            </button>

            <button
              className={`livepreview__texteditor-icon ${activeSubPanel === 'effects' ? 'is-active' : ''} ${!hasText ? 'is-disabled' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => setActiveSubPanel('effects')}
              aria-label="Effects"
              disabled={!hasText}
            >
              ✨
            </button>
          </div>
        </div>
      )}
      {activeTool && !isTextMode && (
        <div
          className="livepreview__bottom-sheet"
          style={{
            height: `calc(${sheetExpanded ? SHEET_EXPANDED_VH : SHEET_COLLAPSED_VH}vh + ${sheetDragOffset}px)`,
            maxHeight: '90vh',
          }}
        >
          <div
            className="livepreview__sheet-drag-handle"
            onPointerDown={handleSheetHandlePointerDown}
            onPointerMove={handleSheetHandlePointerMove}
            onPointerUp={handleSheetHandlePointerUp}
            onPointerCancel={handleSheetHandlePointerUp}
          >
            <span className="livepreview__sheet-drag-bar" />
          </div>
          {activeTool === 'logo' && (
            <div className="livepreview__logo-sheet">
              <div className="livepreview__logo-sheet-head">
                <div>
                  <h3 className="livepreview__logo-sheet-title">Logo Library</h3>
                  <p className="livepreview__logo-sheet-subtitle">Add your logo to personalise your design</p>
                </div>
                <button className="livepreview__logo-sheet-close" onClick={closeTool} aria-label="Close">✕</button>
              </div>

              <button className="livepreview__logo-upload-btn" onClick={() => logoFileInputRef.current?.click()}>
                <span className="livepreview__logo-upload-icon">⬆</span>
                <span className="livepreview__logo-upload-text">
                  <strong>Upload New Logo</strong>
                  <span>PNG, JPG, SVG up to 5MB</span>
                </span>
              </button>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoFileChosen}
              />

              {logoGallery.length > 0 ? (
                <>
                  <div className="livepreview__logo-section-label">Recent Logos</div>
                  <div className="livepreview__logo-grid">
                    {logoGallery.map((item) => {
                      const isSelected = logo.url === item.dataUrl;
                      return (
                        <button
                          key={item.id}
                          className={`livepreview__logo-tile ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => handleLogoGallerySelect(item)}
                        >
                          <img src={item.dataUrl} alt="Saved logo" />
                          {isSelected ? (
                            <span className="livepreview__logo-tile-check">✓</span>
                          ) : (
                            <span
                              className="livepreview__logo-tile-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLogoGalleryDelete(item.id);
                              }}
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="livepreview__logo-tip">Tip: Tap on a logo to use it in your design</p>
                </>
              ) : (
                <div className="livepreview__logo-empty">No logos yet. Upload your first logo to get started.</div>
              )}

              <button className="livepreview__logo-done-btn" onClick={closeTool}>✓ Done</button>
            </div>
          )}

          {activeTool === 'music' && (
            <div>
              <h3>Music</h3>
              <button>Add Music</button>
            </div>
          )}

          {activeTool === 'filters' && (
            <div>
              <h3>Filters</h3>
              <button>Original</button>
              <button>Luxury</button>
              <button>Warm</button>
              <button>Cool</button>
            </div>
          )}
        </div>
      )}

      {!isTextMode && !activeTool && (
        <div className="livepreview__tools">
          <button className="livepreview__tool" onClick={handleAddNewText}>
            <span className="livepreview__tool-icon">Aa</span>
            <span className="livepreview__tool-label">Text</span>
          </button>

          <button className="livepreview__tool" onClick={() => setActiveTool('logo')}>
            <span className="livepreview__tool-icon">⌂</span>
            <span className="livepreview__tool-label">Logo</span>
          </button>

          <button className="livepreview__tool" onClick={() => setActiveTool('music')}>
            <span className="livepreview__tool-icon">♫</span>
            <span className="livepreview__tool-label">Music</span>
          </button>

          <button className="livepreview__tool" onClick={() => setActiveTool('filters')}>
            <span className="livepreview__tool-icon">✦</span>
            <span className="livepreview__tool-label">Filters</span>
          </button>
        </div>
      )}

      {!activeTool && (
        <div className="livepreview__actions">
          <button className="livepreview__btn livepreview__btn--outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button className="livepreview__btn livepreview__btn--primary" onClick={() => navigate('/share')}>
            Share Now
          </button>
        </div>
      )}
    </div>
  );
}