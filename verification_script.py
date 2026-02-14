from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home page...")
        try:
            page.goto("http://localhost:3001", timeout=60000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        # Wait for content to load
        try:
            page.wait_for_selector("h1", timeout=30000)
            print("Home page loaded.")
        except:
             print("Timeout waiting for h1")
             browser.close()
             return

        # Click "Pradėti kurti dizainą"
        start_btn = page.get_by_role("button", name="Pradėti kurti dizainą")
        if start_btn.is_visible():
            start_btn.click()
            print("Clicked Start Designing")
            time.sleep(2)

        # Verification 1: Check Product Description
        try:
            desc_header = page.get_by_text("Apie produktą")
            desc_header.wait_for(state="visible", timeout=5000)
            if page.get_by_text("Gramatūra: 280 g/m²").is_visible():
                print("Product description text verified.")
        except:
            print("Product description verification skipped/failed")

        # Navigate to Order Form

        # Step 1 -> Step 2 (Upload)
        next_btn = page.get_by_role("button", name="Toliau")
        if next_btn.is_visible():
            next_btn.click()
            print("Clicked Next (to Upload)")
            time.sleep(2)

            # Step 2 -> Step 3 or Order
            if page.get_by_text("Įkelkite savo logotipą").is_visible():
                print("In Upload step. Attempting upload.")
                try:
                    file_input = page.locator('input[type="file"]')
                    if file_input.count() > 0:
                        cwd = os.getcwd()
                        file_path = os.path.join(cwd, "public/images/logo.svg")
                        file_input.set_input_files(file_path)
                        print("File uploaded.")
                        time.sleep(2)
                except Exception as e:
                    print(f"Upload failed: {e}")

            # Click Next again
            next_btn = page.get_by_role("button", name="Toliau")
            if next_btn.is_visible():
                next_btn.click()
                print("Clicked Next (from Upload)")
                time.sleep(2)

                # Check if we are on Design step
                confirm_btn = page.get_by_role("button", name="Patvirtinti dizainą")
                if confirm_btn.is_visible():
                    print("In Design step. Confirming.")
                    confirm_btn.click()
                    time.sleep(1)

                    # Click Next to Order
                    next_btn = page.get_by_role("button", name="Toliau")
                    if next_btn.is_visible():
                        next_btn.click()
                        print("Clicked Next (to Order)")
                        time.sleep(2)

        # Final Verification: Order Form
        submit_btn = page.get_by_role("button", name="Pateikti užklausą")
        if submit_btn.is_visible():
            print("Reached Order step.")
            select = page.locator('select#size')

            # Scroll to top to ensure visibility if needed (though Playwright handles this)
            page.evaluate("window.scrollTo(0, 0)")

            if select.is_visible():
                options = select.locator('option').all_inner_texts()
                print(f"Size options found: {options}")
                if "3XL" in options and "4XL" in options:
                        print("VERIFICATION SUCCESS: 3XL and 4XL found.")
                else:
                        print("VERIFICATION FAILURE: 3XL/4XL not found.")

                # Take final screenshot of the form
                page.screenshot(path="verification_final_form.png")
            else:
                print("Order form size select not found.")
                page.screenshot(path="verification_final_fail.png")
        else:
            print("Order step not reached.")
            page.screenshot(path="verification_stuck.png")

        browser.close()

if __name__ == "__main__":
    run()
