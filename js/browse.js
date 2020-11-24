var $ = jQuery;
const hostname = window.location.hostname;
const isStaging = hostname == "staging-homecooksbb.temp927.kinsta.cloud";
// "//api.homecooksapp.co.uk"
const host = isStaging
  ? "https://api.homecooksportal.co.uk"
  : "http://localhost:8002";

var html = '<div class="menus"></div>';

const renderMenu = (posts) => {
  const today = moment();
  const tomorrow = moment().add(1, "days");
  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.fulfilment_date]) acc[post.fulfilment_date] = []; //If this type wasn't previously stored
    acc[post.fulfilment_date].push(post);
    return acc;
  }, {});

  const orderedDays = Object.keys(postsByDate)
    .map((d) => moment(d))
    .sort((a, b) => a.format("YYYY-MM-DD") - b.format("YYYY-MM-DD"))
    .map((d) => {
      const name = d.isSame(today, "d")
        ? "Today"
        : d.isSame(tomorrow, "d")
        ? "Tomorrow"
        : d.format("dddd");
      return [d.format("YYYY-MM-DD"), name];
    });

  const content = orderedDays
    .map((el) => {
      const date = el[0];
      const name = el[1];

      const items = postsByDate[date]
        .map((p) => {
          const fulfilmentType =
            p.fulfilment_type === "delivery_or_collection"
              ? "Delivery/Collection"
              : p.fulfilment_type;
          return `
              <div class="section__card card">
                <div class="card__head">
                  <h3 class="card__title">${p.title}</h3>
                  <span class="card__type">${fulfilmentType} </span>
                  <span class="card__status">${p.remaining_order_quantity} Orders Left</span>
                </div>
                <div class="card__image" style="background: url(${p.images[0]})"></div>
                <div class="card__bottom">
                  <div class="card__author author">
                    <img class="author__avatar" src="https://staging-homecooksbb.temp927.kinsta.cloud/wp-content/plugins/activity-popup-addon/images/chef_icon.jpeg" />
                    <span class="author__name">${p.seller}</span>
                  </div>
                </div>
              </div>
             `;
        })
        .join("");

      const section = `
    <section class="menus-section section">
      <h2 class="section__title">${name}</h2>
      <div class="section__content">${items}</div>
    </section>
    `;
      return section;
    })
    .join("");

  $(".menus").html(content);
};

$(document).ready(function () {
  // alert("hello!");
  // console.log($(".container"));
  $("#content > .container").html(html);
  $.ajax({
    type: "GET",
    url: host + "/api/v1/available-menus",
    error: function (_jqXhr, _textStatus, _errorMessage) {
      alert("error");
    },
    success: renderMenu,
    dataType: "json",
  });
});
