from playwright.sync_api import sync_playwright

def debug_home():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to home...")
            page.goto("http://localhost:3000", timeout=60000)
            print("Page loaded. Taking screenshot...")
            page.screenshot(path="verification/home_debug.png")
            print("Screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/home_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    debug_home()
