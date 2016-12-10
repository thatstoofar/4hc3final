// Code for just the media player here
document.addEventListener("DOMContentLoaded", function() { initMediaPlayer(); }, false);
var mediaTitle; 

// Variables to store handles to various required elements
var mediaPlayer;
var jpgCtrl;
var videoPlaying;
var mediaPlaying = null;
var playPauseBtn;
var muteBtn;
var progressBar;
var intervalRewind;
var startSystemTime;
var startVideoTime;
var rewindSpd;
var mediaExt = 'mp4';

function initMediaPlayer() {
	console.log('initMediaPlayer()');
	mediaTitle = document.getElementById('media-title');
	// Get a handle to the player
	mediaPlayer = document.getElementById('media-video');
	
	jpgCtrl = document.getElementById('media-playing');
	videoPlaying = document.getElementById('video-playing');
	
	// Get handles to each of the buttons and required elements
	playPauseBtn = document.getElementById('play-pause-button');
	muteBtn = document.getElementById('mute-button');
	progressBar = document.getElementById('progress-bar');

	// Hide the browser's default controls
	mediaPlayer.controls = false;
	
	// Add a listener for the timeupdate event so we can update the progress bar
	mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
	progressBar.addEventListener('mousedown', function(mevent) {
		console.log('progressBarMouseDown()');
		console.log(mevent.button+' '+mevent.clientX+' '+mevent.clientY+' '+mevent.screenX+' '+mevent.screenY+' '+mevent.offsetX+' '+mevent.offsetY);

		var duration = mediaPlayer.duration;
		var currentTime = (duration * mevent.offsetX ) / 256;
		mediaPlayer.currentTime = currentTime;

	});
	
	
	// Add a listener for the play and pause events so the buttons state can be updated
	mediaPlayer.addEventListener('play', function() {
		// Change the button to be a pause button
		changeButtonType(playPauseBtn, 'pause');
	    mediaPlayer.playbackRate = 1.0;
		clearTimeout(intervalRewind);

	}, false);
	
	mediaPlayer.addEventListener('pause', function() {
		// Change the button to be a play button
		changeButtonType(playPauseBtn, 'play');
	}, false);
	
	// need to work on this one more...how to know it's muted?
	mediaPlayer.addEventListener('volumechange', function(e) { 
		// Update the button to be mute/unmute
		if (mediaPlayer.muted) changeButtonType(muteBtn, 'unmute');
		else changeButtonType(muteBtn, 'mute');
	}, false);	
	
	mediaPlayer.addEventListener('ended', function() { 
		this.pause(); 
		mediaPlayer.playbackRate = 1.0;
		mediaPlayer.currentTime = 0.0;
		clearTimeout(intervalRewind);
		removeMediaPlaying();

	}, false);	
	
	//jpgCtrl.style.display = 'none';
}

function togglePlayPause() {
	// If the mediaPlayer is currently paused or has ended
	if (mediaPlayer.paused || mediaPlayer.ended) {
		// Change the button to be a pause button
		changeButtonType(playPauseBtn, 'pause');
		// Play the media
		mediaPlayer.play();
		// add media playing if mp3
		if (mediaExt == 'mp3') {
			addMediaPlaying();
		}
	}
	// Otherwise it must currently be playing
	else {
		// Change the button to be a play button
		changeButtonType(playPauseBtn, 'play');
		// Pause the media
		mediaPlayer.pause();
		if (mediaExt == 'mp3') {
			removeMediaPlaying();
		}
	}
	mediaPlayer.playbackRate = 1;
}

// Stop the current media from playing, and return it to the start position
function stopPlayer() {
	mediaPlayer.pause();
	mediaPlayer.currentTime = 0;
	if (mediaExt == 'mp3') {
		removeMediaPlaying();
	}

}

// Changes the volume on the media player
function changeVolume(direction) {
	if (direction === '+') mediaPlayer.volume += mediaPlayer.volume == 1 ? 0 : 0.1;
	else mediaPlayer.volume -= (mediaPlayer.volume == 0 ? 0 : 0.1);
	mediaPlayer.volume = parseFloat(mediaPlayer.volume).toFixed(1);
}

// Toggles the media player's mute and unmute status
function toggleMute() {
	if (mediaPlayer.muted) {
		// Change the cutton to be a mute button
		changeButtonType(muteBtn, 'mute');
		// Unmute the media player
		mediaPlayer.muted = false;
	}
	else {
		// Change the button to be an unmute button
		changeButtonType(muteBtn, 'unmute');
		// Mute the media player
		mediaPlayer.muted = true;
	}
}

// change playbackrate
function slowmotion(increments) {
	mediaPlayer.playbackRate += increments;
//	if (mediaPlayer.playbackRate <= 0.1) {
//		mediaPlayer.playbackRate = 0.15;
//	}
	
}

// // skip
// function skip(seektime) {
	
// }


// Replays the media currently loaded in the player
function replayMedia() {
	resetPlayer();
	mediaPlayer.play();
}

// Update the progress bar
function updateProgressBar() {
// Work out how much of the media has played via the duration and currentTime parameters
	var percentage = Math.floor((100 / mediaPlayer.duration) * mediaPlayer.currentTime);
// Update the progress bar's value
	progressBar.value = percentage;
// Update the progress bar's text (for browsers that don't support the progress element)
	progressBar.innerHTML = percentage + '% played';
}

// Updates a button's title, innerHTML and CSS class to a certain value
function changeButtonType(btn, value) {
	if (btn == playPauseBtn) {
		if (value == 'pause')
			document.getElementById('playpause').src = 'media/images/pause24.png';
		else
			document.getElementById('playpause').src = 'media/images/play24.png';
		return;
	} else if (btn == muteBtn) {
		if (value == 'mute')
			document.getElementById('muteunmute').src = 'media/images/mute24.png';
		else
			document.getElementById('muteunmute').src = 'media/images/unmute24.png';
		return;
		
	}
	btn.title = value;
	btn.innerHTML = value;
	btn.className = value;
}

function addMediaPlaying() {
	if (mediaPlaying == null) {
		mediaPlaying = document.createElement("img");
		mediaPlaying.setAttribute("src", "media/images/bar.gif");
		mediaPlaying.setAttribute("height", "75");
		mediaPlaying.setAttribute("width", "192");
		jpgCtrl.appendChild(mediaPlaying);
	}
	mediaPlayer.play();
}

function removeMediaPlaying() {
	if (mediaPlaying != null)
		jpgCtrl.removeChild(mediaPlaying);
	mediaPlaying = null;
}

// Loads a video item into the media player
function loadVideo() {
	var title = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		var file = arguments[i].split('.');
		var ext = file[file.length - 1];
		// Check if this media can be played
		if (canPlayVideo(ext)) {
			// Reset the player, change the source file and load it
			resetPlayer();
			mediaPlayer.src = arguments[i];
			mediaPlayer.load();
			mediaTitle.innerHTML = '*** '+title+' ***';
			mediaExt = ext;
			if (ext == 'mp3') {
				addMediaPlaying();
//				jpgCtrl.style.display = 'flex';
				videoPlaying.style.diplay = 'none';
			} else {
				removeMediaPlaying();
//				jpgCtrl.style.display = 'none';
				videoPlaying.style.diplay = '';
				mediaPlayer.play();
			}
			break;
		}
	}
}
// Checks if the browser can play this particular type of file or not
function canPlayVideo(ext) {
	var ableToPlay = mediaPlayer.canPlayType('video/' + ext);
	if (ableToPlay == '') {
		ableToPlay = mediaPlayer.canPlayType('audio/' + ext);
		if (ableToPlay == '') {
			return false;
		}
	}
	return true;
}

// Resets the media player
function resetPlayer() {
	// Reset the progress bar to 0
	progressBar.value = 0;
	// Move the media back to the start
	mediaPlayer.currentTime = 0;
	// Ensure that the play pause button is set as 'play'
	changeButtonType(playPauseBtn, 'play');
}

function rewindplay() {
	mediaPlayer.playbackRate = 1.0;
	var elapsed = new Date().getTime()-startSystemTime;
	mediaPlayer.currentTime = Math.max(startVideoTime - elapsed*rewindSpd/1000.0, 0);
	if (mediaPlayer.currentTime > 0) {
		intervalRewind = setTimeout(rewindplay, 30);
	} else {
		mediaPlayer.pause();
	}
	
}

function rewind(rewindSpeed) {
	clearTimeout(intervalRewind);
	startSystemTime = new Date().getTime();
	startVideoTime = mediaPlayer.currentTime;
	rewindSpd = rewindSpeed;
	intervalRewind = setTimeout(rewindplay, 30);
}

// media player needs to be resized on initialization otherwise it goes offscreen
//$("video.media-player").height(window.innerHeight - 34);

//$(window).resize(function(){
//    $("video.media-player").height(window.innerHeight - 34);
//});

