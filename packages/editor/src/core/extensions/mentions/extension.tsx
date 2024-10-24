import { Editor, mergeAttributes } from "@tiptap/core";
import Mention, { MentionOptions } from "@tiptap/extension-mention";
import { MarkdownSerializerState } from "@tiptap/pm/markdown";
import { Node } from "@tiptap/pm/model";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
// extensions
import { MentionList, MentionNodeView } from "@/extensions";
// types
import { IMentionHighlight, IMentionSuggestion } from "@/types";

interface CustomMentionOptions extends MentionOptions {
  mentionHighlights: () => Promise<IMentionHighlight[]>;
  readonly?: boolean;
}

export const CustomMention = ({
  mentionHighlights,
  mentionSuggestions,
  readonly,
}: {
  mentionSuggestions?: () => Promise<IMentionSuggestion[]>;
  mentionHighlights?: () => Promise<IMentionHighlight[]>;
  readonly: boolean;
}) =>
  Mention.extend<CustomMentionOptions>({
    addStorage(this) {
      return {
        mentionsOpen: false,
        markdown: {
          serialize(state: MarkdownSerializerState, node: Node) {
            const { attrs } = node;
            const label = `@${state.esc(attrs.label)}`;
            const originUrl = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
            const safeRedirectionPath = state.esc(attrs.redirect_uri);
            const url = `${originUrl}${safeRedirectionPath}`;
            state.write(`[${label}](${url})`);
          },
        },
      };
    },

    addAttributes() {
      return {
        id: {
          default: null,
        },
        label: {
          default: null,
        },
        target: {
          default: null,
        },
        self: {
          default: false,
        },
        redirect_uri: {
          default: "/",
        },
        entity_identifier: {
          default: null,
        },
        entity_name: {
          default: null,
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionNodeView);
    },
    parseHTML() {
      return [
        {
          tag: "mention-component",
        },
      ];
    },
    renderHTML({ HTMLAttributes }) {
      return ["mention-component", mergeAttributes(HTMLAttributes)];
    },
  }).configure({
    HTMLAttributes: {
      class: "mention",
    },
    readonly: readonly,
    mentionHighlights,
    suggestion: {
      // @ts-expect-error - Tiptap types are incorrect
      render: () => {
        if (!mentionSuggestions) return;
        let component: ReactRenderer | null = null;
        let popup: any | null = null;

        return {
          onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
            if (!props.clientRect) {
              return;
            }
            component = new ReactRenderer(MentionList, {
              props: { ...props, mentionSuggestions },
              editor: props.editor,
            });
            props.editor.storage.mentionsOpen = true;
            // @ts-expect-error - Tippy types are incorrect
            popup = tippy("body", {
              getReferenceClientRect: props.clientRect,
              appendTo: () =>
                document.querySelector(".active-editor") ?? document.querySelector('[id^="editor-container"]'),
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },
          onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
            component?.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            popup &&
              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
          },

          onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === "Escape") {
              popup?.[0].hide();

              return true;
            }

            const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];

            if (navigationKeys.includes(props.event.key)) {
              // @ts-expect-error - Tippy types are incorrect
              component?.ref?.onKeyDown(props);
              event?.stopPropagation();
              return true;
            }
            return false;
          },
          onExit: (props: { editor: Editor; event: KeyboardEvent }) => {
            props.editor.storage.mentionsOpen = false;
            popup?.[0].destroy();
            component?.destroy();
          },
        };
      },
    },
  });
