import { sanitizeHtml, stripHtml } from "@/lib/sanitize";
import { LinkifiedText } from "./LinkifiedText";

interface PostContentProps {
  content: string;
  className?: string;
  /** When true, strip lines starting with 🏷️ (used by EcoProduct posts) */
  stripBadgeLine?: boolean;
}

/**
 * Renders post body content. If the content contains HTML tags (from the rich text editor),
 * it sanitizes and renders as styled HTML. Otherwise it renders plain text with auto-linkified URLs.
 * In both cases, hashtags (#word) are stripped from the body since they render as chips elsewhere.
 */
export function PostContent({ content, className, stripBadgeLine }: PostContentProps) {
  const hasHtml = /<\/?[a-z][\s\S]*?>/i.test(content);

  if (hasHtml) {
    // Sanitize + strip hashtags. Also optionally remove the EcoProduct badge line.
    let cleaned = content.replace(/#\w+/g, "");
    if (stripBadgeLine) {
      // Remove any block/line that starts with 🏷️
      cleaned = cleaned
        .split(/\r?\n|<br\s*\/?>(?![^<]*<\/)/i)
        .filter((l) => !stripHtml(l).trim().startsWith("🏷️"))
        .join("\n");
    }
    return (
      <div
        className={
          "prose prose-sm max-w-none text-foreground " +
          "[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-1 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_a]:text-primary [&_a]:underline [&_a]:break-all hover:[&_a]:opacity-80 " +
          "[&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic " +
          "[&_p]:my-1 [&_br]:leading-none " +
          (className || "")
        }
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(cleaned.trim()) }}
      />
    );
  }

  // Plain text path
  const lines = content
    .replace(/#\w+/g, "")
    .trim()
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .filter((l) => (stripBadgeLine ? !l.startsWith("🏷️") : true));

  return (
    <div className={"whitespace-pre-line text-foreground " + (className || "")}>
      {lines.map((line, i) => (
        <p key={i} className="leading-relaxed">
          <LinkifiedText text={line} />
        </p>
      ))}
    </div>
  );
}
