from playwright.sync_api import sync_playwright, expect
import os

def test_drag_performance():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to home
        print("Navigating to home...")
        page.goto("http://localhost:3000")

        # 2. Click start designing
        print("Clicking 'Pradėti kurti dizainą'...")
        page.get_by_role("button", name="Pradėti kurti dizainą").click()

        # 3. Wait for wizard (product selection)
        print("Waiting for product selection...")
        # Assume product selection is first step. Click Next to go to upload.
        # Find 'Toliau' button
        page.get_by_role("button", name="Toliau").click()

        # 4. Upload image
        print("Uploading image...")
        # Find file input. UploadArea usually has a hidden file input.
        # We need to make sure the file path is absolute or relative to where script is run.
        # Since we run from root, 'public/images/logo.svg' should work if relative to cwd.

        logo_path = os.path.abspath("public/images/logo.svg")
        if not os.path.exists(logo_path):
             print(f"Error: Logo not found at {logo_path}")
             return

        page.locator("input[type='file']").set_input_files(logo_path)

        # 5. Wait for draggable image (transition to design step happens automatically)
        print("Waiting for draggable image...")
        draggable = page.locator(".draggable-image")
        draggable.wait_for(state="visible", timeout=10000)

        # 6. Drag the image
        print("Dragging image...")
        # Get bounding box
        box = draggable.bounding_box()
        if box:
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.mouse.down()
            # Move in small steps to trigger mousemove events
            start_x = box["x"] + box["width"] / 2
            start_y = box["y"] + box["height"] / 2

            for i in range(10):
                page.mouse.move(start_x + i * 10, start_y + i * 5)
                page.wait_for_timeout(50) # wait 50ms between moves

            page.mouse.up()
            print("Drag completed.")

        # 7. Screenshot
        print("Taking screenshot...")
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/drag_verification.png")
        print("Screenshot saved to verification/drag_verification.png")

        browser.close()

if __name__ == "__main__":
    test_drag_performance()
