// global variables
var signalServer = 'https://10.0.0.3:8888/';

/**
 * generates a random room name
 * @return {String} room name
 */
function randomRoomName() {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var length = 10;
    var result = '';

    for (var i = length; i > 0; --i) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}

    return result;
}

/**
 * redirects to the specified room
 * @param {String} ID of the room
 */
function openRoom(roomId) {
	alert('Room not null validation!');
	window.location.href = '/room/' + roomId;
}

/**
 * opens local streams and connects to signal server
 * @param {String} ID of the room
 */
function connect(roomId) {
	var webrtc = new SimpleWebRTC({
		// the id/element dom element that will hold "our" video
		localVideoEl: 'localVideo',
		// the id/element dom element that will hold remote videos
		remoteVideosEl: 'remoteVideos',
		// immediately ask for camera access
		autoRequestMedia: true,
		url: signalServer,
		debug: true
	});
			
	// we have to wait until it's ready
	webrtc.on('readyToCall', function () {
		// you can name it anything
		webrtc.joinRoom(roomId);
	});
}