import type { UITree } from "@json-render/core";
import { serializeProps } from "./serialize";

export interface GenerateJSXOptions {
  /** Initial indentation level (default: 0) */
  indent?: number;
  /** Size of one indentation level (default: 2) */
  indentSize?: number;
  /** Whether to add data={data} to components with data paths (default: true) */
  addDataProp?: boolean;
  /** List of components that always need data prop */
  dataComponents?: string[];
}

/**
 * Generate JSX code for a UI tree
 */
export function generateJSX(
  tree: UITree,
  elementKey: string = tree.root,
  options: GenerateJSXOptions = {},
): string {
  const {
    indent = 0,
    indentSize = 2,
    addDataProp = true,
    dataComponents = ["Chart", "Table", "Metric", "List"],
  } = options;

  const element = tree.elements[elementKey];
  if (!element) return "";

  const spaces = " ".repeat(indent);
  const componentName = element.type;

  // Filter out null/undefined props and convert data paths to data references
  const propsObj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(element.props)) {
    if (v === null || v === undefined) continue;
    propsObj[k] = v;
  }

  // Add data prop for components that need it
  const hasDataPath = Object.keys(propsObj).some(
    (k) => k.endsWith("Path") || k === "bindPath" || k === "dataPath",
  );

  const needsData =
    addDataProp && (hasDataPath || dataComponents.includes(componentName));

  const propsStr = serializeProps(propsObj, { indent: indent + indentSize });
  const dataAttr = needsData ? " data={data}" : "";

  const hasChildren = element.children && element.children.length > 0;

  if (!hasChildren) {
    if (propsStr || dataAttr) {
      // If propsStr is very long, maybe we want to wrap it?
      // For now, simple logic
      return `${spaces}<${componentName}${dataAttr}${propsStr ? " " + propsStr : ""} />`;
    }
    return `${spaces}<${componentName} />`;
  }

  const lines: string[] = [];
  if (propsStr || dataAttr) {
    lines.push(
      `${spaces}<${componentName}${dataAttr}${propsStr ? " " + propsStr : ""}>`,
    );
  } else {
    lines.push(`${spaces}<${componentName}>`);
  }

  for (const childKey of element.children!) {
    lines.push(
      generateJSX(tree, childKey, {
        ...options,
        indent: indent + indentSize,
      }),
    );
  }

  lines.push(`${spaces}</${componentName}>`);

  return lines.join("\n");
}
