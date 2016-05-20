var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/meezz');
var exports = module.exports = {};

/**
 * search a specific room by its id in the database
 * @param {monk} monk database module
 * @param {String} ID of the room
 * @param {function} callback function
 */
exports.getRoom = function (roomId, callback) {
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
exports.writeRoom = function (roomId, salt, pinHash, callback) {
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

exports.addAgent = function (room, agent) {
    var rooms = db.get('rooms');

    // Submit to the DB
    rooms.update(room._id,{
        $push: { wrongPin : agent }
    },function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log("There was a problem adding the information to the database. " + err);
            error = err;
            data = doc;
        } else {
            console.log('room ' + roomId + ' updated');
        }
    })
}

/**
 * deletes "old" rooms from the database
 * @param {monk} monk database module
 * @param {Number} hours to keep the room data
 * @param {function} callback function
 */
exports.reorgRooms = function (hours, callback) {
    var rooms = db.get('rooms');
    
    rooms.remove({ timestamp: { $lt: Math.floor(Date.now() / 1000 - hours*60*60)} }, function(err) {
        if(err) callback(err);
    });
}