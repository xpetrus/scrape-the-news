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
    //Toggle Comment Section Model
    $(".commentArt").click(function(event){
        event.preventDefault();
        var artid = $(this).attr("data");
        $("#carticle-id").text(artid);
        $.ajax({
            url: "/articles/"+artid,
            type: "GET"
        }).then(function(data){
            console.log(data);
            $(".existing-comments").empty();
            if(data[0].comment.length > 0){
                data[0].comment.forEach(c => {
                    $('.existing-comments').append($(`<li class = 'list-group-item'>${c.body}<button type = 'button' class = 'btn btn-danger btn-sm float-right deleteComment' data = '${c._id}'>X</button></li>`));
                })
            }
            else{
                $('.existing-comments').append($(`<li class = 'list-group-item'>No Comments Yet.</li>`));
            }
        })
        $("#comment-sec").modal('toggle');
    });

    $("#submit-comment").click(function(event){
        event.preventDefault();
        var artid = $(this).attr('data');
        var newComment = $("#comment-input").val().trim();
        $("#comment-input").val(''); 
        $.ajax({
            url: "/comment/" + artid,
            type: "POST",
            data: {body: newComment}
        }).then(function(data){
            console.log(data);
            
        })
        $("#comment-sec").modal('toggle');
        
    });



});
