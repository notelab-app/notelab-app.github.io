import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus } from "lucide-react";
import type { Note } from "@shared/schema";

interface NoteListProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  currentNoteId: number | null;
  onNewNote: () => void;
}

export function NoteList({ notes, onNoteSelect, currentNoteId, onNewNote }: NoteListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] border-r">
      <div className="p-4 w-64">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Notes</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewNote}
            title="Create new note"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          ) : (
            notes.map((note) => (
              <Button
                key={note.id}
                variant={note.id === currentNoteId ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => onNoteSelect(note)}
              >
                <FileText className="h-4 w-4" />
                <div className="flex flex-col items-start text-left">
                  <span className="truncate w-full">{note.title || "Untitled"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.lastModified), { addSuffix: true })}
                  </span>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
