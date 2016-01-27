var express = require('express');
var router = express.Router();

/* GET room page. */
router.get('/:roomId', function (req, res, next) {
    console.log('in room GET');
    // reorg rooms
    reorgRooms(req.db, function(err){
        if(err) console.log('Error occcured during reorg: ' + JSON.stringify(err));
    })
    
    // check if room exists
    var roomId = req.params.roomId;
    getRoom(req.db, roomId, function (room) {
        console.log('search result: ' + JSON.stringify(room));

        if (room === null) {
            // generate new room and pin
            var pin = generatePIN();
            var pinHash = hash(pin);
            writeRoom(req.db, roomId, pinHash, function (err, data) {
                if (err) {
                    res.render('usererror', { error: { type: 'Room error', text: 'This room already exists. Please choose a different name.' } });
                } else {
                    // redirect to chatroom with plaintext pin
                    res.render('room', { title: 'Room', roomId: roomId, pin: pin, url: req.protocol + '://' + req.get('host') + req.originalUrl });
                }
            });

        } else {
            res.render('roompin', { title: 'PIN for Room ' + roomId, roomId: roomId });
        }
    });
});

/* POST room page. */
router.post('/:roomId', function (req, res, next) {
    console.log('in room POST');
    // check if room exists
    var roomId = req.params.roomId;
    getRoom(req.db, roomId, function (room) {
        console.log('room.pinHash: ' + room.pinHash);
        console.log('hash(req.body.pin): ' + hash(req.body.pin))
        // read pin post data
        if (hash(req.body.pin) == room.pinHash) {
            // redirect to chatroom without pin
            res.render('room', { title: 'Room', roomId: roomId });
        } else {
            // redirect to chatroom pin
            res.render('roompin', { title: 'Room PIN', roomId: roomId });
        }
    });
});

module.exports = router;

function hash(value) {
    if (typeof value === 'string') {
        var crypto = require('crypto');
        var hash = crypto.createHash('sha512').update(value).digest('hex');
        return hash;
    }
    return null;
}

function generatePIN() {
    number = Math.floor(Math.random() * 99999 + 1);
    return lPad(number, 5);
}

function lPad(value, length) {
    value = value.toString();
    iterator = length - value.length;
    while (iterator--) {
        value = '0' + value;
    }
    return value;
}

function getRoom(db, roomId, callback) {
    var rooms = db.get('rooms');

    rooms.findOne({ roomId: roomId }).on('success', function (doc) {
        callback(doc);
    });
}

function writeRoom(db, roomId, pinHash, callback) {
    // write roomId, pinHash and timestamp (for reorg)
    var error;
    var data;
    // Set our collection
    var rooms = db.get('rooms');

    // Submit to the DB
    rooms.insert({
        "roomId": roomId,
        "pinHash": pinHash,
        "timestamp": Math.floor(Date.now() / 1000)
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log("There was a problem adding the information to the database. " + err);
            error = err;
            data = doc;
        } else {
            console.log('room ' + roomId + ' inserted');
        }
    });

    callback(error, data);
}

function reorgRooms(db, callback) {
    var rooms = db.get('rooms');
    
    rooms.remove({ timestamp: { $lt: Math.floor(Date.now() / 1000 - 24*60*60)} }, function(err) {
        if(err) callback(err);
    });
}