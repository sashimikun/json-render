import type { JsonPatch, UIElement } from "@json-render/core";
import {
  A2UIMessage,
  CreateSurfaceMessage,
  UpdateComponentsMessage,
  isCreateSurface,
  isUpdateComponents,
} from "./types";

/**
 * Converts an A2UI message into a list of JSON patches for json-render
 */
export function a2uiToPatches(message: A2UIMessage): JsonPatch[] {
  if (isCreateSurface(message)) {
    return handleCreateSurface(message);
  }
  if (isUpdateComponents(message)) {
    return handleUpdateComponents(message);
  }
  return [];
}

function handleCreateSurface(message: CreateSurfaceMessage): JsonPatch[] {
  // Set root
  const rootPatch: JsonPatch = {
    op: "replace",
    path: "/root",
    value: message.createSurface.root,
  };

  return [rootPatch];
}

function handleUpdateComponents(message: UpdateComponentsMessage): JsonPatch[] {
  const patches: JsonPatch[] = [];

  for (const component of message.updateComponents.components) {
    const { id, component: type, props } = component;

    // Convert props
    const convertedProps = convertProps(props || {});

    // Extract children if present in props (and it's a list of strings)
    let children: string[] | undefined = undefined;

    // A2UI often passes children in props.children
    if (
      convertedProps.children &&
      Array.isArray(convertedProps.children) &&
      convertedProps.children.every((c) => typeof c === "string")
    ) {
      children = convertedProps.children as string[];
      // Remove children from props to avoid duplication/confusion
      delete convertedProps.children;
    }

    const element: UIElement = {
      key: id,
      type: type,
      props: convertedProps,
      children: children,
    };

    // Patch to add/replace the element
    patches.push({
      op: "add",
      path: `/elements/${id}`,
      value: element,
    });
  }

  return patches;
}

function convertProps(props: Record<string, unknown>): Record<string, unknown> {
  const newProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    newProps[key] = convertValue(value);
  }

  return newProps;
}

function convertValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(convertValue);
  }

  if (typeof value === "object" && value !== null) {
    // Check for explicitList
    if ("explicitList" in value && Array.isArray((value as any).explicitList)) {
      return ((value as any).explicitList as unknown[]).map(convertValue);
    }

    // Recurse for objects
    return convertProps(value as Record<string, unknown>);
  }

  return value;
}
