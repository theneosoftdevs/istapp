import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Login as teacher
        await page.goto("http://localhost:5000/login")
        await page.click("text=Enseignant")
        await page.fill('input[type="email"]', "test@example.com")
        await page.fill('input[type="password"]', "password")
        await page.click('button:has-text("Se connecter")')

        # 2. Wait for dashboard and navigate to grades
        await page.wait_for_url("**/teacher/dashboard")
        await page.goto("http://localhost:5000/teacher/grades")

        # 3. Wait for content and take screenshot
        await page.wait_for_selector("text=Saisie des notes")
        await page.screenshot(path="teacher_grades_verified.png")

        # 4. Try to open the add grade dialog
        await page.click('button:has-text("Saisir une note")')
        await page.wait_for_selector("text=Saisie d'une note")
        await page.screenshot(path="teacher_grades_dialog.png")

        print("Verification completed. Screenshots saved.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
