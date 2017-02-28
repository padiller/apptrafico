







/*eslint-env node*/
 
 var express = require('express');
 var app = express();
 
 
 var cfenv = require('cfenv');
 
 
 var bodyParser  =   require("body-parser");
 var multer = require('multer');
 var path = require('path');
 
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({"extended" : false}));
 
 
 // serve the files out of ./public as our main files
 app.use(express.static(__dirname + '/public'));
   
 var upload = multer({ dest: './public/images/'});
 
 app.upload = upload;
 
 // get the app environment from Cloud Foundry
 var appEnv = cfenv.getAppEnv();
 
 var fs = require("fs");
 
 
 /**********************  Watson Visual Recognition  *********************************/
 var watson = require('watson-developer-cloud');
 
 var visual_recognition = watson.visual_recognition({
   username: '****************',
   password: '***************',
   version: 'v2-beta',
   version_date: '2015-12-02'
 });
 
 //Show all watson Classifiers
 
 app.get('/listClassifiers', function (req, res) {
 
     visual_recognition.listClassifiers({},
         function(err, response) {
          if (err)
             console.log(err);
          else
             res.end(JSON.stringify(response, null, 2));
         }
     );
 });
 
 
 //Classiefies a picture
app.post('/test', function(req, res) {
       var file = null;
     
     upload(req, res, function(err) {
       if(err) {
         console.log('Error Occured = '+ JSON.stringify(err));
         res.status(400).end("{\"results\":\"failure\"}");  
         return;
       }
       console.log("here0 ="+req.file);
       file = fs.createReadStream(req.file.path);
       console.log("file ready = "+ JSON.stringify(file) + " or "+ file);
       
       var params = {
         images_file: file
       };
       
       visual_recognition.classify(params, function(err, results) {
         // delete the recognized file
         if (req.file)
           fs.unlink(file.path);
 
         if (err){
           console.log("here 3 ="+ JSON.stringify(err) +" results= "+results);
           res.status(400).end("{\"bla\":\"failure 2\"}");
       }
         else{
             res.end(JSON.stringify(results));    
         }
       });
     });
 });
 
 
 
 // start server on the specified port and binding host
 app.listen(appEnv.port, '0.0.0.0', function() {
 
     // print a message when the server starts listening
   console.log("server starting on " + appEnv.url);
 });