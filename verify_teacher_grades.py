import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on("pageerror", lambda exc: print(f"uncaught exception: {exc}"))
        page.on("console", lambda msg: print(f"console: {msg.text}"))
        await page.set_viewport_size({"width": 1280, "height": 800})

        # 1. Login as teacher
        await page.goto("http://localhost:5000/login")
        print(f"Current title: {await page.title()}")
        # Click on Teacher Portal card
        await page.click('text=PORTAL ENSEIGNANT')
        await page.fill('input[type="email"]', "jp.bahati@ista-goma.cd")
        await page.fill('input[type="password"]', "password")
        await page.click('button:has-text("Connexion")')

        # 2. Wait for dashboard and navigate to grades
        await page.wait_for_url("**/teacher/dashboard", timeout=10000)
        print("Reached teacher dashboard")
        await page.screenshot(path="debug_teacher_dashboard.png")

        # Click on "Notes" in the sidebar - use a more robust selector
        await page.click('aside nav a:has-text("Notes")')

        # 3. Wait for content and take screenshot
        print("Waiting for Teacher Grades page...")
        await page.wait_for_selector("h1:has-text('Gestion des cotes')", timeout=15000)
        await page.screenshot(path="teacher_grades_verified.png")

        # 4. Check if some inputs are present
        await page.wait_for_selector("text=Titre de l'évaluation", timeout=15000)
        await page.screenshot(path="teacher_grades_form.png")

        print("Verification completed. Screenshots saved.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
