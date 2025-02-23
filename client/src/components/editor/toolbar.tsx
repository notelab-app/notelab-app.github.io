import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, FileInput, FileOutput, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onNew: () => void;
}

export function Toolbar({
  title,
  onTitleChange,
  onSave,
  onImport,
  onExport,
  onNew,
}: ToolbarProps) {
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled Note"
        className="max-w-[200px]"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          onSave();
          toast({
            title: "Note saved",
            description: "Your note has been saved successfully",
          });
        }}
      >
        <Save className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onImport}
      >
        <FileInput className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onExport}
      >
        <FileOutput className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNew}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
