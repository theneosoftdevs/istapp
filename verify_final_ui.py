import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Check Login Page
        await page.goto("http://localhost:5000/login")
        await page.wait_for_selector("text=ISTA PORTAL")
        await page.screenshot(path="final_login_page.png")

        # 2. Login and check Sidebar/Header
        await page.click("text=Étudiant")
        await page.fill('input[type="email"]', "test@example.com")
        await page.fill('input[type="password"]', "password")
        await page.click('button:has-text("Connexion")')

        await page.wait_for_url("**/student/dashboard")
        await page.wait_for_selector("aside >> text=ISTA PORTAL")
        await page.screenshot(path="final_dashboard_desktop.png")

        # 3. Check mobile view
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.screenshot(path="final_dashboard_mobile.png")

        print("Final verification completed.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
