"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Lightweight, safe markdown formatter for AI chat responses (/ponytail).
 * Handles code blocks, bold text, lists, and paragraphs without bulky dependencies.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split content by fenced code blocks (```lang\n...\n```)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-slate-800 text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code block rendering
          const raw = part.slice(3, -3);
          const firstLineBreak = raw.indexOf("\n");
          let language = "text";
          let codeContent = raw;
          if (firstLineBreak !== -1) {
            language = raw.slice(0, firstLineBreak).trim() || "text";
            codeContent = raw.slice(firstLineBreak + 1);
          }

          return (
            <div
              key={index}
              className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-inner"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800 border-b border-slate-700/60 text-xs font-mono text-slate-400">
                <span>{language}</span>
                <span className="text-[10px] tracking-wide text-slate-400">Example Code</span>
              </div>
              <pre className="p-3.5 text-xs md:text-sm font-mono overflow-x-auto whitespace-pre">
                <code>{codeContent.trim()}</code>
              </pre>
            </div>
          );
        }

        // Regular text formatting (paragraphs, lists, bold)
        const paragraphs = part.split(/\n{2,}/);
        return (
          <React.Fragment key={index}>
            {paragraphs.map((p, pIdx) => {
              const lines = p.split("\n");
              const isList = lines.every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim()));

              if (isList) {
                return (
                  <ul key={pIdx} className="space-y-1.5 my-2 pl-4 list-disc list-inside">
                    {lines.map((line, lIdx) => {
                      const cleanText = line.replace(/^[-*]\s+|\d+\.\s+/, "");
                      return (
                        <li key={lIdx} className="text-slate-800">
                          {renderInline(cleanText)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return (
                <p key={pIdx} className="my-1.5">
                  {lines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {renderInline(line)}
                      {lIdx < lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function renderInline(text: string): React.ReactNode {
  // Parse inline bold (**bold**) and inline code (`code`)
  const segments = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith("`") && seg.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-slate-100 text-[#0D3B66] border border-slate-300 rounded font-medium"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return seg;
  });
}
