import '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        audio: {
            setAudio: (options: { src: string }) => ReturnType
        }
    }
}
