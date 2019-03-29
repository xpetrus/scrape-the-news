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


//start the server
app.listen(PORT,function(){
    console.log("App Running on port "+PORT + "!");
});