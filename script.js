const PRODUCTS = [

  { id: 1, name: "Classic Milk Tea", size: "Regular", price: 59, emoji: "🧋", bg: "#f4e2d1", note: "Our signature creamy blend", tag: "BEST SELLER" },

  { id: 2, name: "Wintermelon Milk Tea", size: "Regular", price: 65, emoji: "🥤", bg: "#e7e8d3", note: "Sweet, mellow & refreshing", tag: "" },

  { id: 3, name: "Taro Milk Tea", size: "Regular", price: 65, emoji: "🧋", bg: "#e9def0", note: "Smooth, nutty taro flavor", tag: "FAN FAVORITE" },

  { id: 4, name: "Fruit Tea Lychee", size: "Regular", price: 55, emoji: "🍹", bg: "#f7dfdf", note: "Bright, fruity & floral", tag: "" },

  { id: 5, name: "Brown Sugar Milk Tea", size: "Regular", price: 69, emoji: "🥛", bg: "#ead3bd", note: "Rich brown sugar swirls", tag: "MUST TRY" },

  { id: 6, name: "Bottled Water", size: "500 mL", price: 20, emoji: "💧", bg: "#dcecf0", note: "Cool and refreshing", tag: "" }

];



const cart = new Map();

const peso = amount => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const menuGrid = document.getElementById("menuGrid");

const cartItems = document.getElementById("cartItems");

const cartBadge = document.getElementById("cartBadge");

const summaryCount = document.getElementById("summaryCount");

const grandTotal = document.getElementById("grandTotal");

const cashInput = document.getElementById("cashInput");

const changePreview = document.getElementById("changePreview");

const paymentAlert = document.getElementById("paymentAlert");

const receiptModal = document.getElementById("receiptModal");

const receiptContent = document.getElementById("receiptContent");

const paymentForm = document.getElementById("paymentForm");



document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());

document.getElementById("year").textContent = new Date().getFullYear();



function renderMenu() {

  menuGrid.innerHTML = PRODUCTS.map(product => `

    <article class="product-card">

      <div class="product-art" style="--art-bg:${product.bg}">

        ${product.tag ? `<span class="popular-tag"><i class="fa-solid fa-star"></i> ${product.tag}</span>` : ""}

        <span class="drink-emoji" role="img" aria-label="${product.name}">${product.emoji}</span>

      </div>

      <div class="product-info">

        <h3>${product.name}</h3>

        <p>${product.note}</p>

        <div class="product-bottom"><span class="price">${peso(product.price)}</span>

          <button class="add-btn" data-add="${product.id}" aria-label="Add ${product.name} to order" title="Add to order"><i class="fa-solid fa-plus"></i></button>

        </div>

      </div>

    </article>`).join("");

}



function getTotal() {

  return [...cart.values()].reduce((sum, item) => sum + item.product.price * item.qty, 0);

}

function getCount() {

  return [...cart.values()].reduce((sum, item) => sum + item.qty, 0);

}

function renderCart() {

  const count = getCount();

  cartBadge.textContent = count;

  summaryCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;

  grandTotal.textContent = peso(getTotal());



  if (!cart.size) {

    cartItems.innerHTML = `<div class="empty-cart"><div class="empty-illustration"><i class="fa-solid fa-mug-saucer"></i><span>♡</span></div><h3>Your cup is empty</h3><p>Add a drink from the menu<br>to get your order started.</p></div>`;

  } else {

    cartItems.innerHTML = [...cart.values()].map(({ product, qty }) => `

      <div class="cart-row">

        <div class="cart-thumb" style="--art-bg:${product.bg}">${product.emoji}</div>

        <div class="cart-details"><h4>${product.name}</h4><small>${peso(product.price)} each</small>

          <div class="qty-control">

            <button data-qty="-1" data-id="${product.id}" aria-label="Decrease ${product.name} quantity"><i class="fa-solid fa-minus"></i></button>

            <span>${qty}</span>

            <button data-qty="1" data-id="${product.id}" aria-label="Increase ${product.name} quantity"><i class="fa-solid fa-plus"></i></button>

          </div>

        </div>

        <div class="cart-row-right"><strong>${peso(product.price * qty)}</strong><button class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}" title="Remove item"><i class="fa-solid fa-xmark"></i></button></div>

      </div>`).join("");

  }

  updateChangePreview();

}

function showAlert(message, type = "error") {

  paymentAlert.textContent = "";

  paymentAlert.className = `alert ${type}`;

  const icon = document.createElement("i");

  icon.className = type === "error" ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";

  icon.style.marginRight = "7px";

  paymentAlert.append(icon, document.createTextNode(message));

  paymentAlert.hidden = false;

}

function clearAlert() {

  paymentAlert.hidden = true;

  paymentAlert.textContent = "";

  paymentAlert.className = "alert";

}

function updateChangePreview() {

  const raw = cashInput.value;

  const amount = Number(raw);

  if (raw.trim() !== "" && Number.isFinite(amount) && amount >= getTotal()) {

    changePreview.textContent = peso(amount - getTotal());

  } else {

    changePreview.textContent = peso(0);

  }

}

function validatePayment() {

  if (!cart.size) return "Your cart is empty. Please add at least one drink before checkout.";

  if (cashInput.value.trim() === "") return "Please enter the cash amount received.";

  const cash = Number(cashInput.value);

  if (!Number.isFinite(cash)) return "Please enter a valid numeric cash amount.";

  if (cash < 0) return "Cash received cannot be a negative amount.";

  if (cash < getTotal()) return `Insufficient payment. You still need ${peso(getTotal() - cash)}.`;

  return "";

}

function createTransactionRef() {

  return "TXN-" + Math.floor(100000 + Math.random() * 900000);

}

function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

}

function generateReceipt(cash) {

  const total = getTotal();

  const change = cash - total;

  const now = new Date();

  const date = new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "short", day: "2-digit" }).format(now);

  const time = new Intl.DateTimeFormat("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);

  const ref = createTransactionRef();

  const rows = [...cart.values()].map(({ product, qty }) => `<tr><td>${escapeHTML(product.name)}<br><span style="color:#8b7d71">${escapeHTML(product.size)}</span></td><td>${qty}</td><td>${peso(product.price * qty)}</td></tr>`).join("");

  receiptContent.innerHTML = `

    <div class="receipt-brand"><div class="receipt-cup"><i class="fa-solid fa-mug-hot"></i></div><h2 id="receiptTitle">CAMPUSSIP</h2><p>MILK TEA & BEVERAGE SHOP<br>Campus refreshment, made with love<br>Thank you for supporting our campus shop!</p></div>

    <div class="receipt-meta"><div><span>Transaction:</span><strong>${ref}</strong></div><div><span>Date:</span><span>${date}</span></div><div><span>Time:</span><span>${time}</span></div><div><span>Cashier:</span><span>Campus Cashier</span></div></div>

    <table class="receipt-items"><thead><tr><th>ITEM</th><th>QTY</th><th>AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>

    <div class="receipt-totals"><div class="receipt-grand"><span>TOTAL DUE</span><span>${peso(total)}</span></div><div><span>Cash paid</span><span>${peso(cash)}</span></div><div class="receipt-change"><span>CHANGE</span><span>${peso(change)}</span></div></div>

    <div class="receipt-thanks"><strong>THANK YOU! 🧋</strong>Have a sip-tastic day!<br>Keep this receipt for your records.</div>`;

  receiptModal.hidden = false;

  document.getElementById("closeReceiptBtn").focus();

}

menuGrid.addEventListener("click", event => {

  const button = event.target.closest("[data-add]");

  if (!button) return;

  const id = Number(button.dataset.add);

  const product = PRODUCTS.find(item => item.id === id);

  if (!product) return;

  const existing = cart.get(id);

  cart.set(id, { product, qty: existing ? existing.qty + 1 : 1 });

  clearAlert();

  renderCart();

  button.innerHTML = '<i class="fa-solid fa-check"></i>';

  window.setTimeout(() => { if (button.isConnected) button.innerHTML = '<i class="fa-solid fa-plus"></i>'; }, 500);

});

cartItems.addEventListener("click", event => {

  const qtyButton = event.target.closest("[data-qty]");

  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {

    const id = Number(qtyButton.dataset.id);

    const item = cart.get(id);

    if (!item) return;

    const nextQty = item.qty + Number(qtyButton.dataset.qty);

    if (nextQty <= 0) cart.delete(id);

    else cart.set(id, { ...item, qty: nextQty });

  } else if (removeButton) {

    cart.delete(Number(removeButton.dataset.remove));

  } else return;

  clearAlert();

  renderCart();

});

cashInput.addEventListener("input", () => {

  clearAlert();

  updateChangePreview();

});

paymentForm.addEventListener("submit", event => {

  event.preventDefault();

  const error = validatePayment();

  if (error) {

    showAlert(error);

    const panel = document.querySelector(".order-panel");

    panel.classList.remove("shake");

    void panel.offsetWidth;

    panel.classList.add("shake");

    if (!cart.size) document.getElementById("clearCartBtn").focus();

    else cashInput.focus();

    return;

  }

  generateReceipt(Number(cashInput.value));

});

function resetTransaction() {

  cart.clear();

  cashInput.value = "";

  clearAlert();

  changePreview.textContent = peso(0);

  receiptModal.hidden = true;

  renderCart();

  window.scrollTo({ top: 0, behavior: "smooth" });

}

document.getElementById("clearCartBtn").addEventListener("click", () => {

  cart.clear();

  clearAlert();

  renderCart();

});

document.getElementById("newTransactionBtn").addEventListener("click", resetTransaction);

document.getElementById("receiptNewBtn").addEventListener("click", resetTransaction);

document.getElementById("closeReceiptBtn").addEventListener("click", () => { receiptModal.hidden = true; });

document.getElementById("printReceiptBtn").addEventListener("click", () => window.print());

receiptModal.addEventListener("click", event => { if (event.target === receiptModal) receiptModal.hidden = true; });

document.addEventListener("keydown", event => { if (event.key === "Escape" && !receiptModal.hidden) receiptModal.hidden = true; });



renderMenu();

renderCart();
