let state = {
  userid: null,

}


let videoPlayer = {

}

/*
  Empty response: {"status":"200","msg":"","data":{"vid":"","status":"0"}}
  Live response:  {"status":"200","msg":"","data":
    {"vid":"15162819054075884761","status":"1","watchnumber":"14179","vtime":"1516281936",
      "title":"Hey babyy\ud83d\udc8b","videolength":"5025",
      "cover":"http:\/\/live.store.cmcm.com\/big\/liveme\/cover-a014383785209c703b2f2bfb44efb169_icon.jpeg"
    }
    }
*/
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
    const videoSource = videoInfo["hlsvideosource"] || videoInfo["videosource"] || ''
    const videoType = videoSource.endsWith('flv') ? 'flv' : 'm3u8'

    loadVideo(videoSource, videoType)


  } else {
    $('#liveStatus').text('Ice is currently live, but there was a problem.')

  }
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
    video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
    video.addEventListener('canplay',function() {
      video.play();
    });
  }


}

//https://gaming.youtube.com/live_chat?is_popout=1&v=a13YsaTgzwM
function loadChat() {
  console.log('loadingchat...')
  $("#chatContainer").load("https://gaming.youtube.com/live_chat?is_popout=1&v=a13YsaTgzwM", function() {
    console.log('loaded')
  });
}




$(document).ready(function(){// 948467854813044736 user id ICE POSEIDON

  fetchStream('888801827909795840')
  //fetchStream('948467854813044736') // ICE POSEIDON USER ID 948467854813044736
  loadChat()
});
