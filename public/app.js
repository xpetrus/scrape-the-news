$.getJSON("/articles", function(data){
    for (var i = 0; i < data.length; i++){
        $("#contain-articles").append("<div data-id = '"+ data[i]._id + "'class = 'card'>"
        +"<div class = 'card-header'> <h3><a class ='a-link' href ='"+data[i].link+"'>"+data[i].title+
        "</a><a class ='btn btn-success save'>Save Article</a></h3></div></div>");
    }
});

$(".save").on("click", function(){
    var artid = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url: "/articles/save" + artid
    }).done(function(data){
        window.location="/";
    });
});