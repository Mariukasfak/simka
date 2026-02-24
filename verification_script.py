from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to http://localhost:3001")
        page.goto("http://localhost:3001")

        # Take a screenshot of the landing page
        time.sleep(2)
        page.screenshot(path="verification_home.png")
        print("Home screenshot taken.")

        # Check for start button
        start_button = page.locator("text=Pradėti kurti dizainą").first
        if start_button.count() > 0:
            print("Start button found. Clicking...")
            start_button.click()
            time.sleep(3) # Wait for wizard to load
        else:
            print("Start button NOT found.")
            print("Page content sample:", page.content()[:1000])

        # Check for Upload Area
        upload_area = page.locator("div[role='button']:has-text('Vilkite paveikslėlį čia')").first

        if upload_area.count() == 0:
            print("Upload area not found after clicking start.")
            # Maybe we are already there or something went wrong
            # Check if we need to select a product first?
            # Based on page.tsx:
            # setCurrentWizardStep("product"); -> default
            # So first step is product selection.
            # We need to select a product to proceed to upload?

            # Let's check for product selector
            product_selector = page.locator("text=Pasirinkite produktą").first
            if product_selector.count() > 0:
                print("In Product Selector step.")
                # We need to click "Next" or select a product.
                # In WizardContent.tsx, there should be a next button.

                # Let's look for a "Next" or "Tęsti" button.
                # In WizardContent.tsx:
                # {currentStep === 'product' && ( ... <Button onClick={onNextStep}>Tęsti</Button> )}

                next_button = page.locator("button:has-text('Toliau')").first
                if next_button.count() > 0:
                    print("Clicking Toliau to go to upload step.")
                    next_button.click()
                    time.sleep(2)

                    # Now check for upload area again
                    upload_area = page.locator("div[role='button']:has-text('Vilkite paveikslėlį čia')").first

        if upload_area.count() > 0:
            print("Upload area found.")
            upload_area.scroll_into_view_if_needed()

            # Initial screenshot
            page.screenshot(path="verification_step1.png")
            print("Initial screenshot taken.")

            # Simulate drag enter
            # We trigger dragenter on the element
            upload_area.evaluate("element => { const event = new DragEvent('dragenter', { bubbles: true, cancelable: true }); element.dispatchEvent(event); }")

            # Wait for state update
            time.sleep(0.5)

            # Take screenshot of drag state
            page.screenshot(path="verification_drag_state.png")
            print("Drag state screenshot taken.")

        else:
            print("Upload area still not found.")
            page.screenshot(path="verification_failed.png")

        browser.close()

if __name__ == "__main__":
    run()
