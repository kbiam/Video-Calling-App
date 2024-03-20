var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/chatroom/:room',function(req,res){
  res.render('chatroom2');
});
function checkAccessToIndex(req, res, next) {
  // Check if the user has accessed '/' route
  if (req.originalUrl === '/') {
    // If user has accessed '/', allow them to proceed to the next middleware or route handler
    next();
  } else {
    // If user has not accessed '/', redirect them to '/'
    res.redirect('/');
  }
}
module.exports = router;
