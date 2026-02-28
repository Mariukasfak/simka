from playwright.sync_api import sync_playwright

def verify_order_form(page):
    page.goto("http://localhost:3001/")

    # Pradėti kurti dizainą
    page.wait_for_selector("button:has-text('Pradėti kurti dizainą')")
    page.locator("button:has-text('Pradėti kurti dizainą')").click()

    # 1. Product Step
    page.wait_for_selector("text=Pasirinkite savo rūbą")
    page.get_by_text("Toliau").click()

    # 2. Upload Step
    # Reikia įkelti failą
    file_input = page.locator("input[type='file']")

    import os
    with open("verification/test.gif", "wb") as f:
        # A minimal 1x1 GIF file
        f.write(b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;")

    file_input.set_input_files(os.path.abspath("verification/test.gif"))

    # Tai dabar peršoks į 3 žingsnį (Dizainas)
    page.wait_for_selector("text=Redaguokite dizainą")

    # Palaukime kol preview susigeneruos po uždelsimo.
    page.wait_for_timeout(2000)

    # Patvirtinti dizainą mygtukas jeigu toks yra
    try:
       page.wait_for_selector("button:has-text('Patvirtinti dizainą')", timeout=2000)
       page.locator("button:has-text('Patvirtinti dizainą')").click()
       page.wait_for_timeout(2000)
    except:
       pass

    # Toliau į užsakymą
    page.get_by_text("Toliau į užsakymą").click()

    # 4. Order form step
    page.wait_for_selector("text=Užsakymo informacija")

    # Pabandykime išsiųsti tuščią formą kad atsirastų klaidų
    page.get_by_role("button", name="Pateikti užklausą").click()

    # Palaukime klaidų atvaizdavimo (laukime bent kokio klaidos pranešimo atsiradimo)
    page.wait_for_selector("[role='alert']")

    # Nufotografuojame formą su klaidomis
    page.screenshot(path="verification/order-form-errors.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_order_form(page)
        finally:
            browser.close()
