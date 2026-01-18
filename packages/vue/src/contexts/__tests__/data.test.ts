import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, inject, ref } from "vue";
import {
  DataProvider,
  DataContextKey,
  useData,
  useDataValue,
  useDataBinding,
} from "../data";

describe("DataProvider", () => {
  it("provides data to children", () => {
    const TestComponent = defineComponent({
      setup() {
        const ctx = inject(DataContextKey);
        return { ctx };
      },
      template: "<div>{{ ctx.data.value.message }}</div>",
    });

    const wrapper = mount(DataProvider, {
      props: {
        initialData: { message: "Hello" },
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(wrapper.text()).toBe("Hello");
  });

  it("updates data via set", async () => {
    const TestComponent = defineComponent({
      setup() {
        const { get, set } = useData();
        return { get, set };
      },
      template: `
        <div>
          <span id="value">{{ get('/count') }}</span>
          <button @click="set('/count', 2)">Update</button>
        </div>
      `,
    });

    const wrapper = mount(DataProvider, {
      props: {
        initialData: { count: 1 },
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(wrapper.find("#value").text()).toBe("1");
    await wrapper.find("button").trigger("click");
    expect(wrapper.find("#value").text()).toBe("2");
  });

  it("updates data via update", async () => {
    const TestComponent = defineComponent({
      setup() {
        const { get, update } = useData();
        return { get, update };
      },
      template: `
        <div>
          <span id="a">{{ get('/a') }}</span>
          <span id="b">{{ get('/b') }}</span>
          <button @click="update({ '/a': 2, '/b': 3 })">Update</button>
        </div>
      `,
    });

    const wrapper = mount(DataProvider, {
      props: {
        initialData: { a: 1, b: 1 },
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(wrapper.find("#a").text()).toBe("1");
    expect(wrapper.find("#b").text()).toBe("1");
    await wrapper.find("button").trigger("click");
    expect(wrapper.find("#a").text()).toBe("2");
    expect(wrapper.find("#b").text()).toBe("3");
  });
});

describe("useDataValue", () => {
  it("returns reactive value", async () => {
    const TestComponent = defineComponent({
      setup() {
        const count = useDataValue<number>("/count");
        const { set } = useData();
        return { count, set };
      },
      template: `
        <div>
          <span id="value">{{ count }}</span>
          <button @click="set('/count', 2)">Update</button>
        </div>
      `,
    });

    const wrapper = mount(DataProvider, {
      props: {
        initialData: { count: 1 },
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(wrapper.find("#value").text()).toBe("1");
    await wrapper.find("button").trigger("click");
    expect(wrapper.find("#value").text()).toBe("2");
  });
});

describe("useDataBinding", () => {
  it("returns value and setter", async () => {
    const TestComponent = defineComponent({
      setup() {
        const [value, setValue] = useDataBinding<string>("/name");
        return { value, setValue };
      },
      template: `
        <div>
          <span id="value">{{ value }}</span>
          <button @click="setValue('Jane')">Update</button>
        </div>
      `,
    });

    const wrapper = mount(DataProvider, {
      props: {
        initialData: { name: "John" },
      },
      slots: {
        default: TestComponent,
      },
    });

    expect(wrapper.find("#value").text()).toBe("John");
    await wrapper.find("button").trigger("click");
    expect(wrapper.find("#value").text()).toBe("Jane");
  });
});
