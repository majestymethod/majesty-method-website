"""
End-to-end tests. Run against a running site:
  BASE=http://localhost:3000 DATA_DIR=./data-test python3 tests/e2e.py
Needs test users owner@test.local / editor@test.local (see README "Testing").
"""
import asyncio, json, os, sqlite3, sys, time, uuid
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get('BASE', 'http://localhost:3000')
DATA = Path(os.environ.get('DATA_DIR', './data'))
OWNER = ('owner@test.local', os.environ.get('OWNER_PW', 'TestOwnerPass-2026!'))
EDITOR = ('editor@test.local', os.environ.get('EDITOR_PW', 'TestEditorPass-2026!'))
SHOTS = Path(os.environ.get('SHOTS', '/tmp/claude-0/shots'))
SHOTS.mkdir(parents=True, exist_ok=True)
AXE = Path('node_modules/axe-core/axe.min.js').read_text()
MOCK_SHEET = os.environ.get('MOCK_SHEET')

results = []
def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))

def db():
    return sqlite3.connect(DATA / 'site.db')

FIX = Path(__file__).parent / 'fixtures'
TF_JS = (FIX / 'typeform-embed.js').read_text()
TF_CSS = (FIX / 'typeform-widget.css').read_text()

async def typeform_offline(context):
    # The sandbox can't reach Typeform, so serve Typeform's own embed script locally and a stand-in form page.
    async def embed(route):
        js = route.request.url.endswith('.js')
        await route.fulfill(status=200, content_type='application/javascript' if js else 'text/css', body=TF_JS if js else TF_CSS)
    await context.route('https://embed.typeform.com/**', embed)
    await context.route('https://form.typeform.com/**', lambda r: r.fulfill(status=200, content_type='text/html', body='<html><body>Typeform stand-in</body></html>'))

def set_typeform(key, value):
    # Switch a page between its Typeform and the built-in form (used to keep testing the built-in fallback).
    c = db()
    for col in ('draft', 'published'):
        raw = c.execute(f'select {col} from content where key=?', (key,)).fetchone()
        if not raw or not raw[0]: continue
        doc = json.loads(raw[0]); doc.setdefault('register', {})['typeform'] = value
        c.execute(f'update content set {col}=? where key=?', (json.dumps(doc), key))
    c.commit(); c.close()

PAGES = ['/', '/majesty-method', '/majesty-method/bootcamp', '/majesty-method/webinars', '/majesty-method/acceleration',
         '/majesty-method/courses', '/majesty-method/resources', '/tenderiq', '/contact', '/legal/privacy', '/legal/cookies',
         '/legal/terms', '/legal/paia']
WIDTHS = [360, 390, 768, 1024, 1440]

async def fill_form(page, values: dict, scope='form.form'):
    form = page.locator(scope).first
    for label, val in values.items():
        if isinstance(val, tuple) and val[0] == 'radio':
            await form.get_by_role('radio', name=val[1], exact=True).check()
        elif isinstance(val, tuple) and val[0] == 'select':
            await form.get_by_label(label, exact=False).select_option(val[1])
        else:
            await form.get_by_label(label, exact=False).fill(val)
    return form

async def submit_and_wait(page, form):
    await page.wait_for_timeout(2700)  # anti-bot minimum fill time
    await form.locator('button[type=submit]').click()
    await page.wait_for_selector('.form-success, .alert', timeout=15000)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        _new_context = browser.new_context
        async def new_context(**kw):
            c = await _new_context(**kw); await typeform_offline(c); return c
        browser.new_context = new_context

        # ---------------------------------------------------------------- Routes, overflow, console, a11y
        ctx = await browser.new_context()
        page = await ctx.new_page()
        errors = []
        # Typeform's frame asks for camera/microphone; the site's policy blocks them on purpose, which Chrome reports as a warning.
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'Potential permissions policy violation' not in m.text else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        for w in WIDTHS:
            await page.set_viewport_size({'width': w, 'height': 900})
            for path in PAGES:
                errors.clear()
                r = await page.goto(BASE + path, wait_until='networkidle')
                sw = await page.evaluate('document.documentElement.scrollWidth')
                check(f'{path} @{w}: 200, no overflow, no console errors', r.status == 200 and sw <= w and not errors, f'status={r.status} scrollWidth={sw} errors={errors[:2]}')
                if w in (390, 1440) and path in ('/', '/majesty-method', '/tenderiq', '/majesty-method/bootcamp'):
                    await page.screenshot(path=str(SHOTS / f"t{(path.strip('/').replace('/', '_') or 'entry')}-{w}.png"), full_page=True)
        await page.set_viewport_size({'width': 1280, 'height': 900})
        for path in PAGES:
            await page.goto(BASE + path, wait_until='networkidle')
            await page.add_script_tag(content=AXE)
            res = await page.evaluate("axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}).then(r => r.violations.map(v => v.id + ':' + v.impact + ':' + v.nodes.length))")
            serious = [v for v in res if ':serious:' in v or ':critical:' in v]
            check(f'axe {path}: no serious/critical WCAG violations', not serious, str(res))

        # Mobile menu keyboard
        await page.set_viewport_size({'width': 390, 'height': 844})
        await page.goto(BASE + '/majesty-method')
        toggle = page.locator('.nav__toggle')
        await toggle.click()
        check('mobile menu opens with aria-expanded', await toggle.get_attribute('aria-expanded') == 'true' and await page.locator('.nav__panel[data-open=true] a').count() >= 6)
        await page.keyboard.press('Escape')
        check('mobile menu closes on Escape, focus returns to toggle', await toggle.get_attribute('aria-expanded') == 'false' and await page.evaluate("document.activeElement.classList.contains('nav__toggle')"))
        await page.set_viewport_size({'width': 1280, 'height': 900})

        # ---------------------------------------------------------------- Entry: House of Majesty entrance
        PH = "document.querySelector('.hx').dataset.phase"
        await page.goto(BASE + '/', wait_until='networkidle')
        check('entrance: exterior artwork loaded', await page.evaluate("(() => { const i = document.querySelector('.hx-ext__base'); return i.complete && i.naturalWidth > 1000; })()"))
        check('entrance: interior hidden and inert before opening', await page.evaluate("document.querySelector('.hx-int').inert === true && getComputedStyle(document.querySelector('.hx-int')).visibility === 'hidden'"))
        check('entrance: accessible heading', ((await page.locator('h1').text_content()) or '').strip().lower() == 'welcome to majesty method', await page.locator('h1').text_content())
        check('entrance: ribbon is a labelled button', 'enter' in ((await page.locator('.hx-ribbon-btn').get_attribute('aria-label')) or '').lower())
        await page.locator('.hx-ribbon-btn').click()
        await page.wait_for_timeout(200)
        check('entrance: ribbon click releases the ribbon', await page.evaluate(PH) == 'ribbon')
        await page.wait_for_timeout(600)
        clip = await page.evaluate("getComputedStyle(document.querySelector('.hx-int')).clipPath")
        check('entrance: doors open onto the interior', await page.evaluate(PH) == 'doors' and clip.startswith('inset('), clip)
        await page.wait_for_timeout(1700)
        check('entrance: interior revealed with two live pathways', await page.evaluate(PH) == 'open' and await page.locator('a.hx-path').count() == 2
              and await page.evaluate("document.querySelector('.hx-int').inert === false && getComputedStyle(document.querySelector('.hx-ext')).visibility === 'hidden'"))
        check('entrance: interior artwork loaded', await page.evaluate("(() => { const i = document.querySelector('img.hx-int__base'); return !!i && i.complete && i.naturalWidth > 1000; })()"))
        dt = await page.evaluate("getComputedStyle(document.querySelector('.hx-door--l')).transform")
        check('entrance: glass doors slid open', dt not in ('none', ''), dt)
        await page.wait_for_timeout(600)
        check('entrance: Enter labels visible', await page.evaluate("[...document.querySelectorAll('.hx-chip')].every(c => getComputedStyle(c).opacity === '1')"))
        await page.locator('.hx-path--mm').hover(); await page.wait_for_timeout(500)
        lit = await page.evaluate("[getComputedStyle(document.querySelector('.hx-light--mm.hx-light--sign')).opacity, getComputedStyle(document.querySelector('.hx-path--tiq'), '::before').opacity]")
        check('entrance: hovering a pathway lights it and dims the other', lit == ['1', '1'], str(lit))
        await page.get_by_role('link', name='MAJESTY METHOD').click()
        await page.wait_for_url('**/majesty-method')
        check('entry → Majesty Method', page.url.endswith('/majesty-method'))
        await page.goto(BASE + '/')
        await page.wait_for_timeout(800)
        check('entrance: returning in same session opens instantly', await page.evaluate(PH) == 'open')
        await page.get_by_role('button', name='Back to the entrance').click()
        await page.wait_for_timeout(700)
        check('entrance: back button returns to the closed entrance', await page.evaluate(PH) == 'closed'
              and await page.evaluate("document.activeElement.classList.contains('hx-ribbon-btn')")
              and await page.evaluate("sessionStorage.getItem('mm-entrance-opened')") is None)
        await page.locator('.hx-ribbon-btn').click()
        await page.wait_for_timeout(2400)
        await page.get_by_role('link', name='TENDERIQ').click()
        await page.wait_for_url('**/tenderiq')
        check('entry → TenderIQ', page.url.endswith('/tenderiq'))
        # Tapping the doors (which carry "Tap to enter" in the artwork) also opens; Escape skips the animation
        dctx = await browser.new_context(viewport={'width': 1440, 'height': 810}); dp = await dctx.new_page()
        await dp.goto(BASE + '/', wait_until='networkidle')
        hb = await dp.locator('.hx-door-hit').bounding_box()
        await dp.mouse.click(hb['x'] + hb['width'] / 2, hb['y'] + hb['height'] * 0.75)
        await dp.wait_for_timeout(150)
        check('entrance: tapping the doors opens the entrance', await dp.evaluate(PH) != 'closed')
        await dp.keyboard.press('Escape'); await dp.wait_for_timeout(100)
        check('entrance: Escape skips to the pathways', await dp.evaluate(PH) == 'open')
        await dctx.close()
        # Keyboard: fresh session, Tab to the ribbon, press Enter
        kctx = await browser.new_context(viewport={'width': 1280, 'height': 800}); kp = await kctx.new_page()
        await kp.goto(BASE + '/', wait_until='networkidle')
        for _ in range(4):
            await kp.keyboard.press('Tab')
            if await kp.evaluate("document.activeElement.classList.contains('hx-ribbon-btn')"): break
        check('entrance: ribbon reachable by keyboard', await kp.evaluate("document.activeElement.classList.contains('hx-ribbon-btn')"))
        await kp.keyboard.press('Enter')
        await kp.wait_for_timeout(2500)
        check('entrance: keyboard open moves focus to Majesty Method pathway', await kp.evaluate("document.activeElement.classList.contains('hx-path--mm')"))
        await kp.keyboard.press('Tab')
        check('entrance: Tab moves to TenderIQ pathway', await kp.evaluate("document.activeElement.classList.contains('hx-path--tiq')"))
        await kctx.close()
        # Reduced motion on a phone: opens instantly, pathways become two stacked panels that fit the screen
        rctx = await browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce'); rp = await rctx.new_page()
        await rp.goto(BASE + '/', wait_until='networkidle')
        await rp.locator('.hx-ribbon-btn').click()
        await rp.wait_for_timeout(150)
        check('entrance: reduced motion opens instantly on mobile', await rp.evaluate(PH) == 'open')
        await rp.wait_for_timeout(800)
        check('entrance: phone opens on the whole lobby (both pathways)', await rp.evaluate("document.querySelector('.hx-viewer').dataset.view") == 'both')
        cm = await rp.locator('.hx-path--mm .hx-chip').bounding_box(); ct = await rp.locator('.hx-path--tiq .hx-chip').bounding_box()
        check('entrance: phone shows both Enter buttons on screen, large enough to tap',
              cm and ct and cm['x'] >= 0 and ct['x'] + ct['width'] <= 390 and max(cm['y'] + cm['height'], ct['y'] + ct['height']) <= 844 and min(cm['height'], ct['height']) >= 44, f'{cm} {ct}')
        await rp.get_by_role('button', name='Slide towards TENDERIQ').click(); await rp.wait_for_timeout(200)
        check('entrance: arrow slides towards TenderIQ', await rp.evaluate("document.querySelector('.hx-viewer').dataset.view") == 'tiq')
        await rp.get_by_role('button', name='Back to both pathways').click(); await rp.get_by_role('button', name='Slide towards MAJESTY METHOD').click(); await rp.wait_for_timeout(200)
        check('entrance: arrows slide back and towards Majesty Method', await rp.evaluate("document.querySelector('.hx-viewer').dataset.view") == 'mm')
        vb = await rp.locator('.hx-viewer').bounding_box()
        await rp.mouse.move(vb['x'] + 300, vb['y'] + 200); await rp.mouse.down(); await rp.mouse.move(vb['x'] + 120, vb['y'] + 210, steps=6); await rp.mouse.up()
        await rp.wait_for_timeout(200)
        check('entrance: sliding left moves the view right', await rp.evaluate("document.querySelector('.hx-viewer').dataset.view") == 'both')
        await rp.locator('.hx-path--tiq .hx-chip').click()
        await rp.wait_for_url('**/tenderiq')
        check('entrance: phone TenderIQ pathway opens TenderIQ', rp.url.endswith('/tenderiq'))
        await rctx.close()
        # Landscape tablet: side-by-side pathway panels
        tctx = await browser.new_context(viewport={'width': 1024, 'height': 768}, reduced_motion='reduce'); tp = await tctx.new_page()
        await tp.goto(BASE + '/', wait_until='networkidle')
        await tp.locator('.hx-ribbon-btn').click(); await tp.wait_for_timeout(300)
        bm = await tp.locator('.hx-path--mm').bounding_box(); bt = await tp.locator('.hx-path--tiq').bounding_box()
        check('entrance: tablet shows pathways side by side', bm and bt and bm['x'] + bm['width'] <= bt['x'] + 1 and abs(bm['y'] - bt['y']) < 2, f'{bm} {bt}')
        await tctx.close()
        # Skip link opens directly
        sctx = await browser.new_context(); sp = await sctx.new_page()
        await sp.goto(BASE + '/', wait_until='networkidle')
        await sp.keyboard.press('Tab')
        await sp.keyboard.press('Enter')
        await sp.wait_for_timeout(150)
        check('entrance: skip link opens the pathways', await sp.evaluate(PH) == 'open')
        await sctx.close()
        # Without JavaScript the two pathways are still visible and usable
        nctx = await browser.new_context(java_script_enabled=False); npg = await nctx.new_page()
        await npg.goto(BASE + '/')
        hrefs_nojs = await npg.eval_on_selector_all('a.hx-path', 'els => els.map(e => e.getAttribute("href"))')
        vis = await npg.evaluate("getComputedStyle(document.querySelector('.hx-int')).visibility")
        check('entrance: works without JavaScript (pathways visible)', hrefs_nojs == ['/majesty-method', '/tenderiq'] and vis == 'visible', f'{hrefs_nojs} {vis}')
        await nctx.close()
        # Brand colours: TenderIQ purple, Majesty Method emerald (primary buttons on light sections)
        await page.goto(BASE + '/tenderiq')
        btn = await page.evaluate("getComputedStyle(document.querySelector('.site-header .btn')).backgroundImage")
        check('TenderIQ primary button is plum', 'rgb(90, 0, 96)' in btn, btn)
        hero = await page.evaluate("getComputedStyle(document.querySelector('.tiq-hero > .container')).backgroundImage")
        check('TenderIQ hero is a rich plum panel', 'rgb(90, 0, 96)' in hero, hero[:120])
        await page.goto(BASE + '/majesty-method')
        btn = await page.evaluate("getComputedStyle(document.querySelector('.closing .btn')).backgroundImage")
        check('Majesty Method primary button uses the green stone', 'green-stone' in btn, btn)
        hero = await page.evaluate("getComputedStyle(document.querySelector('.mm-banner')).backgroundImage")
        check('Majesty Method banner uses the green stone background', 'green-stone' in hero, hero[:160])
        panel = await page.evaluate("getComputedStyle(document.querySelector('.surface--emerald > .container, .block--emerald')).backgroundImage")
        check('green panels use the green stone', 'green-stone' in panel, panel[:160])
        imgs = await page.evaluate("[...document.querySelectorAll('.mm-banner img')].map(i => i.complete && i.naturalWidth > 0)")
        check('banner photo and logo load', imgs == [True, True], str(imgs))
        tag = await page.locator('.mm-banner__tag').inner_text()
        check('banner gold bar reads THE METHOD OF SUCCESS', ' '.join(tag.split()).upper() == 'THE METHOD OF SUCCESS', tag)
        acts = page.locator('.mm-hero__actions .btn')
        check('original hero buttons sit below the banner', await acts.count() == 2 and (await acts.first.bounding_box())['y'] > (await page.locator('.mm-banner').bounding_box())['y'] + (await page.locator('.mm-banner').bounding_box())['height'])
        check('banner keeps a page heading for screen readers', await page.locator('h1.visually-hidden').count() == 1)
        ann = page.locator('.announce a')
        check('webinar strip under the menu links straight to the registration form', await ann.count() == 1 and await ann.get_attribute('href') == '/majesty-method/webinars#register-form')
        await ann.click(); await page.wait_for_url('**/majesty-method/webinars#register-form'); await page.wait_for_timeout(1500)
        box = await page.locator('#register-form').bounding_box()
        check('clicking the strip lands on the registration form, below the menu', box is not None and 90 <= box['y'] <= 300, str(box))
        await page.goto(BASE + '/majesty-method')
        check('webinar strip is thin', (await page.locator('.announce').bounding_box())['height'] <= 36)
        await page.goto(BASE + '/tenderiq')
        check('webinar strip not shown on TenderIQ', await page.locator('.announce').count() == 0)
        await page.goto(BASE + '/majesty-method')
        bg = await page.evaluate("[getComputedStyle(document.querySelector('.site-header')).backgroundColor, getComputedStyle(document.querySelector('.mm-hero')).backgroundColor, getComputedStyle(document.body, '::before').backgroundImage]")
        check('page background stays white marble (header white, sections transparent, texture present)', bg[0].startswith('rgba(255, 255, 255') and bg[1] == 'rgba(0, 0, 0, 0)' and 'white-marble' in bg[2], str(bg))

        # All internal links resolve
        hrefs = set()
        for path in PAGES:
            await page.goto(BASE + path)
            for h in await page.eval_on_selector_all('a[href]', 'els => els.map(e => e.getAttribute("href"))'):
                if h.startswith('/') and not h.startswith('//'):
                    hrefs.add(h.split('#')[0] or path)
        bad = []
        for h in sorted(hrefs):
            r = await page.request.get(BASE + h, max_redirects=0)
            if r.status >= 400: bad.append(f'{h}={r.status}')
        check(f'all {len(hrefs)} internal links resolve', not bad, ', '.join(bad))
        # In-page anchors exist
        for path, anchor in [('/majesty-method', 'philosophy'), ('/majesty-method', 'paths'), ('/tenderiq', 'why'), ('/tenderiq', 'how-it-works'), ('/tenderiq', 'register'), ('/majesty-method/bootcamp', 'register')]:
            await page.goto(BASE + path)
            check(f'anchor #{anchor} exists on {path}', await page.locator(f'#{anchor}').count() == 1)


        # ---------------------------------------------------------------- Refinement brief checks
        await page.goto(BASE + '/majesty-method')
        ff = await page.evaluate("getComputedStyle(document.querySelector('h1')).fontFamily")
        check('Poppins used for headings', ff.startswith('Poppins') or ff.startswith('"Poppins"'), ff)
        await page.goto(BASE + '/majesty-method')
        body = await page.locator('main').inner_text()
        check('MM home: banner photo describes the founder', 'Adelade Nyarirangwe' in (await page.locator('.mm-banner__photo').get_attribute('alt')))
        check('MM home: arch and transformation section removed', await page.locator('.arch').count() == 0 and 'From activity to a marketing system' not in body)
        bg = await page.evaluate("getComputedStyle(document.body, '::before').backgroundImage")
        check('white marble background applied site-wide', 'white-marble' in bg, bg)
        await page.goto(BASE + '/majesty-method/bootcamp')
        body = await page.locator('main').inner_text()
        check('bootcamp: How to Get Started with 3 steps', 'How to Get Started' in body and await page.locator('.steps3 > li').count() == 3)
        check('bootcamp: removed sections and no price', 'Who it isn’t for' not in body and 'What you’ll work through' not in body and 'CONFIRM' not in body and 'What does it cost' not in body)
        await page.goto(BASE + '/majesty-method/acceleration')
        check('acceleration: photo + dark green highlighted block', await page.locator('.split-hero__media img').count() == 1 and await page.locator('.block--emerald').count() >= 1)
        await page.goto(BASE + '/tenderiq')
        check('TenderIQ: 7 purple problem blocks + 7 charcoal outcome blocks', await page.locator('.tiles--purple .tile').count() == 7 and await page.locator('.tiles--charcoal .tile').count() == 7)
        ta = await page.evaluate("getComputedStyle(document.querySelector('#problem-title')).textAlign")
        check('TenderIQ: problem heading centred', ta == 'center', ta)
        check('TenderIQ: disclaimer + trust in purple blocks', await page.locator('.scenario__label.block--purple').count() == 1 and await page.locator('#trust-title').evaluate("e => e.closest('.block--purple') !== null"))
        check('TenderIQ: exactly three industry slots', await page.locator('.industry').count() == 3)
        bg = await page.evaluate("getComputedStyle(document.querySelector('.tiles--purple .tile')).borderRadius")
        check('blocks have rounded corners', bg not in ('0px', ''), bg)
        for path in ['/', '/majesty-method', '/majesty-method/bootcamp', '/tenderiq', '/majesty-method/acceleration']:
            await page.goto(BASE + path)
            lds = await page.eval_on_selector_all('script[type="application/ld+json"]', 'els => els.map(e => e.textContent)')
            ok_json = all(json.loads(x) is not None for x in lds)
            h1 = await page.locator('h1').count()
            check(f'{path}: one H1 and valid JSON-LD', h1 == 1 and ok_json and len(lds) >= 1, f'h1={h1} ld={len(lds)}')
        r = await page.request.get(BASE + '/llms.txt')
        check('llms.txt served', r.ok and 'TenderIQ' in await r.text())

        # ---------------------------------------------------------------- Typeform registration forms
        for path, fid, title in [('/majesty-method/bootcamp', 'TAsDQ7fO', 'Founder Marketing Bootcamp registration form'),
                                 ('/majesty-method/webinars', 'gioQxZnS', 'Founder Marketing Sessions registration form'),
                                 ('/tenderiq', 'CqUfKtSO', 'TenderIQ registration form')]:
            await page.goto(BASE + path)
            fr = page.locator(f'iframe[src*="form.typeform.com/to/{fid}"]')
            await fr.first.wait_for(timeout=10000)
            check(f'{path}: Typeform {fid} embedded with a descriptive title', await fr.count() == 1 and await fr.get_attribute('title') == title)
            check(f'{path}: Typeform is tall enough to use', (await fr.bounding_box())['height'] >= 500)
            check(f'{path}: link to open the Typeform in a new tab', await page.locator(f'a[href="https://form.typeform.com/to/{fid}"]').count() == 1)
            check(f'{path}: built-in registration form replaced', await page.locator('form.form').count() == 0)
        csp = (await page.request.get(BASE + '/majesty-method/bootcamp')).headers.get('content-security-policy', '')
        check('CSP allows Typeform script and frame only where needed', 'https://embed.typeform.com' in csp and 'frame-src https://form.typeform.com' in csp)
        priv = await (await page.request.get(BASE + '/legal/privacy')).text()
        check('privacy notice names Typeform for all three registration forms', 'Bootcamp, Friday session and TenderIQ registration forms are provided by Typeform' in priv)

        # Built-in form is still available as the fallback when no Typeform link is set
        set_typeform('bootcamp', ''); set_typeform('webinars_page', ''); set_typeform('tenderiq', '')

        # ---------------------------------------------------------------- Bootcamp form (built-in fallback)
        await page.goto(BASE + '/majesty-method/bootcamp')
        form = page.locator('form.form').first
        await page.wait_for_timeout(2700)
        await form.locator('button[type=submit]').click()
        await page.wait_for_selector('.alert')
        n_err = await form.locator('[aria-invalid=true]').count()
        check('bootcamp: empty submit shows errors on required fields', n_err >= 8, f'invalid={n_err}')
        check('bootcamp: error summary focused', await page.evaluate('document.activeElement.getAttribute("aria-live") === "assertive"'))
        before = db().execute("select count(*) from submissions where form_key='bootcamp'").fetchone()[0]
        await form.get_by_label('Name and surname', exact=False).fill('Thandi Test')
        await form.get_by_label('Email address (required)', exact=True).fill('thandi.test@example.com')
        await form.get_by_label('Phone number (WhatsApp)', exact=False).fill('082 555 0101')
        await form.get_by_label('Business name and description', exact=False).fill('Test Bakery — artisanal bread in Soweto')
        fs = form.locator('fieldset')
        await fs.nth(0).get_by_role('radio', name='Yes', exact=True).check()
        await fs.nth(1).get_by_role('radio', name='2 - 4 employees', exact=True).check()
        await fs.nth(2).get_by_role('radio', name='Yes', exact=True).check()
        await fs.nth(3).get_by_role('radio', name='Me', exact=True).check()
        await form.get_by_label('Employee’s email address', exact=False).fill('not-an-email')
        await form.get_by_label('I have read the privacy notice').check()
        await page.wait_for_timeout(500)
        await form.locator('button[type=submit]').click()
        await page.wait_for_selector('.alert')
        check('bootcamp: invalid optional email rejected client-side', await form.locator('[aria-invalid=true]').count() == 1)
        await form.get_by_label('Employee’s email address', exact=False).fill('')
        await form.locator('button[type=submit]').click()
        await page.wait_for_selector('.form-success', timeout=15000)
        check('bootcamp: success message shown', 'registration has been received' in (await page.locator('.form-success').inner_text()).lower())
        row = db().execute("select data, marketing_consent, sheets_status, privacy_ack_at from submissions where form_key='bootcamp' order by created_at desc limit 1").fetchone()
        after = db().execute("select count(*) from submissions where form_key='bootcamp'").fetchone()[0]
        d = json.loads(row[0])
        check('bootcamp: stored once in database', after == before + 1)
        check('bootcamp: values preserved (phone with leading 0)', d['phone'] == '082 555 0101' and d['employees'] == '2 - 4 employees')
        check('bootcamp: marketing consent not set when unticked', row[1] == 0)
        check('bootcamp: privacy acknowledgement recorded', bool(row[3]))
        time.sleep(1.5)
        status = db().execute("select sheets_status, sheets_error from submissions where form_key='bootcamp' order by created_at desc limit 1").fetchone()
        if MOCK_SHEET:
            check('bootcamp: synced to Google Sheets (mock)', status[0] == 'synced', str(status))
            rows = json.loads(Path(MOCK_SHEET).read_text())
            last = rows[-1]
            check('sheets: mapped to exact existing columns', last['NAME AND SURNAME'] == 'Thandi Test' and last['PHONE NUMBER (WHATSAPP)'] == '082 555 0101'
                  and last['Email address'] == 'thandi.test@example.com' and last['HOW MANY EMPLOYEES DOES YOUR BUSINESS HAVE'] == '2 - 4 employees'
                  and last['Who is currently doing your marketing?'] == 'Me' and last['Timestamp'], json.dumps(last))
        else:
            check('bootcamp: sheets status honest when not configured', status[0] == 'not_configured', str(status))

        # Duplicate / idempotency via API
        token = await page.evaluate("""async () => { const r = await fetch('/majesty-method/bootcamp'); return r.ok }""")
        html = await (await page.request.get(BASE + '/contact')).text()
        import re
        rt = json.loads('"' + re.search(r'renderToken\\?":\\?"([^"\\]+)', html).group(1) + '"')
        time.sleep(2.7)
        key = str(uuid.uuid4())
        payload = {'values': {'name': 'Dup Test', 'email': 'dup@example.com', 'enquiryType': 'General enquiry', 'message': 'Hello'}, 'idempotencyKey': key, 'renderToken': rt, 'privacyAck': True}
        hdr = {'Content-Type': 'application/json', 'Origin': BASE}
        r1 = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(payload), headers=hdr)
        r2 = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(payload), headers=hdr)
        cnt = db().execute("select count(*) from submissions where idempotency_key=?", (key,)).fetchone()[0]
        check('duplicate submission stored once, both get success', r1.ok and r2.ok and (await r2.json()).get('duplicate') and cnt == 1)
        # Server-side validation
        bad = dict(payload, idempotencyKey=str(uuid.uuid4()), values={'name': '', 'email': 'nope', 'enquiryType': 'Hacking', 'message': ''})
        r = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(bad), headers=hdr)
        j = await r.json()
        check('server rejects invalid data (422 with field errors)', r.status == 422 and {'name', 'email', 'enquiryType', 'message'} <= set(j.get('errors', {})), str(j))
        r = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(dict(payload, idempotencyKey=str(uuid.uuid4()), privacyAck=False)), headers=hdr)
        check('server requires privacy acknowledgement', r.status == 422)
        r = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(dict(payload, idempotencyKey=str(uuid.uuid4()))), headers={'Content-Type': 'application/json', 'Origin': 'https://evil.example'})
        check('cross-site form POST blocked (403)', r.status == 403)
        r = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(dict(payload, idempotencyKey=str(uuid.uuid4()), renderToken='forged.123.abc')), headers=hdr)
        check('forged form token rejected', r.status == 400)
        k = str(uuid.uuid4())
        r = await page.request.post(BASE + '/api/forms/contact', data=json.dumps(dict(payload, idempotencyKey=k, hp='http://spam')), headers=hdr)
        check('honeypot submissions not stored', r.ok and db().execute("select count(*) from submissions where idempotency_key=?", (k,)).fetchone()[0] == 0)

        # TenderIQ, Acceleration, Contact via UI
        await page.goto(BASE + '/tenderiq')
        f = await fill_form(page, {'Full name': 'Sipho Tender', 'Business name': 'Sipho Electrical', 'Business email': 'sipho@example.co.za', 'Contact number': '+27 11 555 0199',
                                   'Your province': ('select', 'Limpopo'), 'Sector or industry': 'Electrical contracting'}, '#register form.form')
        await f.get_by_role('radio', name='We tender regularly').check()
        await f.get_by_label('I have read the privacy notice').check()
        await f.get_by_label('TenderIQ product updates', exact=False).check()
        await submit_and_wait(page, f)
        check('tenderiq: registration success', await page.locator('.form-success').count() == 1)
        row = db().execute("select data, marketing_consent, source_page from submissions where form_key='tenderiq' order by created_at desc limit 1").fetchone()
        cons = db().execute("select wording, wording_version, granted_at from marketing_consents where email='sipho@example.co.za'").fetchone()
        check('tenderiq: marketing consent recorded with wording, version and time', row[1] == 1 and cons and 'TenderIQ' in cons[0] and cons[1] and cons[2], str(cons))
        check('tenderiq: source page recorded', row[2] == '/tenderiq')

        await page.goto(BASE + '/majesty-method/acceleration')
        f = await fill_form(page, {'Business name': 'Acme Logistics', 'Contact person': 'Lerato M', 'Work email': 'lerato@acme.example', 'Telephone': '011 555 0123',
                                   'Business website': 'acme.example', 'What are your current marketing needs?': 'Lead generation support'}, '#enquire form.form')
        await f.get_by_label('I have read the privacy notice').check()
        await submit_and_wait(page, f)
        txt = await page.locator('.form-success').inner_text()
        check('acceleration: success without claiming a meeting is booked', 'No meeting has been booked' in txt, txt)
        d = json.loads(db().execute("select data from submissions where form_key='acceleration' order by created_at desc limit 1").fetchone()[0])
        check('acceleration: website normalised to https URL', d['website'] == 'https://acme.example')

        await page.goto(BASE + '/contact?type=privacy')
        sel = await page.get_by_label('What is your enquiry about?').input_value()
        check('contact: privacy request pre-selected from link', sel == 'Privacy or data request')
        await page.goto(BASE + '/contact?brand=tenderiq')
        check('contact: TenderIQ chrome + preselect', await page.locator('[data-brand=tenderiq]').count() == 1 and await page.get_by_label('What is your enquiry about?').input_value() == 'TenderIQ')

        # Rate limiting
        statuses = []
        for _ in range(10):
            r = await page.request.post(BASE + '/api/forms/acceleration', data='{}', headers=hdr)
            statuses.append(r.status)
        check('form endpoint rate-limits bursts (429)', 429 in statuses, str(statuses))

        # ---------------------------------------------------------------- Admin
        actx = await browser.new_context()
        ap = await actx.new_page()
        r = await ap.goto(BASE + '/admin')
        check('admin redirects to login when signed out', '/admin/login' in ap.url)
        r = await ap.request.get(BASE + '/api/admin/submissions')
        check('admin API returns 401 when signed out', r.status == 401)
        await ap.get_by_label('Email').fill(OWNER[0]); await ap.get_by_label('Password').fill('wrong-password-123')
        await ap.get_by_role('button', name='Sign in').click()
        await ap.wait_for_selector('.adm-msg--err')
        check('admin: wrong password rejected', True)
        await ap.get_by_label('Password').fill(OWNER[1])
        await ap.get_by_role('button', name='Sign in').click()
        await ap.wait_for_url(BASE + '/admin')
        await ap.wait_for_selector('text=Before launch')
        check('admin: owner signs in and sees launch checklist', True)
        cookie = [c for c in await actx.cookies() if c['name'] == 'mm_session'][0]
        check('session cookie is HttpOnly + SameSite=Strict', cookie['httpOnly'] and cookie['sameSite'] == 'Strict')
        ph = await ap.locator('text=Placeholders still published').inner_text()
        check('dashboard lists published placeholders', '(0)' not in ph, ph)
        await ap.screenshot(path=str(SHOTS / 'admin-dashboard.png'), full_page=True)

        # Edit → draft not public → preview → publish → public
        await ap.goto(BASE + '/admin/content/entry')
        await ap.wait_for_selector('#f-headline')
        await ap.fill('#f-headline', 'E2E draft headline')
        await ap.get_by_role('button', name='Save draft').click()
        await ap.wait_for_selector('text=Draft saved')
        pub = await (await page.request.get(BASE + '/')).text()
        check('saved draft is NOT visible to visitors', 'E2E draft headline' not in pub)
        await ap.goto(BASE + '/api/admin/preview?to=/')
        check('preview shows draft to signed-in editor', 'E2E draft headline' in await ap.content() and await ap.locator('.preview-bar').count() == 1)
        await ap.goto(BASE + '/api/admin/preview?off=1&to=/admin')
        await ap.goto(BASE + '/admin/content/entry')
        await ap.wait_for_selector('#f-headline')
        await ap.get_by_role('button', name='Publish').click()
        await ap.wait_for_selector('text=Published. The live page')
        pub = await (await page.request.get(BASE + '/')).text()
        check('published change is live after refresh', 'E2E draft headline' in pub)
        await ap.screenshot(path=str(SHOTS / 'admin-editor.png'))
        await ap.fill('#f-headline', 'Welcome to Majesty Method')
        await ap.get_by_role('button', name='Publish').click()
        await ap.wait_for_selector('text=Published. The live page')

        # Content sanitisation: javascript: href dropped
        r = await ap.request.get(BASE + '/api/admin/content/mm_home')
        doc = (await r.json())['data']
        doc['finalCta']['primary']['href'] = 'javascript:alert(1)'
        r = await ap.request.put(BASE + '/api/admin/content/mm_home', data=json.dumps({'data': doc}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        doc2 = (await (await ap.request.get(BASE + '/api/admin/content/mm_home')).json())['data']
        check('javascript: links stripped from content', doc2['finalCta']['primary']['href'] == '')
        await ap.request.post(BASE + '/api/admin/content/mm_home', data=json.dumps({'action': 'discard'}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        r = await ap.request.put(BASE + '/api/admin/content/mm_home', data=json.dumps({'data': doc}), headers={'Content-Type': 'application/json', 'Origin': 'https://evil.example'})
        check('admin API blocks cross-site writes (403)', r.status == 403)

        # Webinar: create, publish, register
        from datetime import datetime, timedelta, timezone
        start = (datetime.now(timezone(timedelta(hours=2))) + timedelta(days=6)).strftime('%Y-%m-%dT10:00')
        wb = {'title': 'E2E: Content that converts', 'topic': 'Marketing', 'description': 'Test session', 'startsAt': start, 'durationMinutes': 60, 'delivery': 'Online via Zoom',
              'registrationMode': 'internal', 'registrationUrl': '', 'meetingInstructions': 'Join at https://zoom.example/j/123', 'recordingUrl': ''}
        r = await ap.request.post(BASE + '/api/admin/items/webinars', data=json.dumps({'data': wb, 'status': 'draft', 'sort': 0}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        wid = (await r.json())['id']
        check('draft webinar hidden from public', 'E2E: Content that converts' not in await (await page.request.get(BASE + '/majesty-method/webinars')).text())
        await ap.request.put(BASE + f'/api/admin/item/{wid}', data=json.dumps({'data': wb, 'status': 'published', 'sort': 0}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        await page.goto(BASE + '/majesty-method/webinars')
        check('published webinar listed with SAST time', await page.locator('text=E2E: Content that converts').count() == 1 and await page.locator('text=10:00 SAST').count() >= 1)
        await page.get_by_text('Register for this session').click()
        f = page.locator(f'#webinar-{wid} form.form')
        await f.get_by_label('Full name').fill('Webinar Person'); await f.get_by_label('Email address').fill('webinar@example.com')
        await f.get_by_label('I have read the privacy notice').check()
        await page.wait_for_timeout(2700)
        await f.locator('button[type=submit]').click()
        await page.wait_for_selector('.form-success')
        check('webinar registration shows joining instructions', 'zoom.example' in await page.locator('.form-success').inner_text())
        ctxrow = json.loads(db().execute("select context from submissions where form_key='webinar' order by created_at desc limit 1").fetchone()[0])
        check('webinar registration linked to the session', ctxrow.get('webinarId') == wid)
        await ap.request.delete(BASE + f'/api/admin/item/{wid}', headers={'Origin': BASE})
        set_typeform('bootcamp', 'https://form.typeform.com/to/TAsDQ7fO'); set_typeform('webinars_page', 'https://form.typeform.com/to/gioQxZnS'); set_typeform('tenderiq', 'https://form.typeform.com/to/CqUfKtSO')

        # Gated resource
        pdf = b'%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'
        r = await ap.request.post(BASE + '/api/admin/files', multipart={'file': {'name': 'checklist.pdf', 'mimeType': 'application/pdf', 'buffer': pdf}}, headers={'Origin': BASE})
        fid = (await r.json())['file']['id']
        check('private file not reachable at a public path', (await page.request.get(BASE + f'/private/{fid}.pdf')).status == 404 and (await page.request.get(BASE + f'/media/{fid}.pdf')).status == 404)
        res = {'title': 'E2E Launch checklist', 'type': 'Checklist', 'description': 'Test', 'thumbnail': None, 'file': {'id': fid, 'name': 'checklist.pdf'}, 'externalUrl': '', 'requiresRegistration': True}
        r = await ap.request.post(BASE + '/api/admin/items/resources', data=json.dumps({'data': res, 'status': 'published', 'sort': 0}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        rid = (await r.json())['id']
        r = await page.request.get(BASE + f'/api/resources/{rid}/download', max_redirects=0)
        check('gated download refused without registration', r.status in (303, 307))
        await page.goto(BASE + '/majesty-method/resources')
        await page.get_by_text('Get this checklist').click()
        f = page.locator('form.form').first
        await f.get_by_label('Full name').fill('Resource Person'); await f.get_by_label('Email address').fill('res@example.com')
        await f.get_by_label('I have read the privacy notice').check()
        await page.wait_for_timeout(2700)
        await f.locator('button[type=submit]').click()
        await page.wait_for_selector('.form-success a.btn')
        href = await page.locator('.form-success a.btn').get_attribute('href')
        r = await page.request.get(BASE + href)
        check('download works with signed link after registration', r.ok and (await r.body()).startswith(b'%PDF') and 'attachment' in r.headers.get('content-disposition', ''))
        r = await page.request.get(BASE + href.replace(rid, str(uuid.uuid4())), max_redirects=0)
        check('signed link can’t be reused for another resource', r.status in (303, 307, 404))
        await ap.request.delete(BASE + f'/api/admin/item/{rid}', headers={'Origin': BASE})

        # Editor role restrictions
        ectx = await browser.new_context()
        ep = await ectx.new_page()
        await ep.goto(BASE + '/admin/login')
        await ep.get_by_label('Email').fill(EDITOR[0]); await ep.get_by_label('Password').fill(EDITOR[1])
        await ep.get_by_role('button', name='Sign in').click()
        await ep.wait_for_url(BASE + '/admin')
        r1 = await ep.request.get(BASE + '/api/admin/submissions')
        r2 = await ep.request.get(BASE + '/api/admin/content/settings')
        r3 = await ep.request.get(BASE + '/api/admin/content/bootcamp')
        check('editor cannot read submissions or settings, can edit pages', r1.status == 403 and r2.status == 403 and r3.ok)

        # Submissions export: formula injection neutralised
        r = await ap.request.get(BASE + '/api/admin/submissions/export?form=contact')
        check('CSV export works', r.ok and 'text/csv' in r.headers['content-type'])

        # ---------------------------------------------------------------- Cookie consent
        c2 = await browser.new_context(); cp = await c2.new_page()
        await cp.goto(BASE + '/majesty-method')
        check('no cookie banner while no optional cookies are used', await cp.locator('.consent-banner').count() == 0)
        await cp.get_by_role('button', name='Cookie settings').first.click()
        check('cookie settings dialog opens and explains essential-only use', 'does not currently use analytics' in await cp.locator('dialog.consent-dialog').inner_text())
        await cp.keyboard.press('Escape')
        s = (await (await ap.request.get(BASE + '/api/admin/content/settings')).json())['data']
        s['analytics'] = {'provider': 'ga4', 'ga4Id': 'G-TEST12345'}
        await ap.request.put(BASE + '/api/admin/content/settings', data=json.dumps({'data': s}), headers={'Content-Type': 'application/json', 'Origin': BASE})
        c3 = await browser.new_context(); cp = await c3.new_page()
        ga_requests = []
        cp.on('request', lambda req: ga_requests.append(req.url) if 'googletagmanager' in req.url else None)
        await cp.route('**/*googletagmanager*/**', lambda route: route.fulfill(status=200, body='/* stub */'))
        await cp.goto(BASE + '/majesty-method', wait_until='networkidle')
        check('GA configured: banner shown, nothing loaded before consent', await cp.locator('.consent-banner').count() == 1 and not ga_requests)
        await cp.get_by_role('button', name='Reject analytics').click()
        await cp.reload(wait_until='networkidle')
        check('after reject: no banner, analytics never loads', await cp.locator('.consent-banner').count() == 0 and not ga_requests)
        c4 = await browser.new_context(); cp = await c4.new_page()
        await cp.route('**/*googletagmanager*/**', lambda route: route.fulfill(status=200, body='/* stub */'))
        await cp.goto(BASE + '/majesty-method', wait_until='networkidle')
        await cp.get_by_role('button', name='Accept analytics').click()
        await cp.wait_for_timeout(500)
        check('after accept: analytics script loads', await cp.locator('script[src*="googletagmanager"]').count() == 1)
        await cp.goto(BASE + '/legal/cookies')
        check('cookie policy table lists GA only when configured', await cp.locator('text=Google Analytics').count() >= 1)
        s['analytics'] = {'provider': 'none', 'ga4Id': ''}
        await ap.request.put(BASE + '/api/admin/content/settings', data=json.dumps({'data': s}), headers={'Content-Type': 'application/json', 'Origin': BASE})

        # ---------------------------------------------------------------- Unsubscribe
        consents = (await (await ap.request.get(BASE + '/api/admin/consents')).json())['items']
        link = [c for c in consents if c['email'] == 'sipho@example.co.za'][0]['unsubscribeUrl']
        path = link[link.index('/unsubscribe'):]
        await page.goto(BASE + path)
        await page.get_by_role('button', name='Unsubscribe').click()
        await page.wait_for_url('**done=1')
        w = db().execute("select withdrawn_at from marketing_consents where email='sipho@example.co.za'").fetchone()[0]
        check('unsubscribe link withdraws consent', bool(w))
        await page.goto(BASE + '/unsubscribe?e=sipho@example.co.za&t=forged')
        check('forged unsubscribe link rejected', await page.locator('text=isn’t valid').count() == 1)

        # ---------------------------------------------------------------- Security headers & SEO
        r = await page.request.get(BASE + '/')
        h = r.headers
        check('security headers present', 'content-security-policy' in h and h.get('x-frame-options') == 'DENY' and h.get('x-content-type-options') == 'nosniff')
        html = await r.text()
        check('canonical + OG + description on entry', 'rel="canonical"' in html and 'og:title' in html and 'name="description"' in html)
        sm = await (await page.request.get(BASE + '/sitemap.xml')).text()
        check('sitemap lists both brands', '/majesty-method' in sm and '/tenderiq' in sm)
        rb = await (await page.request.get(BASE + '/robots.txt')).text()
        check('robots disallows admin & api', 'Disallow: /admin' in rb and 'Disallow: /api/' in rb)
        bundle_secret = False
        for path in ['/', '/majesty-method/bootcamp', '/admin/login']:
            body = await (await page.request.get(BASE + path)).text()
            if any(s in body for s in ['SHEETS_WEBHOOK_SECRET', 'test-secret', 'APP_SECRET', 'SMTP_PASS', 'sheetColumn']):
                bundle_secret = True
        check('no secrets or internal mapping in page HTML', not bundle_secret)

        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} checks passed')
    Path('/tmp/claude-0/e2e-results.json').write_text(json.dumps(results, indent=1))
    sys.exit(1 if failed else 0)

asyncio.run(main())
