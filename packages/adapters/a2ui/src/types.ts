export interface A2UIComponent {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

export interface CreateSurfaceMessage {
  createSurface: {
    surfaceId: string;
    root: string; // The ID of the root component
  };
}

export interface UpdateComponentsMessage {
  updateComponents: {
    surfaceId: string;
    components: A2UIComponent[];
  };
}

export type A2UIMessage = CreateSurfaceMessage | UpdateComponentsMessage;

export function isCreateSurface(msg: unknown): msg is CreateSurfaceMessage {
  return typeof msg === "object" && msg !== null && "createSurface" in msg;
}

export function isUpdateComponents(msg: unknown): msg is UpdateComponentsMessage {
  return typeof msg === "object" && msg !== null && "updateComponents" in msg;
}
