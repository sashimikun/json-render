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
} from "vue";
import {
  getByPath,
  setByPath,
  type DataModel,
  type AuthState,
} from "@json-render/core";

/**
 * Data context value
 */
export interface DataContextValue {
  /** The current data model */
  data: Ref<DataModel>;
  /** Auth state for visibility evaluation */
  authState: Ref<AuthState | undefined>;
  /** Get a value by path */
  get: (path: string) => unknown;
  /** Set a value by path */
  set: (path: string, value: unknown) => void;
  /** Update multiple values at once */
  update: (updates: Record<string, unknown>) => void;
}

export const DataContextKey: InjectionKey<DataContextValue> =
  Symbol("DataContext");

/**
 * Provider for data model context
 */
export const DataProvider = defineComponent({
  name: "DataProvider",
  props: {
    initialData: {
      type: Object as PropType<DataModel>,
      default: () => ({}),
    },
    authState: {
      type: Object as PropType<AuthState>,
    },
    onDataChange: {
      type: Function as PropType<(path: string, value: unknown) => void>,
    },
  },
  setup(props, { slots }) {
    const data = ref<DataModel>(props.initialData);
    const authState = computed(() => props.authState);

    const get = (path: string) => getByPath(data.value, path);

    const set = (path: string, value: unknown) => {
      const next = { ...data.value };
      setByPath(next, path, value);
      data.value = next;
      props.onDataChange?.(path, value);
    };

    const update = (updates: Record<string, unknown>) => {
      const next = { ...data.value };
      for (const [path, value] of Object.entries(updates)) {
        setByPath(next, path, value);
        props.onDataChange?.(path, value);
      }
      data.value = next;
    };

    provide(DataContextKey, {
      data,
      authState,
      get,
      set,
      update,
    });

    return () => slots.default?.();
  },
});

/**
 * Hook to access the data context
 */
export function useData(): DataContextValue {
  const ctx = inject(DataContextKey);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}

/**
 * Hook to get a value from the data model
 */
export function useDataValue<T>(path: string): ComputedRef<T | undefined> {
  const { get, data } = useData();
  return computed(() => {
    // Access data.value to track dependency
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = data.value;
    return get(path) as T | undefined;
  });
}

/**
 * Hook to get and set a value from the data model (like useState)
 */
export function useDataBinding<T>(
  path: string,
): [ComputedRef<T | undefined>, (value: T) => void] {
  const { get, set, data } = useData();
  const value = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = data.value;
    return get(path) as T | undefined;
  });

  const setValue = (newValue: T) => set(path, newValue);

  return [value, setValue];
}
