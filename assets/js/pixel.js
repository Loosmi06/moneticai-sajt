/* ==========================================================
   Meta Pixel + baner za saglasnost (kolačići za reklame)
   ----------------------------------------------------------
   Pixel se učitava TEK kad posetilac klikne "Prihvatam".
   Izbor se pamti u pregledaču (localStorage, ključ "mai_consent").
   Ponovno otvaranje banera: bilo koji element sa
   atributom data-cookie-settings (link "Kolačići" u footeru).

   Događaji koje šaljemo:
   - PageView: svaka stranica
   - Lead:     prijava na besplatan vodič / newsletter (main.js)
   - Contact:  poslata kontakt forma (main.js)
   Iz drugog koda: window.maiTrack('Lead', { content_name: '...' })
   ========================================================== */
(function () {
  var PIXEL_ID = '1405581508328742';
  var KEY = 'mai_consent';
  var loaded = false;

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function loadPixel() {
    if (loaded || !PIXEL_ID) return;
    loaded = true;
    /* Zvanični Meta Pixel base code */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function clearMetaCookies() {
    ['_fbp', '_fbc'].forEach(function (name) {
      var host = location.hostname.replace(/^www\./, '');
      document.cookie = name + '=; Max-Age=0; path=/';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host;
    });
  }

  /* Javna funkcija za slanje događaja (radi samo uz saglasnost) */
  window.maiTrack = function (event, params) {
    if (loaded && window.fbq) window.fbq('track', event, params || {});
  };

  /* ---------- Baner ---------- */
  var css =
    '.mai-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
    'background:#121218;color:#F4F4F7;border:1px solid rgba(255,255,255,.16);border-radius:16px;' +
    'padding:18px 20px;font:14px/1.55 Poppins,system-ui,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.5);' +
    'transform:translateY(20px);opacity:0;transition:transform .3s ease,opacity .3s ease}' +
    '.mai-cookie.is-on{transform:none;opacity:1}' +
    '.mai-cookie p{margin:0 0 14px;color:#C9C9D3}' +
    '.mai-cookie b{color:#F4F4F7;font-weight:600}' +
    '.mai-cookie a{color:inherit;text-decoration:underline}' +
    '.mai-cookie__btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '.mai-cookie button{flex:1 1 140px;cursor:pointer;border-radius:999px;padding:11px 18px;' +
    'font:600 14px Poppins,system-ui,sans-serif;border:1px solid rgba(255,255,255,.16);' +
    'background:rgba(255,255,255,.06);color:#F4F4F7;transition:background .2s}' +
    '.mai-cookie button:hover{background:rgba(255,255,255,.12)}' +
    '.mai-cookie .mai-cookie__yes{background:#FF5733;border-color:#FF5733;color:#fff}' +
    '.mai-cookie .mai-cookie__yes:hover{background:#ff6a4a}' +
    '@media (prefers-reduced-motion:reduce){.mai-cookie{transition:none}}';

  var banner = null;

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-on');
    var b = banner;
    banner = null;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 300);
  }

  function showBanner() {
    if (banner || !PIXEL_ID) return;
    if (!document.getElementById('mai-cookie-css')) {
      var st = document.createElement('style');
      st.id = 'mai-cookie-css';
      st.textContent = css;
      document.head.appendChild(st);
    }
    banner = document.createElement('div');
    banner.className = 'mai-cookie';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Podešavanje kolačića');
    banner.innerHTML =
      '<p><b>Kolačići 🍪</b><br>Uz tvoj pristanak koristimo Meta Pixel da merimo uspeh naših reklama na ' +
      'Instagramu i Facebooku. Bez pristanka sajt radi potpuno isto. ' +
      '<a href="/politika-privatnosti#kolacici">Saznaj više</a></p>' +
      '<div class="mai-cookie__btns">' +
      '<button type="button" class="mai-cookie__no">Odbij</button>' +
      '<button type="button" class="mai-cookie__yes">Prihvatam</button>' +
      '</div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (banner) banner.classList.add('is-on');
    }); });

    banner.querySelector('.mai-cookie__yes').addEventListener('click', function () {
      setChoice('granted');
      hideBanner();
      loadPixel();
    });
    banner.querySelector('.mai-cookie__no').addEventListener('click', function () {
      var wasLoaded = loaded;
      setChoice('denied');
      clearMetaCookies();
      hideBanner();
      if (wasLoaded) location.reload(); // Pixel je već bio učitan, osveži da se ugasi
    });
  }

  function init() {
    var choice = getChoice();
    if (choice === 'granted') loadPixel();
    else if (choice !== 'denied') showBanner();

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
