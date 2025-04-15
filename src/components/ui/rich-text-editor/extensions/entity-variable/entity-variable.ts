import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface EntityVariableOptions {
  HTMLAttributes?: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entityVariable: {
      /**
       * Insert an entity reference
       */
      insertEntity: (entityId: string) => ReturnType;
      /**
       * Insert a variable reference
       */
      insertVariable: (variableId: string) => ReturnType;
    };
  }
}

export const EntityVariable = Extension.create<EntityVariableOptions>({
  name: 'entityVariable',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      insertEntity: (entityId: string) => ({ commands }) => {
        return commands.insertContent(`{{entity:${entityId}}}`);
      },
      insertVariable: (variableId: string) => ({ commands }) => {
        return commands.insertContent(`{{variable:${variableId}}}`);
      },
    };
  },

  addProseMirrorPlugins() {
    const { HTMLAttributes } = this.options;

    return [
      new Plugin({
        key: new PluginKey('entityVariablePlugin'),
        props: {
          decorations(state) {
            const { doc } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text || '';
                const regex = /\{\{(entity|variable):([^}]+)\}\}/g;
                let match;

                while ((match = regex.exec(text)) !== null) {
                  const start = pos + match.index;
                  const end = start + match[0].length;
                  const type = match[1];
                  const id = match[2];

                  decorations.push(
                    Decoration.inline(start, end, {
                      class: `entity-variable-reference ${type}-reference`,
                      'data-type': type,
                      'data-id': id,
                      ...HTMLAttributes,
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});