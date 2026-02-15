"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Editor as TiptapEditor } from "@tiptap/react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: TiptapEditor | null }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-slate-200")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("italic") && "bg-slate-200",
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("underline") && "bg-slate-200",
        )}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("bulletList") && "bg-slate-200",
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("orderedList") && "bg-slate-200",
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("blockquote") && "bg-slate-200",
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-slate-200")}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        className="h-8 w-8 p-0"
      >
        <Unlink className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

const Editor = ({ value, onChange }: Omit<EditorProps, "placeholder">) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-6 text-slate-600 leading-relaxed font-sans",
      },
    },
    immediatelyRender: false,
  });

  // Effect to handle initial value or external reset
  // using useEditor's content is usually enough if handled correctly on initialization
  // but for form resets, we might need a useEffect
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
