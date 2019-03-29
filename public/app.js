

$(".save").on("click", function(){
    var artid = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url: "/articles/save" + artid
    }).done(function(data){
        window.location="/";
    });
});