document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with your Public Key
    if(typeof emailjs !== 'undefined') {
        emailjs.init("a-NBhLL25Z77Iz_8v");
    }

    const form = document.getElementById('checkout-form');
    if(form) {
        form.addEventListener('submit', handleCheckoutSubmit);
    }
});

function handleCheckoutSubmit(e) {
    e.preventDefault();
    const cart = getCart();
    if(cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const submitBtn = document.getElementById('submit-order-btn');
    submitBtn.innerText = "PROCESSING...";
    submitBtn.disabled = true;

    // Gather Form Data
    const formData = {
        name: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        wilaya: document.getElementById('c-wilaya').value,
        address: document.getElementById('c-address').value,
        notes: document.getElementById('c-notes').value || "None",
    };

    // Calculate Financials
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let promoCode = localStorage.getItem('promoCode') || "NONE";
    let discount = 0;
    
    // Must redefine valid promos here since modules aren't used for brevity
    const VALID_PROMOS = { 'AYUUB': 0.1, 'RAHIM': 0.1, 'NAZIM': 0.1 };
    if(promoCode !== "NONE" && VALID_PROMOS[promoCode]) {
        discount = subtotal * VALID_PROMOS[promoCode];
    }
    let total = subtotal - discount;

    // Format Order String
    let orderDetailsText = cart.map(item => 
        `- ${item.name} | Size: ${item.size} | Qty: ${item.quantity} | ${item.price} DA`
    ).join('\n');

    const templateParams = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_wilaya: formData.wilaya,
        customer_address: formData.address,
        customer_notes: formData.notes,
        order_details: orderDetailsText,
        subtotal: subtotal,
        discount: discount,
        total: total,
        promo_code: promoCode
    };

    // 1. Send via EmailJS
    emailjs.send("service_axec8bb", "template_ocswtc4", templateParams)
        .then(() => {
            handleSuccess(templateParams);
        })
        .catch((error) => {
            console.error("EmailJS Error:", error);
            // Even if EmailJS fails, allow them to process via WhatsApp
            alert("Email notification failed, but you can still complete your order via WhatsApp.");
            handleSuccess(templateParams);
        });
}

function handleSuccess(params) {
    // Fire Meta Pixel Purchase
    if(typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: params.total,
            currency: 'DZD'
        });
    }

    // Build WhatsApp Message
    let waMessage = `*GOLDEN BOY ORDER*\n\n` +
        `*Customer:* ${params.customer_name}\n` +
        `*Phone:* ${params.customer_phone}\n` +
        `*Address:* ${params.customer_address}, ${params.customer_wilaya}\n\n` +
        `*Products:*\n${params.order_details}\n\n` +
        `*Subtotal:* ${params.subtotal} DA\n` +
        `*Discount:* -${params.discount} DA (${params.promo_code})\n` +
        `*Total:* ${params.total} DA\n`;
        
    if(params.customer_notes !== "None") {
        waMessage += `\n*Notes:* ${params.customer_notes}`;
    }

    // Show Success UI
    document.querySelector('.cart-layout').style.display = 'none';
    const successBlock = document.getElementById('success-block');
    successBlock.style.display = 'block';
    
    // Setup WhatsApp Button
    const waBtn = document.getElementById('wa-btn');
    waBtn.onclick = () => {
        window.open(`https://wa.me/447300876041?text=${encodeURIComponent(waMessage)}`, '_blank');
    };

    // Clear Cart
    localStorage.removeItem('goldenCart');
    // Don't clear promo immediately so they see it was applied on success screen
    if(window.updateCartCounter) updateCartCounter();
}