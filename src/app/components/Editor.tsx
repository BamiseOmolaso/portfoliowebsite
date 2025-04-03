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
import { useEffect, useState } from 'react';
import { EditorButton } from './EditorButton';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSave?: () => void;
  onPreview?: () => void;
}

const lowlight = createLowlight();

export default function Editor({
  content,
  onChange,
  placeholder,
  onSave,
  onPreview,
}: EditorProps): React.ReactElement {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

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
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div />;
  }

  const addImage = (): void => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = (): void => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
    if (onPreview) {
      onPreview();
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900">
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-800">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-800 pr-2">
          <EditorButton
            icon={Bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          />
          <EditorButton
            icon={Italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
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
            title="Undo"
          />
          <EditorButton
            icon={Redo}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          />
        </div>

        {/* Preview & Save */}
        <div className="flex gap-1 ml-auto">
          <EditorButton icon={Eye} onClick={togglePreview} isActive={isPreview} title="Preview" />
          {onSave && <EditorButton icon={Save} onClick={onSave} title="Save" />}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
