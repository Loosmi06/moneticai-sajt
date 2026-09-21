/* =========================================================
   MonetIC AI — main.js
   Navigacija, animacije, filteri, FAQ, forme
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Mobilni meni ---------- */
  var burger = document.querySelector('.nav__burger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- 2. Nav pri skrolovanju ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Reveal animacije ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.delay || 0;
          setTimeout(function () { entry.target.classList.add('is-in'); }, delay * 1);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 4. FAQ akordeon ---------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var answer = item.querySelector('.faq__a');
      var isOpen = item.classList.contains('is-open');

      var parent = item.parentElement;
      parent.querySelectorAll('.faq__item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq__a').style.maxHeight = null;
          other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ---------- 5. Filteri (shop + vesti) ---------- */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var targetSel = group.dataset.filterTarget;
    var items = document.querySelectorAll(targetSel + ' [data-cat]');
    var empty = document.querySelector(group.dataset.filterEmpty || '#nema-rezultata');

    group.querySelectorAll('.filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var cat = btn.dataset.cat;
        var visible = 0;

        items.forEach(function (item) {
          var match = cat === 'sve' || item.dataset.cat.split(' ').includes(cat);
          item.style.display = match ? '' : 'none';
          if (match) {
            visible++;
            item.classList.remove('is-in');
            requestAnimationFrame(function () { item.classList.add('is-in'); });
          }
        });
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
      });
    });
  });

  /* ---------- 5b. Filter iz URL-a (npr. shop.html#kursevi) ---------- */
  function applyHashFilter() {
    if (!location.hash || location.hash.length < 2) return;
    var hashBtn = document.querySelector('.filter' + location.hash);
    if (!hashBtn) return;
    hashBtn.click();
    setTimeout(function () {
      var grp = hashBtn.closest('[data-filter-group]');
      if (grp) {
        var top = grp.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }, 120);
  }
  applyHashFilter();
  window.addEventListener('hashchange', applyHashFilter);

  /* ---------- 6. Supabase klijent (deljen za kontakt formu i newsletter) ----------
     Podešavanje: assets/js/supabase-config.js postavlja
     window.SUPABASE_URL i window.SUPABASE_ANON_KEY sa tvog Supabase
     projekta. Ako ti vrednosti fale (još nisi podesio nalog), forme
     automatski padaju nazad na stari način rada, tako da sajt radi i
     pre nego što podesiš bazu. */
  var supabaseClient = (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY
    && window.SUPABASE_URL.indexOf('TVOJ-PROJEKAT') === -1)
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

  /* ---------- 6b. Kontakt forma (čuva poruke u Supabase tabeli "poruke") ---------- */
  var form = document.querySelector('#kontakt-forma');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll('[data-required]').forEach(function (input) {
        var field = input.closest('.field');
        var value = input.value.trim();
        var ok = value.length > 0;

        if (ok && input.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        }
        if (ok && input.tagName === 'TEXTAREA') {
          ok = value.length >= 10;
        }
        field.classList.toggle('has-error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) return;

      var ime = (form.querySelector('#ime') || {}).value || '';
      var email = (form.querySelector('#email') || {}).value || '';
      var tema = (form.querySelector('#tema') || {}).value || '';
      var poruka = (form.querySelector('#poruka') || {}).value || '';

      var ok = form.querySelector('.form__ok')
            || (form.parentElement && form.parentElement.querySelector('.form__ok'))
            || document.querySelector('.form__ok');
      var submitBtn = form.querySelector('button[type="submit"]');

      function showSuccess() {
        if (ok) {
          ok.classList.add('is-visible');
          ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        form.reset();
      }

      // Fallback: ako Supabase nije podešen, otvori mejl klijent kao ranije
      if (!supabaseClient) {
        var adresa = form.dataset.mailto || 'kontakt@moneticai.rs';
        var subject = encodeURIComponent('MonetIC AI — ' + tema + ' (' + ime + ')');
        var body = encodeURIComponent(
          'Ime: ' + ime + '\nEmail: ' + email + '\nTema: ' + tema + '\n\nPoruka:\n' + poruka
        );
        showSuccess();
        setTimeout(function () {
          var a = document.createElement('a');
          a.href = 'mailto:' + adresa + '?subject=' + subject + '&body=' + body;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { document.body.removeChild(a); }, 500);
        }, 350);
        return;
      }

      // Glavni put: upis poruke u Supabase tabelu "poruke"
      if (submitBtn) submitBtn.disabled = true;

      supabaseClient
        .from('poruke')
        .insert([{ ime: ime, email: email, tema: tema, poruka: poruka }])
        .then(function (res) {
          if (submitBtn) submitBtn.disabled = false;
          if (res && res.error) {
            alert('Nešto nije u redu, pokušaj ponovo ili piši direktno na ' + (form.dataset.mailto || 'kontakt@moneticai.rs') + '.');
            return;
          }
          showSuccess();
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          alert('Nešto nije u redu, pokušaj ponovo ili piši direktno na ' + (form.dataset.mailto || 'kontakt@moneticai.rs') + '.');
        });
    });

    form.querySelectorAll('[data-required]').forEach(function (input) {
      input.addEventListener('input', function () {
        input.closest('.field').classList.remove('has-error');
      });
    });
  }

  /* ---------- 7. Newsletter forme ("Ostani u toku") — čuva email u Supabase tabeli "mailovi" ---------- */
  document.querySelectorAll('[data-newsletter]').forEach(function (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input[type="email"]');
      var msg = nl.parentElement.querySelector('[data-newsletter-msg]');
      var value = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      var submitBtn = nl.querySelector('button[type="submit"]');

      if (!valid) {
        if (msg) {
          msg.textContent = 'Unesi ispravnu email adresu.';
          msg.style.color = '#FFE0DA';
          msg.style.opacity = '1';
        }
        return;
      }

      function showSuccess() {
        if (msg) {
          msg.textContent = 'Hvala! Proveri inbox — vodič stiže na ' + value + '.';
          msg.style.color = '#fff';
          msg.style.opacity = '1';
        }
        nl.reset();
      }

      // Fallback: ako Supabase nije podešen, samo prikaži poruku (kao ranije)
      if (!supabaseClient) {
        showSuccess();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      supabaseClient
        .from('mailovi')
        .insert([{ email: value }])
        .then(function (res) {
          if (submitBtn) submitBtn.disabled = false;
          // Ako email već postoji (23505 = duplikat), i dalje je uspeh za korisnika
          if (res && res.error && res.error.code !== '23505') {
            if (msg) {
              msg.textContent = 'Nešto nije u redu, pokušaj ponovo malo kasnije.';
              msg.style.color = '#FFE0DA';
              msg.style.opacity = '1';
            }
            return;
          }
          showSuccess();
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (msg) {
            msg.textContent = 'Nešto nije u redu, pokušaj ponovo malo kasnije.';
            msg.style.color = '#FFE0DA';
            msg.style.opacity = '1';
          }
        });
    });
  });

  /* ---------- 7b. MailerLite forme (e-book) ---------- */
  document.querySelectorAll('[data-mailerlite]').forEach(function (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input[type="email"]');
      var msg = nl.parentElement.querySelector('[data-newsletter-msg]');
      var value = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

      if (!valid) {
        if (msg) {
          msg.textContent = 'Unesi ispravnu email adresu.';
          msg.style.color = '#FFE0DA';
          msg.style.opacity = '1';
        }
        return;
      }

      fetch(nl.action, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(nl))
      }).catch(function () {});

      if (msg) {
        var leadMagnet = nl.getAttribute('data-lead-magnet') || 'Tvoj vodič';
        msg.textContent = 'Uspešno si se prijavio. ' + leadMagnet + ' upravo stiže na tvoj email 📩\n\nNe vidiš ga za par minuta? Proveri spam ili promocije folder, ponekad tu zna da se sakrije.';
        msg.style.color = '#fff';
        msg.style.opacity = '1';
      }
      nl.reset();
    });
  });

  /* ---------- 8. Godina u footeru ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 9. Aktivan link u navigaciji ---------- */
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__links a, .mobile-menu a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
  });
})();
