$(function() {
    $(".create-form").on("submit", function(event) {
        event.preventDefault();
        var newComment = {
        comment: $("#comment").val().trim(),
        user: $("user").val().trim()||"anon"
        };
        // Send the POST request.
        $.ajax("/article/"+$(this).data("id"), {
        type: "POST",
        data: newComment
        }).then(
        function() {
            location.reload();
        }
        );
    });
});