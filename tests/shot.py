"""Usage: python3 tests/shot.py <path> [width] [full|fold] [out-name]"""
import sys, asyncio
from playwright.async_api import async_playwright
path = sys.argv[1]; width = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
mode = sys.argv[3] if len(sys.argv) > 3 else 'fold'
name = sys.argv[4] if len(sys.argv) > 4 else (path.strip('/').replace('/', '_') or 'entry') + f'-{width}'
base = 'http://localhost:3000'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        h = {360: 760, 390: 844, 768: 1024, 1024: 768}.get(width, 900)
        pg = await b.new_page(viewport={'width': width, 'height': h})
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(base + path, wait_until='networkidle')
        await pg.wait_for_timeout(400)
        sw = await pg.evaluate('document.documentElement.scrollWidth')
        await pg.screenshot(path=f'/tmp/claude-0/shots/{name}.png', full_page=(mode == 'full'))
        print(f'{name}: scrollWidth={sw} (viewport {width})', 'ERRORS: ' + ' | '.join(errs) if errs else '')
        await b.close()
asyncio.run(main())
