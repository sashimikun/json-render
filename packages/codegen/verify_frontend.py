
from playwright.sync_api import sync_playwright, expect

def test_dashboard_jsx_export():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to dashboard...")
            page.goto("http://localhost:3001")

            # Since we injected a mock tree, View JSX should be visible immediately
            print("Waiting for View JSX...")
            page.wait_for_selector('summary:has-text("View JSX")', timeout=30000)

            print("Opening View JSX...")
            # Click "View JSX" to expand it
            page.click('summary:has-text("View JSX")')

            # Wait for content to be visible
            page.wait_for_selector('button:has-text("Copy")', timeout=5000)

            # Take screenshot of the JSX view
            print("Taking screenshot...")
            page.screenshot(path="/home/jules/verification/dashboard_jsx.png", full_page=True)

            # Verify Export Project button still exists
            expect(page.get_by_role("button", name="Export Project")).to_be_visible()

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_dashboard_jsx_export()
