import Card from './Card.vue';
import Button from './Button.vue';
import Text from './Text.vue';
import type { ComponentRegistry, ComponentRenderer } from '@json-render/vue';

export const registry: ComponentRegistry = {
  card: Card as unknown as ComponentRenderer<any>,
  button: Button as unknown as ComponentRenderer<any>,
  text: Text as unknown as ComponentRenderer<any>,
};
