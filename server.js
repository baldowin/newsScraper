var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars")
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI,{ useNewUrlParser: true });

//API ROUTES HERE
//Scraping Headlines from ESPN
app.get("/api/scrape",function(res,req){
    axios.get("https://espn.com").then(function(response){
      var $ = cheerio.load(response.data);
      $(".headlineStack__list").each(function(i, element) {//list of headlines
        $(element).children().each(function(i,element){
          var title = $(element).children().text();
          var link = $(element).find("a").attr("href");
          if (!link.startsWith("http")){
            link="https://espn.com"+link;//ensuring the full link is present
          }
          db.scrapedData.insert({//adding element to database
            title: title,
            link: link
          });
        })
      });
      res.redirect("/articles");
    })
})

//get an article and its comments
app.get("/article/:id",function(req,res){
    db.Article.findOne({_id:req.params.id}).populate("comment").then(function(data){//get article title and link from the database
        var article = [];
        axios.get(data.link).then(function(response){ //scrape the text of the actual article
            var $ = cheerio.load(response.data);
            $(".article-body").find("p").each(function(i,element){//get all paragraph tags of the article
                article.push($(element).text()); //add each paragraph to the article array
            })
        })
        res.json(data);
      }).catch(function(err){
        res.render("err",err);
      })
})

//posting a comment
app.post("/articles/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function(dbComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{comments: dbComment._id }});
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.redirect("/article/"+req.params.id);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.render("err",err);
      });
  });

//Displaying list of articles on the home page, catching all errant requests
app.get("/", function(res,req){
    db.Article.find({}).then(function(data){
        res.render("index",{articles:data});
      }).catch(function(err){
        res.render("err",err);
    })
})

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});