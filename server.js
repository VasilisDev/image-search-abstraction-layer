var https = require('https');
var express = require('express');
var app = express();
var https= require('https');
var mongoose = require("mongoose");
var models = require('./models/model.js');


const DB =process.env.MONGODB;
mongoose.connect(DB,{ useNewUrlParser: true });

var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.on('open', function() {
        console.log('Connected to database');
    });

    function sendToDb (query) {
        var date = new Date();

        var saveModel = new models({
            term:query,
            when:date.toString()
        });

        saveModel.save((err)=> {
            if (err) throw err;
        });
    }

app.get("/",(request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/api/image/:q', (req, res)=> {
  var query = req.params.q;
  var offset = req.query.offset || 1

   sendToDb(query);

  const API_KEY = process.env.API_KEY;
  const CSE_ID = process.env.CSE_ID;
  const strUrl ='https://www.googleapis.com/customsearch/v1?key=' + API_KEY + '&cx=' + CSE_ID + '&q=' + query + '&searchType=image&start=' + offset;

  https.get(strUrl, (response) => {
  const statusCode = response.statusCode;
  var error;
    if (statusCode !== 200) {
     error = new Error('Error' + `Status Code: ${statusCode}`);
   }
    if (error) {
     console.error(error.message);
     response.resume();
     return;
  }
  response.setEncoding('utf8');
  var apiData = '';
  response.on('data', (chunk) => {
    apiData += chunk;
  });
  response.on('end', () => {
  try {

  const result = JSON.parse(apiData);
  const items = result.items;
  var display = [];
     items.forEach(res=>{
       display.push({
         url : res.link,
         thumbnail :  res.image.thumbnailLink,
         context : res.image.contextLink
         });
       })
      res.send(display);
      } catch (e) {
      console.error(e.message);
     }
   });
}).on('error', (e) => {
  console.error(e.message);
  });
});

app.get('/api/latest', (req, res)=> {
      models.find({},{_id:0, __v:0},(err, docs)=>{
        if (err) throw err;
      docs.reverse();
      res.send(docs);
  });
})


const listener = app.listen(3000, ()=> {
  console.log('Your app is listening on port 3000');
});
