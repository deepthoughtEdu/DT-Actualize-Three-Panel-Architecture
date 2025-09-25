'use client'

import './styles.scss';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline';
import TextAlign from "@tiptap/extension-text-align";
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Audio } from './extentions/audio.js';
import { TableKit } from "@tiptap/extension-table";
import MenuBar from './MenuBar'

interface TiptapEditorProps {
  editable: boolean,
  content: any,
  onContentUpdate?: (content: any) => void
}

const TiptapEditor = ({ editable = true, content, onContentUpdate }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3 black"
          }
        }
      }),
      TableKit.configure({
        table: { resizable: true }
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Link.configure({
        openOnClick: true,
      }),
      Image,
      Audio
    ],
    content,
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        class: "h-[50vh] border focus:outline-none border-slate-300 rounded-md md:w-[50vw] max-h-[83vh] overflow-x-auto scrollbar-thin py-10 px-10 bg-slate-50 font-sans",
      }
    },
    onUpdate: ({ editor }) => {
      if (!onContentUpdate) return;
      const contentJson: any = editor.getJSON();
      onContentUpdate(contentJson);
    }
  })

  //dynamically change editor content (for testing only)
  // useEffect(() => {
  //   if(editor && content && (!editable)) { editor.commands.setContent(content) }
  // }, [content, editor])

  if (!editor) return null;

  return <div className='flex flex-col gap-[5px]'>
    {editable && <div className='sticky top-0 z-10 bg-white border-[1px] shadow-white shadow-2xl border-gray-300 rounded-md'><MenuBar editor={editor} /></div>}
    <EditorContent editor={editor} />
  </div>
}

export default TiptapEditor