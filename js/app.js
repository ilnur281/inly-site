/* INLY — данные каталога, корзина, меню, страница товара. */
(function () {
  'use strict';

  var OZON = 'https://www.ozon.ru/seller/inly-kuche/';
  var WB = 'https://www.wildberries.ru/catalog/0/search.aspx?search=INLY%20%D0%B2%D1%8B%D0%BA%D0%BB%D1%8E%D1%87%D0%B0%D1%82%D0%B5%D0%BB%D1%8C';

  // Цены — как на Ozon (INLY Kuche) 05.11.2026. Меняются здесь.
  var PRODUCTS = [
    { id: 's1-white', type: 'sensor', line: 'Сенсорные', name: 'Сенсорный выключатель с подсветкой, 1 клавиша, белый', price: 833, color: 'white', keys: 1, badge: 'Хит' },
    { id: 's1-grey', type: 'sensor', line: 'Сенсорные', name: 'Сенсорный выключатель с подсветкой, 1 клавиша, серый', price: 833, color: 'grey', keys: 1, badge: 'Серый' },
    { id: 's1-black', type: 'sensor', line: 'Сенсорные', name: 'Сенсорный выключатель с подсветкой, 1 клавиша, чёрный', price: 833, color: 'black', keys: 1, badge: 'Хит' },
    { id: 's2-white', type: 'sensor', line: 'Сенсорные', name: 'Сенсорный выключатель с подсветкой, 2 клавиши, белый', price: 818, color: 'white', keys: 2, badge: 'Хит', photo: 'img/switch-white-2key.jpg' },
    { id: 's2-black', type: 'sensor', line: 'Сенсорные', name: 'Сенсорный выключатель с подсветкой, 2 клавиши, чёрный', price: 846, color: 'black', keys: 2, badge: 'Хит' },
    { id: 'w1-white', type: 'wifi', line: 'Сенсорные с Wi-Fi', name: 'Умный сенсорный Wi-Fi выключатель с Алисой, 1 клавиша', price: 1190, color: 'white', keys: 1, badge: 'Wi-Fi' },
    { id: 'w2-white', type: 'wifi', line: 'Сенсорные с Wi-Fi', name: 'Умный сенсорный Wi-Fi выключатель с Алисой, 2 клавиши', price: 1280, color: 'white', keys: 2, badge: 'Wi-Fi' },
    { id: 'r1-white', type: 'smart', line: 'Умные клавишные', name: 'Умный клавишный выключатель с Алисой, 1 клавиша, белый', price: 2100, color: 'white', keys: 1, badge: 'Wi-Fi', rocker: true },
    { id: 'k1-white', type: 'kinetic', line: 'Беспроводные', name: 'Кинетический выключатель: клавиша + контроллер, белый', price: 1740, color: 'white', keys: 1, badge: 'Без проводов', rocker: true },
    { id: 'k2-white', type: 'kinetic', line: 'Беспроводные', name: 'Кинетический выключатель: 2 клавиши + 2 контроллера', price: 3230, color: 'white', keys: 2, badge: 'Комплект', rocker: true },
    { id: 'kw2-white', type: 'kinetic', line: 'Беспроводные с Wi-Fi', name: 'Кинетический Wi-Fi выключатель: 2 клавиши + контроллер', price: 3300, color: 'white', keys: 2, badge: 'Wi-Fi', rocker: true }
  ];
  var COLOR_NAME = { white: 'белый', grey: 'серый', black: 'чёрный' };

  function rub(n) { return n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽'; }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var POWER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M12 3v8"/><path d="M7.5 6.5a7 7 0 1 0 9 0"/></svg>';

  function panelHtml(p, size) {
    var cls = 'panel ' + p.color + (p.keys === 1 ? ' one' : '');
    var inner;
    if (p.rocker) {
      inner = '<div class="keys">' + (p.keys === 2 ? '<span></span><span></span>' : '<span></span>') + '</div>';
    } else {
      inner = p.keys === 2 ? POWER + POWER : POWER;
    }
    return '<div class="' + cls + '" style="width:' + size + 'px;height:' + size + 'px" role="img" aria-label="' + esc(p.name) + '">' + inner + '</div>';
  }

  function cardHtml(p) {
    var img = p.photo ? '<img src="' + p.photo + '" alt="' + esc(p.name) + '" loading="lazy">' : panelHtml(p, 124);
    return '<article class="card">' +
      '<a class="card-img" href="product.html?id=' + p.id + '"><span class="badge">' + esc(p.badge) + '</span>' + img + '</a>' +
      '<span class="line">' + esc(p.line) + '</span>' +
      '<a class="name" href="product.html?id=' + p.id + '">' + esc(p.name) + '</a>' +
      '<span class="stock">✓ В наличии</span>' +
      '<div class="buy"><span class="price">' + rub(p.price) + '</span>' +
      '<button class="btn btn-green" type="button" data-add="' + p.id + '">В корзину</button></div>' +
      '</article>';
  }

  /* ---------- Корзина (хранится в браузере покупателя) ---------- */
  var CART_KEY = 'inly_cart_v1';
  function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; } }
  function setCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} renderCartCount(); }
  function cartCount() { var c = getCart(), n = 0; for (var k in c) n += c[k]; return n; }
  function addToCart(id, qty) { var c = getCart(); c[id] = (c[id] || 0) + (qty || 1); setCart(c); }
  function renderCartCount() {
    var n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    addToCart(b.getAttribute('data-add'), 1);
    var old = b.textContent;
    b.textContent = 'Добавлено ✓';
    setTimeout(function () { b.textContent = old; }, 1400);
  });

  /* ---------- Меню на телефоне ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Главная: полка и хиты ---------- */
  var shelf = document.getElementById('shelf');
  if (shelf) {
    var shelfItems = [
      ['k2-white', 130, 'Беспроводной · 2 кл', 'grey'],
      ['s1-white', 168, 'Сенсорный · 1 кл'],
      ['s2-black', 216, 'Сенсорный · 2 кл'],
      ['w2-white', 190, 'Wi-Fi + Алиса · 2 кл'],
      ['r1-white', 150, 'Умный клавишный'],
      ['s1-grey', 130, 'Сенсорный · серый']
    ];
    shelf.innerHTML = shelfItems.map(function (s) {
      var p = byId(s[0]);
      var shown = s[3] ? Object.assign({}, p, { color: s[3] }) : p;
      return '<a class="shelf-item" href="product.html?id=' + p.id + '">' + panelHtml(shown, s[1]) + '<span class="label">' + esc(s[2]) + '</span></a>';
    }).join('');
  }
  var hits = document.getElementById('hits');
  if (hits) hits.innerHTML = ['s1-white', 's2-white', 'k1-white', 'w1-white'].map(function (id) { return cardHtml(byId(id)); }).join('');

  /* ---------- Каталог ---------- */
  var grid = document.getElementById('catalog-grid');
  if (grid) {
    var state = { type: new URLSearchParams(location.search).get('type') || 'all', color: 'all', keys: 'all', sort: 'pop' };
    var count = document.getElementById('found');
    function render() {
      var list = PRODUCTS.filter(function (p) {
        return (state.type === 'all' || p.type === state.type) &&
          (state.color === 'all' || p.color === state.color) &&
          (state.keys === 'all' || String(p.keys) === state.keys);
      });
      if (state.sort === 'cheap') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'exp') list.sort(function (a, b) { return b.price - a.price; });
      grid.innerHTML = list.length ? list.map(cardHtml).join('') : '<div class="empty">Ничего не нашлось — попробуйте другой фильтр.</div>';
      if (count) count.textContent = list.length;
      document.querySelectorAll('[data-type]').forEach(function (c) {
        var on = c.getAttribute('data-type') === state.type;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    document.querySelectorAll('[data-type]').forEach(function (c) {
      c.addEventListener('click', function () { state.type = c.getAttribute('data-type'); render(); });
    });
    document.querySelectorAll('input[name=color]').forEach(function (r) {
      r.addEventListener('change', function () { state.color = r.value; render(); });
    });
    document.querySelectorAll('input[name=keys]').forEach(function (r) {
      r.addEventListener('change', function () { state.keys = r.value; render(); });
    });
    var sort = document.getElementById('sort');
    if (sort) sort.addEventListener('change', function () { state.sort = sort.value; render(); });
    var ft = document.getElementById('filters-toggle');
    var fp = document.querySelector('.filters');
    if (ft && fp) ft.addEventListener('click', function () { fp.classList.toggle('open'); });
    render();
  }

  /* ---------- Карточка товара ---------- */
  var pinfo = document.getElementById('pinfo');
  if (pinfo) {
    var cur = byId(new URLSearchParams(location.search).get('id')) || byId('s2-white');
    var qty = 1;
    var $ = function (s) { return document.querySelector(s); };

    function sibling(color, keys) {
      for (var i = 0; i < PRODUCTS.length; i++) {
        var p = PRODUCTS[i];
        if (p.type === cur.type && p.color === color && p.keys === keys) return p;
      }
      return null;
    }
    function draw() {
      document.title = cur.name + ' — INLY';
      $('#p-name').textContent = cur.name;
      $('#p-line').textContent = '▸ ' + cur.line.toLowerCase();
      $('#p-price').textContent = rub(cur.price);
      $('#p-color').textContent = COLOR_NAME[cur.color];
      $('#p-keys').textContent = cur.keys === 1 ? '1 клавиша' : '2 клавиши';
      $('#s-color').textContent = COLOR_NAME[cur.color];
      $('#s-keys').textContent = cur.keys === 1 ? '1' : '2';
      $('#s-type').textContent = cur.type === 'kinetic' ? 'Беспроводной кинетический' : (cur.type === 'smart' ? 'Клавишный, Wi-Fi' : (cur.type === 'wifi' ? 'Сенсорный, Wi-Fi' : 'Сенсорный'));
      $('#gallery-main').innerHTML = cur.photo ? '<img src="' + cur.photo + '" alt="' + esc(cur.name) + '">' : panelHtml(cur, 300);
      $('#thumb-1').innerHTML = cur.photo ? '<img src="' + cur.photo + '" alt="">' : panelHtml(cur, 60);
      document.querySelectorAll('[data-pick-color]').forEach(function (b) {
        var c = b.getAttribute('data-pick-color');
        var exists = !!sibling(c, cur.keys) || !!sibling(c, cur.keys === 1 ? 2 : 1);
        b.hidden = !exists;
        b.setAttribute('aria-pressed', c === cur.color ? 'true' : 'false');
      });
      document.querySelectorAll('[data-pick-keys]').forEach(function (b) {
        var k = Number(b.getAttribute('data-pick-keys'));
        b.hidden = !sibling(cur.color, k) && !PRODUCTS.some(function (p) { return p.type === cur.type && p.keys === k; });
        b.setAttribute('aria-pressed', k === cur.keys ? 'true' : 'false');
      });
      $('#qty').textContent = qty;
    }
    document.querySelectorAll('[data-pick-color]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-pick-color');
        cur = sibling(c, cur.keys) || sibling(c, cur.keys === 1 ? 2 : 1) || cur;
        history.replaceState(null, '', '?id=' + cur.id); draw();
      });
    });
    document.querySelectorAll('[data-pick-keys]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = Number(b.getAttribute('data-pick-keys'));
        cur = sibling(cur.color, k) || PRODUCTS.filter(function (p) { return p.type === cur.type && p.keys === k; })[0] || cur;
        history.replaceState(null, '', '?id=' + cur.id); draw();
      });
    });
    $('#qty-minus').addEventListener('click', function () { qty = Math.max(1, qty - 1); draw(); });
    $('#qty-plus').addEventListener('click', function () { qty += 1; draw(); });
    $('#add').addEventListener('click', function () {
      addToCart(cur.id, qty);
      var b = $('#add'); b.textContent = 'Добавлено ✓';
      setTimeout(function () { b.textContent = 'Добавить в корзину'; }, 1400);
    });
    draw();
  }

  /* ---------- Ссылки на маркетплейсы ---------- */
  document.querySelectorAll('[data-ozon]').forEach(function (a) { a.href = OZON; a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelectorAll('[data-wb]').forEach(function (a) { a.href = WB; a.target = '_blank'; a.rel = 'noopener'; });

  renderCartCount();
})();
