import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type ComputedRef,
  type DefineComponent,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from "vue";
import type {
  UIElement,
  UITree,
  Action,
  Catalog,
  ComponentDefinition,
  DataModel,
  AuthState,
  ActionHandler,
  ValidationFunction,
} from "@json-render/core";
import {
  useIsVisible,
  VisibilityProvider,
  VisibilityContextKey,
} from "./contexts/visibility";
import {
  useActions,
  ActionProvider,
  ConfirmDialog,
  ActionContextKey,
  type PendingConfirmation,
} from "./contexts/actions";
import { DataProvider, DataContextKey } from "./contexts/data";
import {
  ValidationProvider,
  ValidationContextKey,
} from "./contexts/validation";

/**
 * Props passed to component renderers
 */
export interface ComponentRenderProps<P = Record<string, unknown>> {
  /** The element being rendered */
  element: UIElement<string, P>;
  /** Rendered children */
  children?: VNode[];
  /** Execute an action */
  onAction?: (action: Action) => void;
  /** Whether the parent is loading */
  loading?: boolean;
}

/**
 * Component renderer type
 */
export type ComponentRenderer<P = Record<string, unknown>> = DefineComponent<
  ComponentRenderProps<P>
>;

/**
 * Registry of component renderers
 */
export type ComponentRegistry = Record<string, ComponentRenderer<any>>;

/**
 * Props for the Renderer component
 */
export interface RendererProps {
  /** The UI tree to render */
  tree: UITree | null;
  /** Component registry */
  registry: ComponentRegistry;
  /** Whether the tree is currently loading/streaming */
  loading?: boolean;
  /** Fallback component for unknown types */
  fallback?: ComponentRenderer;
}

/**
 * Element renderer component
 */
const ElementRenderer: DefineComponent<{
  element: UIElement;
  tree: UITree;
  registry: ComponentRegistry;
  loading?: boolean;
  fallback?: ComponentRenderer;
}> = defineComponent({
  name: "ElementRenderer",
  props: {
    element: {
      type: Object as PropType<UIElement>,
      required: true,
    },
    tree: {
      type: Object as PropType<UITree>,
      required: true,
    },
    registry: {
      type: Object as PropType<ComponentRegistry>,
      required: true,
    },
    loading: {
      type: Boolean,
    },
    fallback: {
      type: Object as PropType<ComponentRenderer>,
    },
  },
  setup(props) {
    const isVisible = useIsVisible(() => props.element.visible);
    const { execute } = useActions();

    return () => {
      // Don't render if not visible
      if (isVisible.value === false) {
        return null;
      }

      // Get the component renderer
      const Component =
        props.registry[props.element.type] ?? props.fallback;

      if (!Component) {
        console.warn(`No renderer for component type: ${props.element.type}`);
        return null;
      }

      // Render children
      const children = props.element.children?.map((childKey: string) => {
        const childElement = props.tree.elements[childKey];
        if (!childElement) {
          return null;
        }
        return h(ElementRenderer, {
          key: childKey,
          element: childElement,
          tree: props.tree,
          registry: props.registry,
          loading: props.loading,
          fallback: props.fallback,
        });
      });

      return h(
        Component,
        {
          element: props.element,
          onAction: execute,
          loading: props.loading,
        },
        () => children,
      );
    };
  },
});

/**
 * Main renderer component
 */
export const Renderer = defineComponent({
  name: "Renderer",
  props: {
    tree: {
      type: Object as PropType<UITree | null>,
    },
    registry: {
      type: Object as PropType<ComponentRegistry>,
      required: true,
    },
    loading: {
      type: Boolean,
    },
    fallback: {
      type: Object as PropType<ComponentRenderer>,
    },
  },
  setup(props) {
    return () => {
      if (!props.tree || !props.tree.root) {
        return null;
      }

      const rootElement = props.tree.elements[props.tree.root];
      if (!rootElement) {
        return null;
      }

      return h(ElementRenderer, {
        element: rootElement,
        tree: props.tree,
        registry: props.registry,
        loading: props.loading,
        fallback: props.fallback,
      });
    };
  },
});

/**
 * Renders the confirmation dialog when needed
 */
const ConfirmationDialogManager = defineComponent({
  name: "ConfirmationDialogManager",
  setup() {
    const { pendingConfirmation, confirm, cancel } = useActions();

    return () => {
      if (!pendingConfirmation.value?.action.confirm) {
        return null;
      }

      return h(ConfirmDialog, {
        confirm: pendingConfirmation.value.action.confirm,
        onConfirm: confirm,
        onCancel: cancel,
      });
    };
  },
});

/**
 * Combined provider for all JSONUI contexts
 */
export const JSONUIProvider = defineComponent({
  name: "JSONUIProvider",
  props: {
    registry: {
      type: Object as PropType<ComponentRegistry>,
      required: true,
    },
    initialData: {
      type: Object as PropType<DataModel>,
    },
    authState: {
      type: Object as PropType<AuthState>,
    },
    actionHandlers: {
      type: Object as PropType<Record<string, ActionHandler>>,
    },
    navigate: {
      type: Function as PropType<(path: string) => void>,
    },
    validationFunctions: {
      type: Object as PropType<Record<string, ValidationFunction>>,
    },
    onDataChange: {
      type: Function as PropType<(path: string, value: unknown) => void>,
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        DataProvider,
        {
          initialData: props.initialData,
          authState: props.authState,
          onDataChange: props.onDataChange,
        },
        () =>
          h(VisibilityProvider, () =>
            h(
              ActionProvider,
              {
                handlers: props.actionHandlers,
                navigate: props.navigate,
              },
              () =>
                h(
                  ValidationProvider,
                  {
                    customFunctions: props.validationFunctions,
                  },
                  () => [slots.default?.(), h(ConfirmationDialogManager)],
                ),
            ),
          ),
      );
  },
});

/**
 * Helper to create a renderer component from a catalog
 */
export function createRendererFromCatalog<
  C extends Catalog<Record<string, ComponentDefinition>>,
>(
  _catalog: C,
  registry: ComponentRegistry,
): DefineComponent<Omit<RendererProps, "registry">> {
  return defineComponent({
    name: "CatalogRenderer",
    props: {
      tree: {
        type: Object as PropType<UITree | null>,
      },
      loading: {
        type: Boolean,
      },
      fallback: {
        type: Object as PropType<ComponentRenderer>,
      },
    },
    setup(props) {
      return () =>
        h(Renderer, {
          ...props,
          registry,
        });
    },
  }) as DefineComponent<Omit<RendererProps, "registry">>;
}

// Re-export contexts
export {
  DataProvider,
  useData,
  useDataValue,
  useDataBinding,
  type DataContextValue,
} from "./contexts/data";

export {
  VisibilityProvider,
  useVisibility,
  useIsVisible,
  type VisibilityContextValue,
} from "./contexts/visibility";

export {
  ActionProvider,
  useActions,
  useAction,
  ConfirmDialog,
  type ActionContextValue,
  type PendingConfirmation,
  type ConfirmDialogProps,
} from "./contexts/actions";

export {
  ValidationProvider,
  useValidation,
  useFieldValidation,
  type ValidationContextValue,
  type FieldValidationState,
} from "./contexts/validation";
