$(document).ready(function(){
    //Saving a scraped article
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
    //deleting a saved article
    $(".delArt").click(function(event){
        event.preventDefault();
        var artid = $(this).attr("data");
        $.ajax({
            type:"PUT",
            url: "/delete/" +artid
        }).done(function(data){
            window.location="/saved";
        });
    });



});
