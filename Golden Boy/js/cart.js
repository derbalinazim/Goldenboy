document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('cart-items-container')) {
        renderCartPage();
        
        // Track Checkout Start
        if(typeof fbq !== 'undefined' && getCart().length > 0) {
            fbq('track', 'InitiateCheckout');
        }
    }
});

function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';

    if(cart.length === 0) {
        container.innerHTML = `<p>Your cart is empty.</p>`;
        updateCartTotals();
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <h4>${item.name}</h4>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
                <p>Size: ${item.size}</p>
                <p>${item.price} DA</p>
                <div class="qty-wrapper" style="width: fit-content; margin-top:10px;">
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
                    <!-- Added id to the input box here -->
                    <input type="text" id="qty-${index}" class="qty-input" value="${item.quantity}" readonly>
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    updateCartTotals();
}

function changeQty(index, delta) {
    let cart = getCart();
    if(cart[index].quantity + delta > 0) {
        // 1. Update the background data
        cart[index].quantity += delta;
        localStorage.setItem('goldenCart', JSON.stringify(cart));
        
        // 2. Update only the targeted input box on the screen
        const qtyInput = document.getElementById(`qty-${index}`);
        if(qtyInput) {
            qtyInput.value = cart[index].quantity;
        }
        
        // 3. Recalculate summary and header counts without refreshing the page
        updateCartTotals();
        if(window.updateCartCounter) {
            window.updateCartCounter();
        }
    }
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem('goldenCart', JSON.stringify(cart));
    renderCartPage();
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }
}

function updateCartTotals() {
    const cart = getCart();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discount = 0;
    let code = localStorage.getItem('promoCode');
    if(code && typeof VALID_PROMOS !== 'undefined' && VALID_PROMOS[code]) {
        discount = subtotal * VALID_PROMOS[code];
    }

    let total = subtotal - discount;

    const subEl = document.getElementById('summary-subtotal');
    const discEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');

    if(subEl) subEl.innerText = `${subtotal} DA`;
    if(discEl) discEl.innerText = `-${discount} DA`;
    if(totalEl) totalEl.innerText = `${total} DA`;
}

// Make accessible to window for scope limits
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.updateCartTotals = updateCartTotals;