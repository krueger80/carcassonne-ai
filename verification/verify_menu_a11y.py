from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        # Start the game
        print("Clicking 'Start Game'...")
        # Use a more robust selector
        start_btn = page.locator("button", has_text="Start Game")
        if start_btn.count() > 0:
            start_btn.first.click()
            print("Clicked 'Start Game'")
        else:
            print("Start Game button not found!")
            print(page.content())
            return

        # Wait for GameOverlay to appear.
        # The hamburger menu button should appear.
        try:
            open_button = page.get_by_role("button", name="Open menu")
            open_button.wait_for(state="visible", timeout=5000)
            print("SUCCESS: Found button with aria-label 'Open menu'")
        except Exception as e:
            print(f"FAILURE: Could not find button with aria-label 'Open menu'. Error: {e}")
            print("Page content after click:")
            print(page.content())
            return

        # Check aria-expanded is false
        expanded = open_button.get_attribute("aria-expanded")
        print(f"Initial aria-expanded: {expanded}")

        # Click the button
        open_button.click()

        # Wait for menu to appear
        menu = page.get_by_role("menu")
        try:
            menu.wait_for(state="visible", timeout=2000)
            print("SUCCESS: Menu is visible")
        except:
             print("FAILURE: Menu did not become visible")
             print(page.content())
             return

        # Check button state changed
        close_button = page.get_by_role("button", name="Close menu")
        if close_button.is_visible():
            print("SUCCESS: Found button with aria-label 'Close menu'")
        else:
            print("FAILURE: Button label did not update to 'Close menu'")

        expanded_after = close_button.get_attribute("aria-expanded")
        print(f"Post-click aria-expanded: {expanded_after}")

        # Verify menu items
        menu_items = menu.get_by_role("menuitem").all()
        print(f"Found {len(menu_items)} menu items")
        for item in menu_items:
            print(f"Menu item: {item.text_content()}")

        # Verify emojis are hidden
        if len(menu_items) > 0:
            first_item_html = menu_items[0].inner_html()
            if 'aria-hidden="true"' in first_item_html:
                print("SUCCESS: Emoji has aria-hidden='true'")
            else:
                print(f"FAILURE: Emoji missing aria-hidden='true'. HTML: {first_item_html}")

        # Take screenshot
        page.screenshot(path="verification/menu_open.png")
        print("Screenshot saved to verification/menu_open.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
