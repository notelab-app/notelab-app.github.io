import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CodeMirror } from "@/components/editor/code-mirror";
import { Toolbar } from "@/components/editor/toolbar";
import { NoteList } from "@/components/notes/note-list";
import { importFile, exportFile } from "@/lib/file-handlers";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Note } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  useEffect(() => {
    // Only load from localStorage if no note is selected
    if (!currentNoteId) {
      const savedNote = localStorage.getItem("currentNote");
      if (savedNote) {
        const { title: savedTitle, content: savedContent } = JSON.parse(savedNote);
        setTitle(savedTitle);
        setContent(savedContent);
      }
    }
  }, [currentNoteId]);

  // Auto-save to local storage when no note is selected
  useEffect(() => {
    if (!currentNoteId) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(
          "currentNote",
          JSON.stringify({ title, content })
        );
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [title, content, currentNoteId]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [title, content]);

  const createNote = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notes", { title, content });
      return res.json();
    },
    onSuccess: (data: Note) => {
      setCurrentNoteId(data.id);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async () => {
      if (!currentNoteId) return null;
      const res = await apiRequest("PUT", `/api/notes/${currentNoteId}`, {
        title,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const handleSave = () => {
    if (currentNoteId) {
      updateNote.mutate();
    } else {
      createNote.mutate();
    }
  };

  const handleImport = async () => {
    const result = await importFile();
    if (result) {
      setTitle(result.title);
      setContent(result.content);
      setCurrentNoteId(null);
    }
  };

  const handleExport = () => {
    exportFile(title, content);
  };

  const handleNew = () => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setTitle("Untitled Note");
        setContent("");
        setCurrentNoteId(null);
        setHasUnsavedChanges(false);
      });
      setShowSaveDialog(true);
    } else {
      setTitle("Untitled Note");
      setContent("");
      setCurrentNoteId(null);
    }
  };

  const handleNoteSelect = (note: Note) => {
    const selectNote = () => {
      setCurrentNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
    };

    if (hasUnsavedChanges) {
      setPendingAction(() => selectNote);
      setShowSaveDialog(true);
    } else {
      selectNote();
    }
  };

  const handleSaveDialogClose = (shouldSave: boolean) => {
    setShowSaveDialog(false);
    if (shouldSave) {
      handleSave();
    }
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <>
      <div className="h-screen flex bg-background text-foreground">
        <NoteList
          notes={notes}
          onNoteSelect={handleNoteSelect}
          currentNoteId={currentNoteId}
          onNewNote={handleNew}
        />
        <div className="flex-1 flex flex-col">
          <Toolbar
            title={title}
            onTitleChange={setTitle}
            onSave={handleSave}
            onImport={handleImport}
            onExport={handleExport}
            onNew={handleNew}
          />
          <div className="flex-1 overflow-hidden">
            <CodeMirror value={content} onChange={setContent} />
          </div>
        </div>
      </div>

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your changes before continuing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleSaveDialogClose(false)}>
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSaveDialogClose(true)}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
