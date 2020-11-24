class Cart {
  products = {};
  total = 0.0;
  quantity(productId) {
    return this.products[productId] || 0;
  }
  addProduct(productId, price) {
    this.products[productId] = this.products[productId] || 0;
    this.products[productId] += 1;
    this.total += price;
  }
  removeProduct(productId, price) {
    if (
      this.products[productId] === undefined ||
      this.products[productId] === 0
    ) {
      this.products[productId] = 0;
    } else {
      this.products[productId] -= 1;
      this.total -= price;
    }
  }
  clear() {
    this.total = 0.0;
    this.products = {};
  }
}

var $ = jQuery;
var modal = jQuery.modal;
// var autocompleter = jQuery.autocompleter;
const hostname = window.location.hostname;
const isStaging = hostname == "staging-homecooksbb.temp927.kinsta.cloud";
const host = isStaging
  ? "https://api.homecooksapp.co.uk"
  : "http://localhost:8002";

const fetchMenuSuccess = function (menuId, cart, data) {
  $(`#${menuId}`).modal();

  const modalEl = $(`.jquery-modal > #${menuId}`);
  const container = $(`.jquery-modal > #${menuId}.modal > .container`);

  modalEl.on($.modal.BEFORE_CLOSE, function (_event, _modal) {
    cart.clear();
    container.html("");
  });

  container.append(`<h2 class="order__title title">${data.title}</h2>`);

  dataEl = $(".generic-button.buy").first();
  const plusImage = dataEl.data("plus");
  const minusImage = dataEl.data("minus");
  const buttonImage = dataEl.data("button");
  const categories = data.products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = []; //If this type wasn't previously stored
    acc[product.category].push(product);
    return acc;
  }, {});

  Object.keys(categories).forEach(function (category) {
    const products = categories[category];
    const rows = products.map(
      (p) => `
        <div class="starters__item item">
          <div class="item__form">
            <span class="item__name">${p.title}</span>
            <span class="item__counter counter">
              <span class="counter__price">${p.price_text}</span>
              <div data-product-id='${p.id}' data-price='${p.price}' class="counter__btn remove-from-cart"><img src="${minusImage}" /></div>
              <span id='quantity_${p.id}' class="counter__count">0</span>
              <div data-product-id='${p.id}' data-price='${p.price}' class="counter__btn add-to-cart"><img src="${plusImage}" /></div>
            </span>
          </div>
          <p class="item__description description">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. <a class="description__btn">Read More</a>
          </p>
        </div>
      `
    );

    container.append(`<h2 class="starters__title">${category}</h2>${rows}`);
  });

  container.append(`
    <h2 class="starters__title"></h2>
    <button disabled data-post-id='${data.post_id}' class="button--submit btn-checkout">Checkout <img src="${buttonImage}" /></button>
  `);
};

const saveMenuSuccess = function (menuId, cart, data) {
  const modalEl = $(`.jquery-modal > #${menuId}`);
  const container = $(`.jquery-modal > #${menuId}.modal > .container`);

  modalEl.on($.modal.BEFORE_CLOSE, function (_event, _modal) {
    cart.clear();
    container.html("");
  });

  dataEl = $(".generic-button.buy").first();
  const firstName = dataEl.data("first-name");
  const lastName = dataEl.data("last-name");
  const phone = dataEl.data("phone");
  const email = dataEl.data("email");
  const deliveryAddress = dataEl.data("address");
  const buttonImage = dataEl.data("button");

  const items = data.items.map(
    (i) => `
    <tr class="table__row">
      <td class="cell cell-name">${i.name}</td>
      <td class="cell cell-cost">£ ${i.cost}</td>
    </tr>
  `
  );

  const total = `
    <tr class="table__row">
      <td class="cell cell-name">Total</td>
      <td class="cell cell-cost">£ ${data.total}</td>
    </tr>
  `;

  const fulfilment = `<input type="hidden" name="fulfilment">`;

  const form = `
  <div class="modal__content">
    <section class="order">
      <h2 class="order__title title">${data.post_title}</h2>
      <table class="order__table table">
        <thead class="table__head">
          <tr class="table__row">
            <th class="cell cell-name">ITEM NAME</th>
            <th class="cell cell-cost">COST</th>
          </tr>
        </thead>
        <tbody class="table__body">
          ${items}
        </tbody>
        <tfoot class="table__foot">
          ${total}
        </tfoot>
      </table>
    </section>
    <section class="delivery">
      <h2 class="delivery__title title">Delivery information</h2>
      <form class="delivery__form form">
        <label class="form__field field">
          <span class="field__text">First Name</span>
          <input value="${firstName}" class="field__input" name="first_name" type="text" placeholder="Enter first name" />
        </label>
        <label class="form__field field">
          <span class="field__text">Last Name</span>
          <input value="${lastName}" class="field__input" name="last_name" type="text" placeholder="Enter last name" />
        </label>
        <label class="form__field field">
          <span class="field__text">Email</span>
          <input value="${email}" class="field__input" name="email" type="text" placeholder="Enter e-mail" />
        </label>
        <label class="form__field field">
          <span class="field__text">Phone</span>
          <input value="${phone}" class="field__input" name="phone" type="text" placeholder="(480) 555-0103" />
        </label>
        ${fulfilment}
        <label class="form__field field field__select">
          <span class="field__text ">Delivery Address</span>
          <input value="${deliveryAddress}" name="delivery_address" id="geocomplete" class="field__input" value="" type="text" placeholder="" />
        </label>
        <label class="form__field field">
          <span class="field__text">Delivery Instructions</span>
          <textarea class="field__input" name="delivery_instruction" type="text" rows="4"></textarea>
        </label>
        <div class="file-input">
          <label class="form__field field">
            <span class="field__text">Delivery Instructions</span>
          </label>
          <label for="file-upload" class="custom-file-upload">
            Choose File
          </label>
          <input id="file-upload" name="front_door_photo" type="file" />
          <span class="file-list">No File Chosen</span>
        </div>
        <div class="form__submit">
          <button data-fulfilment-type='${data}' data-payment-link-reference='${data.payment_link_reference}' class="button--submit btn-pay">Checkout <img src="${buttonImage}" /></button>
        </div>
      </form>
    </section>
  </div>`;

  container.html(form);
};

$(document).ready(function () {
  $(document).on("click", ".menu-button", function (e) {
    e.preventDefault();
    const menuId = $(this).data("id");
    const modalEl = $(`#${menuId}`);
    const cart = new Cart();

    $.ajax({
      type: "GET",
      url: host + "/api/v1/menu/" + menuId,
      error: function (_jqXhr, _textStatus, _errorMessage) {
        alert("error");
      },
      success: (data) => fetchMenuSuccess(menuId, cart, data),
      dataType: "json",
    });

    $(document).on("click", ".add-to-cart", function (e) {
      e.stopPropagation();
      const productId = $(this).data("product-id");
      const price = parseFloat($(this).data("price"));
      // const total = modalEl.find(".total");
      const checkout = modalEl.find(".btn-checkout");
      const el = $("#quantity_" + productId);
      cart.addProduct(productId, price);
      el.html(cart.quantity(productId));
      // total.html(`Total: £${cart.total}`);
      if (cart.total > 0) checkout.prop("disabled", false);
    });

    $(document).on("click", ".remove-from-cart", function (e) {
      e.stopPropagation();
      const productId = $(this).data("product-id");
      const price = parseFloat($(this).data("price"));
      // const total = modalEl.find(".total");
      const checkout = modalEl.find(".btn-checkout");
      const el = $("#quantity_" + productId);
      cart.removeProduct(productId, price);
      el.html(cart.quantity(productId));
      // total.html(`Total: £${cart.total}`);
      if (cart.total <= 0) checkout.prop("disabled", true);
    });

    $(document).on("click", ".btn-pay", function (e) {
      e.preventDefault();
      const fulfilmentEl = $("input[name='fulfilment']");
      const paymentLinkReference = $(this).data("payment-link-reference");
      const fulfilmentType = $(this).data("fulfilment-type");

      if (fulfilmentType == "collection") {
        fulfilmentEl.val("collection_box");
      } else if (fulfilmentType == "delivery") {
        fulfilmentEl.val("delivery_box");
      }

      var fd = new FormData();
      fd.append("first_name", $("input[name='first_name']").val());
      fd.append("last_name", $("input[name='last_name']").val());
      fd.append("phone", $("input[name='phone']").val());
      fd.append("email", $("input[name='email']").val());

      if (fulfilmentEl.val() == "collection_box") {
        fd.append("collection_time", $("#ec_Time").val());
        fd.append("fulfilment", fulfilmentEl.val());
      } else {
        var file = $("input[name='front_door_photo']")[0].files[0];
        if (file) fd.append("file", file);
        fd.append(
          "delivery_address",
          $("input[name='delivery_address']").val()
        );
        fd.append(
          "delivery_instruction",
          $("input[name='delivery_instruction']").val()
        );
        fd.append("fulfilment", fulfilmentEl.val());
      }

      $.ajax({
        url: `${host}/api/v1/prepare-fulfilment/${paymentLinkReference}`,
        type: "POST",
        data: fd,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
          Stripe(data.stripe_public)
            .redirectToCheckout({
              sessionId: data.stripe_id,
            })
            .then(function (result) {
              console.log(result);
            });
        },
      });
    });

    // let searchPlace = "Paris";
    // const googleApiKey = "AIzaSyCwUWvrwC2F3K4sluMgaf6xHxCjsv-LIr4";
    // const searchReqLink = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchPlace}&types=geocode&key=${googleApiKey}&callback=?`;

    // $("#geocomplete").autocomplete({
    //   source: data,
    // });

    // $(document).on("change keyup", "#geocomplete", function () {
    //   searchPlace = this.value;
    //   // $.getJSON('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=1600+Amphitheatre&key=AIzaSyCwUWvrwC2F3K4sluMgaf6xHxCjsv-LIr4&callback=?')
    //   $.getJSON(searchReqLink, function (result) {
    //     $.each(result, function (_i, field) {
    //       console.log(field);
    //     });
    //   });
    // });

    $(document).on("click", ".btn-checkout", function (e) {
      e.preventDefault();
      var postId = $(this).data("post-id");

      $.ajax({
        type: "POST",
        url: host + "/api/v1/save-cart",
        data: {
          post_id: postId,
          products: cart.products,
        },
        error: function (_jqXhr, _textStatus, _errorMessage) {
          alert("error");
        },
        success: (data) => saveMenuSuccess(menuId, cart, data),
        dataType: "json",
      });
    });
  });
});
