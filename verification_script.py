from playwright.sync_api import sync_playwright
import os
import shutil

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:3000")

            # Click start designing
            print("Clicking 'Pradėti kurti dizainą'...")
            page.click("text=Pradėti kurti dizainą")

            # Wait for wizard
            page.wait_for_selector("text=Sukurkite savo dizainą", timeout=10000)

            # Take screenshot of product selection
            page.screenshot(path="verification_step1.png")
            print("Step 1 screenshot taken.")

            # Select a product (click on the first one)
            print("Selecting product...")
            # Use specific product name to be sure
            page.click("text=Džemperis (tamsus)")

            # Wait for upload area text
            print("Waiting for upload area...")
            page.wait_for_selector("text=Įkelkite savo logotipą", timeout=10000)

            # Create a dummy image file
            if not os.path.exists("test_logo.svg"):
                if os.path.exists("public/images/logo.svg"):
                    shutil.copy("public/images/logo.svg", "test_logo.svg")
                else:
                    with open("test_logo.svg", "w") as f:
                        f.write('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>')

            # Upload file
            print("Uploading file...")
            page.set_input_files("input[type='file']", "test_logo.svg")

            # Wait for design canvas (draggable-image class)
            print("Waiting for design canvas...")
            page.wait_for_selector(".draggable-image", timeout=30000)

            # Take screenshot
            page.screenshot(path="verification_design.png")
            print("Design screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
            import traceback
            traceback.print_exc()
        finally:
            browser.close()

if __name__ == "__main__":
    run()
