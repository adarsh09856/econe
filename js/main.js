/**
 * BHUTAN GLOBAL MART - Interactive Engine
 * AI Shopping Assistant, Live Currency Converter, Cart & Video Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Currency Conversion State
  let currentCurrency = 'USD';
  const currencyRates = {
    USD: { symbol: '$', rate: 1 },
    BTN: { symbol: 'Nu. ', rate: 86.5 },
    INR: { symbol: '₹', rate: 86.5 }
  };

  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    currencySelector.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      updateAllPrices();
    });
  }

  function updateAllPrices() {
    const rateObj = currencyRates[currentCurrency];
    document.querySelectorAll('[data-base-price]').forEach(el => {
      const baseUSD = parseFloat(el.getAttribute('data-base-price'));
      const converted = (baseUSD * rateObj.rate).toFixed(currentCurrency === 'USD' ? 2 : 0);
      el.textContent = `${rateObj.symbol}${converted}`;
    });
  }

  // 2. Shopping Cart System
  let cart = [
    {
      id: 'earbuds-01',
      title: 'Wireless Bluetooth Earbuds Pro (Active Noise Canceling)',
      priceUSD: 8.50,
      qty: 1,
      img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const cartDrawer = document.getElementById('cartDrawer');
  const cartTrigger = document.getElementById('cartTrigger');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.getElementById('cartCountBadge');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotalAmount');

  function renderCart() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = '';
    let totalUSD = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
      totalUSD += item.priceUSD * item.qty;
      totalItems += item.qty;

      const rateObj = currencyRates[currentCurrency];
      const itemPrice = (item.priceUSD * rateObj.rate).toFixed(currentCurrency === 'USD' ? 2 : 0);

      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <img src="${item.img}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${rateObj.symbol}${itemPrice} each</div>
          <div class="cart-qty-ctrl">
            <button class="cart-qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
            <span style="font-size: 0.82rem; font-weight: 700; min-width: 16px; text-align: center;">${item.qty}</span>
            <button class="cart-qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
            <button style="margin-left: 8px; border:none; background:none; color:#ef4444; font-size:0.75rem; cursor:pointer;" onclick="removeCartItem(${index})">Remove</button>
          </div>
        </div>
      `;
      cartItemsList.appendChild(row);
    });

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p style="text-align:center; color:#64748b; font-size:0.88rem; padding: 20px 0;">Your wholesale cart is empty.</p>';
    }

    if (cartBadge) cartBadge.textContent = totalItems;
    if (cartSubtotalEl) {
      const rateObj = currencyRates[currentCurrency];
      cartSubtotalEl.textContent = `${rateObj.symbol}${(totalUSD * rateObj.rate).toFixed(currentCurrency === 'USD' ? 2 : 0)}`;
    }
  }

  window.updateItemQty = (index, delta) => {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    renderCart();
  };

  window.removeCartItem = (index) => {
    cart.splice(index, 1);
    renderCart();
  };

  window.addToCartDirect = (title, priceUSD, img) => {
    const existing = cart.find(item => item.title === title);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: 'item-' + Date.now(),
        title: title,
        priceUSD: priceUSD,
        qty: 1,
        img: img
      });
    }
    renderCart();
    cartDrawer?.classList.add('open');
  };

  cartTrigger?.addEventListener('click', () => cartDrawer?.classList.add('open'));
  closeCartBtn?.addEventListener('click', () => cartDrawer?.classList.remove('open'));

  // 3. Wishlist Toggle
  let wishlistCount = 3;
  const wishlistBadge = document.getElementById('wishlistCountBadge');
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        wishlistCount++;
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        wishlistCount = Math.max(0, wishlistCount - 1);
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }
      if (wishlistBadge) wishlistBadge.textContent = wishlistCount;
    });
  });

  // 4. Conversational AI Assistant Logic
  const aiChatBox = document.getElementById('aiChatBody');
  const aiInput = document.getElementById('aiChatInput');
  const aiSendBtn = document.getElementById('aiSendBtn');

  function appendAIMessage(sender, text) {
    if (!aiChatBox) return;
    const msgDiv = document.createElement('div');
    if (sender === 'user') {
      msgDiv.style.alignSelf = 'flex-end';
      msgDiv.style.background = '#0284c7';
      msgDiv.style.color = '#ffffff';
      msgDiv.style.padding = '8px 12px';
      msgDiv.style.borderRadius = '12px 12px 2px 12px';
      msgDiv.style.fontSize = '0.8rem';
      msgDiv.style.maxWidth = '85%';
      msgDiv.textContent = text;
    } else {
      msgDiv.className = 'ai-bubble';
      msgDiv.innerHTML = text;
    }
    aiChatBox.appendChild(msgDiv);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
  }

  window.sendAIPrompt = (promptText) => {
    appendAIMessage('user', promptText);

    setTimeout(() => {
      let botReply = '';
      if (promptText.toLowerCase().includes('best-selling') || promptText.toLowerCase().includes('popular')) {
        botReply = `Here are our <strong>Top 3 Best Sellers</strong> direct from Alibaba & Amazon:<br>
        1. <strong>Smart Watch Fitness Tracker</strong> ($15.00 /pc)<br>
        2. <strong>ANC Wireless Earbuds</strong> ($8.50 /pc)<br>
        3. <strong>Heavy Winter Goose-Down Parka</strong> ($12.00 /pc)<br>
        <button style="margin-top:6px; background:#0284c7; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:0.75rem; cursor:pointer;" onclick="addToCartDirect('Smart Watch Fitness Tracker', 15.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80')">+ Add Smart Watch to Cart</button>`;
      } else if (promptText.toLowerCase().includes('red jacket') || promptText.toLowerCase().includes('jacket')) {
        botReply = `Found 1 matching item in AliExpress Wholesale:<br>
        <strong>Waterproof Puffer Winter Jacket (Red, Size L)</strong><br>
        Price: <strong>$12.00 - $18.00 /pc</strong> (MOQ: 50 pcs)<br>
        Delivery to Thimphu / Phuentsholing: 5-7 business days.<br>
        <button style="margin-top:6px; background:#16a34a; color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:0.75rem; cursor:pointer;" onclick="addToCartDirect('Waterproof Puffer Winter Jacket', 14.00, 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=150&q=80')">Add 50 pcs to Quote</button>`;
      } else if (promptText.toLowerCase().includes('under $20') || promptText.toLowerCase().includes('20')) {
        botReply = `Great budget picks under $20 from global hubs:<br>
        • High-Speed Air Fryer 3.5L ($25 promotional tier)<br>
        • 10-Pack Ultra Bright LED Bulbs ($5.50)<br>
        • Multi-Compartment Travel Backpack ($10.00)<br>
        Would you like wholesale customs clearance assistance?`;
      } else if (promptText.toLowerCase().includes('cart')) {
        cartDrawer?.classList.add('open');
        botReply = `I've opened your shopping drawer! You have items ready for quotation and direct dispatch to Bhutan.`;
      } else {
        botReply = `I've searched our Alibaba, Amazon & AliExpress catalogs for <em>"${promptText}"</em>. Found 14 verified manufacturers with shipping options to Bhutan. Would you like wholesale pricing or sample units?`;
      }

      appendAIMessage('bot', botReply);
    }, 600);
  };

  aiSendBtn?.addEventListener('click', () => {
    const text = aiInput?.value?.trim();
    if (text) {
      sendAIPrompt(text);
      aiInput.value = '';
    }
  });

  aiInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = aiInput.value.trim();
      if (text) {
        sendAIPrompt(text);
        aiInput.value = '';
      }
    }
  });

  // 5. Video Preview Modal
  const videoModal = document.getElementById('videoModal');
  const videoTitleEl = document.getElementById('videoModalTitle');
  const videoPlayerSimulation = document.getElementById('videoPlayerSimulation');

  window.openProductVideo = (title, duration) => {
    if (videoTitleEl) videoTitleEl.textContent = `${title} (${duration})`;
    if (videoPlayerSimulation) {
      videoPlayerSimulation.innerHTML = `
        <div style="background:#0f172a; border-radius:8px; padding:40px 20px; text-align:center; color:#fff;">
          <div style="font-size:2.5rem; margin-bottom:12px;">▶️</div>
          <h4 style="font-size:1.15rem; margin-bottom:8px;">${title}</h4>
          <p style="color:#94a3b8; font-size:0.85rem;">Simulating high-definition product unboxing & quality stress test streamed from global verification lab.</p>
          <div style="height:6px; background:#334155; border-radius:3px; margin:24px auto 12px; max-width:80%; overflow:hidden;">
            <div style="height:100%; width:45%; background:#0284c7;"></div>
          </div>
          <span style="font-size:0.75rem; color:#cbd5e1;">Time Elapsed: 01:12 / ${duration}</span>
        </div>
      `;
    }
    videoModal?.showModal();
  };

  // 6. Farm Brokerage Modals
  const farmModal = document.getElementById('farmModal');
  const farmModalTitle = document.getElementById('farmModalTitle');

  window.openFarmTour = (farmName, location, size, price) => {
    if (farmModalTitle) farmModalTitle.textContent = `${farmName} – Virtual Tour & Cadastral Details`;
    const body = document.getElementById('farmModalContent');
    if (body) {
      body.innerHTML = `
        <div style="margin-bottom:16px;">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; font-size:0.85rem;">
          <div><strong>Location:</strong> ${location}, Bhutan</div>
          <div><strong>Total Area:</strong> ${size}</div>
          <div><strong>Price Guide:</strong> ${price}</div>
          <div><strong>Land Title:</strong> Chhuzhing / Kamzhing (Lagthram Verified)</div>
          <div><strong>Water Source:</strong> Glacier mountain stream piped</div>
          <div><strong>Road Access:</strong> All-weather paved feeder road</div>
        </div>
        <p style="font-size:0.82rem; color:#475569; line-height:1.5;">
          Our certified Bhutan land conveyancing team assists with National Land Commission Secretariat (NLCS) clearance, lagthram transfer, and agricultural development permissions.
        </p>
      `;
    }
    farmModal?.showModal();
  };

  // Close modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      document.getElementById(modalId)?.close();
    });
  });

  // Light dismiss fallback
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e, dialog) => {
      const rect = dialog.getBoundingClientRect();
      return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
    };
    document.querySelectorAll('dialog').forEach(dialog => {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, dialog)) {
          dialog.close();
        }
      });
    });
  }

  // Initial render
  renderCart();
  updateAllPrices();
});
