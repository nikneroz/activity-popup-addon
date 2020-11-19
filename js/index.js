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
}

var $ = jQuery;
var modal = jQuery.modal;
const hostname = window.location.hostname;
const isStaging = hostname == "staging-homecooksbb.temp927.kinsta.cloud";
const host = isStaging
  ? "http://api.homecooksapp.co.uk"
  : "http://localhost:8002";

$(document).ready(function () {
  $(document).on("click", ".menu-button", function (e) {
    e.preventDefault();
    const menuId = $(this).data("id");
    const modalEl = $("#ex1");
    const cart = new Cart();

    modalEl.on($.modal.BEFORE_CLOSE, function (_event, _modal) {
      modalEl.children(".container").html("");
    });

    modalEl.on("click", ".add-to-cart", function (e) {
      e.stopPropagation();
      const productId = $(this).data("product-id");
      const price = parseFloat($(this).data("price"));
      const total = modalEl.find(".total");
      const checkout = modalEl.find(".btn-checkout");
      const el = $("#quantity_" + productId);
      cart.addProduct(productId, price);
      el.html(cart.quantity(productId));
      total.html(`Total: £${cart.total}`);
      if (cart.total > 0) checkout.prop("disabled", false);
    });

    modalEl.on("click", ".remove-from-cart", function (e) {
      e.stopPropagation();
      const productId = $(this).data("product-id");
      const price = parseFloat($(this).data("price"));
      const total = modalEl.find(".total");
      const checkout = modalEl.find(".btn-checkout");
      const el = $("#quantity_" + productId);
      cart.removeProduct(productId, price);
      el.html(cart.quantity(productId));
      total.html(`Total: £${cart.total}`);
      if (cart.total <= 0) checkout.prop("disabled", true);
    });

    modalEl.on("click", ".btn-pay", function (e) {
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
          $("input[name='delivery_instructions']").val()
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
              // Make the id field from the Checkout Session creation API response
              // available tw3q21 `esQ1`ZSWQ@!`So this file, so you can provide it as argument here
              sessionId: data.stripe_id,
            })
            .then(function (result) {
              console.log(result);
              // If `redirectToCheckout` fails due to a browser or network
              // error, display the localized error message to your customer
              // using `result.error.message`.
            });
        },
      });
    });

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
        success: function (data) {
          dataEl = $(".generic-button.buy").first();
          const firstName = dataEl.data("first-name");
          const lastName = dataEl.data("last-name");
          const phone = dataEl.data("phone");
          const email = dataEl.data("email");
          const deliveryAddress = dataEl.data("address");

          const items = data.items.map(
            (i) => `
            <div class='row justify-content-md-center'>
              <div class='col col-md-10'>${i.name}</div>
              <div class='col col-md-2'>£${i.cost}</div>
            </div>
          `
          );

          const total = `
            <div class='row justify-content-md-center'>
              <div class='col col-md-10'>Total</div>
              <div class='col col-md-2'>£${data.total}</div>
            </div>
          `;

          // let fulfilment = `
          // <div class="form-group">
          //   <label for="fulfilment">Fulfilment</label>
          //   <input type="hidden" name="fulfilment">
          // </div>
          // `;

          const fulfilment = `<input type="hidden" name="fulfilment">`;

          const form = `
            <h1 class='text-center'>${data.post_title}</h1>
            <div class='row justify-content-md-center'>
              <div class='col col-md-10'>Items</div>
              <div class='col col-md-2'>Cost</div>
            </div>
            ${items}
            ${total}

            <h1 class='text-center'>Delivery information</h1>

            <form>
              <div class="form-group">
                <label for="first_name">First Name</label>
                <input value="${firstName}" type="text" class="form-control" name="first_name" required placeholder="Enter first name">
              </div>
              <div class="form-group">
                <label for="last_name">Last Name</label>
                <input value="${lastName}" type="text" class="form-control" name="last_name" required placeholder="Enter last name">
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input value="${email}" type="email" class="form-control" name="email" required placeholder="Enter email">
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input value="${phone}" type="text" class="form-control" name="phone" required placeholder="Enter phone">
              </div>
              ${fulfilment}
              <div class="form-group">
                <label for="delivery_address">Delivery Address</label>
                <input value="${deliveryAddress}" type="text" class="form-control" name="delivery_address" required placeholder="Enter delivery address">
              </div>
              <div class="form-group">
                <label for="delivery_instructions">Delivery Instructions</label>
                <textarea class="form-control" name="delivery_instructions" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label for="front_door_photo">Front Door Photo</label>
                <input type="file" name="front_door_photo" id="front_door_photo" accept='image/*'>
              </div>
              <div class="text-center">
                <button type="button" data-fulfilment-type='${data}' data-payment-link-reference='${data.payment_link_reference}' class="btn btn-success btn-lg btn-pay">Checkout</button>
              </div>
            </form>
          `;

          modalEl.children(".container").html(form);
        },
        dataType: "json",
      });
    });

    const success = function (data) {
      modalEl.modal();
      const categories = data.products.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = []; //If this type wasn't previously stored
        acc[product.category].push(product);
        return acc;
      }, {});

      Object.keys(categories).forEach(function (category) {
        const products = categories[category];
        const rows = products.map(
          (p) => `
            <div class='row justify-content-md-center'>
              <div class='col col-sm-1'></div>
              <div class='col col-md-5'>${p.title}</div>
              <div class='col col-md-2'>${p.price_text}</div>
              <div class='col col-md-2' id='quantity_${p.id}'>0</div>
              <div class='col col-md-2'>
                <button type="button" data-product-id='${p.id}' data-price='${p.price}' class="btn btn-danger remove-from-cart">-</button>
                <button type="button" data-product-id='${p.id}' data-price='${p.price}' class="btn btn-primary add-to-cart">+</button>
              </div>
            </div>
          `
        );
        const total = `<h2 class='total'>Total: £${cart.total}</h2>`;
        const checkout = `
            <div class="text-center">
              <button type="button" class="btn btn-success btn-lg btn-checkout" disabled data-post-id='${data.post_id}'>Checkout</button>
            </div>
          `;
        modalEl
          .children(".container")
          .append(`<h2>${category}</h2>${rows}${total}${checkout}`);
      });
    };

    $.ajax({
      type: "GET",
      url: host + "/api/v1/menu/" + menuId,
      error: function (_jqXhr, _textStatus, _errorMessage) {
        alert("error");
      },
      success,
      dataType: "json",
    });
  });

  // $(document).on("click", ".product-details-popup", function (e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   var reference_no = $(this).data("id");
  //   $.ajax({
  //     url: "/product-detail-popup/" + reference_no,
  //     method: "get",
  //     success: function (res) {
  //       $("#product_image").attr("src", res.image);
  //       $("#product_title").text(res.title);
  //       $("#product_price").text(res.price);
  //       $("#seller_name").text(res.seller);
  //       $("#dietaryTag").text(res.dietaryTags);
  //       $("#cuisineTag").text(res.cuisineTags);
  //       $("#product_description").text(res.description);
  //       $("#allergens").text(res.allergens);
  //       $("#reheating_instruction_1").parent().show();
  //       $("#reheating_instruction_2").parent().show();
  //       if (res.reheating_instruction_1 != null) {
  //         $("#reheating_instruction_1").text(res.reheating_instruction_1);
  //       } else {
  //         $("#reheating_instruction_1").parent().hide();
  //       }

  //       if (res.reheating_instruction_2 != null) {
  //         $("#reheating_instruction_2").text(res.reheating_instruction_2);
  //       } else {
  //         $("#reheating_instruction_2").parent().hide();
  //       }

  //       $("#exampleModalCenter").modal("show");
  //     },
  //   });
  // });
});
