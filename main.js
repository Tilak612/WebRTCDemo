const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
let icecandidateList = []
const peerConnection = new RTCPeerConnection(configuration);
let localStream;
let remoteStream;
let _sendbyStrema
let dataChannel
let messagedata=''

// function handle  start cammera and inital connection establish
let init = async () => {
    localStream =await navigator.mediaDevices.getUserMedia({ video: true });
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream
    try {
     
        peerConnection.addStream(localStream);
    } catch (e) {
        var tracks = userMedia.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            peerConnection.addTrack(tracks[i], localStream);
        }
        console.log('catch of add stream');
    }
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };
    peerConnection.addEventListener("connectionstatechange", async (event) => {
        console.log('$$$$ ' + peerConnection.connectionState);
        if(peerConnection.connectionState=='connected'){
            alert('success')
        }
    })
    peerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
            icecandidateList.push(event.candidate);
        }
    })
}
//Function create offer for connection
let createOffer = async () => {
    dataChannel =peerConnection.createDataChannel('Mychannel')
    openchannel()
    let offer=await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer);
    console.log(dataChannel);
    document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription)
}
//function create answer for connection
let createAnswer = async () => {
    let offer = JSON.parse(document.getElementById('offer-sdp').value)
    await peerConnection.setRemoteDescription(offer);
    peerConnection.ondatachannel=(e)=>{
        dataChannel=e.channel
        console.log(dataChannel);
        openchannel()
    }
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription)
    setTimeout(()=>{
        document.getElementById('candi').value = JSON.stringify(icecandidateList)
    },100)
}

//function add answer for connection
let addAnswer = async () => {
    console.log('Add answer triggerd')
    let answer = JSON.parse(document.getElementById('answer-sdp').value)
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
        document.getElementById('candi').value = JSON.stringify(icecandidateList)
    }
}
// function handle  data Channel information
openchannel=()=>{
    console.log(dataChannel);
    dataChannel.onopen = () => {
        dataChannel.send("Hello World!");
    };
    dataChannel.onmessage=(e)=> {
        messagedata=messagedata+'\n'+e.data
        document.getElementById('receiveMessage').value=messagedata
    }
    dataChannel.onclose = () => {
        console.log("The Data Channel is Closed");
    };
}
// function send message to other user
sendMessage=()=>{
    let message =document.getElementById('Message').value
    dataChannel.send(message)
}
init()
//function add candidate 
let addcad = async () => {
    let cand = JSON.parse(document.getElementById('addcandi').value)
    cand.forEach((ele) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(ele, function () { }, function (e) { console.log("Problem adding ice candidate: " + e); }))
    })
}

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)
document.getElementById('add-Cand').addEventListener('click', addcad)
document.getElementById('send').addEventListener('click', sendMessage)

