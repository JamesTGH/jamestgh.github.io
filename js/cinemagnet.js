function saveDebridKey() {
	const debridKey = $('#debridkey').val().trim();
	if (debridKey) Cookies.set('debridKey', debridKey, { expires: 7 });
}

function deleteDebridKey() {
	Cookies.remove('debridKey');
	$('#debridkey').val('');
}

$(document).ready(function() {
	const debridKey = Cookies.get('debridKey');
	$('#debridkey').val(debridKey);
});

async function getMagnetStream(debridAgent, debridKey, magnetHash) {
	try {
		const fetchAPI = async (url) => {
			const response = await fetch(url);
			if (!response.ok) throw new Error(response.statusText);
			return await response.json();
		};
		const fetchAndExtract = async (url, key) => (await fetchAPI(url)).data.magnets[0][key];
		const magnetCached = await fetchAndExtract(`https://api.alldebrid.com/v4/magnet/instant?agent=${debridAgent}&apikey=${debridKey}&magnets[]=${magnetHash}`, 'instant');
		if (magnetCached) {
			const magnetId = await fetchAndExtract(`https://api.alldebrid.com/v4/magnet/upload?agent=${debridAgent}&apikey=${debridKey}&magnets[]=${magnetHash}`, 'id');
			if (magnetId) {
				const magnetLinks = (await fetchAPI(`https://api.alldebrid.com/v4/magnet/status?agent=${debridAgent}&apikey=${debridKey}&id=${magnetId}`)).data.magnets.links;
				const fileWithLargestSize = magnetLinks.reduce((prev, current) => (prev.size > current.size) ? prev : current, {});
				const unlockedLink = (await fetchAPI(`https://api.alldebrid.com/v4/link/unlock?agent=${debridAgent}&apikey=${debridKey}&link=${fileWithLargestSize.link}`)).data.link;
				return unlockedLink;
			}
		} else {
			console.error('magnet is not cached');
		}
	} catch (error) {
		console.error(error);
	}
}

// async function runFunction() {
// 	const debridKey = $('#debridkey').val();
// 	const magnetHash = $('#magnethash').val();
	
// 	if (debridKey && magnetHash) {
// 		if (/^[0-9a-f]{40}$/i.test(magnetHash)) {
// 			const magnetStreamUrl = await getMagnetStream('cinemagnet', debridKey, magnetHash);
// 			$('#magnetstreamurl').attr('href', magnetStreamUrl);
// 			$('#magnetstreamvideo').attr('src', magnetStreamUrl).get(0).load();
// 			$('#magnetstreamvideo').get(0).play();
// 			var video = $('#magnetstreamvideo')[0]; // Get the video element as a plain DOM object

// 			if (video.canPlayType) {
// 				var codecs = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
// 				console.log('Supported video codecs: ' + codecs);
		
// 				var videoUrl = video.currentSrc;
// 				console.log('Video URL: ' + videoUrl);
		
// 				var videoTrack = video.videoTracks[0];
// 				if (videoTrack) {
// 					console.log('Video Track Information:');
// 					console.log('Track ID: ' + videoTrack.id);
// 					console.log('Kind: ' + videoTrack.kind);
// 					console.log('Label: ' + videoTrack.label);
// 				}
		
// 				var audioTrack = video.audioTracks[0];
// 				if (audioTrack) {
// 					console.log('Audio Track Information:');
// 					console.log('Track ID: ' + audioTrack.id);
// 					console.log('Kind: ' + audioTrack.kind);
// 					console.log('Label: ' + audioTrack.label);
// 				}
// 			} else {
// 				console.error('Video element is not supported in this browser.');
// 			}
// 		}
// 	}
// }

async function runFunction() {
	const debridKey = $('#debridkey').val();
	const magnetHash = $('#magnethash').val();

	if (debridKey && magnetHash) {
		if (/^[0-9a-f]{40}$/i.test(magnetHash)) {
			const magnetStreamUrl = await getMagnetStream('cinemagnet', debridKey, magnetHash);
			$('#magnetstreamurl').attr('href', magnetStreamUrl);
			$('#magnetstreamvideo').attr('src', magnetStreamUrl);

			$('#magnetstreamvideo').on('loadedmetadata', function() {
				var video = $('#magnetstreamvideo')[0];

				if (video.canPlayType) {
					var codecs = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
					console.log('Supported video codecs: ' + codecs);

					var videoUrl = video.currentSrc;
					console.log('Video URL: ' + videoUrl);

					var videoTrack = video.videoTracks[0];
					if (videoTrack) {
						console.log('Video Track Information:');
						console.log('Track ID: ' + videoTrack.id);
						console.log('Kind: ' + videoTrack.kind);
						console.log('Label: ' + videoTrack.label);
					}

					var audioTrack = video.audioTracks[0];
					if (audioTrack) {
						console.log('Audio Track Information:');
						console.log('Track ID: ' + audioTrack.id);
						console.log('Kind: ' + audioTrack.kind);
						console.log('Label: ' + audioTrack.label);
					}
				} else {
					console.error('Video element is not supported in this browser.');
				}
			});

			$('#magnetstreamvideo').get(0).load();
		}
	}
}