import {
  inject,
  provide,
  ref,
  computed,
  defineComponent,
  toRaw,
  type InjectionKey,
  type PropType,
  type Ref,
  type ComputedRef,
  watchEffect,
} from "vue";
import {
  runValidation,
  type ValidationConfig,
  type ValidationFunction,
  type ValidationResult,
} from "@json-render/core";
import { useData } from "./data";

/**
 * Field validation state
 */
export interface FieldValidationState {
  /** Whether the field has been touched */
  touched: boolean;
  /** Whether the field has been validated */
  validated: boolean;
  /** Validation result */
  result: ValidationResult | null;
}

/**
 * Validation context value
 */
export interface ValidationContextValue {
  /** Custom validation functions from catalog */
  customFunctions: Record<string, ValidationFunction>;
  /** Validation state by field path */
  fieldStates: Ref<Record<string, FieldValidationState>>;
  /** Validate a field */
  validate: (path: string, config: ValidationConfig) => ValidationResult;
  /** Mark field as touched */
  touch: (path: string) => void;
  /** Clear validation for a field */
  clear: (path: string) => void;
  /** Validate all fields */
  validateAll: () => boolean;
  /** Register field config */
  registerField: (path: string, config: ValidationConfig) => void;
}

export const ValidationContextKey: InjectionKey<ValidationContextValue> =
  Symbol("ValidationContext");

/**
 * Provider for validation
 */
export const ValidationProvider = defineComponent({
  name: "ValidationProvider",
  props: {
    customFunctions: {
      type: Object as PropType<Record<string, ValidationFunction>>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const { data, authState } = useData();
    const fieldStates = ref<Record<string, FieldValidationState>>({});
    const fieldConfigs = ref<Record<string, ValidationConfig>>({});

    const registerField = (path: string, config: ValidationConfig) => {
      fieldConfigs.value = { ...fieldConfigs.value, [path]: config };
    };

    const validate = (
      path: string,
      config: ValidationConfig,
    ): ValidationResult => {
      const value = data.value[path.split("/").filter(Boolean).join(".")];
      const result = runValidation(config, {
        value: toRaw(value),
        dataModel: toRaw(data.value),
        customFunctions: toRaw(props.customFunctions),
        authState: toRaw(authState.value),
      });

      fieldStates.value = {
        ...fieldStates.value,
        [path]: {
          touched: fieldStates.value[path]?.touched ?? true,
          validated: true,
          result,
        },
      };

      return result;
    };

    const touch = (path: string) => {
      fieldStates.value = {
        ...fieldStates.value,
        [path]: {
          ...fieldStates.value[path],
          touched: true,
          validated: fieldStates.value[path]?.validated ?? false,
          result: fieldStates.value[path]?.result ?? null,
        },
      };
    };

    const clear = (path: string) => {
      const { [path]: _, ...rest } = fieldStates.value;
      fieldStates.value = rest;
    };

    const validateAll = () => {
      let allValid = true;

      for (const [path, config] of Object.entries(fieldConfigs.value)) {
        const result = validate(path, config);
        if (!result.valid) {
          allValid = false;
        }
      }

      return allValid;
    };

    provide(ValidationContextKey, {
      customFunctions: props.customFunctions,
      fieldStates,
      validate,
      touch,
      clear,
      validateAll,
      registerField,
    });

    return () => slots.default?.();
  },
});

/**
 * Hook to access validation context
 */
export function useValidation(): ValidationContextValue {
  const ctx = inject(ValidationContextKey);
  if (!ctx) {
    throw new Error("useValidation must be used within a ValidationProvider");
  }
  return ctx;
}

/**
 * Hook to get validation state for a field
 */
export function useFieldValidation(
  path: string,
  config?: ValidationConfig,
): {
  state: ComputedRef<FieldValidationState>;
  validate: () => ValidationResult;
  touch: () => void;
  clear: () => void;
  errors: ComputedRef<string[]>;
  isValid: ComputedRef<boolean>;
} {
  const {
    fieldStates,
    validate: validateField,
    touch: touchField,
    clear: clearField,
    registerField,
  } = useValidation();

  // Register field on mount
  watchEffect(() => {
    if (config) {
      registerField(path, config);
    }
  });

  const state = computed(
    () =>
      fieldStates.value[path] ?? {
        touched: false,
        validated: false,
        result: null,
      },
  );

  const validate = () => validateField(path, config ?? { checks: [] });

  const touch = () => touchField(path);
  const clear = () => clearField(path);

  const errors = computed(() => state.value.result?.errors ?? []);
  const isValid = computed(() => state.value.result?.valid ?? true);

  return {
    state,
    validate,
    touch,
    clear,
    errors,
    isValid,
  };
}
