import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Undo,
  Redo,
  Code
} from 'lucide-react';

/**
 * RichTextEditor
 * A clean, lightweight HTML WYSIWYG editor built with contentEditable.
 * Strictly prohibits media/image uploads as required by the dispute filing protocol.
 */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Describe what happened...',
  minHeight = '140px'
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [mediaWarning, setMediaWarning] = useState('');

  // Synchronize internal DOM when external value changes
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml && (value || currentHtml !== '')) {
        // Prevent clearing if user is actively editing
        if (document.activeElement !== editorRef.current || !value) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
  }, [value, isHtmlMode]);

  // Update active formatting states (bold, italic, etc.)
  const checkActiveFormats = useCallback(() => {
    if (isHtmlMode) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList')
      });
    } catch {
      // Ignore queryCommandState issues in test/headless environments
    }
  }, [isHtmlMode]);

  const executeCommand = (cmd, arg = null) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, arg);
    checkActiveFormats();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const cleanHtml = html === '<br>' || html === '<p><br></p>' ? '' : html;
      if (onChange) {
        onChange(cleanHtml);
      }
    }
  };

  // Block media pasting (images, files, data URIs)
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for file/image items
    const hasFiles = Array.from(clipboardData.items || []).some(
      (item) => item.kind === 'file' || item.type.startsWith('image/') || item.type.startsWith('video/')
    );

    if (hasFiles) {
      e.preventDefault();
      triggerMediaWarning('Media uploads are not permitted here. Please attach files in the Evidence step.');
      return;
    }

    // Check for HTML containing <img> or <video> tags
    const html = clipboardData.getData('text/html');
    if (html && (/<img\b/i.test(html) || /<video\b/i.test(html))) {
      e.preventDefault();
      // Strip images/videos and paste clean text
      const cleanText = clipboardData.getData('text/plain');
      document.execCommand('insertText', false, cleanText);
      triggerMediaWarning('Images have been stripped. Please attach evidence in the Evidence step.');
    }
  };

  // Block media drag & drop
  const handleDrop = (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      triggerMediaWarning('Media uploads are not permitted here. Please attach files in the Evidence step.');
    }
  };

  const triggerMediaWarning = (msg) => {
    setMediaWarning(msg);
    setTimeout(() => setMediaWarning(''), 5000);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter website or documentation link (https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleFormatBlock = (tag) => {
    executeCommand('formatBlock', tag);
  };

  const isContentEmpty = !value || value === '<p><br></p>' || value === '<br>' || value.trim() === '';

  return (
    <div
      style={{
        border: isFocused ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Media Restriction Notice Toast */}
      {mediaWarning && (
        <div
          style={{
            backgroundColor: '#fff7ed',
            color: '#c2410c',
            borderBottom: '1px solid #fed7aa',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>⚠️ {mediaWarning}</span>
          <button
            type="button"
            onClick={() => setMediaWarning('')}
            style={{ background: 'none', border: 'none', color: '#c2410c', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 10px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          userSelect: 'none'
        }}
      >
        {/* Bold */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          style={getToolbarBtnStyle(activeFormats.bold)}
        >
          <Bold size={15} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          style={getToolbarBtnStyle(activeFormats.italic)}
        >
          <Italic size={15} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
          style={getToolbarBtnStyle(activeFormats.underline)}
        >
          <Underline size={15} />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
          style={getToolbarBtnStyle(activeFormats.strikethrough)}
        >
          <Strikethrough size={15} />
        </button>

        <div style={separatorStyle} />

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => handleFormatBlock('<h2>')}
          title="Heading 2"
          style={getToolbarBtnStyle(false)}
        >
          <Heading2 size={15} />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => handleFormatBlock('<h3>')}
          title="Heading 3"
          style={getToolbarBtnStyle(false)}
        >
          <Heading3 size={15} />
        </button>

        <div style={separatorStyle} />

        {/* Unordered List */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          style={getToolbarBtnStyle(activeFormats.unorderedList)}
        >
          <List size={15} />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          style={getToolbarBtnStyle(activeFormats.orderedList)}
        >
          <ListOrdered size={15} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => handleFormatBlock('<blockquote>')}
          title="Quote Block"
          style={getToolbarBtnStyle(false)}
        >
          <Quote size={15} />
        </button>

        <div style={separatorStyle} />

        {/* Insert Link */}
        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Link"
          style={getToolbarBtnStyle(false)}
        >
          <LinkIcon size={15} />
        </button>

        {/* Remove Link */}
        <button
          type="button"
          onClick={() => executeCommand('unlink')}
          title="Remove Link"
          style={getToolbarBtnStyle(false)}
        >
          <Unlink size={15} />
        </button>

        <div style={separatorStyle} />

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          title="Clear Formatting"
          style={getToolbarBtnStyle(false)}
        >
          <RemoveFormatting size={15} />
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          title="Undo (Ctrl+Z)"
          style={getToolbarBtnStyle(false)}
        >
          <Undo size={15} />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          title="Redo (Ctrl+Y)"
          style={getToolbarBtnStyle(false)}
        >
          <Redo size={15} />
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
            Media disabled
          </span>
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            title={isHtmlMode ? 'Switch to Rich Text' : 'View Raw HTML'}
            style={{
              ...getToolbarBtnStyle(isHtmlMode),
              fontSize: '11px',
              gap: '4px',
              padding: '4px 8px'
            }}
          >
            <Code size={13} />
            <span>{isHtmlMode ? 'WYSIWYG' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div style={{ position: 'relative' }}>
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
            }}
            placeholder="<p>Enter HTML markup...</p>"
            style={{
              width: '100%',
              minHeight,
              padding: '14px 16px',
              border: 'none',
              outline: 'none',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              color: '#0f172a',
              backgroundColor: '#fafafa',
              boxSizing: 'border-box',
              resize: 'vertical',
              display: 'block'
            }}
          />
        ) : (
          <>
            {/* Visual Placeholder */}
            {isContentEmpty && !isFocused && (
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '16px',
                  right: '16px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                {placeholder}
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable
              onFocus={() => {
                setIsFocused(true);
                checkActiveFormats();
              }}
              onBlur={() => {
                setIsFocused(false);
                handleInput();
              }}
              onInput={handleInput}
              onKeyUp={checkActiveFormats}
              onMouseUp={checkActiveFormats}
              onPaste={handlePaste}
              onDrop={handleDrop}
              style={{
                minHeight,
                padding: '14px 16px',
                outline: 'none',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#071a38',
                boxSizing: 'border-box',
                wordBreak: 'break-word',
                cursor: 'text'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

const separatorStyle = {
  width: '1px',
  height: '18px',
  backgroundColor: '#e2e8f0',
  margin: '0 4px'
};

function getToolbarBtnStyle(isActive) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: '6px',
    border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    color: isActive ? '#1d4ed8' : '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  };
}
