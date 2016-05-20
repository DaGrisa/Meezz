var express = require('express');
var router = express.Router();

/* GET no room name set */
router.get('/', function(req, res, next) {
    console.log('RoomId empty => redirect to usererror page');
    res.render('usererror', { errors: { error: { type: 'Room error', msg: 'Room needs to have a name.' } } });
})

/* GET room page. => new room */
router.get('/:roomId', function (req, res, next) {
    console.log('in room GET');
    // validations
    req.checkParams('roomId', 'Room name must contain alphanumeric characters only (a-z, A-Z, 0-9).').isAlphanumeric();
    var errors = req.validationErrors();
    if (errors) {
        res.render('usererror', { errors: errors });
        return;
    }
    
    // reorg rooms older then 12 hours
    reorgRooms(req.db, 12, function(err){
        if(err) console.log('Error occcured during reorg: ' + JSON.stringify(err));
    })
    
    // check if room exists
    var roomId = req.params.roomId;
    getRoom(req.db, roomId, function (room) {
        console.log('search result: ' + JSON.stringify(room));

        if (room === null) {
            // generate new room and pin
            var pin = generatePIN();
            var salt = crypto.randomBytes(128).toString('base64');
            var pinHash = hash(salt + pin);
            writeRoom(req.db, roomId, salt, pinHash, function (err, data) {
                if (err) {
                    res.render('usererror', { errors: { error: { type: 'Room error', text: 'Error writing room data.' } } });
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

/* POST room page. => enter room */
router.post('/:roomId', function (req, res, next) {
    console.log('in room POST');
    // validations
    if(req.body.pin) {
        req.checkBody('pin', 'PIN must contain numeric characters only (0-9).').isNumeric();
        req.checkBody('pin', 'PIN has wrong length.').len(5,5);
    }
    var errors = req.validationErrors();
    if (errors) {
        res.render('usererror', { errors: errors });
        return;
    }
    
    // check if room exists
    var roomId = req.params.roomId;
    getRoom(req.db, roomId, function (room) {
        console.log('req.body.pin: ' + req.body.pin);
        // read pin post data
        if (hash(room.salt + req.body.pin) == room.pinHash) {
            // redirect to chatroom without pin
            res.render('room', { title: 'Room', roomId: roomId });
        } else {
            // redirect to chatroom pin
            res.render('roompin', { title: 'PIN for Room ' + roomId, roomId: roomId });
        }
    });
});

module.exports = router;

/**
 * generates the sha-512 hash value of a string value
 * @param {String} value to be hashed
 * @return {String} hash value
 */
function hash(value) {
    if (typeof value === 'string') {
        var crypto = require('crypto');
        // TODO salt
        var hash = crypto.createHash('sha512').update(value).digest('hex');
        return hash;
    }
    return null;
}

/**
 * generates a pin code which consitsts of 5 numbers
 * @return {String} pin code
 */
function generatePIN() {
    number = Math.floor(Math.random() * 99999 + 1);
    return lPad(number, 5, '0');
}

/**
 * left padding of a string value
 * @param {String} value to be padded
 * @param {String} length of the output
 * @param {String} character used for padding
 * @return {String} padded value
 */
function lPad(value, length, char) {
    value = value.toString();
    iterator = length - value.length;
    while (iterator--) {
        value = char + value;
    }
    return value;
}

/**
 * search a specific room by its id in the database
 * @param {monk} monk database module
 * @param {String} ID of the room
 * @param {function} callback function
 */
function getRoom(db, roomId, callback) {
    var rooms = db.get('rooms');

    rooms.findOne({ roomId: roomId }).on('success', function (doc) {
        callback(doc);
    });
}

/**
 * insert a new room into the database
 * @param {monk} monk database module
 * @param {String} ID of the room
 * @param {String} sha-512 hashed pin code for the room
 * @param {function} callback function
 */
function writeRoom(db, roomId, salt, pinHash, callback) {
    // write roomId, pinHash and timestamp (for reorg)
    var error;
    var data;
    // Set our collection
    var rooms = db.get('rooms');

    // Submit to the DB
    rooms.insert({
        "roomId": roomId,
        "salt": salt,
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

/**
 * deletes "old" rooms from the database
 * @param {monk} monk database module
 * @param {Number} hours to keep the room data
 * @param {function} callback function
 */
function reorgRooms(db, hours, callback) {
    var rooms = db.get('rooms');
    
    rooms.remove({ timestamp: { $lt: Math.floor(Date.now() / 1000 - hours*60*60)} }, function(err) {
        if(err) callback(err);
    });
}
