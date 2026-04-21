"use client";

import {
  useEditor,
  EditorContent,
  Editor as TiptapEditor,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu";
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Maximize2,
  ChevronDown,
  ListRestart,
  Heading1,
  Heading2,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  Divide,
  Code,
  ImageIcon,
  Upload,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  COMMON_EXTENSIONS,
  FONT_FAMILIES,
  FONT_SIZES,
  LINE_HEIGHTS,
  PARAGRAPH_SPACINGS,
} from "@/components/shared/editor-extensions";
import { useEffect, useRef } from "react";
import { useUploadImage } from "@/features/dashboard/hooks/useCms";
import { toast } from "sonner";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: TiptapEditor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage } = useUploadImage();

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const toastId = toast.loading("Uploading image...");
      try {
        const res = await uploadImage(file);
        const url = res.data.data.uploaded[0].url;
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Image uploaded", { id: toastId });
      } catch {
        toast.error("Failed to upload image", { id: toastId });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addImageFromUrl = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
      {/* Font Family */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 px-2 h-8"
          >
            <Type size={16} />
            <span className="text-xs hidden sm:inline truncate max-w-[60px]">
              {FONT_FAMILIES.find((f) =>
                editor.isActive("textStyle", { fontFamily: f.value }),
              )?.label || "Font"}
            </span>
            <ChevronDown size={10} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-slate-200 text-slate-900 max-h-60 overflow-y-auto">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetFontFamily().run()}
            className="hover:bg-slate-50 cursor-pointer text-xs"
          >
            Default Font
          </DropdownMenuItem>
          {FONT_FAMILIES.map((f) => (
            <DropdownMenuItem
              key={f.value}
              onClick={() =>
                editor.chain().focus().setFontFamily(f.value).run()
              }
              className={cn(
                "hover:bg-slate-50 cursor-pointer text-xs",
                editor.isActive("textStyle", { fontFamily: f.value }) &&
                  "text-primary font-bold",
              )}
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Size */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 px-2 h-8"
          >
            <Maximize2 size={14} />
            <span className="text-xs hidden sm:inline">
              {FONT_SIZES.find((s) =>
                editor.isActive("textStyle", { fontSize: s }),
              ) || "Size"}
            </span>
            <ChevronDown size={10} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-slate-200 text-slate-900 max-h-60 overflow-y-auto">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetFontSize().run()}
            className="hover:bg-slate-50 cursor-pointer text-xs"
          >
            Default Size
          </DropdownMenuItem>
          {FONT_SIZES.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => editor.chain().focus().setFontSize(s).run()}
              className={cn(
                "hover:bg-slate-50 cursor-pointer text-xs",
                editor.isActive("textStyle", { fontSize: s }) &&
                  "text-primary font-bold",
              )}
            >
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-slate-300 mx-1" />

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("strike") && "bg-slate-200",
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

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

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Alignment */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive({ textAlign: "left" }) && "bg-slate-200",
        )}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive({ textAlign: "center" }) && "bg-slate-200",
        )}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive({ textAlign: "right" }) && "bg-slate-200",
        )}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive({ textAlign: "justify" }) && "bg-slate-200",
        )}
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Spacing Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 px-2 h-8"
            title="Spacing"
          >
            <ListRestart size={14} />
            <ChevronDown size={10} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-slate-200 text-slate-900 p-2 min-w-[200px]">
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Line Height
          </div>
          {LINE_HEIGHTS.map((lh) => (
            <DropdownMenuItem
              key={lh}
              onClick={() => editor.chain().focus().setLineHeight(lh).run()}
              className={cn(
                "hover:bg-slate-50 cursor-pointer text-xs",
                editor.isActive({ lineHeight: lh }) && "text-primary font-bold",
              )}
            >
              {lh}
            </DropdownMenuItem>
          ))}
          <div className="h-px bg-slate-100 my-1" />
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Paragraph Spacing
          </div>
          {PARAGRAPH_SPACINGS.map((ps) => (
            <DropdownMenuItem
              key={ps}
              onClick={() =>
                editor.chain().focus().setParagraphSpacing(ps).run()
              }
              className={cn(
                "hover:bg-slate-50 cursor-pointer text-xs",
                editor.isActive({ marginBottom: ps }) &&
                  "text-primary font-bold",
              )}
            >
              {ps}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Headings */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          if (editor.isActive("textStyle", { fontSize: "36px" })) {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize("36px").setBold().run();
          }
        }}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("textStyle", { fontSize: "36px" }) && "bg-slate-200",
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          if (editor.isActive("textStyle", { fontSize: "30px" })) {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize("30px").setBold().run();
          }
        }}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("textStyle", { fontSize: "30px" }) && "bg-slate-200",
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

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

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Table Management */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 h-8 px-2"
          >
            <TableIcon size={16} />
            <ChevronDown size={10} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border-slate-200 text-slate-900">
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            className="hover:bg-slate-50 cursor-pointer text-xs"
          >
            Insert 3x3 Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("codeBlock") && "bg-slate-200",
        )}
      >
        <Code className="h-4 w-4" />
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

      {/* Image Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900 h-8 w-8 p-0"
          >
            <ImageIcon size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-white border-slate-200 text-slate-900"
        >
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-xs"
          >
            <Upload size={14} />
            <span>Upload Image</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={addImageFromUrl}
            className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-xs"
          >
            <LinkIcon size={14} />
            <span>Image URL</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

const Editor = ({ value, onChange }: Omit<EditorProps, "placeholder">) => {
  const { mutateAsync: uploadImage } = useUploadImage();

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
          class: "bg-slate-100 border border-slate-200 p-2 font-bold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-slate-100 p-2 text-slate-600",
        },
      }),
      BubbleMenuExtension,
      ...COMMON_EXTENSIONS,
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
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const toastId = toast.loading("Uploading image...");

            uploadImage(file)
              .then((res) => {
                const url = res.data.data.uploaded[0].url;
                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node,
                  );
                  view.dispatch(transaction);
                }
                toast.success("Image uploaded", { id: toastId });
              })
              .catch(() => {
                toast.error("Failed to upload image", { id: toastId });
              });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                const toastId = toast.loading("Uploading pasted image...");
                uploadImage(file)
                  .then((res) => {
                    const url = res.data.data.uploaded[0].url;
                    const { schema } = view.state;
                    const node = schema.nodes.image.create({ src: url });
                    const transaction =
                      view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                    toast.success("Image uploaded", { id: toastId });
                  })
                  .catch(() => {
                    toast.error("Failed to upload image", { id: toastId });
                  });
              }
              return true;
            }
          }
        }
        return false;
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
    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white relative">
      <style>{`
        .prose table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 2em 0;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
        }
        .prose table th,
        .prose table td {
          min-width: 1em;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .prose table th {
          font-weight: bold;
          text-align: left;
          background-color: rgba(0, 0, 0, 0.05);
        }
        .prose table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.05);
          pointer-events: none;
        }
        .prose table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #3b82f6;
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

      {/* Table Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: activeEditor }: { editor: TiptapEditor }) =>
            activeEditor.isActive("table")
          }
          className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-xl"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
            title="Add Column Before"
          >
            <Columns size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
            title="Add Column After"
          >
            <Columns size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="text-slate-600 hover:text-red-500 hover:bg-red-50 h-8"
            title="Delete Column"
          >
            <Columns size={14} className="mr-1" /> <Trash2 size={8} />
          </Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
            title="Add Row Before"
          >
            <Rows size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
            title="Add Row After"
          >
            <Rows size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="text-slate-600 hover:text-red-500 hover:bg-red-50 h-8"
            title="Delete Row"
          >
            <Rows size={14} className="mr-1" /> <Trash2 size={8} />
          </Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
            title="Merge Cells"
          >
            <Divide size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="text-slate-600 hover:text-red-500 hover:bg-red-50 h-8"
            title="Delete Table"
          >
            <Trash2 size={14} />
          </Button>
        </BubbleMenu>
      )}

      {/* Image Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: activeEditor }: { editor: TiptapEditor }) =>
            activeEditor.isActive("image")
          }
          className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg shadow-xl"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { width: "25%" })
                .run()
            }
            className={cn(
              "h-8 px-2 text-xs",
              editor.isActive("image", { width: "25%" })
                ? "bg-slate-100 text-primary"
                : "text-slate-600",
            )}
          >
            25%
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { width: "50%" })
                .run()
            }
            className={cn(
              "h-8 px-2 text-xs",
              editor.isActive("image", { width: "50%" })
                ? "bg-slate-100 text-primary"
                : "text-slate-600",
            )}
          >
            50%
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { width: "75%" })
                .run()
            }
            className={cn(
              "h-8 px-2 text-xs",
              editor.isActive("image", { width: "75%" })
                ? "bg-slate-100 text-primary"
                : "text-slate-600",
            )}
          >
            75%
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { width: "100%" })
                .run()
            }
            className={cn(
              "h-8 px-2 text-xs",
              editor.isActive("image", { width: "100%" })
                ? "bg-slate-100 text-primary"
                : "text-slate-600",
            )}
          >
            100%
          </Button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.commands.deleteSelection()}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 size={14} />
          </Button>
        </BubbleMenu>
      )}

      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
