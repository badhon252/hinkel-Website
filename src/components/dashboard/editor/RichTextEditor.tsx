import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu";
import {
  COMMON_EXTENSIONS,
  FONT_FAMILIES,
  FONT_SIZES,
  LINE_HEIGHTS,
  PARAGRAPH_SPACINGS,
} from "@/components/shared/editor-extensions";
import { useRef } from "react";
import { cn } from "@/lib/utils";
// ... (rest of imports)
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Upload,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  Divide,
  ChevronDown,
  Type,
  Maximize2,
  ListRestart,
  Underline as UnderlineIcon,
} from "lucide-react";

// Custom FontSize Extension is now imported from @/components/shared/editor-extensions

// FONT_FAMILIES and FONT_SIZES are now imported from @/components/shared/editor-extensions
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUploadImage } from "@/features/dashboard/hooks/useCms";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (json: string, html: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage } = useUploadImage();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
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
      BubbleMenuExtension,
      ...COMMON_EXTENSIONS,
    ],
    immediatelyRender: false,
    content:
      typeof content === "string" && content
        ? JSON.parse(content)
        : content || "",
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const html = editor.getHTML();
      onChange(json, html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm sm:prose mx-auto focus:outline-none min-h-[150px] p-4",
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
  });

  if (!editor) {
    return null;
  }

  // Handle file upload
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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add image from URL
  const addImageFromUrl = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border border-white/10 rounded-xl overflow-hidden bg-white/5 ${className} `}
    >
      <style>{`
        .prose table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
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
        .prose table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(255, 122, 0, 0.1);
          pointer-events: none;
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

      {/* Table Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: activeEditor }: { editor: Editor }) =>
            activeEditor.isActive("table")
          }
          className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-lg shadow-xl backdrop-blur-xl"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Add Column Before"
          >
            <Columns size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Add Column After"
          >
            <Columns size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="text-white/60 hover:text-red-400 hover:bg-red-400/10"
            title="Delete Column"
          >
            <Columns size={14} className="mr-1" /> <Trash2 size={8} />
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Add Row Before"
          >
            <Rows size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Add Row After"
          >
            <Rows size={14} className="mr-1" /> <Plus size={8} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="text-white/60 hover:text-red-400 hover:bg-red-400/10"
            title="Delete Row"
          >
            <Rows size={14} className="mr-1" /> <Trash2 size={8} />
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="text-white/60 hover:text-white hover:bg-white/10"
            title="Merge Cells"
          >
            <Divide size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="text-white/60 hover:text-red-400 hover:bg-red-400/10"
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
          shouldShow={({ editor: activeEditor }: { editor: Editor }) =>
            activeEditor.isActive("image")
          }
          className="flex items-center gap-1 bg-zinc-900 border border-white/10 p-1 rounded-lg shadow-xl"
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
            className={
              editor.isActive("image", { width: "25%" })
                ? "bg-white/10 text-[#ff7a00]"
                : "text-white/60"
            }
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
            className={
              editor.isActive("image", { width: "50%" })
                ? "bg-white/10 text-[#ff7a00]"
                : "text-white/60"
            }
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
            className={
              editor.isActive("image", { width: "75%" })
                ? "bg-white/10 text-[#ff7a00]"
                : "text-white/60"
            }
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
            className={
              editor.isActive("image", { width: "100%" })
                ? "bg-white/10 text-[#ff7a00]"
                : "text-white/60"
            }
          >
            100%
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.commands.deleteSelection()}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <Trash2 size={14} />
          </Button>
        </BubbleMenu>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5">
        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white flex items-center gap-2 px-2"
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
          <DropdownMenuContent className="bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetFontFamily().run()}
              className="hover:bg-white/5 cursor-pointer text-xs"
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
                  "hover:bg-white/5 cursor-pointer text-xs",
                  editor.isActive("textStyle", { fontFamily: f.value }) &&
                    "text-[#ff7a00] font-bold",
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
              className="text-white/60 hover:text-white flex items-center gap-2 px-2"
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
          <DropdownMenuContent className="bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetFontSize().run()}
              className="hover:bg-white/5 cursor-pointer text-xs"
            >
              Default Size
            </DropdownMenuItem>
            {FONT_SIZES.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => editor.chain().focus().setFontSize(s).run()}
                className={cn(
                  "hover:bg-white/5 cursor-pointer text-xs",
                  editor.isActive("textStyle", { fontSize: s }) &&
                    "text-[#ff7a00] font-bold",
                )}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-white/10 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            editor.isActive("underline")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <UnderlineIcon size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Strikethrough size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("Enter URL", previousUrl);
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          className={
            editor.isActive("link")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
          title="Add Link"
        >
          <LinkIcon size={16} />
        </Button>
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <AlignLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <AlignCenter size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <AlignRight size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <AlignJustify size={16} />
        </Button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Spacing Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white flex items-center gap-2 px-2"
              title="Spacing"
            >
              <ListRestart size={14} />
              <ChevronDown size={10} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-900 border-white/10 text-white p-2 min-w-[200px]">
            <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
              Line Height
            </div>
            {LINE_HEIGHTS.map((lh) => (
              <DropdownMenuItem
                key={lh}
                onClick={() => editor.chain().focus().setLineHeight(lh).run()}
                className={cn(
                  "hover:bg-white/5 cursor-pointer text-xs",
                  editor.isActive({ lineHeight: lh }) &&
                    "text-[#ff7a00] font-bold",
                )}
              >
                {lh}
              </DropdownMenuItem>
            ))}
            <div className="h-px bg-white/10 my-1" />
            <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
              Paragraph Spacing (Margin Bottom)
            </div>
            {PARAGRAPH_SPACINGS.map((ps) => (
              <DropdownMenuItem
                key={ps}
                onClick={() =>
                  editor.chain().focus().setParagraphSpacing(ps).run()
                }
                className={cn(
                  "hover:bg-white/5 cursor-pointer text-xs",
                  editor.isActive({ marginBottom: ps }) &&
                    "text-[#ff7a00] font-bold",
                )}
              >
                {ps}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-white/10 mx-1" />
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
          className={
            editor.isActive("textStyle", { fontSize: "36px" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Heading1 size={16} />
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
          className={
            editor.isActive("textStyle", { fontSize: "30px" })
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Heading2 size={16} />
        </Button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <ListOrdered size={16} />
        </Button>
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Table Management */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white flex items-center gap-1"
            >
              <TableIcon size={16} />
              <ChevronDown size={10} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="hover:bg-white/5 cursor-pointer"
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
          className={
            editor.isActive("codeBlock")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Code size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={
            editor.isActive("blockquote")
              ? "bg-white/10 text-[#ff7a00]"
              : "text-white/60"
          }
        >
          <Quote size={16} />
        </Button>

        {/* Image Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white"
            >
              <ImageIcon size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-slate-900 border-white/10 text-white"
          >
            <DropdownMenuItem
              onClick={triggerFileUpload}
              className="hover:bg-white/5 cursor-pointer flex items-center gap-2"
            >
              <Upload size={14} />
              <span>Upload Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={addImageFromUrl}
              className="hover:bg-white/5 cursor-pointer flex items-center gap-2"
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
          className="text-white/60 hover:text-white disabled:opacity-30"
        >
          <Undo size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-white/60 hover:text-white disabled:opacity-30"
        >
          <Redo size={16} />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white! " />
    </div>
  );
};

export default RichTextEditor;
