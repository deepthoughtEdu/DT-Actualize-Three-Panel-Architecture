import { Node, mergeAttributes } from '@tiptap/core'

export const Audio = Node.create({
  name: 'audio',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [
      { tag: 'audio' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(HTMLAttributes, { controls: true })]
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            })
          },
    }
  },
})
