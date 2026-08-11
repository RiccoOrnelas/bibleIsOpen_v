'use client';

import { useEffect, useRef, useState } from 'react';

type Visibility = 'public' | 'private';

const STORAGE_KEY = 'bible-is-open-meditation-draft';
const textColors = ['#111827', '#6B7280', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#2563EB', '#7C3AED', '#DB2777'];
const alignments = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'] as const;

function sanitizeHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'MARK', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'DIV', 'SPAN']);

  document.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name !== 'style') element.removeAttribute(attribute.name);
    });

    if (element.hasAttribute('style')) {
      const style = element.getAttribute('style') ?? '';
      const safeStyle = style
        .split(';')
        .filter((rule) => /^(font-size|color|background-color|text-align):/.test(rule.trim()))
        .join(';');
      element.setAttribute('style', safeStyle);
    }
  });

  return document.body.innerHTML;
}

function ToolbarButton({
  label,
  children,
  onMouseDown,
  active = false,
}: {
  label: string;
  children: React.ReactNode;
  onMouseDown: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown();
      }}
      className={`h-8 min-w-8 px-1.5 rounded-md flex items-center justify-center text-[var(--dark-gray)] transition-colors hover:bg-[var(--light-blue)]/15 hover:text-[var(--light-blue)] ${active ? 'bg-[var(--light-blue)]/20 text-[var(--light-blue)]' : ''}`}
    >
      {children}
    </button>
  );
}

export default function MeditationPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [fontSize, setFontSize] = useState(12);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [alignmentIndex, setAlignmentIndex] = useState(0);

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft) as {
        title?: string;
        contentHtml?: string;
        visibility?: Visibility;
      };
      setTitle(draft.title ?? '');
      setContentHtml(sanitizeHtml(draft.contentHtml ?? ''));
      setVisibility(draft.visibility === 'public' ? 'public' : 'private');
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== contentHtml) {
      editorRef.current.innerHTML = contentHtml;
    }
  }, [contentHtml]);

  const execute = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? '');
  };

  const uppercaseSelection = () => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    if (!selectedText) return;
    document.execCommand('insertText', false, selectedText.toLocaleUpperCase('pt-BR'));
    setContentHtml(editorRef.current?.innerHTML ?? '');
  };

  const toggleList = () => {
    editorRef.current?.focus();
    document.execCommand('insertUnorderedList', false);
    setContentHtml(editorRef.current?.innerHTML ?? '');
  };

  const cycleAlignment = () => {
    const nextIndex = (alignmentIndex + 1) % alignments.length;
    setAlignmentIndex(nextIndex);
    execute(alignments[nextIndex]);
  };

  const changeFontSize = (delta: number) => {
    const nextSize = Math.min(40, Math.max(8, fontSize + delta));
    setFontSize(nextSize);
    execute('fontSize', String(Math.max(1, Math.min(7, Math.round(nextSize / 4)))));
  };

  const handleInput = () => {
    setContentHtml(editorRef.current?.innerHTML ?? '');
  };

  const handleSave = () => {
    const cleanHtml = sanitizeHtml(contentHtml);
    if (!title.trim() || !cleanHtml.replace(/<[^>]*>/g, '').trim()) return;

    const draft = {
      title: title.trim(),
      contentHtml: cleanHtml,
      visibility,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setContentHtml(cleanHtml);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título da meditação..."
          className="w-full text-xl sm:text-3xl font-bold bg-transparent text-[var(--dark-gray)] placeholder:text-[var(--dark-gray)]/25 outline-none mb-2"
        />

        <div className="flex items-center gap-3 mb-4 text-xs text-[var(--dark-gray)]/50">
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
          <button type="button" onClick={() => setPreview((value) => !value)} className="hover:text-[var(--light-blue)]">
            {preview ? 'Editar' : 'Visualizar'}
          </button>
        </div>

        {!preview && (
          <div className="flex items-center gap-1 mb-3 p-1.5 rounded-xl bg-[var(--white)] shadow-sm overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center rounded-lg bg-[var(--background)] px-1">
              <ToolbarButton label="Diminuir fonte" onMouseDown={() => changeFontSize(-1)}>-</ToolbarButton>
              <span className="w-7 text-center text-sm text-[var(--dark-gray)]">{fontSize}</span>
              <ToolbarButton label="Aumentar fonte" onMouseDown={() => changeFontSize(1)}>+</ToolbarButton>
            </div>
            <div className="relative">
              <ToolbarButton label="Cor do texto" onMouseDown={() => setColorOpen((open) => !open)}>
                <span className="font-bold text-lg border-b-4 border-cyan-400">A</span>
              </ToolbarButton>
              {colorOpen && (
                <div className="absolute left-0 top-10 z-20 grid grid-cols-5 gap-1 p-2 w-36 rounded-lg bg-[var(--white)] shadow-xl max-[360px]:left-auto max-[360px]:right-0">
                  {textColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      aria-label={`Cor ${color}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        execute('foreColor', color);
                        setColorOpen(false);
                      }}
                      className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            <ToolbarButton label="Negrito" onMouseDown={() => execute('bold')}><strong className="text-lg">B</strong></ToolbarButton>
            <ToolbarButton label="Itálico" onMouseDown={() => execute('italic')}><em className="text-lg">I</em></ToolbarButton>
            <ToolbarButton label="Sublinhado" onMouseDown={() => execute('underline')}><u className="text-lg">U</u></ToolbarButton>
            <ToolbarButton label="Tachado" onMouseDown={() => execute('strikeThrough')}><s className="text-lg">S</s></ToolbarButton>
            <ToolbarButton label="Transformar em maiúsculas" onMouseDown={uppercaseSelection}>
              <span className="text-sm">aA</span>
            </ToolbarButton>
            <ToolbarButton label="Alinhar texto" onMouseDown={cycleAlignment}>
              <span className="text-lg">≡</span>
            </ToolbarButton>
            <ToolbarButton label="Lista" onMouseDown={toggleList}>
              <span className="text-lg">☷</span>
            </ToolbarButton>
            <ToolbarButton label="Limpar formatação" onMouseDown={() => execute('removeFormat')}>
              <span className="text-lg">T<span className="text-xs">↔</span></span>
            </ToolbarButton>
          </div>
        )}

        {preview ? (
          <article
            className="w-full max-w-full min-w-0 min-h-[50vh] break-words [overflow-wrap:anywhere] prose-meditation text-[var(--dark-gray)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder="Comece a escrever sua meditação..."
            className="w-full max-w-full min-w-0 min-h-[50vh] overflow-x-hidden break-words [overflow-wrap:anywhere] whitespace-pre-wrap outline-none text-[var(--dark-gray)] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--dark-gray)]/25"
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--dark-gray)]/50">Visibilidade:</span>
            {(['private', 'public'] as Visibility[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${visibility === value ? 'bg-[var(--light-blue)] text-white' : 'bg-[var(--background)] text-[var(--dark-gray)]/70'}`}
              >
                {value === 'private' ? 'Privado' : 'Público'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || !contentHtml.replace(/<[^>]*>/g, '').trim()}
            className="px-6 py-2 text-sm font-medium rounded-xl bg-[var(--light-blue)] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {saved ? 'Salvo ✓' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
