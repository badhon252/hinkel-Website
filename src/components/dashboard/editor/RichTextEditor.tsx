import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu";
import { useRef } from "react";
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
} from "lucide-react";
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
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
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
          class: "bg-white/10 border border-white/20 p-2 font-bold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-white/10 p-2 text-white/80",
        },
      }),
      BubbleMenuExtension,
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
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4",
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/5">
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 })
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
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 })
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
