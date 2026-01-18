import { describe, it, expect } from "vitest";
import { generateJSX } from "./react";
import type { UITree } from "@json-render/core";

describe("generateJSX", () => {
  const tree: UITree = {
    root: "root",
    elements: {
      root: {
        key: "root",
        type: "Container",
        props: { className: "p-4" },
        children: ["header", "content"],
      },
      header: {
        key: "header",
        type: "Header",
        props: { title: "Dashboard" },
      },
      content: {
        key: "content",
        type: "div",
        props: { className: "content" },
        children: ["list"],
      },
      list: {
        key: "list",
        type: "List",
        props: { itemsPath: "data.items" },
      },
    },
  };

  it("generates JSX with default options", () => {
    const jsx = generateJSX(tree);
    expect(jsx).toContain('<Container className="p-4">');
    expect(jsx).toContain('<Header title="Dashboard" />');
    expect(jsx).toContain('<div className="content">');
    expect(jsx).toContain('<List data={data} itemsPath="data.items" />');
  });

  it("handles indentation", () => {
    const jsx = generateJSX(tree, "root", { indent: 2, indentSize: 2 });
    const lines = jsx.split("\n");
    expect(lines[0]).toMatch(/^  <Container/);
    expect(lines[1]).toMatch(/^    <Header/);
  });

  it("adds data prop correctly", () => {
    // List has itemsPath so it should get data={data}
    const listJsx = generateJSX(tree, "list");
    expect(listJsx).toContain('data={data}');

    // Header has no path props, so it should not get data={data} unless in dataComponents list
    const headerJsx = generateJSX(tree, "header");
    expect(headerJsx).not.toContain('data={data}');
  });

  it("respects dataComponents option", () => {
    const jsx = generateJSX(tree, "header", { dataComponents: ["Header"] });
    expect(jsx).toContain('data={data}');
  });

  it("handles nested children", () => {
    const jsx = generateJSX(tree);
    // Check structure
    expect(jsx).toContain("<div");
    expect(jsx).toContain("<List");
    expect(jsx).toContain("</div>");
  });

  it("handles props serialization", () => {
    const elementTree: UITree = {
      root: 'comp',
      elements: {
        comp: {
          key: 'comp',
          type: 'Component',
          props: {
            str: 'string',
            num: 123,
            bool: true,
            obj: { a: 1 },
            arr: [1, 2]
          }
        }
      }
    };

    const jsx = generateJSX(elementTree);
    expect(jsx).toContain('str="string"');
    expect(jsx).toContain('num={123}');
    expect(jsx).toContain('bool'); // shorthand
    expect(jsx).toContain('obj={{ a: 1 }}');
    expect(jsx).toContain('arr={[1, 2]}');
  });
});
