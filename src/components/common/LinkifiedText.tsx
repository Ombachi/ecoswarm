import React from "react";

/**
 * Renders text with auto-detected URLs as clickable links.
 * URLs are styled with primary color and truncated for display.
 */
export function LinkifiedText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          // Reset lastIndex since we reuse the regex
          urlRegex.lastIndex = 0;
          const displayUrl = part.length > 50 ? part.slice(0, 47) + "..." : part;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {displayUrl}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
