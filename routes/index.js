var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/chatroom/:room',function(req,res){
  res.render('chatroom');
});
module.exports = router;
