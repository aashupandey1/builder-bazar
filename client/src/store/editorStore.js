import { create } from 'zustand';

const initialElements = [
  {
    id: 'logo', type: 'logo',
    x: 14, y: 14, width: 60, height: 60,
    rotation: 0, zIndex: 0, visible: true, locked: false, selected: false,
    data: {},
  },
  {
    id: 'addText', type: 'text',
    x: 24, y: 415, width: 300, height: 24,
    rotation: 0, zIndex: 1, visible: true, locked: false, selected: false,
    data: {
      text: 'LIVE THE LUXURY',
      editable: true,
      style: {
        font: 'classic', size: 11, color: '#ffffff', align: 'left',
        textStyle: 'plain', effect: 'none',
        weight: 600, letterSpacing: 'normal', opacity: 0.9,
      },
    },
  },
  {
    id: 'subHeading', type: 'text',
    x: 24, y: 435, width: 320, height: 48,
    rotation: 0, zIndex: 2, visible: true, locked: false, selected: false,
    data: {
      text: 'YOU DESERVE',
      editable: true,
      style: {
        font: 'classic', size: 28, color: '#ffffff', align: 'left',
        textStyle: 'plain', effect: 'none',
        weight: 800, letterSpacing: '1px', opacity: 1,
      },
    },
  },
  {
    id: 'buttonText', type: 'text',
    x: 24, y: 475, width: 200, height: 30,
    rotation: 0, zIndex: 3, visible: true, locked: false, selected: false,
    data: {
      text: 'BOOK YOUR SITE VISIT',
      editable: true,
      style: {
        font: 'classic', size: 11, color: '#2f5fe0', align: 'left',
        textStyle: 'bubble', effect: 'none',
        weight: 700, letterSpacing: 'normal', opacity: 1,
      },
    },
  },
  {
    id: 'companyName', type: 'text',
    x: 24, y: 510, width: 150, height: 18,
    rotation: 0, zIndex: 4, visible: true, locked: false, selected: false,
    data: {
      text: 'Sharma Realty',
      editable: true,
      style: {
        font: 'classic', size: 10, color: '#ffffff', align: 'left',
        textStyle: 'plain', effect: 'none',
        weight: 400, letterSpacing: 'normal', opacity: 0.85,
      },
    },
  },
  {
    id: 'contactNumber', type: 'text',
    x: 200, y: 530, width: 170, height: 18,
    rotation: 0, zIndex: 5, visible: true, locked: false, selected: false,
    data: {
      text: '📞 +91 98765 43210',
      editable: true,
      style: {
        font: 'classic', size: 10, color: '#ffffff', align: 'left',
        textStyle: 'plain', effect: 'none',
        weight: 400, letterSpacing: 'normal', opacity: 0.85,
      },
    },
  },
  {
    id: 'website', type: 'text',
    x: 24, y: 530, width: 200, height: 16,
    rotation: 0, zIndex: 6, visible: true, locked: false, selected: false,
    data: {
      text: 'www.sharmarealty.com',
      editable: true,
      style: {
        font: 'classic', size: 10, color: '#ffffff', align: 'left',
        textStyle: 'plain', effect: 'none',
        weight: 400, letterSpacing: 'normal', opacity: 0.85,
      },
    },
  },
];

function reorder(elements, id, direction) {
  const index = elements.findIndex((l) => l.id === id);
  const swapWith = index + direction;
  if (index === -1 || swapWith < 0 || swapWith >= elements.length) return elements;

  const next = [...elements];
  [next[index], next[swapWith]] = [next[swapWith], next[index]];
  return next.map((layer, i) => ({ ...layer, zIndex: i }));
}

export const useEditorStore = create((set) => ({
  elements: initialElements,
  activeFilter: 'Bright',
  background: {
    type: null,
    name: null,
    size: null,
    mimeType: null,
  },

  updateLayer: (id, partial) =>
    set((s) => ({
      elements: s.elements.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    })),

  updateLayerData: (id, dataPartial) =>
    set((s) => ({
      elements: s.elements.map((l) =>
        l.id === id ? { ...l, data: { ...l.data, ...dataPartial } } : l
      ),
    })),

  selectLayer: (id) =>
    set((s) => ({
      elements: s.elements.map((l) => ({ ...l, selected: l.id === id })),
    })),

  deselectAll: () =>
    set((s) => ({ elements: s.elements.map((l) => ({ ...l, selected: false })) })),

  toggleVisible: (id) =>
    set((s) => ({
      elements: s.elements.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    })),

  toggleLock: (id) =>
    set((s) => ({
      elements: s.elements.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
    })),

  bringForward: (id) => set((s) => ({ elements: reorder(s.elements, id, 1) })),
  sendBackward: (id) => set((s) => ({ elements: reorder(s.elements, id, -1) })),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setBackgroundMeta: (meta) =>
    set({
      background: {
        type: meta.type,
        name: meta.name,
        size: meta.size,
        mimeType: meta.mimeType,
      },
    }),

  addTextLayer: (dataOverrides = {}, position = {}) => {
    const id = `text-${Date.now()}`;
    set((s) => {
      const maxZ =
        s.elements.length === 0
          ? 0
          : Math.max(...s.elements.map((e) => e.zIndex));

      return {
        elements: [
          ...s.elements.map((e) => ({ ...e, selected: false })),
          {
            id,
            type: 'text',
            x: position.x ?? 0,
            y: position.y ?? 0,
            width: position.width ?? 220,
            height: position.height ?? 48,
            rotation: 0,
            zIndex: maxZ + 1,
            visible: true,
            locked: false,
            selected: true,
            data: {
              text: 'New Text',
              editable: true,
              ...dataOverrides,
            },
          },
        ],
      };
    });
    return id;
  },

  deleteLayer: (id) =>
    set((s) => ({
      elements: s.elements.filter((l) => l.id !== id),
    })),

  clearBackgroundMeta: () =>
    set({ background: { type: null, name: null, size: null, mimeType: null } }),
  resetElements: () => set({ elements: initialElements }),
  // Hydrates the store from a saved project's `data` JSONB (see project.repository.js).
  // Only overwrites fields that are present so a partial/older save doesn't wipe the rest.
  loadProject: (saved = {}) =>
    set((s) => ({
      elements: saved.elements ?? s.elements,
      activeFilter: saved.activeFilter ?? s.activeFilter,
      background: saved.background ?? s.background,
    })),
}));