import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeMirror({ value, onChange }: CodeMirrorProps) {
  const editor = useRef<EditorView>();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: container.current,
    });

    editor.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const currentValue = editor.current?.state.doc.toString();
    if (currentValue !== value) {
      editor.current?.dispatch({
        changes: {
          from: 0,
          to: currentValue?.length || 0,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div 
      ref={container} 
      className="h-full w-full overflow-hidden rounded-md border border-input bg-background"
    />
  );
}
