(function () {
  "use strict";

  var CART_KEY = "site-cart";
  var LANG_KEY = "site-lang";
  var WHATSAPP_PHONE = "2250767490189";

  var memoryCart = { version: 1, items: [] };
  var storageAvailable = (function () {
    try {
      var testKey = "__cart_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function getLang() {
    return localStorage.getItem(LANG_KEY) || "fr";
  }

  function findProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function formatFCFA(amount, lang) {
    var formatted = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(amount);
    return formatted + " FCFA";
  }

  /* ---------- Cart storage ---------- */
  function readCart() {
    if (!storageAvailable) return memoryCart;
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return { version: 1, items: [] };
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return { version: 1, items: [] };
      return parsed;
    } catch (e) {
      return { version: 1, items: [] };
    }
  }

  function writeCart(state) {
    if (!storageAvailable) {
      memoryCart = state;
    } else {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(state));
      } catch (e) {
        storageAvailable = false;
        memoryCart = state;
      }
    }
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  var Cart = {
    add: function (id, qty) {
      qty = qty || 1;
      var product = findProduct(id);
      if (!product) return;
      var state = readCart();
      var maxQty = (typeof product.stock === "number") ? product.stock : Infinity;
      var existing = null;
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) { existing = state.items[i]; break; }
      }
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, maxQty);
      } else {
        state.items.push({ id: id, qty: Math.min(qty, maxQty) });
      }
      writeCart(state);
    },
    setQty: function (id, qty) {
      var state = readCart();
      if (qty <= 0) {
        state.items = state.items.filter(function (i) { return i.id !== id; });
      } else {
        var product = findProduct(id);
        var maxQty = (product && typeof product.stock === "number") ? product.stock : Infinity;
        for (var i = 0; i < state.items.length; i++) {
          if (state.items[i].id === id) { state.items[i].qty = Math.min(qty, maxQty); break; }
        }
      }
      writeCart(state);
    },
    remove: function (id) {
      var state = readCart();
      state.items = state.items.filter(function (i) { return i.id !== id; });
      writeCart(state);
    },
    clear: function () {
      writeCart({ version: 1, items: [] });
    },
    resolvedItems: function () {
      var state = readCart();
      var result = [];
      state.items.forEach(function (item) {
        var product = findProduct(item.id);
        if (!product) return;
        result.push({ product: product, qty: item.qty, lineTotal: product.price * item.qty });
      });
      return result;
    },
    count: function () {
      return this.resolvedItems().reduce(function (sum, i) { return sum + i.qty; }, 0);
    },
    subtotal: function () {
      return this.resolvedItems().reduce(function (sum, i) { return sum + i.lineTotal; }, 0);
    }
  };

  /* ---------- Cart badge (every page) ---------- */
  function renderCartBadge() {
    var count = Cart.count();
    document.querySelectorAll("#cart-count").forEach(function (badge) {
      badge.textContent = count;
      badge.classList.toggle("cart-badge-empty", count === 0);
    });
  }

  /* ---------- Storage warning banner ---------- */
  function renderStorageWarning() {
    if (storageAvailable || document.querySelector(".storage-warning")) return;
    var dict = translations[getLang()] || translations.fr;
    var anchor = document.getElementById("shop-grid") || document.getElementById("product-detail") || document.getElementById("cart-page");
    if (!anchor || !anchor.parentElement) return;
    var warning = document.createElement("p");
    warning.className = "storage-warning";
    warning.textContent = dict["cart.storage_warning"];
    anchor.parentElement.insertBefore(warning, anchor);
  }

  /* ---------- Catalog page (boutique/index.html) ---------- */
  var currentCatalogFilter = "all";

  function renderCatalog() {
    var grid = document.getElementById("shop-grid");
    if (!grid) return;
    var lang = getLang();
    var dict = translations[lang] || translations.fr;
    var filterButtons = document.querySelectorAll(".shop-filter-btn");

    function buildCard(product) {
      var t = product[lang] || product.fr;
      var outOfStock = typeof product.stock === "number" && product.stock <= 0;
      var card = document.createElement("article");
      card.className = "product-card";

      card.innerHTML =
        '<a href="produit.html?id=' + encodeURIComponent(product.id) + '" class="product-card-media">' +
          '<img src="../' + product.image + '" alt="" onerror="this.parentElement.classList.add(\'img-fallback\')">' +
        '</a>' +
        '<div class="product-card-body">' +
          '<span class="product-type-badge">' + (dict["shop.filter_" + product.type] || product.type) + '</span>' +
          '<h3><a href="produit.html?id=' + encodeURIComponent(product.id) + '">' + t.name + '</a></h3>' +
          '<p class="product-card-desc">' + t.short + '</p>' +
          '<div class="product-card-footer">' +
            '<span class="product-price">' + formatFCFA(product.price, lang) + '</span>' +
            '<button type="button" class="btn btn-primary btn-sm" data-add-to-cart="' + product.id + '"' + (outOfStock ? " disabled" : "") + '>' +
              (outOfStock ? dict["shop.out_of_stock"] : dict["shop.add_to_cart"]) +
            '</button>' +
          '</div>' +
        '</div>';

      return card;
    }

    function renderGrid() {
      grid.innerHTML = "";
      products
        .filter(function (p) { return currentCatalogFilter === "all" || p.type === currentCatalogFilter; })
        .forEach(function (p) { grid.appendChild(buildCard(p)); });

      grid.querySelectorAll("[data-add-to-cart]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          Cart.add(btn.getAttribute("data-add-to-cart"), 1);
          renderCartBadge();
          var original = btn.textContent;
          btn.textContent = dict["shop.added_confirmation"];
          setTimeout(function () { btn.textContent = original; }, 1200);
        });
      });
    }

    if (!grid.dataset.filtersBound) {
      filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          filterButtons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          currentCatalogFilter = btn.getAttribute("data-filter");
          renderGrid();
        });
      });
      grid.dataset.filtersBound = "true";
    }

    renderGrid();
  }

  /* ---------- Product detail page (boutique/produit.html) ---------- */
  function renderProductDetail() {
    var container = document.getElementById("product-detail");
    if (!container) return;
    var lang = getLang();
    var dict = translations[lang] || translations.fr;
    var id = new URLSearchParams(window.location.search).get("id");
    var product = findProduct(id);

    if (!product) {
      container.innerHTML =
        '<div class="product-not-found">' +
          "<p>" + dict["shop.not_found"] + "</p>" +
          '<a href="index.html" class="btn btn-outline">' + dict["shop.back_to_catalog"] + "</a>" +
        "</div>";
      return;
    }

    var t = product[lang] || product.fr;
    var outOfStock = typeof product.stock === "number" && product.stock <= 0;
    var maxQty = typeof product.stock === "number" ? product.stock : 99;

    container.innerHTML =
      '<div class="product-detail-media">' +
        '<img src="../' + product.image + '" alt="" onerror="this.parentElement.classList.add(\'img-fallback\')">' +
      "</div>" +
      '<div class="product-detail-body">' +
        '<span class="product-type-badge">' + (dict["shop.filter_" + product.type] || product.type) + "</span> " +
        '<span class="product-format-badge">' + (product.digital ? dict["shop.digital_badge"] : dict["shop.physical_badge"]) + "</span>" +
        "<h1>" + t.name + "</h1>" +
        '<p class="product-detail-desc">' + t.description + "</p>" +
        '<p class="product-price product-price-lg">' + formatFCFA(product.price, lang) + "</p>" +
        (outOfStock ? "" :
          '<div class="qty-stepper">' +
            '<button type="button" class="qty-btn" data-qty-decrease>−</button>' +
            '<input type="number" class="qty-input" id="detail-qty" value="1" min="1" max="' + maxQty + '">' +
            '<button type="button" class="qty-btn" data-qty-increase>+</button>' +
          "</div>"
        ) +
        '<button type="button" class="btn btn-primary" id="detail-add-to-cart"' + (outOfStock ? " disabled" : "") + ">" +
          (outOfStock ? dict["shop.out_of_stock"] : dict["shop.add_to_cart"]) +
        "</button>" +
        '<p class="product-stock-note">' + dict["shop.stock_note"] + "</p>" +
        '<a href="index.html" class="product-back-link">← ' + dict["shop.back_to_catalog"] + "</a>" +
      "</div>";

    var qtyInput = document.getElementById("detail-qty");
    var decreaseBtn = container.querySelector("[data-qty-decrease]");
    var increaseBtn = container.querySelector("[data-qty-increase]");
    if (decreaseBtn && qtyInput) {
      decreaseBtn.addEventListener("click", function () {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
      });
    }
    if (increaseBtn && qtyInput) {
      increaseBtn.addEventListener("click", function () {
        qtyInput.value = Math.min(maxQty, parseInt(qtyInput.value || "1", 10) + 1);
      });
    }

    var addBtn = document.getElementById("detail-add-to-cart");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var qty = qtyInput ? Math.max(1, parseInt(qtyInput.value || "1", 10)) : 1;
        Cart.add(product.id, qty);
        renderCartBadge();
        var original = addBtn.textContent;
        addBtn.textContent = dict["shop.added_confirmation"];
        setTimeout(function () { addBtn.textContent = original; }, 1200);
      });
    }
  }

  /* ---------- Cart page (boutique/panier.html) ---------- */
  function renderCartPage() {
    var cartPage = document.getElementById("cart-page");
    if (!cartPage) return;
    var lang = getLang();
    var dict = translations[lang] || translations.fr;

    var itemsContainer = document.getElementById("cart-items");
    var summaryContainer = document.getElementById("cart-summary");
    var checkoutForm = document.getElementById("checkout-form");
    var deliveryFields = document.getElementById("delivery-fields");
    var confirmation = document.getElementById("checkout-confirmation");
    var statusEl = document.getElementById("checkout-status");

    function renderItems() {
      var items = Cart.resolvedItems();

      if (!items.length) {
        itemsContainer.innerHTML =
          '<p class="cart-empty-message">' + dict["cart.empty"] + "</p>" +
          '<a href="index.html" class="btn btn-outline">' + dict["shop.back_to_catalog"] + "</a>";
        if (summaryContainer) summaryContainer.innerHTML = "";
        if (checkoutForm) checkoutForm.hidden = true;
        return;
      }

      if (checkoutForm) checkoutForm.hidden = false;

      var rows = items.map(function (item) {
        var t = item.product[lang] || item.product.fr;
        var maxQty = typeof item.product.stock === "number" ? item.product.stock : 99;
        return (
          '<div class="cart-row" data-cart-row="' + item.product.id + '">' +
            '<div class="cart-row-product">' +
              '<img src="../' + item.product.image + '" alt="" onerror="this.style.display=\'none\'">' +
              "<span>" + t.name + "</span>" +
            "</div>" +
            '<div class="cart-row-price" data-label="' + dict["cart.col_price"] + '">' + formatFCFA(item.product.price, lang) + "</div>" +
            '<div class="cart-row-qty" data-label="' + dict["cart.col_qty"] + '">' +
              '<div class="qty-stepper">' +
                '<button type="button" class="qty-btn" data-row-decrease="' + item.product.id + '">−</button>' +
                '<input type="number" class="qty-input" data-row-qty="' + item.product.id + '" value="' + item.qty + '" min="1" max="' + maxQty + '">' +
                '<button type="button" class="qty-btn" data-row-increase="' + item.product.id + '">+</button>' +
              "</div>" +
            "</div>" +
            '<div class="cart-row-subtotal" data-label="' + dict["cart.col_subtotal"] + '">' + formatFCFA(item.lineTotal, lang) + "</div>" +
            '<button type="button" class="cart-row-remove" data-row-remove="' + item.product.id + '" aria-label="' + dict["cart.col_remove"] + '">×</button>' +
          "</div>"
        );
      }).join("");

      itemsContainer.innerHTML =
        '<div class="cart-table">' +
          '<div class="cart-row cart-row-head">' +
            "<div>" + dict["cart.col_product"] + "</div>" +
            "<div>" + dict["cart.col_price"] + "</div>" +
            "<div>" + dict["cart.col_qty"] + "</div>" +
            "<div>" + dict["cart.col_subtotal"] + "</div>" +
            "<div></div>" +
          "</div>" +
          rows +
        "</div>";

      if (summaryContainer) {
        summaryContainer.innerHTML =
          '<div class="cart-subtotal-line">' +
            "<span>" + dict["cart.subtotal_label"] + "</span>" +
            "<strong>" + formatFCFA(Cart.subtotal(), lang) + "</strong>" +
          "</div>";
      }

      var hasPhysical = items.some(function (item) { return !item.product.digital; });
      if (deliveryFields) {
        deliveryFields.hidden = !hasPhysical;
        var addressInput = deliveryFields.querySelector('[name="address"]');
        var cityInput = deliveryFields.querySelector('[name="city"]');
        if (addressInput) addressInput.required = hasPhysical;
        if (cityInput) cityInput.required = hasPhysical;
      }

      itemsContainer.querySelectorAll("[data-row-decrease]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-row-decrease");
          var input = itemsContainer.querySelector('[data-row-qty="' + id + '"]');
          Cart.setQty(id, Math.max(1, parseInt(input.value || "1", 10) - 1));
          renderItems();
          renderCartBadge();
        });
      });
      itemsContainer.querySelectorAll("[data-row-increase]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-row-increase");
          var input = itemsContainer.querySelector('[data-row-qty="' + id + '"]');
          Cart.setQty(id, parseInt(input.value || "1", 10) + 1);
          renderItems();
          renderCartBadge();
        });
      });
      itemsContainer.querySelectorAll("[data-row-qty]").forEach(function (input) {
        input.addEventListener("change", function () {
          Cart.setQty(input.getAttribute("data-row-qty"), Math.max(1, parseInt(input.value || "1", 10)));
          renderItems();
          renderCartBadge();
        });
      });
      itemsContainer.querySelectorAll("[data-row-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          Cart.remove(btn.getAttribute("data-row-remove"));
          renderItems();
          renderCartBadge();
        });
      });
    }

    renderItems();

    if (checkoutForm && !checkoutForm.dataset.bound) {
      checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var items = Cart.resolvedItems();
        if (!items.length) return;

        var currentLang = getLang();
        var currentDict = translations[currentLang] || translations.fr;

        var lines = items.map(function (item) {
          var t = item.product[currentLang] || item.product.fr;
          return t.name + " x" + item.qty + " — " + formatFCFA(item.product.price, currentLang) + " — " + formatFCFA(item.lineTotal, currentLang);
        });
        var summaryText = lines.join("\n") + "\n" + currentDict["cart.subtotal_label"] + ": " + formatFCFA(Cart.subtotal(), currentLang);

        var summaryField = checkoutForm.querySelector('[name="order_summary"]');
        if (summaryField) summaryField.value = summaryText;

        var submitBtn = checkoutForm.querySelector('button[type="submit"]');
        var originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = currentDict["checkout.sending"];
        if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

        fetch(checkoutForm.action, {
          method: "POST",
          body: new FormData(checkoutForm),
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Order submission failed");

            var hasPhysical = items.some(function (item) { return !item.product.digital; });
            var hasDigital = items.some(function (item) { return item.product.digital; });

            if (confirmation) {
              var whatsappMessage = currentDict["checkout.whatsapp_message_prefix"] + "\n" + summaryText;
              var whatsappLink = confirmation.querySelector("#checkout-whatsapp-link");
              var summaryEl = confirmation.querySelector("#confirmation-summary");
              if (summaryEl) summaryEl.textContent = summaryText;
              if (whatsappLink) whatsappLink.href = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(whatsappMessage);

              var digitalNote = confirmation.querySelector("#confirmation-digital-note");
              var physicalNote = confirmation.querySelector("#confirmation-physical-note");
              if (digitalNote) digitalNote.hidden = !hasDigital;
              if (physicalNote) physicalNote.hidden = !hasPhysical;

              confirmation.hidden = false;
            }
            checkoutForm.hidden = true;

            Cart.clear();
            renderCartBadge();
          })
          .catch(function () {
            if (statusEl) {
              statusEl.textContent = currentDict["checkout.error"];
              statusEl.classList.add("error");
            }
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          });
      });
      checkoutForm.dataset.bound = "true";
    }
  }

  /* ---------- Init ---------- */
  function renderAll() {
    renderCartBadge();
    renderCatalog();
    renderProductDetail();
    renderCartPage();
    renderStorageWarning();
  }

  renderAll();
  window.addEventListener("langchange", renderAll);
})();
