'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Image as ImageIcon,
  Eye,
  Save,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { EditorButton } from './EditorButton';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

const lowlight = createLowlight();

export default function Editor({
  content,
  onChange,
  placeholder,
  onSave,
  onPreview,
  className = '',
}: EditorProps): React.ReactElement {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 ${className}`,
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const validateUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const addImage = useCallback((): void => {
    try {
      const url = window.prompt('Enter the URL of the image:');
      if (!url) return;

      if (!validateUrl(url)) {
        throw new Error('Please enter a valid URL');
      }

      editor?.chain().focus().setImage({ src: url }).run();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add image';
      setError(errorMessage);
      console.error('Error adding image:', err);
    }
  }, [editor, validateUrl]);

  const addLink = useCallback((): void => {
    try {
      const url = window.prompt('Enter the URL:');
      if (!url) return;

      if (!validateUrl(url)) {
        throw new Error('Please enter a valid URL');
      }

      editor?.chain().focus().setLink({ href: url }).run();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add link';
      setError(errorMessage);
      console.error('Error adding link:', err);
    }
  }, [editor, validateUrl]);

  const togglePreview = useCallback(() => {
    setIsPreview(!isPreview);
    if (onPreview) {
      onPreview();
    }
  }, [isPreview, onPreview]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;

      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave();
      }

      // Preview: Ctrl/Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        togglePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave, togglePreview]);

  if (!editor) {
    return <div className="min-h-[400px] bg-gray-900 rounded-lg border border-gray-700" />;
  }

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900">
      {error && (
        <div className="bg-red-500/10 border-b border-red-500 text-red-500 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-800">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={Bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          />
          <EditorButton
            icon={Italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          />
          <EditorButton
            icon={Strikethrough}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={Heading1}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          />
          <EditorButton
            icon={Heading2}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          />
          <EditorButton
            icon={Heading3}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={List}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          />
          <EditorButton
            icon={ListOrdered}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={AlignLeft}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          />
          <EditorButton
            icon={AlignCenter}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          />
          <EditorButton
            icon={AlignRight}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          />
          <EditorButton
            icon={AlignJustify}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          />
        </div>

        {/* Special Elements */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={Quote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          />
          <EditorButton
            icon={Code2}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          />
          <EditorButton icon={ImageIcon} onClick={addImage} title="Insert Image" />
          <EditorButton
            icon={LinkIcon}
            onClick={addLink}
            isActive={editor.isActive('link')}
            title="Insert Link"
          />
        </div>

        {/* History */}
        <div className="flex gap-1">
          <EditorButton
            icon={Undo}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          />
          <EditorButton
            icon={Redo}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          />
        </div>

        {/* Preview & Save */}
        <div className="flex gap-1 ml-auto">
          <EditorButton
            icon={Eye}
            onClick={togglePreview}
            isActive={isPreview}
            title="Preview (Ctrl+P)"
          />
          {onSave && (
            <EditorButton
              icon={Save}
              onClick={onSave}
              title="Save (Ctrl+S)"
            />
          )}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
