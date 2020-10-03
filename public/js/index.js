$(() => {
  console.log("ready!");

  $(".image-modal-button").on("click", function() {
    console.log($(this));
    const url = $(this).attr("data-url");
    const alt = $(this).attr("data-alt");

    $(".modal-img").attr("src", url);
    $(".modal-img").attr("alt", alt);
    $(".modal-title").text(alt);
    $("#image-modal").modal("show");
  });

  $(".close-modal").on("click", () => {
    $(".modal-img").attr("src", null);
    $(".modal-img").attr("alt", "");
    $(".modal-title").val("");
    $("#image-modal").removeClass("is-active");
  });
});
