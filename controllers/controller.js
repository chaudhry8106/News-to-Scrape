var express = require('express');
var router = express.Router();
var app = express();
var path = require("path");
var cheerio = require('cheerio');
var mongojs = require("mongojs");
var request = require("request");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


module.exports = function(app){
    app.get("/saved", function(req, res){
      db.scrapedData.find({}, function (err, data) {
        res.render("savedArticles", {data: data});
        // res.send(data);
      })
    //  console.log(data);
    
      
    });








    app.get("/scrape", function(req, res) {
      // Make a request for the news section of wsj
      request("https://www.wsj.com", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "title" class
        $("h3.wsj-headline").each(function(i, element) {
          // Save the text and href of each link enclosed in the current element
          var title = $(element).children("a").text();
          var link = $(element).children("a").attr("href");
    
          // If this found element had both a title and a link
          if (title && link) {
            // Insert the data in the scrapedData db
            db.scrapedData.insert({
              title: title,
              link: link
            },
            function(err, inserted) {
              if (err) {
                // Log the error if one is encountered during the query
                console.log(err);
              }
              else {
                // Otherwise, log the inserted data
                console.log(inserted);
                res.send(inserted);
              }
            });
          }
        });
      });
    
      // Send a "Scrape Complete" message to the browser
      // res.send("Scrape Complete");
      res.render("index");
      // res.send(inserted);
    });












    app.get("/saved", function(req, res){
      res.render("savedArticles");
    });

    app.get("/noArticle", function(req, res){
      res.render("noArticle");
    });
  };