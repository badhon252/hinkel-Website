import { getPlainTextFromRichText } from "@/lib/rich-text";

interface PlainTextContentProps {
  content?: string | null;
  className?: string;
}

export default function PlainTextContent({
  content,
  className,
}: PlainTextContentProps) {
  const plainText = getPlainTextFromRichText(content).trim();

  if (!plainText) {
    return null;
  }

  return (
    <div className={className}>
      {plainText.split(/\n{2,}/).map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 24)}`}
          className="mb-4 last:mb-0"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
