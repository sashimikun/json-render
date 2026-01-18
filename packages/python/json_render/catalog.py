from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, field

# Since we don't have Zod in Python, we'll use a generic type or Dict for schema definitions for now.
# Users can pass whatever schema representation they want, but usually it might be a JSON schema dict.
ComponentSchema = Any

@dataclass
class ComponentDefinition:
    """
    Component definition matching the TypeScript API.
    """
    props: ComponentSchema
    has_children: bool = False
    description: Optional[str] = None

@dataclass
class ActionDefinition:
    """
    Action definition matching the TypeScript API.
    """
    params: Optional[ComponentSchema] = None
    description: Optional[str] = None

# Validation function placeholder
ValidationFunction = Callable[[Any], bool]

@dataclass
class CatalogConfig:
    """
    Catalog configuration.
    """
    components: Dict[str, ComponentDefinition]
    name: str = "unnamed"
    actions: Dict[str, ActionDefinition] = field(default_factory=dict)
    functions: Dict[str, ValidationFunction] = field(default_factory=dict)
    validation: str = "strict" # "strict" | "warn" | "ignore"

class Catalog:
    """
    Catalog instance.
    """
    def __init__(self, config: CatalogConfig):
        self.name = config.name
        self.components = config.components
        self.actions = config.actions
        self.functions = config.functions
        self.validation = config.validation

    @property
    def component_names(self) -> List[str]:
        return list(self.components.keys())

    @property
    def action_names(self) -> List[str]:
        return list(self.actions.keys())

    @property
    def function_names(self) -> List[str]:
        return list(self.functions.keys())

    def has_component(self, type_name: str) -> bool:
        return type_name in self.components

    def has_action(self, name: str) -> bool:
        return name in self.actions

    def has_function(self, name: str) -> bool:
        return name in self.functions

def create_catalog(config: CatalogConfig) -> Catalog:
    return Catalog(config)

def generate_catalog_prompt(catalog: Catalog) -> str:
    """
    Generate a prompt for AI that describes the catalog.
    Matches packages/core/src/catalog.ts generateCatalogPrompt
    """
    lines = [
        f"# {catalog.name} Component Catalog",
        "",
        "## Available Components",
        "",
    ]

    # Components
    for name in catalog.component_names:
        definition = catalog.components[name]
        lines.append(f"### {name}")
        if definition.description:
            lines.append(definition.description)
        lines.append("")

    # Actions
    if catalog.action_names:
        lines.append("## Available Actions")
        lines.append("")
        for name in catalog.action_names:
            definition = catalog.actions[name]
            desc_part = f": {definition.description}" if definition.description else ""
            lines.append(f"- `{name}`{desc_part}")
        lines.append("")

    # Visibility
    lines.append("## Visibility Conditions")
    lines.append("")
    lines.append("Components can have a `visible` property:")
    lines.append("- `true` / `false` - Always visible/hidden")
    lines.append('- `{ "path": "/data/path" }` - Visible when path is truthy')
    lines.append('- `{ "auth": "signedIn" }` - Visible when user is signed in')
    lines.append('- `{ "and": [...] }` - All conditions must be true')
    lines.append('- `{ "or": [...] }` - Any condition must be true')
    lines.append('- `{ "not": {...} }` - Negates a condition')
    lines.append('- `{ "eq": [a, b] }` - Equality check')
    lines.append("")

    # Validation
    lines.append("## Validation Functions")
    lines.append("")
    lines.append(
        "Built-in: `required`, `email`, `minLength`, `maxLength`, `pattern`, `min`, `max`, `url`"
    )
    if catalog.function_names:
        custom_funcs = ", ".join([str(name) for name in catalog.function_names])
        lines.append(f"Custom: {custom_funcs}")
    lines.append("")

    return "\n".join(lines)
