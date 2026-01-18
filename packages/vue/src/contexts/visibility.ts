import {
  inject,
  provide,
  computed,
  defineComponent,
  toRaw,
  toValue,
  type InjectionKey,
  type ComputedRef,
  type MaybeRefOrGetter,
} from "vue";
import {
  evaluateVisibility,
  type VisibilityCondition,
  type VisibilityContext as CoreVisibilityContext,
} from "@json-render/core";
import { useData } from "./data";

/**
 * Visibility context value
 */
export interface VisibilityContextValue {
  /** Evaluate a visibility condition */
  isVisible: (condition: VisibilityCondition | undefined) => boolean;
  /** The underlying visibility context */
  ctx: ComputedRef<CoreVisibilityContext>;
}

export const VisibilityContextKey: InjectionKey<VisibilityContextValue> =
  Symbol("VisibilityContext");

/**
 * Provider for visibility evaluation
 */
export const VisibilityProvider = defineComponent({
  name: "VisibilityProvider",
  setup(_, { slots }) {
    const { data, authState } = useData();

    const ctx = computed<CoreVisibilityContext>(() => ({
      dataModel: toRaw(data.value),
      authState: toRaw(authState.value),
    }));

    const isVisible = (condition: VisibilityCondition | undefined) =>
      evaluateVisibility(condition, ctx.value);

    provide(VisibilityContextKey, { isVisible, ctx });

    return () => slots.default?.();
  },
});

/**
 * Hook to access visibility evaluation
 */
export function useVisibility(): VisibilityContextValue {
  const ctx = inject(VisibilityContextKey);
  if (!ctx) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return ctx;
}

/**
 * Hook to check if a condition is visible
 */
export function useIsVisible(
  condition: MaybeRefOrGetter<VisibilityCondition | undefined>,
): ComputedRef<boolean> {
  const { isVisible, ctx } = useVisibility();
  return computed(() => {
    // Dependency on ctx
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = ctx.value;
    return isVisible(toValue(condition));
  });
}
