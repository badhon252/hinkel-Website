"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import React from "react";
import { COMMON_EXTENSIONS } from "./editor-extensions";

interface RichTextRendererProps {
  content: string | unknown;
  className?: string;
}

const RichTextRenderer = ({ content, className }: RichTextRendererProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      Link.configure({
        openOnClick: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full mb-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-white/10 border border-white/20 p-2 font-bold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-white/10 p-2 text-white/80",
        },
      }),
      ...COMMON_EXTENSIONS,
    ],
    immediatelyRender: false,
    content: (() => {
      if (!content) return "";
      if (typeof content === "object") return content;
      if (typeof content === "string") {
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      }
      return content;
    })(),
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose mx-auto focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`rich-text-renderer ${className}`}>
      <style>{`
        .prose table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5em 0;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .prose table th,
        .prose table td {
          min-width: 1em;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .prose table th {
          font-weight: bold;
          text-align: left;
          background-color: rgba(255, 255, 255, 0.05);
        }
        .prose table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #ff7a00;
          pointer-events: none;
        }
        .prose .tableWrapper {
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .prose .resize-cursor {
          cursor: col-resize;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextRenderer;
