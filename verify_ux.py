import os
import glob
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1000)

    # Click the "Start Local Game" button if it's there
    try:
        page.locator("button:has-text('Start Local Game')").click(timeout=2000)
    except Exception:
        pass

    # Or maybe "Start Game"
    try:
        page.locator("button:has-text('Start Game')").click(timeout=2000)
    except Exception:
        pass

    page.wait_for_timeout(1000)

    # Take screenshot of the Game Overlay containing the buttons
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
