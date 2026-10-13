const PRODUCTS = [
  { id: 1, name: "Classic Milk Tea", price: 59, emoji: "🧋", bg: "#f4e2d1" },
  { id: 2, name: "Wintermelon Tea", price: 65, emoji: "🥤", bg: "#e7e8d3" },
  { id: 3, name: "Taro Milk Tea", price: 65, emoji: "🧋", bg: "#e9def0" },
  { id: 4, name: "Fruit Tea Lychee", price: 55, emoji: "🍹", bg: "#f7dfdf" },
  { id: 5, name: "Brown Sugar Milk", price: 69, emoji: "🥛", bg: "#ead3bd" },
  { id: 6, name: "Bottled Water", price: 20, emoji: "💧", bg: "#dcecf0" }
];

const cart = new Map();
const peso = amount => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

document.getElementById("todayLabel").textContent = new Date().toLocaleDateString("en-PH");

function renderMenu() {
  document.getElementById("menuGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-art" style="--art-bg:${p.bg}"><span class="drink-emoji">${p.emoji}</span></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-bottom"><span class="price">${peso(p.price)}</span>
          <button class="add-btn" data-add="${p.id}"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    </article>`).join("");
}

function getTotal() { return [...cart.values()].reduce((sum, item) => sum + item.p.price * item.qty, 0); }

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  document.getElementById("cartBadge").textContent = cart.size;
  document.getElementById("summaryCount").textContent = `${cart.size} items`;
  document.getElementById("grandTotal").textContent = peso(getTotal());

  if (!cart.size) {
    cartItems.innerHTML = `<div class="empty-cart">Your cup is empty</div>`;
  } else {
    cartItems.innerHTML = [...cart.values()].map(({ p, qty }) => `
      <div class="cart-row">
        <div class="cart-thumb" style="--art-bg:${p.bg}">${p.emoji}</div>
        <div class="cart-details"><h4>${p.name}</h4><small>${peso(p.price)} each</small>
          <div class="qty-control">
            <button data-qty="-1" data-id="${p.id}">-</button><span>${qty}</span><button data-qty="1" data-id="${p.id}">+</button>
          </div>
        </div>
        <div class="cart-row-right"><strong>${peso(p.price * qty)}</strong><button class="remove-item" data-remove="${p.id}">x</button></div>
      </div>`).join("");
  }
  updateChange();
}

function updateChange() {
  const cash = Number(document.getElementById("cashInput").value);
  document.getElementById("changePreview").textContent = cash >= getTotal() ? peso(cash - getTotal()) : peso(0);
}

document.getElementById("menuGrid").addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  const p = PRODUCTS.find(item => item.id === id);
  const existing = cart.get(id);
  cart.set(id, { p, qty: existing ? existing.qty + 1 : 1 });
  renderCart();
});

document.getElementById("cartItems").addEventListener("click", e => {
  const qtyBtn = e.target.closest("[data-qty]");
  const rmBtn = e.target.closest("[data-remove]");
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.id);
    const nextQty = cart.get(id).qty + Number(qtyBtn.dataset.qty);
    nextQty <= 0 ? cart.delete(id) : cart.set(id, { ...cart.get(id), qty: nextQty });
  } else if (rmBtn) {
    cart.delete(Number(rmBtn.dataset.remove));
  }
  renderCart();
});

document.getElementById("cashInput").addEventListener("input", updateChange);

document.getElementById("paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  const alertBox = document.getElementById("paymentAlert");
  const cash = Number(document.getElementById("cashInput").value);
  
  if (!cart.size) { alertBox.textContent = "Cart is empty."; alertBox.className = "alert error"; alertBox.hidden = false; return; }
  if (cash < getTotal()) { alertBox.textContent = "Insufficient cash."; alertBox.className = "alert error"; alertBox.hidden = false; return; }
  
  alertBox.hidden = true;
  generateReceipt(cash);
});

function generateReceipt(cash) {
  const total = getTotal();
  document.getElementById("receiptContent").innerHTML = `
    <div class="receipt-brand"><h2>CAMPUSSIP</h2><p>Transaction: TXN-${Math.floor(Math.random()*90000)}</p></div>
    <table class="receipt-items"><thead><tr><th>ITEM</th><th>QTY</th><th>AMT</th></tr></thead>
    <tbody>${[...cart.values()].map(({p, qty}) => `<tr><td>${p.name}</td><td>${qty}</td><td>${peso(p.price*qty)}</td></tr>`).join("")}</tbody></table>
    <div class="receipt-totals"><div><span>TOTAL DUE</span><span>${peso(total)}</span></div>
    <div><span>Cash paid</span><span>${peso(cash)}</span></div>
    <div class="receipt-change"><span>CHANGE</span><span>${peso(cash - total)}</span></div></div>`;
  document.getElementById("receiptModal").hidden = false;
}

document.getElementById("clearCartBtn").addEventListener("click", () => { cart.clear(); renderCart(); });
document.getElementById("closeReceiptBtn").addEventListener("click", () => document.getElementById("receiptModal").hidden = true);
document.getElementById("receiptNewBtn").addEventListener("click", () => { cart.clear(); document.getElementById("cashInput").value = ""; document.getElementById("receiptModal").hidden = true; renderCart(); });
document.getElementById("printReceiptBtn").addEventListener("click", () => window.print());

renderMenu();
renderCart();