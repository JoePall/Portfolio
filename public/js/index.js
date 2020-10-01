$(function() {
  console.log("ready!");

  $(".image-modal-button").on("click", function() {
    console.log($(this));
    let url = $(this).attr("data-url");
    let alt = $(this).attr("data-alt");

    $(".modal-img").attr("src", url);
    $(".modal-img").attr("alt", alt);
    $(".modal-title").text(alt);
    $("#image-modal").modal("show");
  });

  $(".close-modal").on("click", function() {
    $(".modal-img").attr("src", null);
    $(".modal-img").attr("alt", "");
    $(".modal-title").val("");
    $("#image-modal").removeClass("is-active");
  });
});