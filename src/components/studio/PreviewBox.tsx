import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  MousePointer, 
  Move, 
  Trash2, 
  Palette, 
  Maximize2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Type, 
  Minimize2, 
  CheckCircle2, 
  ExternalLink,
  Sliders,
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  ArrowUpDown,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target,
  Droplets,
  Pin,
  Code2,
  Save,
  AlignCenter
} from 'lucide-react';
import { AppPage, VisualElementEdit } from '../../types';

interface PreviewBoxProps {
  pages: AppPage[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onApplyVisualEditToCode: (pageId: string, updatedHtml: string) => void;
}

export const PreviewBox: React.FC<PreviewBoxProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onApplyVisualEditToCode,
}) => {
  // Mode: 'preview' (Interactive navigation, buttons active) vs 'edit' (Visual editing, buttons inactive)
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');

  // Viewport sizing: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Fullscreen view mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Photoshop-style Left Sidebar state
  const [isToolsSidebarCollapsed, setIsToolsSidebarCollapsed] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'size' | 'position' | 'color' | 'text'>('size');

  // Transparency and layout for editing tools
  const [toolsOpacity, setToolsOpacity] = useState<'ultra' | 'glass' | 'solid'>('ultra');
  const [toolsLayout, setToolsLayout] = useState<'overlay' | 'docked'>('overlay');

  // Selected element for visual editing
  const [selectedElement, setSelectedElement] = useState<VisualElementEdit | null>(null);

  // Floating D-pad step & dock position (Active strictly when activeToolTab === 'position' and mode === 'edit')
  const [cursorStep, setCursorStep] = useState<number>(5);
  const [dpadPosition, setDpadPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right'>('bottom-right');

  // Undo & Redo state stacks (stores clean HTML snapshots)
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [undoNotification, setUndoNotification] = useState<string | null>(null);

  // Status and apply feedback
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [autoFitText, setAutoFitText] = useState(true); // Otomatis sesuaikan ukuran dan pusatkan teks saat ubah ukuran atau geser
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const [isRepaired, setIsRepaired] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  // Helper to extract clean HTML without inspector outlines/injected scripts for undo snapshot & apply
  const getCleanDocumentHtml = (doc: Document): string => {
    const cloneDoc = doc.cloneNode(true) as Document;

    // 1. Remove selection outlines and temporary inspector data attributes from all elements
    cloneDoc.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.hasAttribute && htmlEl.hasAttribute('data-ghighais-selected')) {
        htmlEl.removeAttribute('data-ghighais-selected');
      }
      if (htmlEl.style) {
        if (
          htmlEl.style.outline?.includes('rgb(6, 182, 212)') ||
          htmlEl.style.outline?.includes('#06b6d4') ||
          htmlEl.style.outline?.includes('38bdf8') ||
          htmlEl.style.outline?.includes('dashed')
        ) {
          htmlEl.style.outline = '';
          htmlEl.style.outlineOffset = '';
        }
      }
      if (htmlEl.hasAttribute && htmlEl.getAttribute('style') === '') {
        htmlEl.removeAttribute('style');
      }
    });

    // 2. Reset crosshair cursor on body if present
    if (cloneDoc.body && cloneDoc.body.style && cloneDoc.body.style.cursor === 'crosshair') {
      cloneDoc.body.style.cursor = '';
      if (cloneDoc.body.getAttribute('style') === '') {
        cloneDoc.body.removeAttribute('style');
      }
    }

    // 3. Remove temporary injected styles (from styles.css) so they don't get duplicated into head
    cloneDoc.querySelectorAll('#ghighais-injected-styles').forEach((s) => s.remove());

    // 4. Remove injected inspector and error-handling scripts
    cloneDoc.querySelectorAll('#ghighais-inspector-script, script').forEach((s) => {
      if (
        s.id === 'ghighais-inspector-script' ||
        s.textContent?.includes('GHIGHAIS_IFRAME_ERROR') ||
        s.textContent?.includes('GHIGHAIS_ELEMENT_SELECTED')
      ) {
        s.remove();
      }
    });

    return '<!DOCTYPE html>\n' + cloneDoc.documentElement.outerHTML;
  };

  // Push an undo snapshot before any mutation
  const pushUndoSnapshot = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const cleanHtml = getCleanDocumentHtml(doc);
    setUndoStack((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === cleanHtml) return prev;
      return [...prev.slice(-30), cleanHtml];
    });
    setRedoStack([]); // reset redo on new edits
    setHasPendingChanges(true);
  };

  // Undo recent edit
  const handleUndo = () => {
    if (undoStack.length === 0 || !iframeRef.current || !iframeRef.current.contentDocument || !activePage) return;
    const doc = iframeRef.current.contentDocument;
    const currentCleanHtml = getCleanDocumentHtml(doc);

    // Save to redo
    setRedoStack((prev) => [...prev.slice(-30), currentCleanHtml]);

    // Pop from undo
    const previousHtml = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    // Apply back to code
    onApplyVisualEditToCode(activePage.id, previousHtml);
    setSelectedElement(null);
    setHasPendingChanges(false);

    setUndoNotification('Undo diterapkan: Perubahan dikembalikan!');
    setTimeout(() => setUndoNotification(null), 2000);
  };

  // Redo recent edit
  const handleRedo = () => {
    if (redoStack.length === 0 || !iframeRef.current || !iframeRef.current.contentDocument || !activePage) return;
    const doc = iframeRef.current.contentDocument;
    const currentCleanHtml = getCleanDocumentHtml(doc);

    // Save to undo
    setUndoStack((prev) => [...prev.slice(-30), currentCleanHtml]);

    // Pop from redo
    const nextHtml = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    // Apply back to code
    onApplyVisualEditToCode(activePage.id, nextHtml);
    setSelectedElement(null);
    setHasPendingChanges(false);

    setUndoNotification('Redo diterapkan: Perubahan dimajukan!');
    setTimeout(() => setUndoNotification(null), 2000);
  };

  // Keyboard shortcut listener (Esc for fullscreen, Ctrl+Z for Undo, Ctrl+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }

      // Keyboard Undo (Ctrl+Z or Cmd+Z)
      if (mode === 'edit' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleUndo();
        }
      }

      // Keyboard Redo (Ctrl+Y or Cmd+Shift+Z)
      if (mode === 'edit' && ((e.ctrlKey && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z'))) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, mode, undoStack, redoStack]);

  // Open preview in a new browser tab
  const handleOpenInNewTab = () => {
    const docHtml = buildIframeSourceDoc();
    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Prepare HTML document with scripts & interactive hooks injected
  const buildIframeSourceDoc = () => {
    if (!activePage) return '';
    let html = activePage.content;

    // Find styles.css if exists to inject
    const stylesPage = pages.find((p) => p.name === 'styles.css');
    if (stylesPage && !html.includes(stylesPage.content)) {
      html = html.replace('</head>', `<style id="ghighais-injected-styles">\n${stylesPage.content}\n</style>\n</head>`);
    }

    // Injection script for link interception and visual inspector
    const injectionScript = `
      <script id="ghighais-inspector-script">
        (function() {
          const currentMode = "${mode}";
          
          // Error guardian to prevent iframe blank-out
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'GHIGHAIS_IFRAME_ERROR', message: msg + ' (Baris ' + line + ')' }, '*');
            return true;
          };

          // Link interception for multi-page switching
          document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (target) {
              const href = target.getAttribute('href');
              if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:')) {
                e.preventDefault();
                e.stopPropagation();
                if (currentMode === 'preview') {
                  window.parent.postMessage({ type: 'GHIGHAIS_NAVIGATE_PAGE', pageName: href }, '*');
                }
              }
            }

            // In edit mode, disable all button actions and trigger element selection
            if (currentMode === 'edit') {
              e.preventDefault();
              e.stopPropagation();

              // Clean previous selections
              document.querySelectorAll('[data-ghighais-selected]').forEach(el => {
                el.removeAttribute('data-ghighais-selected');
                el.style.outline = '';
              });

              // Mark selected
              const clickedEl = e.target;
              clickedEl.setAttribute('data-ghighais-selected', 'true');
              clickedEl.style.outline = '2px solid #06b6d4';
              clickedEl.style.outlineOffset = '2px';

              // Compute styles
              const computed = window.getComputedStyle(clickedEl);
              const elementInfo = {
                tagName: clickedEl.tagName.toLowerCase(),
                id: clickedEl.id || '',
                className: clickedEl.className || '',
                innerText: clickedEl.innerText ? clickedEl.innerText.slice(0, 300) : '',
                styles: {
                  width: clickedEl.style.width || computed.width,
                  height: clickedEl.style.height || computed.height,
                  padding: clickedEl.style.padding || computed.padding,
                  fontSize: clickedEl.style.fontSize || computed.fontSize,
                  borderRadius: clickedEl.style.borderRadius || computed.borderRadius,
                  color: computed.color,
                  backgroundColor: computed.backgroundColor,
                  borderColor: computed.borderColor,
                  transformX: clickedEl.dataset.transformX ? parseFloat(clickedEl.dataset.transformX) : 0,
                  transformY: clickedEl.dataset.transformY ? parseFloat(clickedEl.dataset.transformY) : 0,
                }
              };

              window.parent.postMessage({ type: 'GHIGHAIS_ELEMENT_SELECTED', info: elementInfo }, '*');
            }
          }, true);

          // Edit mode hover effect
          if (currentMode === 'edit') {
            document.body.style.cursor = 'crosshair';
            document.addEventListener('mouseover', function(e) {
              if (e.target && !e.target.getAttribute('data-ghighais-selected')) {
                e.target.style.outline = '1px dashed #38bdf8';
              }
            });
            document.addEventListener('mouseout', function(e) {
              if (e.target && !e.target.getAttribute('data-ghighais-selected')) {
                e.target.style.outline = '';
              }
            });
          } else {
            document.body.style.cursor = 'default';
          }
        })();
      </script>
    `;

    return html.replace('</body>', `${injectionScript}</body>`);
  };

  // Listen to messages from iframe (navigation, element select, error reports)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      // Handle page navigation via clicked links in preview mode
      if (e.data.type === 'GHIGHAIS_NAVIGATE_PAGE') {
        const targetPage = pages.find((p) => p.name === e.data.pageName);
        if (targetPage) {
          onSelectPage(targetPage.id);
        }
      }

      // Handle element selection in edit mode
      if (e.data.type === 'GHIGHAIS_ELEMENT_SELECTED') {
        setSelectedElement({
          selector: e.data.info.id ? `#${e.data.info.id}` : e.data.info.tagName,
          tagName: e.data.info.tagName,
          id: e.data.info.id,
          className: e.data.info.className,
          innerText: e.data.info.innerText,
          styles: {
            width: e.data.info.styles.width,
            height: e.data.info.styles.height,
            padding: e.data.info.styles.padding,
            fontSize: e.data.info.styles.fontSize,
            borderRadius: e.data.info.styles.borderRadius,
            color: e.data.info.styles.color,
            backgroundColor: e.data.info.styles.backgroundColor,
            borderColor: e.data.info.styles.borderColor,
            transformX: e.data.info.styles.transformX || 0,
            transformY: e.data.info.styles.transformY || 0,
          }
        });
      }

      // Handle iframe error guardian
      if (e.data.type === 'GHIGHAIS_IFRAME_ERROR') {
        setRuntimeErrors((prev) => [...prev.slice(-4), e.data.message]);
        setIsRepaired(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pages, onSelectPage]);

  // Apply style update to element in iframe DOM
  const updateIframeElementStyle = (property: string, value: any, saveSnapshot = true) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (el) {
      if (saveSnapshot) {
        pushUndoSnapshot();
      }

      // Automatically support sizing for inline elements (e.g. span, a)
      if (property === 'width' || property === 'height') {
        const compDisplay = window.getComputedStyle(el).display;
        if (compDisplay === 'inline') {
          el.style.display = 'inline-block';
        }
      }

      (el.style as any)[property] = value;
      // update state
      setSelectedElement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          styles: {
            ...prev.styles,
            [property]: value,
          }
        };
      });
    }
  };

  // Helper to automatically fit text size precisely and center it in the middle of the box
  const fitAndCenterTextInBox = (el: HTMLElement, customW?: number, customH?: number): string | null => {
    if (!el) return null;
    const rawText = (el.innerText || el.textContent || '').trim();

    // 1. Center the box content horizontally and vertically
    el.style.textAlign = 'center';
    const compDisplay = window.getComputedStyle(el).display;
    if (compDisplay === 'inline') {
      el.style.display = 'inline-flex';
    } else if (!compDisplay.includes('flex')) {
      el.style.display = 'flex';
    }
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.boxSizing = 'border-box';

    // Ensure all internal text/headings/spans/paragraphs/buttons also center properly
    const textChildren = el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button');
    textChildren.forEach((child) => {
      const c = child as HTMLElement;
      c.style.textAlign = 'center';
      c.style.margin = '0 auto';
      c.style.maxWidth = '100%';
    });

    if (!rawText) return null;

    // 2. Measure container box dimensions (allowing passed in width/height from step)
    const rect = el.getBoundingClientRect();
    const boxW = customW || rect.width || el.offsetWidth || parseInt(el.style.width) || 120;
    const boxH = customH || rect.height || el.offsetHeight || parseInt(el.style.height) || 40;

    // Safe inner bounds subtracting padding
    const availW = Math.max(20, boxW - 16);
    const availH = Math.max(16, boxH - 12);

    const words = rawText.split(/\s+/).filter(Boolean);
    const longestWord = Math.max(...words.map((w) => w.length), 1);
    const totalChars = Math.max(rawText.length, 1);

    // Optical scaling formula based on box geometry and character density
    const sizeFromWord = (availW * 0.88) / (longestWord * 0.62);
    const sizeFromHeight = availH * 0.45;
    const approxLines = Math.max(1, Math.ceil(totalChars / Math.max(1, Math.floor(availW / 14))));
    const sizeFromMultiLine = availH / (approxLines * 1.35);

    let targetSize = Math.round(Math.min(sizeFromWord, sizeFromHeight, sizeFromMultiLine));
    targetSize = Math.max(10, Math.min(72, targetSize));

    el.style.fontSize = `${targetSize}px`;
    el.style.lineHeight = '1.25';

    // 3. Iterative fine-tuning using scrollWidth & scrollHeight in DOM for precision fit
    let passes = 30;
    while (
      targetSize > 10 &&
      passes > 0 &&
      (el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4)
    ) {
      targetSize -= 1;
      el.style.fontSize = `${targetSize}px`;
      passes--;
    }

    const finalFontSize = `${targetSize}px`;
    return finalFontSize;
  };

  // Manual action to fit and center selected element
  const handleManualAutoFitAndCenter = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument || !selectedElement) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (!el) return;

    pushUndoSnapshot();
    const fittedFontSize = fitAndCenterTextInBox(el);
    setHasPendingChanges(true);

    setSelectedElement((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        styles: {
          ...prev.styles,
          ...(fittedFontSize ? { fontSize: fittedFontSize } : {})
        }
      };
    });

    setUndoNotification(`Teks dipusatkan & disesuaikan presisi (${fittedFontSize || 'Tengah'})!`);
    setTimeout(() => setUndoNotification(null), 2500);
  };

  // Step resize: Perkecil (-) atau Perbesar (+) Lebar atau Panjang
  const handleStepDimension = (dimension: 'width' | 'height', delta: number) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument || !selectedElement) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (!el) return;

    pushUndoSnapshot();

    const currentValStr = selectedElement.styles[dimension] || '';
    let currentNum = parseInt(currentValStr);
    if (isNaN(currentNum) || currentNum <= 0) {
      currentNum = dimension === 'width' ? el.offsetWidth : el.offsetHeight;
    }
    const newNum = Math.max(20, currentNum + delta);
    const newVal = `${newNum}px`;

    const compDisplay = window.getComputedStyle(el).display;
    if (compDisplay === 'inline') {
      el.style.display = 'inline-block';
    }

    el.style[dimension] = newVal;
    setHasPendingChanges(true);

    let fittedFontSize: string | null = null;
    if (autoFitText) {
      const newW = dimension === 'width' ? newNum : undefined;
      const newH = dimension === 'height' ? newNum : undefined;
      fittedFontSize = fitAndCenterTextInBox(el, newW, newH);
    }

    setSelectedElement((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        styles: {
          ...prev.styles,
          [dimension]: newVal,
          ...(fittedFontSize ? { fontSize: fittedFontSize } : {})
        }
      };
    });
  };

  // Direct dimension update (Slider, Input, Preset)
  const handleSetDimension = (dimension: 'width' | 'height', val: string) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument || !selectedElement) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (!el) return;

    const compDisplay = window.getComputedStyle(el).display;
    if (compDisplay === 'inline') {
      el.style.display = 'inline-block';
    }

    el.style[dimension] = val;
    setHasPendingChanges(true);

    let fittedFontSize: string | null = null;
    if (autoFitText) {
      fittedFontSize = fitAndCenterTextInBox(el);
    }

    setSelectedElement((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        styles: {
          ...prev.styles,
          [dimension]: val,
          ...(fittedFontSize ? { fontSize: fittedFontSize } : {})
        }
      };
    });
  };

  // Update text content of selected element
  const updateIframeElementText = (text: string) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (el) {
      el.innerText = text;
      setHasPendingChanges(true);
      let fittedFontSize: string | null = null;
      if (autoFitText) {
        fittedFontSize = fitAndCenterTextInBox(el);
      }
      setSelectedElement((prev) => prev ? {
        ...prev,
        innerText: text,
        styles: {
          ...prev.styles,
          ...(fittedFontSize ? { fontSize: fittedFontSize } : {})
        }
      } : null);
    }
  };

  // Delete selected element
  const handleDeleteElement = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (el) {
      pushUndoSnapshot();
      el.remove();
      setHasPendingChanges(true);
      setSelectedElement(null);
    }
  };

  // Update Transform X/Y (Drag / Reposition / Nudge)
  const updateTransform = (x: number, y: number) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    const doc = iframeRef.current.contentDocument;
    const el = doc.querySelector('[data-ghighais-selected="true"]') as HTMLElement;
    if (el) {
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.dataset.transformX = x.toString();
      el.dataset.transformY = y.toString();
      setHasPendingChanges(true);

      let fittedFontSize: string | null = null;
      if (autoFitText) {
        fittedFontSize = fitAndCenterTextInBox(el);
      }

      setSelectedElement((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          styles: {
            ...prev.styles,
            transformX: x,
            transformY: y,
            ...(fittedFontSize ? { fontSize: fittedFontSize } : {})
          }
        };
      });
    }
  };

  // Directional Nudge handler for Floating Cursor D-pad (Atas, Bawah, Kiri, Kanan)
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    pushUndoSnapshot();
    const curX = selectedElement.styles.transformX || 0;
    const curY = selectedElement.styles.transformY || 0;
    updateTransform(curX + dx, curY + dy);
  };

  // Keyboard arrow listener: only active when in edit mode, cursor/position tab, and element selected
  useEffect(() => {
    if (mode !== 'edit' || activeToolTab !== 'position' || !selectedElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      const step = e.shiftKey ? cursorStep * 2 : cursorStep;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudge(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudge(0, step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudge(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudge(step, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activeToolTab, selectedElement, cursorStep]);

  // Apply changes to underlying code
  const handleApplyToCode = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument || !activePage) return;
    const doc = iframeRef.current.contentDocument;

    const serializedHtml = getCleanDocumentHtml(doc);
    onApplyVisualEditToCode(activePage.id, serializedHtml);

    setHasPendingChanges(false);
    setSelectedElement(null);
    setApplySuccess(true);
    setUndoNotification(`Codingan diperbarui sesuai pratinjau! (${activePage.name})`);
    setTimeout(() => {
      setApplySuccess(false);
      setUndoNotification(null);
    }, 3500);
  };

  // Dynamic transparency style classes for all editing tools
  const getToolsPanelBg = () => {
    if (toolsOpacity === 'ultra') {
      return 'bg-neutral-950/40 backdrop-blur-md border-neutral-700/40 hover:bg-neutral-950/65 transition-colors shadow-2xl';
    }
    if (toolsOpacity === 'glass') {
      return 'bg-neutral-950/60 backdrop-blur-lg border-neutral-700/60 hover:bg-neutral-950/80 transition-colors shadow-2xl';
    }
    return 'bg-neutral-950/92 backdrop-blur-xl border-neutral-800 shadow-2xl';
  };

  const getToolsCardBg = () => {
    if (toolsOpacity === 'ultra') {
      return 'bg-neutral-950/35 backdrop-blur-sm border-neutral-800/60';
    }
    if (toolsOpacity === 'glass') {
      return 'bg-neutral-950/55 backdrop-blur-sm border-neutral-800/70';
    }
    return 'bg-neutral-900/85 border-neutral-800';
  };

  const getToolsHeaderBg = () => {
    if (toolsOpacity === 'ultra') {
      return 'bg-neutral-950/45 backdrop-blur-md border-neutral-800/60';
    }
    if (toolsOpacity === 'glass') {
      return 'bg-neutral-950/70 backdrop-blur-md border-neutral-800/70';
    }
    return 'bg-neutral-950/90 border-neutral-800';
  };

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-2xl p-4 sm:p-6 flex flex-col h-screen w-screen overflow-hidden shadow-2xl"
          : "rounded-3xl luxury-card border border-neutral-800 p-5 shadow-2xl flex flex-col h-full min-h-[620px] relative overflow-hidden"
      }
    >
      {/* PREVIEW HEADER: MODE SWITCH, VIEWPORT SIZES, FULLSCREEN, AND CURRENT PAGE */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        
        {/* Left: Mode Switcher (Interaktif vs Pengeditan Visual) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            {/* Interactive Preview Mode */}
            <button
              id="mode-preview-btn"
              type="button"
              onClick={() => {
                setMode('preview');
                setSelectedElement(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'preview'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mode Interaktif</span>
            </button>

            {/* Visual Edit Mode */}
            <button
              id="mode-edit-btn"
              type="button"
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'edit'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Mode Edit Visual</span>
            </button>
          </div>

          {/* TOMBOL TERAPKAN PERUBAHAN KE CODINGAN */}
          {mode === 'edit' && (
            <button
              id="preview-header-apply-code-btn"
              type="button"
              onClick={handleApplyToCode}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                applySuccess
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                  : hasPendingChanges
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 ring-2 ring-emerald-400/80 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-950/40'
              }`}
              title="Terapkan semua perubahan visual di preview ke dalam file codingan sekarang"
            >
              {applySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tersinkron ke Codingan!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terapkan ke Codingan</span>
                  {hasPendingChanges && (
                    <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping ml-0.5" />
                  )}
                </>
              )}
            </button>
          )}

          {isFullscreen && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Layar Penuh (Esc)</span>
            </span>
          )}
        </div>

        {/* Center/Right: Viewport switches, Fullscreen & Active page select */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Page Selector */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-neutral-500 text-[11px]">Halaman:</span>
            <select
              value={activePageId}
              onChange={(e) => onSelectPage(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {pages.filter(p => p.type === 'html').map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-neutral-200">
                  {p.name} ({p.title})
                </option>
              ))}
            </select>
          </div>

          {/* Viewport device buttons */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'}`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded ${viewport === 'tablet' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* OPEN IN NEW TAB BUTTON */}
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Buka Pratinjau di Tab Browser Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* FULLSCREEN TOGGLE BUTTON */}
          <button
            id="preview-fullscreen-toggle-btn"
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-white border border-neutral-800 hover:border-amber-500/40'
            }`}
            title={isFullscreen ? "Kecilkan ke Ukuran Normal (Esc)" : "Perbesar Tampilan Edit/Preview ke Layar Penuh"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Kecilkan</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Layar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODE INSTRUCTION BANNER */}
      <div className="my-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs flex flex-wrap items-center justify-between gap-2">
        {mode === 'preview' ? (
          <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              <strong>Mode Navigasi Aktif:</strong> Klik tombol atau link apa saja untuk berpindah antar halaman secara interaktif.
            </span>
          </span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cyan-300 flex items-center gap-1.5 text-[11px]">
              <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                <strong>Mode Edit Visual Aktif:</strong> Sesuaikan elemen lalu klik tombol <strong>Terapkan</strong> agar codingan langsung berubah.
              </span>
            </span>
            <button
              type="button"
              onClick={handleApplyToCode}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow ${
                applySuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : hasPendingChanges
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-1 ring-emerald-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {applySuccess ? (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Tersinkron!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Terapkan Sekarang</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Undo notification toast */}
        {undoNotification ? (
          <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 animate-in fade-in">
            {undoNotification}
          </span>
        ) : (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Zero-Error Siaga</span>
          </span>
        )}
      </div>

      {/* WORKSPACE CONTAINER: SEPARATED PHOTOSHOP TOOLS (LEFT) AND PREVIEW CANVAS (RIGHT) */}
      <div className="flex-1 flex overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 mt-1 min-h-[460px] relative">
        
        {/* KOTAK TOOLS DISEBELAH KIRI (SEPERTI TAMPILAN PHOTOSHOP) DALAM MODE EDIT */}
        {mode === 'edit' && (
          <>
            {isToolsSidebarCollapsed ? (
              /* COLLAPSED MINI TOOLBAR (PHOTOSHOP ICON RAIL) */
              <div
                id="photoshop-tools-strip"
                className={`w-14 shrink-0 flex flex-col items-center py-3 justify-between z-20 transition-all ${
                  toolsLayout === 'overlay'
                    ? 'absolute left-3 top-3 bottom-3 rounded-2xl border shadow-2xl'
                    : 'border-r'
                } ${getToolsPanelBg()}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsToolsSidebarCollapsed(false)}
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-amber-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
                    title="Buka Kotak Tools Lengkap"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-px bg-neutral-800/60 my-1" />

                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-30 text-amber-400 border border-neutral-700 cursor-pointer"
                    title="Undo (Ctrl+Z)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-30 text-cyan-400 border border-neutral-700 cursor-pointer"
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-px bg-neutral-800/60 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolTab('size');
                      setIsToolsSidebarCollapsed(false);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      activeToolTab === 'size'
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                    title="Tools Ukuran (Lebar & Panjang)"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolTab('position');
                      setIsToolsSidebarCollapsed(false);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      activeToolTab === 'position'
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                    title="Tools Posisi / Geser"
                  >
                    <Move className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolTab('color');
                      setIsToolsSidebarCollapsed(false);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      activeToolTab === 'color'
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                    title="Tools Warna"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolTab('text');
                      setIsToolsSidebarCollapsed(false);
                    }}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      activeToolTab === 'text'
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                    title="Tools Teks"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToCode}
                  className={`p-2 rounded-xl font-bold transition-all shadow-md cursor-pointer ${
                    applySuccess
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                      : hasPendingChanges
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950 ring-2 ring-emerald-400/80 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title="Terapkan Perubahan ke Codingan"
                >
                  {applySuccess ? <Check className="w-4 h-4 stroke-[3]" /> : <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              /* EXPANDED PHOTOSHOP-STYLE LEFT TOOLS PANEL (TRANSPARAN / FROSTED GLASS) */
              <div
                id="photoshop-tools-sidebar"
                className={`w-80 sm:w-84 xl:w-90 shrink-0 flex flex-col h-full overflow-hidden z-20 text-xs transition-all ${
                  toolsLayout === 'overlay'
                    ? 'absolute left-3 top-3 bottom-3 rounded-2xl border'
                    : 'border-r'
                } ${getToolsPanelBg()}`}
              >
                {/* 1. TOP HEADER: PANEL TITLE, TRANSPARENCY SELECTOR, DOCK/FLOAT, UNDO, REDO, COLLAPSE */}
                <div className={`px-3 py-2 border-b flex items-center justify-between gap-1.5 ${getToolsHeaderBg()}`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="p-1 rounded bg-cyan-500/20 text-cyan-400 font-bold shrink-0">
                      <Sliders className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-neutral-200 text-[11px] tracking-wide truncate">
                      Tools Edit
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Opacity level switcher */}
                    <button
                      type="button"
                      onClick={() => {
                        setToolsOpacity((prev) => prev === 'ultra' ? 'glass' : prev === 'glass' ? 'solid' : 'ultra');
                      }}
                      className="px-1.5 py-1 rounded bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-700/60 text-cyan-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                      title="Ubah Tingkat Transparansi Tools (35% Bening / 60% Kaca / 90% Solid)"
                    >
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>{toolsOpacity === 'ultra' ? '35%' : toolsOpacity === 'glass' ? '60%' : '90%'}</span>
                    </button>

                    {/* Float / Dock Switcher */}
                    <button
                      type="button"
                      onClick={() => setToolsLayout((prev) => prev === 'overlay' ? 'docked' : 'overlay')}
                      className={`p-1 rounded border text-[10px] cursor-pointer transition-colors ${
                        toolsLayout === 'overlay'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-neutral-900/60 text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                      title={toolsLayout === 'overlay' ? 'Mode Mengambang Transparan (Klik untuk Pasang di Samping)' : 'Mode Samping (Klik untuk Mengambang Transparan)'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>

                    {/* UNDO */}
                    <button
                      id="ps-undo-btn"
                      type="button"
                      onClick={handleUndo}
                      disabled={undoStack.length === 0}
                      className="px-1.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-35 border border-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center gap-0.5 transition-all cursor-pointer"
                      title="Undo Perubahan (Shortcut: Ctrl + Z)"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">Undo</span>
                    </button>

                    {/* REDO */}
                    <button
                      id="ps-redo-btn"
                      type="button"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="px-1.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-35 border border-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center gap-0.5 transition-all cursor-pointer"
                      title="Redo Perubahan (Shortcut: Ctrl + Y)"
                    >
                      <RotateCw className="w-3 h-3 text-cyan-400" />
                    </button>

                    {/* COLLAPSE TOGGLE */}
                    <button
                      type="button"
                      onClick={() => setIsToolsSidebarCollapsed(true)}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white border border-transparent hover:border-neutral-700"
                      title="Sembunyikan Panel Tools ke Sisi Kiri"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. PHOTOSHOP TOOL CATEGORY TABS */}
                <div className={`grid grid-cols-4 p-1.5 gap-1 border-b ${getToolsHeaderBg()}`}>
                  <button
                    type="button"
                    onClick={() => setActiveToolTab('size')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all flex flex-col items-center gap-1 ${
                      activeToolTab === 'size'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-none">Ukuran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveToolTab('position')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all flex flex-col items-center gap-1 ${
                      activeToolTab === 'position'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-none">Posisi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveToolTab('color')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all flex flex-col items-center gap-1 ${
                      activeToolTab === 'color'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-none">Warna</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveToolTab('text')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all flex flex-col items-center gap-1 ${
                      activeToolTab === 'text'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span className="text-[10px] leading-none">Teks</span>
                  </button>
                </div>

                {/* 3. SCROLLABLE INSPECTOR BODY */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  
                  {/* ELEMENT STATUS BAR */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${getToolsCardBg()}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 shrink-0">
                        <MousePointer className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        {selectedElement ? (
                          <div className="text-[11px]">
                            <span className="text-neutral-400">Elemen: </span>
                            <span className="font-mono font-bold text-cyan-300">&lt;{selectedElement.tagName}&gt;</span>
                            {selectedElement.id && <span className="text-neutral-400 font-mono ml-1">#{selectedElement.id}</span>}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">
                            Belum ada elemen yang dipilih
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedElement && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={handleDeleteElement}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 transition-all cursor-pointer"
                          title="Hapus elemen terpilih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedElement(null)}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Batalkan pilihan elemen"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* IF NO ELEMENT SELECTED: HELPFUL ONBOARDING GUIDE */}
                  {!selectedElement && (
                    <div className={`p-4 rounded-xl border text-center space-y-2 ${getToolsCardBg()}`}>
                      <div className="w-10 h-10 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <MousePointer className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-neutral-200 text-xs">Pilih Elemen di Pratinjau</h4>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Kotak pratinjau di sebelah kanan terbuka penuh tanpa tertutup apapun. <strong>Arahkan dan klik</strong> elemen apa saja (tombol, teks, gambar, kartu, dll) untuk memodifikasinya di sini.
                      </p>
                    </div>
                  )}

                  {/* ACTIVE ELEMENT CONTROLS */}
                  {selectedElement && (
                    <>
                      {/* 1. TAB UKURAN (LEBAR & PANJANG / TINGGI) */}
                      {activeToolTab === 'size' && (
                        <div className="space-y-3 animate-in fade-in duration-150">
                          
                          {/* SISI LEBAR (WIDTH) */}
                          <div className={`p-3 rounded-xl border space-y-2 ${getToolsCardBg()}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-200 text-[11px] flex items-center gap-1.5">
                                <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Sisi Lebar (Width)</span>
                              </span>
                              <span className="font-mono text-cyan-300 font-bold text-[11px]">
                                {selectedElement.styles.width || 'Otomatis'}
                              </span>
                            </div>

                            {/* Steppers & Slider */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStepDimension('width', -20)}
                                className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Perkecil Lebar (-20px)"
                              >
                                <Minus className="w-3 h-3 text-amber-400" />
                                <span className="hidden sm:inline">Perkecil</span>
                              </button>

                              <input
                                type="range"
                                min="40"
                                max="1400"
                                value={parseInt(selectedElement.styles.width || '300') || 300}
                                onMouseDown={pushUndoSnapshot}
                                onTouchStart={pushUndoSnapshot}
                                onChange={(e) => handleSetDimension('width', `${e.target.value}px`)}
                                className="w-full accent-cyan-400 cursor-pointer"
                                title="Tarik slider untuk mengubah lebar"
                              />

                              <button
                                type="button"
                                onClick={() => handleStepDimension('width', 20)}
                                className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Perbesar Lebar (+20px)"
                              >
                                <Plus className="w-3 h-3 text-cyan-400" />
                                <span className="hidden sm:inline">Perbesar</span>
                              </button>
                            </div>

                            {/* Presets */}
                            <div className="flex items-center gap-1 pt-1 flex-wrap">
                              <span className="text-[10px] text-neutral-500 mr-1">Preset:</span>
                              {['25%', '50%', '75%', '100%', 'auto'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    handleSetDimension('width', preset);
                                  }}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono hover:text-white"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* SISI PANJANG / TINGGI (HEIGHT) */}
                          <div className={`p-3 rounded-xl border space-y-2 ${getToolsCardBg()}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-200 text-[11px] flex items-center gap-1.5">
                                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                                <span>Sisi Panjang / Tinggi (Height)</span>
                              </span>
                              <span className="font-mono text-amber-300 font-bold text-[11px]">
                                {selectedElement.styles.height || 'Otomatis'}
                              </span>
                            </div>

                            {/* Steppers & Slider */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStepDimension('height', -20)}
                                className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Perkecil Panjang / Tinggi (-20px)"
                              >
                                <Minus className="w-3 h-3 text-amber-400" />
                                <span className="hidden sm:inline">Perkecil</span>
                              </button>

                              <input
                                type="range"
                                min="20"
                                max="900"
                                value={parseInt(selectedElement.styles.height || '150') || 150}
                                onMouseDown={pushUndoSnapshot}
                                onTouchStart={pushUndoSnapshot}
                                onChange={(e) => handleSetDimension('height', `${e.target.value}px`)}
                                className="w-full accent-amber-400 cursor-pointer"
                                title="Tarik slider untuk mengubah panjang/tinggi"
                              />

                              <button
                                type="button"
                                onClick={() => handleStepDimension('height', 20)}
                                className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Perbesar Panjang / Tinggi (+20px)"
                              >
                                <Plus className="w-3 h-3 text-amber-400" />
                                <span className="hidden sm:inline">Perbesar</span>
                              </button>
                            </div>

                            {/* Presets */}
                            <div className="flex items-center gap-1 pt-1 flex-wrap">
                              <span className="text-[10px] text-neutral-500 mr-1">Preset:</span>
                              {['auto', '60px', '120px', '240px', '400px', '600px'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    handleSetDimension('height', preset);
                                  }}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono hover:text-white"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* UKURAN FONT & PADDING */}
                          <div className={`p-3 rounded-xl border space-y-2.5 ${getToolsCardBg()}`}>
                            <span className="font-bold text-neutral-200 text-[11px] block">
                              Tipografi &amp; Jarak Spasi
                            </span>

                            {/* Font size */}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-neutral-400">Ukuran Font:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    const cur = parseInt(selectedElement.styles.fontSize || '16');
                                    updateIframeElementStyle('fontSize', `${Math.max(10, cur - 2)}px`, false);
                                  }}
                                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                                  title="Perkecil Font"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono text-cyan-300 font-semibold px-2 text-xs">
                                  {selectedElement.styles.fontSize || '16px'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    const cur = parseInt(selectedElement.styles.fontSize || '16');
                                    updateIframeElementStyle('fontSize', `${Math.min(96, cur + 2)}px`, false);
                                  }}
                                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                                  title="Perbesar Font"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Padding */}
                            <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
                              <span className="text-[11px] text-neutral-400">Ruang Dalam (Padding):</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    const cur = parseInt(selectedElement.styles.padding || '8');
                                    updateIframeElementStyle('padding', `${Math.max(0, cur - 4)}px`, false);
                                  }}
                                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                                  title="Perkecil Padding"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-mono text-amber-300 font-semibold px-2 text-xs">
                                  {selectedElement.styles.padding || '0px'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    pushUndoSnapshot();
                                    const cur = parseInt(selectedElement.styles.padding || '8');
                                    updateIframeElementStyle('padding', `${cur + 4}px`, false);
                                  }}
                                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                                  title="Perbesar Padding"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* FITUR AUTO-FIT & PUSATKAN TEKS (UKURAN OTOMATIS MENYESUAIKAN & DI TENGAH) */}
                          <div className={`p-3 rounded-xl border space-y-2.5 ${getToolsCardBg()}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                                  <AlignCenter className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="font-bold text-neutral-200 text-[11px] block">Auto-Fit &amp; Pusatkan Teks</span>
                                  <span className="text-[10px] text-neutral-400">Teks pas presisi &amp; di tengah kotak</span>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setAutoFitText(!autoFitText);
                                  setUndoNotification(!autoFitText ? 'Auto-Fit & Pusatkan Teks Aktif' : 'Auto-Fit Dinonaktifkan');
                                  setTimeout(() => setUndoNotification(null), 2000);
                                }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  autoFitText
                                    ? 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-400'
                                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                {autoFitText ? 'AKTIF' : 'OFF'}
                              </button>
                            </div>

                            <p className="text-[10px] text-neutral-400 leading-relaxed">
                              Saat kotak diperbesar, diperkecil, atau digeser, teks otomatis memusatkan diri ke tengah dan ukuran font presisi sesuai ruang kotak.
                            </p>

                            <button
                              type="button"
                              onClick={handleManualAutoFitAndCenter}
                              className="w-full py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 hover:text-emerald-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              title="Pusatkan teks horizontal & vertikal serta sesuaikan ukuran font dengan dimensi kotak sekarang"
                            >
                              <Target className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Pusatkan &amp; Pas-kan Teks Sekarang</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. TAB POSISI / GESER */}
                      {activeToolTab === 'position' && (
                        <div className="space-y-3 animate-in fade-in duration-150">
                          <div className={`p-2.5 rounded-xl border text-[11px] text-cyan-300 flex items-center gap-2 ${getToolsCardBg()}`}>
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>Tombol mengambang (Atas, Bawah, Kanan, Kiri) aktif di layar pratinjau!</span>
                          </div>

                          <div className={`p-3 rounded-xl border space-y-2 ${getToolsCardBg()}`}>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-300 font-semibold">Geser Horizontal (X):</span>
                              <span className="font-mono text-cyan-300 font-bold">{selectedElement.styles.transformX || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-150"
                              max="150"
                              value={selectedElement.styles.transformX || 0}
                              onMouseDown={pushUndoSnapshot}
                              onTouchStart={pushUndoSnapshot}
                              onChange={(e) => updateTransform(parseInt(e.target.value), selectedElement.styles.transformY || 0)}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          <div className={`p-3 rounded-xl border space-y-2 ${getToolsCardBg()}`}>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-300 font-semibold">Geser Vertikal (Y):</span>
                              <span className="font-mono text-cyan-300 font-bold">{selectedElement.styles.transformY || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-150"
                              max="150"
                              value={selectedElement.styles.transformY || 0}
                              onMouseDown={pushUndoSnapshot}
                              onTouchStart={pushUndoSnapshot}
                              onChange={(e) => updateTransform(selectedElement.styles.transformX || 0, parseInt(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                pushUndoSnapshot();
                                updateTransform(0, 0);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-medium transition-all cursor-pointer"
                            >
                              Reset Posisi (0, 0)
                            </button>

                            <button
                              type="button"
                              onClick={handleManualAutoFitAndCenter}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                              title="Pusatkan teks ke tengah kotak"
                            >
                              <AlignCenter className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Pusatkan Teks</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. TAB WARNA */}
                      {activeToolTab === 'color' && (
                        <div className="space-y-3 animate-in fade-in duration-150">
                          <div className={`p-3 rounded-xl border flex items-center justify-between ${getToolsCardBg()}`}>
                            <div>
                              <span className="text-[11px] font-semibold text-neutral-200 block">Warna Teks</span>
                              <span className="text-[10px] text-neutral-400">Pilih warna font elemen</span>
                            </div>
                            <input
                              type="color"
                              defaultValue="#ffffff"
                              onFocus={pushUndoSnapshot}
                              onChange={(e) => updateIframeElementStyle('color', e.target.value, false)}
                              className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                            />
                          </div>

                          <div className={`p-3 rounded-xl border flex items-center justify-between ${getToolsCardBg()}`}>
                            <div>
                              <span className="text-[11px] font-semibold text-neutral-200 block">Warna Latar</span>
                              <span className="text-[10px] text-neutral-400">Pilih background elemen</span>
                            </div>
                            <input
                              type="color"
                              defaultValue="#0f172a"
                              onFocus={pushUndoSnapshot}
                              onChange={(e) => updateIframeElementStyle('backgroundColor', e.target.value, false)}
                              className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                            />
                          </div>

                          <div className={`p-3 rounded-xl border flex items-center justify-between ${getToolsCardBg()}`}>
                            <div>
                              <span className="text-[11px] font-semibold text-neutral-200 block">Warna Border</span>
                              <span className="text-[10px] text-neutral-400">Pilih garis batas</span>
                            </div>
                            <input
                              type="color"
                              defaultValue="#f59e0b"
                              onFocus={pushUndoSnapshot}
                              onChange={(e) => {
                                updateIframeElementStyle('borderColor', e.target.value, false);
                                updateIframeElementStyle('borderWidth', '2px', false);
                              }}
                              className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* 4. TAB TEKS */}
                      {activeToolTab === 'text' && (
                        <div className={`p-3 rounded-xl border space-y-3 animate-in fade-in duration-150 ${getToolsCardBg()}`}>
                          <span className="text-[11px] font-semibold text-neutral-200 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Edit Isi Teks Elemen:</span>
                          </span>
                          <textarea
                            rows={3}
                            value={selectedElement.innerText || ''}
                            onFocus={pushUndoSnapshot}
                            onChange={(e) => updateIframeElementText(e.target.value)}
                            placeholder="Ketik teks baru di sini..."
                            className="w-full p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none font-sans"
                          />

                          {/* Tombol Cepat Pusatkan & Pas-kan Ukuran Teks */}
                          <button
                            type="button"
                            onClick={handleManualAutoFitAndCenter}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                            title="Otomatis sesuaikan ukuran teks sesuai dimensi kotak dan letakkan persis di tengah"
                          >
                            <AlignCenter className="w-4 h-4 text-emerald-400" />
                            <span>Pusatkan &amp; Pas-kan Ukuran Teks</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 4. FOOTER OF TOOLS BOX: BIG APPLY TO CODE BUTTON */}
                <div className={`p-3 border-t space-y-2 ${getToolsHeaderBg()}`}>
                  <button
                    id="ps-apply-code-btn"
                    type="button"
                    onClick={handleApplyToCode}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                      applySuccess
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                        : hasPendingChanges
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 ring-2 ring-emerald-400/80 shadow-emerald-950/60 animate-pulse'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950'
                    }`}
                    title="Terapkan semua perubahan visual ke codingan file HTML sekarang"
                  >
                    {applySuccess ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Tersinkron ke Codingan!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terapkan ke Codingan</span>
                        {hasPendingChanges && (
                          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping ml-1" />
                        )}
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-neutral-400 text-center">
                    Shortcut Undo: <kbd className="font-mono text-amber-300">Ctrl+Z</kbd> • Redo: <kbd className="font-mono text-cyan-300">Ctrl+Y</kbd>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* KOTAK PREVIEW DISEBELAH KANAN (TIDAK TERTUTUP SAMA SEKALI!) */}
        <div className="flex-1 min-w-0 h-full relative flex items-center justify-center p-2 bg-neutral-950/90 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 flex flex-col bg-white shadow-2xl ${
              viewport === 'mobile'
                ? 'w-[375px] max-w-full rounded-2xl my-2 border-4 border-neutral-800 overflow-hidden'
                : viewport === 'tablet'
                ? 'w-[768px] max-w-full rounded-xl my-2 border-2 border-neutral-800 overflow-hidden'
                : 'w-full'
            }`}
          >
            <iframe
              ref={iframeRef}
              srcDoc={buildIframeSourceDoc()}
              title="Aplikasi Preview"
              className="w-full h-full border-0 bg-slate-950"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />
          </div>

          {/* TOMBOL MENGAMBANG UNTUK POSISI (HANYA KURSOR SAJA - TRANSPARAN / FROSTED GLASS) */}
          {mode === 'edit' && activeToolTab === 'position' && (
            <div
              id="floating-cursor-controller"
              className={`absolute z-30 transition-all duration-300 animate-in fade-in zoom-in-95 select-none ${
                dpadPosition === 'bottom-right'
                  ? 'bottom-4 right-4 sm:bottom-6 sm:right-6'
                  : dpadPosition === 'bottom-left'
                  ? 'bottom-4 left-4 sm:bottom-6 sm:left-6'
                  : 'top-4 right-4 sm:top-6 sm:right-6'
              }`}
            >
              <div className={`backdrop-blur-md border border-cyan-500/40 shadow-2xl rounded-2xl p-3 sm:p-4 text-neutral-200 w-64 sm:w-72 ${getToolsPanelBg()}`}>
                {/* Header Widget */}
                <div className={`flex items-center justify-between pb-2 mb-2 border-b border-neutral-700/60 text-xs`}>
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                      <Move className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-white text-[11px] tracking-wide">
                      Kontrol Kursor
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Position dock switcher */}
                    <button
                      type="button"
                      onClick={() => {
                        setDpadPosition((prev) => 
                          prev === 'bottom-right' ? 'bottom-left' : prev === 'bottom-left' ? 'top-right' : 'bottom-right'
                        );
                      }}
                      className="px-1.5 py-0.5 rounded bg-neutral-900/70 hover:bg-neutral-800 text-[10px] text-neutral-300 hover:text-white border border-neutral-700/60 cursor-pointer"
                      title="Pindahkan letak tombol mengambang"
                    >
                      Pindah Posisi
                    </button>

                    {selectedElement && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                        &lt;{selectedElement.tagName}&gt;
                      </span>
                    )}
                  </div>
                </div>

                {!selectedElement ? (
                  <div className={`py-3 px-2 text-center text-[11px] text-neutral-300 leading-relaxed rounded-xl border ${getToolsCardBg()}`}>
                    <MousePointer className="w-4 h-4 mx-auto mb-1 text-cyan-400 animate-bounce" />
                    Klik salah satu elemen di pratinjau untuk menggesernya dengan tombol Atas, Bawah, Kiri, Kanan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Coordinates & Step control */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-neutral-400">X:</span>
                        <span className="text-cyan-300 font-bold">{selectedElement.styles.transformX || 0}px</span>
                        <span className="text-neutral-600">|</span>
                        <span className="text-neutral-400">Y:</span>
                        <span className="text-cyan-300 font-bold">{selectedElement.styles.transformY || 0}px</span>
                      </div>

                      {/* Step chips */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400">Jarak:</span>
                        {[1, 5, 10, 25].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => setCursorStep(step)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                              cursorStep === step
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60'
                            }`}
                          >
                            {step}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* STATUS AUTO-FIT & PUSATKAN TEKS SAAT GESER */}
                    <div className={`p-1.5 rounded-xl border flex items-center justify-between gap-1 text-[10px] ${getToolsCardBg()}`}>
                      <div className="flex items-center gap-1.5">
                        <AlignCenter className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-neutral-300">Teks Otomatis Tengah:</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleManualAutoFitAndCenter}
                          className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold cursor-pointer"
                          title="Pusatkan dan pas-kan teks sekarang"
                        >
                          Pas-kan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAutoFitText(!autoFitText);
                            setUndoNotification(!autoFitText ? 'Auto-Tengah Aktif' : 'Auto-Tengah Nonaktif');
                            setTimeout(() => setUndoNotification(null), 1800);
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            autoFitText ? 'bg-emerald-500 text-slate-950' : 'bg-neutral-800 text-neutral-400'
                          }`}
                          title="Aktifkan/Nonaktifkan penyesuaian otomatis teks saat digeser"
                        >
                          {autoFitText ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {/* D-PAD CONTROLLER (ATAS, BAWAH, KIRI, KANAN) */}
                    <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 shadow-inner ${getToolsCardBg()}`}>
                      {/* ROW 1: ATAS */}
                      <button
                        id="dpad-up-btn"
                        type="button"
                        onClick={() => handleNudge(0, -cursorStep)}
                        className="w-24 py-2 rounded-lg bg-neutral-800/80 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 text-neutral-200 border border-neutral-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer group"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-4 h-4 text-cyan-400 group-hover:text-slate-950 transition-colors" />
                        <span>Atas</span>
                      </button>

                      {/* ROW 2: KIRI, RESET/TENGAH, KANAN */}
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        {/* KIRI */}
                        <button
                          id="dpad-left-btn"
                          type="button"
                          onClick={() => handleNudge(-cursorStep, 0)}
                          className="flex-1 py-2 px-1 rounded-lg bg-neutral-800/80 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 text-neutral-200 border border-neutral-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer group"
                          title="Geser ke Kiri"
                        >
                          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:text-slate-950 transition-colors" />
                          <span>Kiri</span>
                        </button>

                        {/* RESET / 0,0 */}
                        <button
                          id="dpad-center-btn"
                          type="button"
                          onClick={() => {
                            pushUndoSnapshot();
                            updateTransform(0, 0);
                          }}
                          className="px-2.5 py-2 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 text-neutral-300 hover:text-amber-300 border border-neutral-700 text-[11px] font-mono flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="Kembalikan ke posisi awal (0, 0)"
                        >
                          <Target className="w-3.5 h-3.5 text-amber-400" />
                          <span>0,0</span>
                        </button>

                        {/* KANAN */}
                        <button
                          id="dpad-right-btn"
                          type="button"
                          onClick={() => handleNudge(cursorStep, 0)}
                          className="flex-1 py-2 px-1 rounded-lg bg-neutral-800/80 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 text-neutral-200 border border-neutral-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer group"
                          title="Geser ke Kanan"
                        >
                          <span>Kanan</span>
                          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:text-slate-950 transition-colors" />
                        </button>
                      </div>

                      {/* ROW 3: BAWAH */}
                      <button
                        id="dpad-down-btn"
                        type="button"
                        onClick={() => handleNudge(0, cursorStep)}
                        className="w-24 py-2 rounded-lg bg-neutral-800/80 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 text-neutral-200 border border-neutral-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer group"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-4 h-4 text-cyan-400 group-hover:text-slate-950 transition-colors" />
                        <span>Bawah</span>
                      </button>
                    </div>

                    {/* Hint keyboard */}
                    <div className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
                      <span>⌨️ Keyboard:</span>
                      <kbd className="px-1 py-0.5 rounded bg-neutral-900/80 text-cyan-300 font-mono">↑</kbd>
                      <kbd className="px-1 py-0.5 rounded bg-neutral-900/80 text-cyan-300 font-mono">↓</kbd>
                      <kbd className="px-1 py-0.5 rounded bg-neutral-900/80 text-cyan-300 font-mono">←</kbd>
                      <kbd className="px-1 py-0.5 rounded bg-neutral-900/80 text-cyan-300 font-mono">→</kbd>
                    </div>

                    {/* TOMBOL CEPAT TERAPKAN KE CODINGAN */}
                    <button
                      id="floating-dpad-apply-code-btn"
                      type="button"
                      onClick={handleApplyToCode}
                      className={`w-full mt-2 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                        applySuccess
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                          : hasPendingChanges
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 ring-2 ring-emerald-400/80 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
                      }`}
                      title="Terapkan pergeseran posisi elemen langsung ke file codingan"
                    >
                      {applySuccess ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Tersinkron ke Codingan!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Terapkan ke Codingan</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR: NOTIFICATION OF APPLIED EDITS & RELOAD */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80 mt-2 text-xs">
        <div className="flex items-center gap-2">
          {applySuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Perubahan visual berhasil diterapkan ke codingan!
            </span>
          )}
          {!applySuccess && mode === 'edit' && (
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <span>💡 Shortcut Undo: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-amber-300 text-[10px]">Ctrl+Z</kbd></span>
              <span className="text-neutral-600">•</span>
              <span>Klik <strong>"Terapkan ke Kode"</strong> untuk menyimpan permanen ke HTML.</span>
            </span>
          )}
          {!applySuccess && mode === 'preview' && (
            <span className="text-neutral-500 text-[11px]">
              Gunakan mode <strong>"Mode Edit Visual"</strong> untuk memilih &amp; mengubah ukuran elemen langsung pada pratinjau.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (iframeRef.current) {
              iframeRef.current.srcdoc = buildIframeSourceDoc();
            }
          }}
          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
          title="Muat Ulang Tampilan"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Muat Ulang</span>
        </button>
      </div>
    </div>
  );
};
