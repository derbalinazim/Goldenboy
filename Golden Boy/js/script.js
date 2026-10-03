// Valid Promo Codes
const VALID_PROMOS = { 'AYUUB': 0.1, 'RAHIM': 0.1, 'NAZIM': 0.1 };

// Translations
const translations = {
    en: {
        "nav-home": "HOME", "nav-man": "MAN", "nav-woman": "WOMAN", "nav-shop": "SHOP",
        "promo-text": "PROMO CODE — GET 10% OFF", "btn-apply": "APPLY",
        "hero-man": "MAN COLLECTION", "hero-woman": "WOMAN COLLECTION",
        "title-featured": "FEATURED", "title-reviews": "WHAT THEY SAY",
        "btn-view-all": "VIEW ALL", "btn-add": "ADD TO CART",
        "lbl-size": "SIZE", "msg-added": "✓ Added to cart",
        "msg-promo-success": "✓ 10% discount applied", "msg-promo-fail": "Invalid promo code.",
        "lbl-total-cost": "TOTAL", "btn-command-now": "COMMAND NOW", "lbl-items": "items"
    },
    fr: {
        "nav-home": "ACCUEIL", "nav-man": "HOMME", "nav-woman": "FEMME", "nav-shop": "PANIER",
        "promo-text": "CODE PROMO — OBTENEZ 10% DE RÉDUCTION", "btn-apply": "APPLIQUER",
        "hero-man": "COLLECTION HOMME", "hero-woman": "COLLECTION FEMME",
        "title-featured": "EN VEDETTE", "title-reviews": "CE QU'ILS DISENT",
        "btn-view-all": "VOIR TOUT", "btn-add": "AJOUTER",
        "lbl-size": "TAILLE", "msg-added": "✓ Ajouté au panier",
        "msg-promo-success": "✓ 10% de réduction appliquée", "msg-promo-fail": "Code promo invalide.",
        "lbl-total-cost": "TOTAL", "btn-command-now": "COMMANDER MAINTENANT", "lbl-items": "articles"
    },
    ar: {
        "nav-home": "الرئيسية", "nav-man": "رجال", "nav-woman": "نساء", "nav-shop": "السلة",
        "promo-text": "كود الخصم — احصل على خصم 10٪", "btn-apply": "تطبيق",
        "hero-man": "مجموعة الرجال", "hero-woman": "مجموعة النساء",
        "title-featured": "المميز", "title-reviews": "ماذا يقولون",
        "btn-view-all": "عرض الكل", "btn-add": "أضف للسلة",
        "lbl-size": "المقاس", "msg-added": "✓ تمت الإضافة للسلة",
        "msg-promo-success": "✓ تم تطبيق خصم 10٪", "msg-promo-fail": "كود الخصم غير صالح.",
        "lbl-total-cost": "المجموع", "btn-command-now": "اطلب الآن", "lbl-items": "قطع"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLang();
    initMenu();
    initPromo();
    updateCartCounter();
    updateBottomBar();
    
    // Render Products if container exists
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) renderProducts(products.filter(p => p.featured), featuredContainer);
    
    const manContainer = document.getElementById('man-products');
    if (manContainer) renderProducts(products.filter(p => p.category === 'man'), manContainer);
});

// Language Management
function initLang() {
    let lang = localStorage.getItem('lang') || 'en';
    applyLanguage(lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let selectedLang = e.target.dataset.lang;
            localStorage.setItem('lang', selectedLang);
            applyLanguage(selectedLang);
        });
    });
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        let key = el.getAttribute('data-i18n');
        if(translations[lang][key]) {
            if(el.tagName === 'INPUT' && el.type === 'text') el.placeholder = translations[lang][key];
            else el.innerText = translations[lang][key];
        }
    });
    
    // Refresh dynamic text in bottom bar when language changes
    updateBottomBar();
}

// Side Menu
function initMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const closeBtn = document.querySelector('.close-btn');
    const sideMenu = document.querySelector('.side-menu');
    const overlay = document.querySelector('.overlay');

    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.add('active');
            overlay.classList.add('active');
        });
    }
    
    if(closeBtn && overlay) {
        const closeMenu = () => {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
        };
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }
}

// Promo System
function initPromo() {
    const applyBtn = document.getElementById('apply-promo');
    const promoInput = document.getElementById('promo-input');
    const promoMsg = document.getElementById('promo-msg');

    // Restore state
    if(localStorage.getItem('promoCode')) {
        if(promoInput) promoInput.value = localStorage.getItem('promoCode');
        if(promoMsg) {
            let lang = localStorage.getItem('lang') || 'en';
            promoMsg.innerText = translations[lang]["msg-promo-success"];
        }
    }

    if(applyBtn && promoInput) {
        applyBtn.addEventListener('click', () => {
            let code = promoInput.value.trim().toUpperCase();
            let lang = localStorage.getItem('lang') || 'en';
            if (VALID_PROMOS[code]) {
                localStorage.setItem('promoCode', code);
                promoMsg.innerText = translations[lang]["msg-promo-success"];
                promoMsg.style.color = "inherit";
                if(window.updateCartTotals) window.updateCartTotals();
                updateBottomBar();
            } else {
                localStorage.removeItem('promoCode');
                promoMsg.innerText = translations[lang]["msg-promo-fail"];
                promoMsg.style.color = "red";
                if(window.updateCartTotals) window.updateCartTotals();
                updateBottomBar();
            }
        });
    }
}

// Render Products
function renderProducts(items, container) {
    container.innerHTML = '';
    let lang = localStorage.getItem('lang') || 'en';

    items.forEach(product => {
        let sizeOptions = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
        let priceHTML = product.sale ? 
            `<span class="old-price">${product.oldPrice} DA</span> <span>${product.price} DA</span>` : 
            `<span>${product.price} DA</span>`;
            
        let badges = '';
        if(product.sale) badges += `<span class="badge">SALE</span>`;
        if(product.new) badges += `<span class="badge">NEW</span>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <div class="badges">${badges}</div>
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+PC9zdmc+'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="price-box">${priceHTML}</div>
                <div class="product-options">
                    <select class="size-select" id="size-${product.id}">
                        ${sizeOptions}
                    </select>
                </div>
                <button class="btn add-to-cart-btn" style="margin-top: 10px; padding: 0.8rem;" 
                    data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.image}">
                    <span data-i18n="btn-add">${translations[lang]["btn-add"]}</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    // Attach Add to Cart Events
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const id = button.getAttribute('data-id');
            const size = document.getElementById(`size-${id}`).value;
            addToCart({
                id: id,
                name: button.getAttribute('data-name'),
                price: parseInt(button.getAttribute('data-price')),
                image: button.getAttribute('data-img'),
                size: size,
                quantity: 1
            });
        });
    });
}

// Cart Global Functions
function getCart() {
    return JSON.parse(localStorage.getItem('goldenCart')) || [];
}

function addToCart(item) {
    let cart = getCart();
    let existing = cart.find(i => i.id === item.id && i.size === item.size);
    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push(item);
    }
    localStorage.setItem('goldenCart', JSON.stringify(cart));
    updateCartCounter();
    updateBottomBar();
    showNotification();
    
    // Meta Pixel Event
    if(typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_name: item.name,
            value: item.price,
            currency: 'DZD'
        });
    }
}

function updateCartCounter() {
    let cart = getCart();
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.innerText = totalItems);
}

// Sticky Bottom Order Bar Logic
function updateBottomBar() {
    const bottomBar = document.getElementById('sticky-bottom-bar');
    if (!bottomBar) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let code = localStorage.getItem('promoCode');
        let discount = (code && VALID_PROMOS[code]) ? subtotal * VALID_PROMOS[code] : 0;
        let finalCost = subtotal - discount;

        // Format with commas to match your screenshot "3,500 DA"[cite: 1]
        const formattedCost = finalCost.toLocaleString(); 
        
        const costEl = document.getElementById('bottom-bar-price');
        if (costEl) costEl.innerText = `${formattedCost} DA`;

        bottomBar.classList.add('active');
        document.body.classList.add('has-bottom-bar');
    } else {
        bottomBar.classList.remove('active');
        document.body.classList.remove('has-bottom-bar');
    }
}

function showNotification() {
    let lang = localStorage.getItem('lang') || 'en';
    const notif = document.getElementById('notification');
    notif.innerText = translations[lang]["msg-added"];
    notif.classList.add('show');
    setTimeout(() => { notif.classList.remove('show'); }, 3000);
}

// Make updateBottomBar globally accessible for cart.js interactions
window.updateBottomBar = updateBottomBar;