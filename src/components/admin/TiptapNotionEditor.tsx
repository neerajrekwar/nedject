'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  FileCode,
  AlignLeft,
  Check,
  Type,
  Plus,
} from 'lucide-react';

interface TiptapNotionEditorProps {
  initialContent?: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

export function TiptapNotionEditor({
  initialContent = '',
  onChange,
  placeholder = "Write your blog post in Notion mode... Use headings, callouts, lists, or code blocks.",
}: TiptapNotionEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-zinc-900 text-emerald-400 p-4 rounded-none font-mono text-xs my-4 border-2 border-black overflow-x-auto',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-black pl-4 py-1 italic my-4 text-zinc-700 bg-zinc-50',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside space-y-1 my-3 pl-2 text-zinc-800',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside space-y-1 my-3 pl-2 text-zinc-800',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:text-zinc-400 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none before:h-0',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-semibold hover:text-black',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'w-full my-6 border-2 border-black shadow-[4px_4px_0px_#000000]',
        },
      }),
    ],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'min-h-[450px] max-w-none focus:outline-none p-6 text-sm leading-relaxed font-sans text-zinc-900 space-y-3 prose prose-zinc prose-headings:font-mono prose-headings:font-black',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content if initialContent changes externally (e.g. loading from API)
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) {
    return (
      <div className="min-h-[300px] border-2 border-black bg-zinc-50 p-6 flex items-center justify-center font-mono text-xs text-zinc-500">
        Loading Tiptap Notion Editor...
      </div>
    );
  }

  const handleAddLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setIsLinkModalOpen(false);
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt || 'Post image' }).run();
      setImageUrl('');
      setImageAlt('');
      setIsImageModalOpen(false);
    }
  };

  // Stats calculation
  const text = editor.getText();
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_#000000] flex flex-col">
      {/* 1. NOTION TOP TOOLBAR */}
      <div className="border-b-2 border-black bg-zinc-100 p-2 flex flex-wrap items-center justify-between gap-2 select-none font-mono text-xs">
        
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 border border-black font-bold flex items-center gap-1 transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-black text-[#ccff00]'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Heading 1 (H1)"
          >
            <Heading1 className="w-3.5 h-3.5" />
            <span className="text-[10px]">H1</span>
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 border border-black font-bold flex items-center gap-1 transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-black text-[#ccff00]'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Heading 2 (H2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="text-[10px]">H2</span>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 border border-black font-bold flex items-center gap-1 transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-black text-[#ccff00]'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Heading 3 (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span className="text-[10px]">H3</span>
          </button>

          <div className="w-[1px] h-5 bg-zinc-400 mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('bold') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('italic') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('strike') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('code') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-5 bg-zinc-400 mx-1" />

          {/* Blocks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('bulletList') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('orderedList') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('blockquote') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('codeBlock') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Code Block"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 border border-black bg-white hover:bg-zinc-200 text-black transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-5 bg-zinc-400 mx-1" />

          {/* Media & Embeds */}
          <button
            type="button"
            onClick={() => {
              setLinkUrl(editor.getAttributes('link').href || '');
              setIsLinkModalOpen(true);
            }}
            className={`p-1.5 border border-black transition-colors ${
              editor.isActive('link') ? 'bg-black text-[#ccff00]' : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 border border-black bg-white hover:bg-zinc-200 text-black transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Undo / Redo & Mode Pill */}
        <div className="flex items-center gap-1.5">
          <div className="bg-[#ccff00] text-black px-2 py-0.5 border border-black font-black text-[10px] uppercase">
            Notion Mode
          </div>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 border border-black bg-white hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 border border-black bg-white hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. NOTION QUICK BLOCK INSERT BAR */}
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-zinc-600">
        <span className="font-bold text-black uppercase shrink-0 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Block:
        </span>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /h1 Large Heading
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /h2 Section Title
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /list Bullet points
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /quote Callout
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /code Preformatted code
        </button>
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-black hover:text-black shrink-0 transition-colors"
        >
          /image Photograph
        </button>
      </div>

      {/* 3. CORE EDITOR CONTENT AREA */}
      <div className="relative flex-1 bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* 4. BOTTOM STATUS BAR WITH WORDS & READING TIME */}
      <div className="border-t-2 border-black bg-zinc-100 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-600">
        <div className="flex items-center gap-4">
          <span>
            <strong>{wordCount}</strong> words
          </span>
          <span>&bull;</span>
          <span>
            <strong>{charCount}</strong> characters
          </span>
          <span>&bull;</span>
          <span>
            ~<strong>{readingTime}</strong> min read
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="w-2 h-2 bg-emerald-500 inline-block" />
          <span>Tiptap Engine &bull; Notion Block Mode Active</span>
        </div>
      </div>

      {/* LINK INSERT MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white p-6 max-w-md w-full shadow-[8px_8px_0px_#000000] font-mono space-y-4">
            <h4 className="font-black text-sm uppercase text-black">Insert Web Hyperlink</h4>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Target URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/specifications"
                className="w-full border-2 border-black p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-4 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 text-xs font-black uppercase"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE INSERT MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border-4 border-black bg-white p-6 max-w-md w-full shadow-[8px_8px_0px_#000000] font-mono space-y-4">
            <h4 className="font-black text-sm uppercase text-black">Insert Photograph / Diagram</h4>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Image URL (HTTPS)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full border-2 border-black p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Alt Text / Caption</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="300 DPI high-speed flexo test print"
                className="w-full border-2 border-black p-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 border border-black bg-zinc-100 hover:bg-zinc-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-1.5 border-2 border-black bg-black text-[#ccff00] hover:bg-zinc-800 text-xs font-black uppercase"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
