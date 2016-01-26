var express = require('express');
var router = express.Router();

/* GET room page. */
router.get('/:roomId', function(req, res, next) {
  res.render('room', { title: 'Room' , roomId: req.params.roomId, url: req.protocol + '://' + req.get('host') + req.originalUrl});
});

module.exports = router;
