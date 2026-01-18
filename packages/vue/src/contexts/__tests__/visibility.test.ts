import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { DataProvider, useData } from "../data";
import {
  VisibilityProvider,
  useIsVisible,
} from "../visibility";

describe("VisibilityProvider", () => {
  it("provides visibility context", () => {
    const TestComponent = defineComponent({
      setup() {
        const isVisible = useIsVisible({ path: "/foo", value: "bar", operator: "eq" });
        return { isVisible };
      },
      template: "<div>{{ isVisible }}</div>",
    });

    const Wrapper = defineComponent({
      setup() {
        return () => h(DataProvider, { initialData: { foo: "bar" } }, () =>
          h(VisibilityProvider, () => h(TestComponent))
        );
      }
    });

    const wrapper = mount(Wrapper);
    expect(wrapper.text()).toBe("true");
  });

  it("handles boolean visibility", () => {
    const TestComponent = defineComponent({
      setup() {
        const isVisible = useIsVisible(false);
        return { isVisible };
      },
      template: "<div>{{ isVisible }}</div>",
    });

    const Wrapper = defineComponent({
      setup() {
        return () => h(DataProvider, { initialData: {} }, () =>
          h(VisibilityProvider, () => h(TestComponent))
        );
      }
    });

    const wrapper = mount(Wrapper);
    expect(wrapper.text()).toBe("false");
  });
});
