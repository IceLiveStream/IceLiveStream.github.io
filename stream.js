let state = {
  userid: null,

}

function setState(newState) {
  state = Object.assign({}, state, newState)
}

function fetchVideoId (userid, callback) {
  fetch("https://live.ksmobile.net/user/getlive?uid=" + userid)
  .then(function(res){ return res.json() })
  .then(callback)
}

/*
  Random LiveMe Validation string in a ^[\S]{4}$l^[\S]{4}$m^[\S]{5}$ format
  ex: aaaalaaaamaaaaa
*/
function makeVali() {
  var text = "";
  var possible = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  for (var i = 0; i < 15; i++) {
    if(i === 4) {
      text += 'l'
    } else if(i === 9) {
      text += 'm'
    } else {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  }
  return text;
}

//https://github.com/github/fetch/issues/263#issuecomment-209548790
const searchParams = function(params) {
    return Object.keys(params).map((key) => {
      return key + '=' + params[key]
    }).join('&');
}


function fetchStream (userid) {
  fetchVideoId(userid, function(data){
      const videoid = data.data && data.data.vid && data.data.status && data.data.status !== "0" && data.data.vid
      if(videoid) {
        const params = new URLSearchParams()
        params.append('userid', 1)
        params.append('videoid', videoid)
        params.append('area', '')
        params.append('h5', 1)
        params.append('vali', makeVali())
        fetch("https://live.ksmobile.net/live/queryinfo",
        {
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        })
        .then(function(res){ return res.json() })
        .then(receivedStreamData)
      } else {
        $('#liveStatus').text('Ice is currently not live (no livestream found).')
      }
  })
}

function receivedStreamData(data) {
  if(data && data["data"] && data["data"]["video_info"]) {
    $('#liveStatus').text('Ice is live!')

    const videoInfo = data["data"]["video_info"]
    console.log(videoInfo)
    const videoSource = videoInfo["hlsvideosource"] || videoInfo["videosource"] || ''
    const videoType = videoSource.endsWith('flv') ? 'flv' : 'm3u8'


    if (state.videoSource != videoSource) {
      onVideoSourceChanged(videoSource, videoType)
    }


  } else {
    $('#liveStatus').text('Ice is currently live, but there was a problem.')

  }
}


function onVideoSourceChanged(videoSource, videoType) {
  setState({
    videoSource,
    videoType
  })
  loadVideo(videoSource, videoType)
}


function loadVideo(videoSource, videoType) {

  if(Hls.isSupported()) {
    var video = document.getElementById('videoPlayer');
    var hls = new Hls();
    hls.loadSource(videoSource);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
      video.play();
  });
 } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    /*video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
    video.addEventListener('canplay',function() {
      video.play();
    });*/
  }


}


$(document).ready(function(){// 948467854813044736 user id ICE POSEIDON

  fetchStream('918148595226902528')
  //fetchStream('948467854813044736') // ICE POSEIDON USER ID 948467854813044736

});
