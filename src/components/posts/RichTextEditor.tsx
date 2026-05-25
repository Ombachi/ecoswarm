import { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Undo2, Redo2 } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, className, autoFocus }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || '';
      isInitialized.current = true;
      if (autoFocus) editorRef.current.focus();
    }
  }, []);

  // Reset when value is cleared externally (e.g., after post submit)
  useEffect(() => {
    if (value === '' && editorRef.current && editorRef.current.innerHTML !== '') {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const isActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const insertEmoji = (emoji: string) => {
    editorRef.current?.focus();
    // Insert at cursor
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(emoji);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current?.append(emoji);
    }
    handleInput();
  };

  const toolbarButtons = [
    { command: 'undo', icon: Undo2, label: 'Undo (⌘/Ctrl+Z)' },
    { command: 'redo', icon: Redo2, label: 'Redo (⌘/Ctrl+Shift+Z)' },
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet list' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
    { command: 'formatBlock', icon: Heading2, label: 'Heading', value: '<h3>' },
    { command: 'formatBlock', icon: Quote, label: 'Quote', value: '<blockquote>' },
  ];

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 pb-2 mb-2 border-b border-border flex-wrap">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={() => execCommand(btn.command, btn.value)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isActive(btn.command)
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={btn.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="w-px h-6 bg-border mx-1" />
        <EmojiPicker onSelect={insertEmoji} />
      </div>

      {/* Editable area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={cn(
            'min-h-[120px] max-h-[300px] overflow-y-auto outline-none text-foreground',
            'prose prose-sm max-w-none',
            '[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1',
            '[&_blockquote]:border-l-3 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
            '[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic',
          )}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
        {/* Placeholder */}
        {(!value || value === '' || value === '<br>') && (
          <div className="absolute top-0 left-0 text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
