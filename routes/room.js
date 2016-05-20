var express = require('express');
var router = express.Router();
var db = require('../db/room.js');

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
    db.reorgRooms(12, function(err){
        if(err) console.log('Error occcured during reorg: ' + JSON.stringify(err));
    })
    
    // check if room exists
    var roomId = req.params.roomId;
    db.getRoom(roomId, function (room) {
        console.log('search result: ' + JSON.stringify(room));

        if (room === null) {
            // generate new room and pin
            var pin = generatePIN();
            var crypto = require('crypto');
            var salt = crypto.randomBytes(128).toString('base64');
            var pinHash = hash(salt + pin);
            db.writeRoom(roomId, salt, pinHash, function (err, data) {
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
    db.getRoom(roomId, function (room) {
        console.log('req.body.pin: ' + req.body.pin);
        // check login attempts
        var wrongPinCount = 0;
        if(room.wrongPin!==undefined){
            for(var user in room.wrongPin){
                if(user.ip===req.headers['x-forwarded-for'] || user.agent===req.headers['user-agent']){
                    wrongPinCount++;
                }
            }
        }
        
        if(wrongPinCount>=5){
            console.log('too many login attempts from ' + req.headers['x-forwarded-for']);
            res.render('usererror', { errors: { error: { type: 'Room error', msg: 'Too many login attempts.' } } });
        } else {
            // read pin post data
            if (hash(room.salt + req.body.pin) == room.pinHash) {
                // redirect to chatroom without pin
                res.render('room', { title: 'Room', roomId: roomId });
            } else {
                // save ip and fingerprint
                db.addAgent(room, {'ip':req.headers['x-forwarded-for'], 'user-agent': req.headers['user-agent']});
                // redirect to chatroom pin
                res.render('roompin', { title: 'PIN for Room ' + roomId, roomId: roomId });
            }
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