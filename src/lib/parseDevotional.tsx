export interface ParsedBody {
  biblicalQuote: string;
  reference: string;
  paragraphs: ParsedParagraph[];
}

export interface ParsedParagraph {
  type: 'subtitle' | 'body' | 'separator';
  text: string;
}

export function parseDevotionalBody(body: string): ParsedBody {
  const cleaned = body.trim();

  let biblicalQuote = '';
  let reference = '';
  let expositionRaw = '';

  const boldRefMatch = cleaned.match(/\*\*(.+?)\*\*/);
  if (boldRefMatch) {
    const refText = boldRefMatch[1].trim();

    if (refText.startsWith('—')) {
      const idx = boldRefMatch.index!;
      biblicalQuote = cleaned.slice(0, idx).trim();
      expositionRaw = cleaned.slice(idx + boldRefMatch[0].length).trim();
    } else {
      const afterRef = cleaned.slice(boldRefMatch.index! + boldRefMatch[0].length).trim();

      const dashIdx = afterRef.indexOf('—');
      if (dashIdx === 0) {
        reference = refText;
        expositionRaw = afterRef.slice(1).trim();
        const idx = boldRefMatch.index!;
        biblicalQuote = cleaned.slice(0, idx).trim();
      } else if (dashIdx > 0) {
        reference = refText;
        expositionRaw = afterRef.slice(dashIdx + 1).trim();
        const idx = boldRefMatch.index!;
        biblicalQuote = cleaned.slice(0, idx).trim();
      } else {
        reference = refText;
        expositionRaw = afterRef;
        const idx = boldRefMatch.index!;
        biblicalQuote = cleaned.slice(0, idx).trim();
      }
    }
  } else {
    const dashIdx = cleaned.indexOf('—');
    if (dashIdx >= 0) {
      biblicalQuote = cleaned.slice(0, dashIdx).trim();
      expositionRaw = cleaned.slice(dashIdx + 1).trim();
    } else {
      expositionRaw = cleaned;
    }
  }

  if (!reference && biblicalQuote) {
    const lastBold = biblicalQuote.match(/\*\*(.+?)\*\*\s*$/);
    if (lastBold) {
      reference = lastBold[1].trim();
      biblicalQuote = biblicalQuote.slice(0, lastBold.index!).trim();
    }
  }

  biblicalQuote = biblicalQuote.replace(/\*\*/g, '').trim();

  const paragraphs = parseExposition(expositionRaw);

  return { biblicalQuote, reference, paragraphs };
}

function parseExposition(text: string): ParsedParagraph[] {
  const result: ParsedParagraph[] = [];
  const raw = text.trim();
  if (!raw) return result;

  const blocks = raw.split(/\n{2,}/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed === '—' || trimmed === '**—**') {
      result.push({ type: 'separator', text: '' });
      continue;
    }

    const boldContent = extractBoldSegments(trimmed);

    if (boldContent.length === 1 && boldContent[0].bold && trimmed.startsWith('**') && trimmed.endsWith('**')) {
      result.push({ type: 'subtitle', text: trimmed.replace(/\*\*/g, '').trim() });
    } else {
      result.push({ type: 'body', text: trimmed });
    }
  }

  return result;
}

function extractBoldSegments(text: string): { text: string; bold: boolean }[] {
  const segments: { text: string; bold: boolean }[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      segments.push({ text: text.slice(lastIdx, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    segments.push({ text: text.slice(lastIdx), bold: false });
  }

  return segments;
}

export function renderFormattedText(text: string): React.ReactNode[] {
  const segments = extractBoldSegments(text);
  return segments.map((seg, i) =>
    seg.bold
      ? <strong key={i} className="font-bold text-[var(--dark-gray)]">{seg.text}</strong>
      : <span key={i}>{seg.text}</span>
  );
}
