import unittest
from json_render.catalog import (
    CatalogConfig,
    ComponentDefinition,
    ActionDefinition,
    create_catalog,
    generate_catalog_prompt,
)

class TestCatalog(unittest.TestCase):
    def test_generate_catalog_prompt(self):
        # Define components
        components = {
            "Button": ComponentDefinition(
                props={"label": "string", "onClick": "string"},
                description="A clickable button"
            ),
            "Card": ComponentDefinition(
                props={"title": "string"},
                has_children=True,
                description="A card container"
            )
        }

        # Define actions
        actions = {
            "submit": ActionDefinition(
                params={"data": "object"},
                description="Submit form data"
            )
        }

        # Create catalog
        config = CatalogConfig(
            name="Test",
            components=components,
            actions=actions
        )
        catalog = create_catalog(config)

        # Generate prompt
        prompt = generate_catalog_prompt(catalog)

        # Expected output
        expected_lines = [
            "# Test Component Catalog",
            "",
            "## Available Components",
            "",
            "### Button",
            "A clickable button",
            "",
            "### Card",
            "A card container",
            "",
            "## Available Actions",
            "",
            "- `submit`: Submit form data",
            "",
            "## Visibility Conditions",
            "",
            "Components can have a `visible` property:",
            "- `true` / `false` - Always visible/hidden",
            '- `{ "path": "/data/path" }` - Visible when path is truthy',
            '- `{ "auth": "signedIn" }` - Visible when user is signed in',
            '- `{ "and": [...] }` - All conditions must be true',
            '- `{ "or": [...] }` - Any condition must be true',
            '- `{ "not": {...} }` - Negates a condition',
            '- `{ "eq": [a, b] }` - Equality check',
            "",
            "## Validation Functions",
            "",
            "Built-in: `required`, `email`, `minLength`, `maxLength`, `pattern`, `min`, `max`, `url`",
            ""
        ]

        expected = "\n".join(expected_lines)

        self.assertEqual(prompt, expected)

if __name__ == '__main__':
    unittest.main()
