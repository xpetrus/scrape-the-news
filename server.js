var express = require("express");
var logger = require ("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapticle", { useNewUrlParser: true });

//Routes
app.get("/scrape", function(req, res){
    axios.get("https://www.theonion.com").then(function(response){
        var $ = cheerio.load(response.data);

        $("article div a").each(function(i, element){
            var result = {};

            result.title = $(this)
            .children("h1")
            .text();

            result.link = $(this)
            
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
        res.send("Scrape Complete");
    });
});

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
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});

//saving an article
app.post("/articles/save/:id", function(req, res){
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