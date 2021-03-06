var express = require("express");
var logger = require ("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

//database config with mongoose
var databaseUri = 'mongodb://localhost/scrapticle';

if(process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI);
} else{
    mongoose.connect(databaseUri, {useNewUrlParser: true});
}


app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//mongoose
//mongoose.connect("mongodb://localhost/scrapticle", { useNewUrlParser: true });

//Routes
app.get("/", function(req, res){
    db.Article.find({"saved":false})
        .then(function(dbArticle){
            
            let hbsArticles = {
                articles: dbArticle
            };
            res.render("index", hbsArticles);
        })
        .catch(function(err){
            res.json(err);
        });
});

app.get("/scrape", function(req, res){
    axios.get("https://www.theonion.com").then(function(response){
        var $ = cheerio.load(response.data);

        $("article header h1").each(function(i, element){
            var result = {};

            result.title = $(this)
            .children("a")
            .text();

            result.link = $(this)
            .children("a")
            .attr("href");

            result.saved = false;

            db.Article.create(result)
            .then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        });
        res.redirect('/');
    });
});
//get scraped articles from db
app.get("/articles", function(req, res){
    db.Article.find({})
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});

app.get("/saved", function(req, res){
    db.Article.find({"saved":true})
        .then(function(sArticles){
            //res.json(dbArticle);
            var hbsArticles;
            hbsArticles ={
                articles: sArticles
            };
            res.render("saved", hbsArticles);
        })
        .catch(function(err){
            res.json(err);
        });
});

//saving an article
app.put("/articles/save/:id", function(req, res){
    db.Article.findOneAndUpdate({"_id":req.params.id}, {"saved":true})
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//deleting saved article...
app.put("/delete/:id", function (req, res){
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"saved": false})
    .then(function(data){
        res.json(data);
    })
    .catch(function(err){
        res.json(err);
    });
});

//Get article by id and populating it with comments
app.get("/articles/:id", function(req, res){
    db.Article.find({_id: req.params.id})
    .populate({
        path: 'comment',
        model: 'Comment'
    })
    .then(function(rarticle){
        res.json(rarticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//saving a new comment
app.post("/comment/:id", function (req, res){
    db.Comment.create(req.body)
        .then(function(dbComment){
            return db.Article.findOneAndUpdate({_id: req.params.id }, {$push: {comment: dbComment._id}},{new: true});
        })
        .then(function(article){
            res.json(article);
        })
        .catch(function(err){
            res.json(err);
        });
});

app.delete("/comment/:id", function(req, res){
    db.Comment.findOneAndDelete({_id: req.params.id})
    .then(function(data){
        //return db.Article.findByIdAndUpdate({comment:req.params.id}, {$pullAll: [{comment: req.params.id}]});
        res.json(data);
    });
});



//start the server
app.listen(PORT,function(){
    console.log("App Running on port "+PORT + "!");
});