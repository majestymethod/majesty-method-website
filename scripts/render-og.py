import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':630})
        for name in ['majesty','tenderiq']:
            await pg.goto(f'http://localhost:3000/og-preview/{name}', wait_until='networkidle')
            await pg.screenshot(path=f'public/og/{name}.jpg', type='jpeg', quality=88)
        await b.close()
asyncio.run(main())
