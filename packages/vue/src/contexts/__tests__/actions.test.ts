import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { DataProvider } from "../data";
import { ActionProvider, useAction } from "../actions";

describe("ActionProvider", () => {
  it("executes registered actions", async () => {
    const handler = vi.fn();
    const handlers = { testAction: handler };

    const TestComponent = defineComponent({
      setup() {
        const { execute } = useAction({ name: "testAction" });
        return { execute };
      },
      template: "<button @click=\"execute\">Click</button>",
    });

    const Wrapper = defineComponent({
      setup() {
        return () => h(DataProvider, () =>
            h(ActionProvider, { handlers }, () => h(TestComponent))
        );
      }
    });

    const wrapper = mount(Wrapper);

    await wrapper.find("button").trigger("click");
    expect(handler).toHaveBeenCalled();
  });
});
