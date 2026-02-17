from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        print("Page title:", page.title())

        # Start Game
        start_button = page.get_by_role("button", name="Start Game")
        if start_button.is_visible():
            print("Found 'Start Game' button. Clicking...")
            start_button.click()
            # Wait for game board to load
            page.wait_for_timeout(1000)
        else:
            print("FAILURE: 'Start Game' button not found")
            return

        # Now verify Hamburger Menu
        menu_button = page.get_by_role("button", name="Open game menu")
        if menu_button.is_visible():
            print("SUCCESS: Found 'Open game menu' button")
        else:
            print("FAILURE: 'Open game menu' button not found")

        # Verify Zoom Buttons
        zoom_in = page.get_by_role("button", name="Zoom in")
        if zoom_in.is_visible():
            print("SUCCESS: Found 'Zoom in' button")
        else:
            print("FAILURE: 'Zoom in' button not found")

        zoom_out = page.get_by_role("button", name="Zoom out")
        if zoom_out.is_visible():
            print("SUCCESS: Found 'Zoom out' button")
        else:
            print("FAILURE: 'Zoom out' button not found")

        zoom_reset = page.get_by_role("button", name="Reset zoom")
        if zoom_reset.is_visible():
            print("SUCCESS: Found 'Reset zoom' button")
        else:
            print("FAILURE: 'Reset zoom' button not found")

        # Open the menu to check New Game buttons
        if menu_button.is_visible():
            menu_button.click()
            page.wait_for_timeout(500) # Wait for animation

            # Check for "New Game" button inside the menu
            new_game_btn = page.get_by_text("New Game")
            if new_game_btn.is_visible():
                print("Clicking 'New Game' inside menu...")
                new_game_btn.click()
                page.wait_for_timeout(500)

            # Now check for player count buttons
            # My change added aria-label="{count} Players"
            player_4_btn = page.get_by_role("button", name="4 Players")
            if player_4_btn.is_visible():
                print("SUCCESS: Found '4 Players' button")
                is_pressed = player_4_btn.get_attribute("aria-pressed")
                print("4 Players button aria-pressed:", is_pressed)
            else:
                print("FAILURE: '4 Players' button not found")

        page.screenshot(path="verification/verification_game.png")
        print("Screenshot saved to verification/verification_game.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
