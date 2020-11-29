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

// "https://api.homecooksapp.co.uk"
// "https://api.homecooksportal.co.uk"
const hostname = window.location.hostname;
let host;
switch (hostname) {
  case "staging-homecooksbb.temp927.kinsta.cloud":
    host = "https://api.homecooksapp.co.uk";
    break;
  case "home-cooks.co.uk":
    host = "https://api.homecooksportal.co.uk";
    break;
  default:
    host = "https://cehc-api.test";
}

const fetchMenuSuccess = function (menuId, cart, data) {
  $(`#${menuId}`).modal();

  const modalEl = $(`.jquery-modal > #${menuId}`);
  const container = $(`.jquery-modal > #${menuId}.modal > .container`);

  modalEl.on($.modal.BEFORE_CLOSE, function (_event, _modal) {
    cart.clear();
    container.html("");
  });

  const { title, products, post_id: postId } = data;

  container.append(`<h2 class="order__title title">${title}</h2>`);

  dataEl = $(".generic-button.buy").first();
  const plusImage = dataEl.data("plus");
  const minusImage = dataEl.data("minus");
  const buttonImage = dataEl.data("button");
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = []; //If this type wasn't previously stored
    acc[product.category].push(product);
    return acc;
  }, {});

  const order = [
    "Starters",
    "Mains",
    "Sides",
    "Desserts",
    "Extras",
    "Snacks",
    "Desserts",
    "Deals",
    "Delivery",
  ];

  order.forEach(function (category) {
    const products = categories[category];
    if (products === undefined) return;
    const rows = products
      .map((p) => {
        const description = p.description
          ? p.description.length > 155
            ? `<div class="item__description description hidden">
            <p class='item__description__content'>${p.description}</p>
            <a class="description__btn">Read More</a>
          </div>`
            : `<div class="item__description description">
            <p class='item__description__content'>${p.description}</p>
          </div>`
          : "";
        return `
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
          ${description}
        </div>
      `;
      })
      .join("");

    container.append(`<h2 class="starters__title">${category}</h2>${rows}`);
  });

  container.append(`
    <h2 class="starters__title"></h2>
    <button disabled data-post-id='${postId}' class="button--submit btn-checkout">Checkout <img src="${buttonImage}" /></button>
  `);

  $(".description__btn").on("click", function (e) {
    e.preventDefault();
    $(this).parent().toggleClass("hidden");
  });

  $(".btn-checkout").on("click", function (e) {
    e.preventDefault();

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

  const {
    total,
    fulfilment_type: fulfilmentType,
    post_title: postTitle,
    payment_link_reference: paymentLinkReference,
  } = data;

  const minTime = data.min_time.split(":").slice(0, 2).join(":");
  const maxTime = data.max_time.split(":").slice(0, 2).join(":");
  const minLabel = minTime.replace(":", "");
  const maxLabel = maxTime.replace(":", "");

  const totalEl = `
    <tr class="table__row">
      <td class="cell cell-name">Total</td>
      <td class="cell cell-cost">£ ${total}</td>
    </tr>
  `;

  const userHasChoice = fulfilmentType == "delivery_or_collection";
  const fulfilmentInput = userHasChoice
    ? `<label class="form__field field field__select">
          <span class="field__text ">Fulfilment Type</span>
          <select name="fulfilment" id="fulfilment-select">
            <option value="collection">Collection</option>
            <option value="delivery">Delivery</option>
          </select>
        </label>`
    : `<input type="hidden" name="fulfilment" value="${fulfilmentType}">`;

  const isHidden = (field) => (field.length > 0 ? "hidden" : "");

  const fulfilmentElements = {
    collection: `
      <label class="form__field field field__select">
        <span class="field__text ">Collection can be made between ${minLabel} and ${maxLabel}. When would you like to collect your food?</span>
        <input type="time" required class="field__input" name="collection_time" min="${minTime}" max="${maxTime}" />
      </label>
    `,
    delivery: `
      <label class="form__field field field__select">
        <span class="field__text ">Delivery Address</span>
        <input required value="${deliveryAddress}" name="delivery_address" id="geocomplete" class="field__input" value="" type="text" placeholder="" />
      </label>
      <label class="form__field field">
        <span class="field__text">Delivery Instructions</span>
        <textarea class="field__input" name="delivery_instruction" type="text" rows="4"></textarea>
      </label>
      <div class="file-input">
        <label class="form__field field">
          <span class="field__text">(Optional) Add a pic of your front door to help the delivery driver find you</span>
        </label>
        <label for="file-upload" class="custom-file-upload form__field">
          Choose File
          <input id="file-upload" name="front_door_photo" type="file" />
        </label>
        <span class="file-list">No File Chosen</span>
      </div>
    `,
  };

  const form = `
  <div class="modal__content">
    <section class="order">
      <h2 class="order__title title">${postTitle}</h2>
      <table class="order__table table">
        <tfoot class="table__foot">
          ${totalEl}
        </tfoot>
      </table>
    </section>
    <section class="delivery">
      <h2 class="delivery__title title">Delivery information</h2>
      <form class="delivery__form form" id="checkout-form">
        <label class="form__field ${isHidden(firstName)} field">
          <span class="field__text">First Name</span>
          <input required value="${firstName}" class="field__input" name="first_name" type="text" placeholder="Enter first name" />
        </label>
        <label class="form__field ${isHidden(lastName)} field">
          <span class="field__text">Last Name</span>
          <input required value="${lastName}" class="field__input" name="last_name" type="text" placeholder="Enter last name" />
        </label>
        <label class="form__field ${isHidden(email)} field">
          <span class="field__text">Email</span>
          <input required value="${email}" class="field__input" name="email" type="email" placeholder="Enter e-mail" />
        </label>
        <label class="form__field ${isHidden(phone)} field">
          <span class="field__text">Phone</span>
          <input required value="${phone}" class="field__input" name="phone" type="text" placeholder="(480) 555-0103" />
        </label>
        ${fulfilmentInput}
        <div class="fulfilment-content">
          ${
            userHasChoice
              ? fulfilmentElements.collection
              : fulfilmentElements[fulfilmentType]
          }
        </div>
        <div class="form__submit">
          <button data-fulfilment-type='${fulfilmentType}' data-payment-link-reference='${paymentLinkReference}' class="button--submit btn-pay">Checkout <img src="${buttonImage}" /></button>
        </div>
      </form>
    </section>
  </div>`;

  container.html(form);

  const formEl = document.getElementById("checkout-form");
  let pristine = new Pristine(formEl, { classTo: "form__field" });

  if (userHasChoice) {
    $("#fulfilment-select").on("change", function (e) {
      $(".fulfilment-content").html(fulfilmentElements[e.target.value]);
      pristine = new Pristine(formEl, { classTo: "form__field" });
    });
  }

  $(".btn-pay").on("click", function (e) {
    e.preventDefault();

    // Validation
    const valid = pristine.validate();

    if (valid) {
      const paymentLinkReference = $(this).data("payment-link-reference");
      const currentFulfilment = $('*[name="fulfilment"]').val();

      var fd = new FormData();
      fd.append("first_name", $("input[name='first_name']").val());
      fd.append("last_name", $("input[name='last_name']").val());
      fd.append("phone", $("input[name='phone']").val());
      fd.append("email", $("input[name='email']").val());

      if (currentFulfilment == "collection") {
        fd.append("collection_time", $("input[name='collection_time']").val());
        fd.append("fulfilment", "collection_box");
      } else if (currentFulfilment == "delivery") {
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
        fd.append("fulfilment", "delivery_box");
      } else {
        alert("Fulfilment not selected!");
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
    }
  });

  // geocoder = new google.maps.Geocoder();
  // const setAddressFromGeocode = (element) => {
  //   geocoder.geocode({ address: element.value }, function (results, status) {
  //     if (status == "OK") {
  //       result = results[0];
  //       if (result && (result.types || []).includes("street_address")) {
  //         element.value = result.formatted_address;
  //       } else {
  //         element.value = "";
  //       }
  //     } else {
  //       element.value = "";
  //     }
  //   });
  // };

  // const input = document.getElementById("geocomplete");
  // setAddressFromGeocode(input);

  // const autocomplete = new google.maps.places.Autocomplete(input, {
  //   types: ["address"],
  //   componentRestrictions: { country: "uk" },
  // });
  // google.maps.event.addListener(autocomplete, "place_changed", function () {
  //   input.parentElement.classList.remove("has-danger");
  //   setAddressFromGeocode(input);
  // });
  // input.addEventListener("change", (_event) => {
  //   input.value = "";
  //   input.parentElement.classList.add("has-danger");
  //   input.parentElement.classList.remove("has-success");
  // });
};

function initMap() {
  console.log("DONE!");
}

$(document).ready(function () {
  $(document).on("change", "#file-upload", function (e) {
    const files = e.currentTarget.files; //FileList
    const fileNames = [];
    for (let i = 0; i < files.length; i++) {
      fileNames.push(files[i].name);
    }
    $(".file-list").html(fileNames[0]);
  });

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
      const checkout = modalEl.find(".btn-checkout");
      const el = $("#quantity_" + productId);
      cart.removeProduct(productId, price);
      el.html(cart.quantity(productId));
      // total.html(`Total: £${cart.total}`);
      if (cart.total <= 0) checkout.prop("disabled", true);
    });
  });
});
