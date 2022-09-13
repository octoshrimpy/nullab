( () => {

  var lastPeerId = null
  var peer       = null
  var c_in       = null
  var c_out      = null
  
  var comms   = document.getElementById('comms-group')
  var selfId  = document.getElementById('selfId')
  var otherId = document.getElementById('otherId')
  var msg     = document.getElementById('msg')
  var send    = document.getElementById('send')
  var status  = document.getElementById('status')
  var convo   = document.getElementById('convo')
  var connect = document.getElementById('connect')

  function initialize() {
    peer = new Peer(null, {
      host: 'peer.octoshrimpy.dev',
      port: location.protocol === 'https:' ? 443 : 80,
      path: '/myapp',
      debug: 2
    })
    
    peer.on('open', (id) => {
      if (peer.id === null) {
        console.log('received null id from peer open')
        peer.id = lastPeerId
      } else {
        lastPeerId = peer.id
      }

      selfId.value = peer.id
      console.log('peer ID:', peer.id)

      status.innerHTML = 'awaiting connection...'
    })

    // other client can send
    peer.on('connection', conn => {

      c_in = conn

      c_in.on('open', () => {
        status.innerHTML = 'connected'
        comms.style.display = 'block'
      })

      c_in.on('data', data => {
        addMessage(data)
      })
    })

    peer.on('disconnected', () => {
      status.innerHTML = 'connection lost'
    })

    peer.on('close', () => {
      c_in = null
      status.innerHTML = 'connection destroyed, please refresh'
      console.log('conn destroyed')
    })

    peer.on('error', err => {
      console.log(err)
      alert('' + err)
    })    
  }

  function join() {
 
    c_out = peer.connect(otherId.value, {reliable: true})

    c_out.on('open', () => {
      status.innerHTML = 'connected to: ' + c_out.peer
      console.log('connected to ' + c_out.peer)
    })

    c_out.on('data', data => {
      addMessage(data)
    })

    c_out.on('close', () => {
      status.innerHTML = 'connection closed'
    })
  }

  function sendMsg () {
    if (c_out && c_out.open) {
      let msgString = msg.value
      msg.value = ''
      c_out.send(msgString)
      console.log(msgString + ' sent')
      addMessage(msgString)
    } else {
      console.log('connection is closed')
    }
  }

  function addMessage(msgString) {
    var today = new Date()

    var strDate = 'h:m'
      .replace('h', today.getHours())
      .replace('m', today.getMinutes())

    convo.innerText += `${strDate} - ${msgString}\n`
  }


  connect.addEventListener('click', join)

  send.addEventListener('click', sendMsg)


  initialize()
})()
