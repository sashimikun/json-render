import {
  inject,
  provide,
  ref,
  computed,
  defineComponent,
  type InjectionKey,
  type PropType,
  type Ref,
  type ComputedRef,
  h,
  type CSSProperties,
} from "vue";
import {
  resolveAction,
  executeAction,
  type Action,
  type ActionHandler,
  type ActionConfirm,
  type ResolvedAction,
} from "@json-render/core";
import { useData } from "./data";

/**
 * Pending confirmation state
 */
export interface PendingConfirmation {
  /** The resolved action */
  action: ResolvedAction;
  /** The action handler */
  handler: ActionHandler;
  /** Resolve callback */
  resolve: () => void;
  /** Reject callback */
  reject: () => void;
}

/**
 * Action context value
 */
export interface ActionContextValue {
  /** Registered action handlers */
  handlers: Ref<Record<string, ActionHandler>>;
  /** Currently loading action names */
  loadingActions: Ref<Set<string>>;
  /** Pending confirmation dialog */
  pendingConfirmation: Ref<PendingConfirmation | null>;
  /** Execute an action */
  execute: (action: Action) => Promise<void>;
  /** Confirm the pending action */
  confirm: () => void;
  /** Cancel the pending action */
  cancel: () => void;
  /** Register an action handler */
  registerHandler: (name: string, handler: ActionHandler) => void;
}

export const ActionContextKey: InjectionKey<ActionContextValue> =
  Symbol("ActionContext");

/**
 * Provider for action execution
 */
export const ActionProvider = defineComponent({
  name: "ActionProvider",
  props: {
    handlers: {
      type: Object as PropType<Record<string, ActionHandler>>,
      default: () => ({}),
    },
    navigate: {
      type: Function as PropType<(path: string) => void>,
    },
  },
  setup(props, { slots }) {
    const { data, set } = useData();
    const handlers = ref<Record<string, ActionHandler>>(props.handlers);
    const loadingActions = ref<Set<string>>(new Set());
    const pendingConfirmation = ref<PendingConfirmation | null>(null);

    const registerHandler = (name: string, handler: ActionHandler) => {
      handlers.value = { ...handlers.value, [name]: handler };
    };

    const execute = async (action: Action) => {
      const resolved = resolveAction(action, data.value);
      const handler = handlers.value[resolved.name];

      if (!handler) {
        console.warn(`No handler registered for action: ${resolved.name}`);
        return;
      }

      // If confirmation is required, show dialog
      if (resolved.confirm) {
        return new Promise<void>((resolve, reject) => {
          pendingConfirmation.value = {
            action: resolved,
            handler,
            resolve: () => {
              pendingConfirmation.value = null;
              resolve();
            },
            reject: () => {
              pendingConfirmation.value = null;
              reject(new Error("Action cancelled"));
            },
          };
        }).then(async () => {
          loadingActions.value.add(resolved.name);
          try {
            await executeAction({
              action: resolved,
              handler,
              setData: set,
              navigate: props.navigate,
              executeAction: async (name) => {
                const subAction: Action = { name };
                await execute(subAction);
              },
            });
          } finally {
            loadingActions.value.delete(resolved.name);
          }
        });
      }

      // Execute immediately
      loadingActions.value.add(resolved.name);
      try {
        await executeAction({
          action: resolved,
          handler,
          setData: set,
          navigate: props.navigate,
          executeAction: async (name) => {
            const subAction: Action = { name };
            await execute(subAction);
          },
        });
      } finally {
        loadingActions.value.delete(resolved.name);
      }
    };

    const confirm = () => {
      pendingConfirmation.value?.resolve();
    };

    const cancel = () => {
      pendingConfirmation.value?.reject();
    };

    provide(ActionContextKey, {
      handlers,
      loadingActions,
      pendingConfirmation,
      execute,
      confirm,
      cancel,
      registerHandler,
    });

    return () => slots.default?.();
  },
});

/**
 * Hook to access action context
 */
export function useActions(): ActionContextValue {
  const ctx = inject(ActionContextKey);
  if (!ctx) {
    throw new Error("useActions must be used within an ActionProvider");
  }
  return ctx;
}

/**
 * Hook to execute an action
 */
export function useAction(action: Action): {
  execute: () => Promise<void>;
  isLoading: ComputedRef<boolean>;
} {
  const { execute, loadingActions } = useActions();
  const isLoading = computed(() => loadingActions.value.has(action.name));

  const executeAction = () => execute(action);

  return { execute: executeAction, isLoading };
}

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** The confirmation config */
  confirm: ActionConfirm;
  /** Called when confirmed */
  onConfirm: () => void;
  /** Called when cancelled */
  onCancel: () => void;
}

/**
 * Default confirmation dialog component
 */
export const ConfirmDialog = defineComponent({
  name: "ConfirmDialog",
  props: {
    confirm: {
      type: Object as PropType<ActionConfirm>,
      required: true,
    },
    onConfirm: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const isDanger = props.confirm.variant === "danger";

      const overlayStyle: CSSProperties = {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      };

      const dialogStyle: CSSProperties = {
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      };

      const titleStyle: CSSProperties = {
        margin: "0 0 8px 0",
        fontSize: "18px",
        fontWeight: 600,
      };

      const messageStyle: CSSProperties = {
        margin: "0 0 24px 0",
        color: "#6b7280",
      };

      const buttonContainerStyle: CSSProperties = {
        display: "flex",
        gap: "12px",
        justifyContent: "flex-end",
      };

      const cancelButtonStyle: CSSProperties = {
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        backgroundColor: "white",
        cursor: "pointer",
      };

      const confirmButtonStyle: CSSProperties = {
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: isDanger ? "#dc2626" : "#3b82f6",
        color: "white",
        cursor: "pointer",
      };

      return h(
        "div",
        {
          style: overlayStyle,
          onClick: props.onCancel,
        },
        [
          h(
            "div",
            {
              style: dialogStyle,
              onClick: (e: Event) => e.stopPropagation(),
            },
            [
              h("h3", { style: titleStyle }, props.confirm.title),
              h("p", { style: messageStyle }, props.confirm.message),
              h("div", { style: buttonContainerStyle }, [
                h(
                  "button",
                  {
                    style: cancelButtonStyle,
                    onClick: props.onCancel,
                  },
                  props.confirm.cancelLabel ?? "Cancel",
                ),
                h(
                  "button",
                  {
                    style: confirmButtonStyle,
                    onClick: props.onConfirm,
                  },
                  props.confirm.confirmLabel ?? "Confirm",
                ),
              ]),
            ],
          ),
        ],
      );
    };
  },
});
