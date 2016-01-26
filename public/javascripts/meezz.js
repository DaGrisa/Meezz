function randomRoomName() {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var length = 10;
    var result = '';

    for (var i = length; i > 0; --i) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}

    return result;
}

function openRoom(roomId) {
	alert('Room not null validation!');
	window.location.href = '/room/' + roomId;
}

function connect(roomId) {
	var webrtc = new SimpleWebRTC({
		// the id/element dom element that will hold "our" video
		localVideoEl: 'localVideo',
		// the id/element dom element that will hold remote videos
		remoteVideosEl: 'remoteVideos',
		// immediately ask for camera access
		autoRequestMedia: true,
		url: 'https://10.0.0.3:8888/',
		debug: true
	});
			
	// we have to wait until it's ready
	webrtc.on('readyToCall', function () {
		// you can name it anything
		webrtc.joinRoom(roomId);
	});
}