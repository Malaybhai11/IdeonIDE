import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const customTheme = EditorView.theme({
  "&": {
    outline: "none !important",
    height: "100%",
    backgroundColor: "transparent !important",
    color: "var(--foreground)",
  },
  ".cm-content": {
    fontFamily: "var(--font-plex-mono), monospace",
    fontSize: "14px",
    caretColor: "var(--foreground)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ".cm-gutters": {
    backgroundColor: "transparent !important",
    color: "var(--muted-foreground)",
    border: "none",
  },
  ".cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
});

export const customHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "var(--foreground)", fontWeight: "bold" },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: "var(--foreground)" },
  { tag: [t.function(t.variableName), t.labelName], color: "var(--foreground)" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "var(--foreground)" },
  { tag: [t.definition(t.name), t.separator], color: "var(--foreground)" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "var(--foreground)" },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "var(--muted-foreground)" },
  { tag: [t.meta, t.comment], color: "var(--muted-foreground)", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "var(--muted-foreground)", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "var(--foreground)" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "var(--foreground)" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "var(--foreground)", opacity: 0.8 },
  { tag: t.invalid, color: "var(--destructive)" },
]);

export const syntaxExtension = syntaxHighlighting(customHighlightStyle);