// Fallback implementation when File System Access API is not available
async function saveFileDownload(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

async function openFilePicker(): Promise<File | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';

  return new Promise((resolve) => {
    input.onchange = () => {
      const file = input.files?.[0] || null;
      resolve(file);
    };
    input.click();
  });
}

export async function importFile(): Promise<{ title: string; content: string } | null> {
  try {
    // Try modern File System Access API first
    if ('showOpenFilePicker' in window) {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: "Text Files", accept: { "text/plain": [".txt"] } }],
      });
      const file = await fileHandle.getFile();
      const content = await file.text();
      const title = file.name.replace(".txt", "");
      return { title, content };
    } else {
      // Fallback to traditional file input
      const file = await openFilePicker();
      if (!file) return null;
      const content = await file.text();
      const title = file.name.replace(".txt", "");
      return { title, content };
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.error("Error importing file:", err);
    }
    return null;
  }
}

export async function exportFile(title: string, content: string): Promise<void> {
  try {
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${title}.txt`,
        types: [{ description: "Text Files", accept: { "text/plain": [".txt"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      // Fallback to download
      await saveFileDownload(`${title}.txt`, content);
    }
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.error("Error exporting file:", err);
    }
  }
}
