$(document).ready(function(){

    $(".save-art").click(function(event){
        event.preventDefault();
        var artid = $(this).attr("id");
        
        $.ajax({
            type:"PUT",
            url: "/articles/save/" + artid
        }).done(function(data){
            window.location="/";
        });
    });



});
