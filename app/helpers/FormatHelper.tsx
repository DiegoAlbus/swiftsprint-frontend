const formatComment = (text: string) => {
  // Simple markdown-like formatting
  let formatted = text
    // Headers: # H1 and ## H2
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-lg font-semibold mt-2 mb-1">$1</h2>'
    )
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-2">$1</h1>')
    // Bold: **text** -> <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* -> <em>text</em>
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Code: `text` -> <code>text</code>
    .replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
    // Line breaks
    .replace(/\n/g, "<br/>");
  return formatted;
};

export { formatComment };
