import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { Renderer, JSONUIProvider, type ComponentRenderProps } from "../index";

const TestCard = defineComponent({
  props: ['element'],
  template: `<div class="card"><slot /></div>`
});

const TestText = defineComponent({
  props: ['element'],
  template: `<span class="text">{{ element.props.content }}</span>`
});

// We need to cast these to any because of type mismatch in test environment vs runtime
const registry: any = {
  card: TestCard,
  text: TestText
};

describe("Renderer", () => {
  it("renders tree structure", () => {
    const tree = {
      root: "root",
      elements: {
        root: {
          key: "root",
          type: "card",
          props: {},
          children: ["child1"],
          visible: true
        },
        child1: {
          key: "child1",
          type: "text",
          props: { content: "Hello" },
          children: [],
          visible: true
        }
      }
    };

    // Note: wrapper must include DataProvider etc. which JSONUIProvider provides.
    // However, if we mount JSONUIProvider, accessing children might need wrapper.findComponent(Renderer).
    const wrapper = mount(JSONUIProvider, {
      props: { registry },
      slots: {
        default: () => h(Renderer, { tree, registry })
      }
    });

    expect(wrapper.find(".card").exists()).toBe(true);
    expect(wrapper.find(".text").text()).toBe("Hello");
  });
});
