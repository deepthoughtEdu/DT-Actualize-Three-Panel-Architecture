import {
    Bold, Italic, Strikethrough, Underline,
    Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
    Link as LinkIcon, Image as ImageIcon, Music as AudioIcon
} from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";
import { Editor } from '@tiptap/react';
import './styles.scss';

export default function MenuBar({ editor }: { editor: Editor }) {
    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt('Enter URL'); // simple prompt for demo
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    const removeLink = () => {
        editor.chain().focus().unsetLink().run();
    };

    const formatOptions = [
        {
            icon: <Heading1 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: editor.isActive('heading', { level: 1 }),
        },
        {
            icon: <Heading2 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: editor.isActive('heading', { level: 2 }),
        },
        {
            icon: <Heading3 />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: editor.isActive('heading', { level: 3 }),
        },
        {
            icon: <Bold />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive('bold'),
        },
        {
            icon: <Italic />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive('italic'),
        },
        {
            icon: <Underline />,
            onClick: () => editor.chain().focus().toggleUnderline().run(),
            pressed: editor.isActive('underline'),
        },
        {
            icon: <Strikethrough />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive('strike'),
        },
        {
            icon: <AlignLeft />,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            pressed: editor.isActive({ textAlign: 'left' }),
        },
        {
            icon: <AlignCenter />,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            pressed: editor.isActive({ textAlign: 'center' }),
        },
        {
            icon: <AlignRight />,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            pressed: editor.isActive({ textAlign: 'right' }),
        },
        {
            icon: <List />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            preesed: editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            preesed: editor.isActive("orderedList"),
        },
        {
            icon: <LinkIcon />,
            onClick: () => {
                // If link is active, remove it; otherwise, prompt to add
                if (editor.isActive('link')) {
                    removeLink();
                } else {
                    addLink();
                }
            },
            pressed: editor.isActive('link'),
        },
        {
            icon: <ImageIcon />,
            onClick: () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = async () => {
                    const file = fileInput.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result as string;
                        editor.chain().focus().setImage({ src: base64 }).run();
                    };
                    reader.readAsDataURL(file);
                };
                fileInput.click();
            },
            pressed: false, // image doesn’t toggle
        },
        {
            icon: <AudioIcon />, // any icon you want
            onClick: () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'audio/*';
                fileInput.onchange = async () => {
                    const file = fileInput.files?.[0];
                    if (!file) return;

                    // Option 1: Base64 audio (like images)
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result as string;
                        editor.chain().focus().setAudio({ src: base64 }).run();
                    };
                    reader.readAsDataURL(file);

                    // Option 2: Upload to server/Cloudinary and insert URL
                    // const url = await uploadFile(file);
                    // editor.chain().focus().setAudio({ src: url }).run();
                };
                fileInput.click();
            },
            pressed: false,
        }


    ];

    return (
        <div className="flex flex-wrap gap-2 p-1">
            {formatOptions.map((option, idx) => (
                <Toggle
                    className=''
                    key={idx}
                    pressed={option.pressed}
                    onPressedChange={option.onClick}
                >
                    {option.icon}
                </Toggle>
            ))}
        </div>
    );
}
