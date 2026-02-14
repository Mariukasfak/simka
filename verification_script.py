from playwright.sync_api import sync_playwright
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    print("Navigating to home...")
    page.goto("http://localhost:3000")
    # page.wait_for_load_state("networkidle") # Flaky
    print("Navigated to home")
    page.screenshot(path="verification_home.png")

    # Click "Pradėti kurti dizainą"
    try:
        # Try finding by text loosely if role fails
        start_btn = page.locator("button:has-text('Pradėti kurti dizainą')")
        if start_btn.count() > 0:
            start_btn.first.click()
            print("Clicked start creating")
        else:
            print("Start button not found")
            return
    except Exception as e:
        print(f"Error clicking start: {e}")
        return

    # Wait for wizard
    try:
        page.wait_for_selector("h2:has-text('Sukurkite savo dizainą')", timeout=5000)
        print("Wizard appeared")
    except:
        print("Wizard did not appear")
        page.screenshot(path="verification_error_wizard.png")
        return

    page.screenshot(path="verification_step1.png")

    # Click "Toliau" (Step 1 -> 2)
    try:
        next_btn = page.locator("button:has-text('Toliau')")
        if next_btn.count() > 0:
            next_btn.click()
            print("Clicked Toliau (Step 1 -> 2)")
        else:
            print("Toliau button not found in step 1")
            # Maybe it is just icon? Or "Pasirinkti"?
            # Check buttons
            print("Available buttons:")
            for btn in page.get_by_role("button").all():
                if btn.is_visible():
                    print(f" - {btn.inner_text()}")
            return
    except Exception as e:
        print(f"Error clicking Toliau: {e}")
        return

    # Step 2: Upload
    page.wait_for_timeout(1000)
    page.screenshot(path="verification_step2.png")

    # Upload image
    try:
        file_input = page.locator('input[type="file"]')
        if file_input.count() > 0:
            current_dir = os.getcwd()
            logo_path = os.path.join(current_dir, "public/images/logo.svg")
            file_input.set_input_files(logo_path)
            print("Uploaded logo")

            # Wait for upload to process
            page.wait_for_timeout(2000)

            page.screenshot(path="verification_step2_filled.png")

            # App auto-advances to Design step on upload
            print("Upload complete, waiting for auto-advance to Design step")

            page.wait_for_timeout(2000)
            page.screenshot(path="verification_step3_initial.png")

            # Step 3: Design
            # Wait for draggable image
            try:
                page.wait_for_selector(".draggable-image", timeout=10000)
                print("Draggable image appeared")

                # Screenshot design canvas
                page.screenshot(path="verification_design.png")
            except:
                print("Draggable image did not appear")
                page.screenshot(path="verification_error_design.png")

        else:
            print("No file input found in step 2")
    except Exception as e:
        print(f"Error during upload/navigation: {e}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
