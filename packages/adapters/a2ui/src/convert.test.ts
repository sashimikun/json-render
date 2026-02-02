import { describe, it, expect } from "vitest";
import { a2uiToPatches } from "./convert";
import { CreateSurfaceMessage, UpdateComponentsMessage } from "./types";

describe("a2uiToPatches", () => {
  it("should handle createSurface message", () => {
    const message: CreateSurfaceMessage = {
      createSurface: {
        surfaceId: "surface-1",
        root: "root-component",
      },
    };

    const patches = a2uiToPatches(message);

    expect(patches).toEqual([
      {
        op: "replace",
        path: "/root",
        value: "root-component",
      },
    ]);
  });

  it("should handle updateComponents message", () => {
    const message: UpdateComponentsMessage = {
      updateComponents: {
        surfaceId: "surface-1",
        components: [
          {
            id: "comp-1",
            component: "Button",
            props: {
              label: "Click Me",
            },
          },
        ],
      },
    };

    const patches = a2uiToPatches(message);

    expect(patches).toHaveLength(1);
    expect(patches[0]).toEqual({
      op: "add",
      path: "/elements/comp-1",
      value: {
        key: "comp-1",
        type: "Button",
        props: {
          label: "Click Me",
        },
        children: undefined,
      },
    });
  });

  it("should convert explicitList to array", () => {
    const message: UpdateComponentsMessage = {
      updateComponents: {
        surfaceId: "surface-1",
        components: [
          {
            id: "comp-1",
            component: "List",
            props: {
              items: {
                explicitList: ["Item 1", "Item 2"],
              },
            },
          },
        ],
      },
    };

    const patches = a2uiToPatches(message);

    expect(patches[0].value).toEqual({
      key: "comp-1",
      type: "List",
      props: {
        items: ["Item 1", "Item 2"],
      },
      children: undefined,
    });
  });

  it("should extract children from props", () => {
    const message: UpdateComponentsMessage = {
      updateComponents: {
        surfaceId: "surface-1",
        components: [
          {
            id: "parent",
            component: "Container",
            props: {
              title: "My Container",
              children: ["child-1", "child-2"],
            },
          },
        ],
      },
    };

    const patches = a2uiToPatches(message);

    expect(patches[0].value).toEqual({
      key: "parent",
      type: "Container",
      props: {
        title: "My Container",
      },
      children: ["child-1", "child-2"],
    });
  });

  it("should handle explicitList in children", () => {
    const message: UpdateComponentsMessage = {
      updateComponents: {
        surfaceId: "surface-1",
        components: [
          {
            id: "parent",
            component: "Container",
            props: {
              children: {
                explicitList: ["child-1", "child-2"],
              },
            },
          },
        ],
      },
    };

    const patches = a2uiToPatches(message);

    expect(patches[0].value).toEqual({
      key: "parent",
      type: "Container",
      props: {},
      children: ["child-1", "child-2"],
    });
  });
});
