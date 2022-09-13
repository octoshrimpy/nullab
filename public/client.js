( () => {

  var lastPeerId = null
  var peer       = null
  var c_in       = null
  var c_out      = null

  var selfIdStr = null
  
  var comms    = document.getElementById('comms-group')
  var selfId   = document.getElementById('selfId')
  var otherId  = document.getElementById('otherId')
  var msg      = document.getElementById('msg')
  var send     = document.getElementById('send')
  var status   = document.getElementById('status')
  var convo    = document.getElementById('convo')
  var connect  = document.getElementById('connect')
  var selfSave = document.getElementById('selfSave')
  var nextStep = document.getElementById('nextStep')


  function initialize() {
    peer = new Peer(selfIdStr, {
      host: 'peer.octoshrimpy.dev',
      port: location.protocol === 'https:' ? 443 : 80,
      path: '/myapp',
      debug: 2
    })
    
    peer.on('open', (id) => {
      console.log(peer)
      if (peer.id === null) {
        console.log('received null id from peer open')
        peer.id = lastPeerId
      } else {
        lastPeerId = peer.id
      }

      selfId.innerText = peer.id
      console.log('peer ID:', peer.id)

      status.innerHTML = 'awaiting connection...'
    })

    // other client can send
    peer.on('connection', conn => {
      c_in = conn

      c_in.on('open', () => {
        status.innerHTML = 'connected to ' + c_in.peer 
        comms.style.display = 'block'

        // connect right back
        if (c_in && c_out) {
          return
        }

        join.call({connectTo: c_in.peer})
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

    
    let connectTo = this.connectTo || otherId.innerText

    console.log('connectTo', connectTo)
 
    c_out = peer.connect(connectTo, {reliable: true})

    c_out.on('open', () => {
      status.innerHTML = 'connected to ' + c_out.peer
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
      let msgString = msg.innerText
      msg.innerText = ''
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

  function enableSelfSave() {
    selfSave.style.display = 'block'
  }

  function reJoin() {
    c_in  && c_in.close()
    c_out && c_out.close()

    peer  = null
    c_in  = null
    c_out = null

    selfIdStr = selfId.innerText
    selfSave.style.display = 'none'

    initialize()

  }

  function stepForward() {
    let step = Number.parseInt(document.body.getAttribute('data-step'))
    document.body.setAttribute('data-step', step + 1)

  }


  connect.addEventListener('click', join)

  send.addEventListener('click', sendMsg)

  selfId.addEventListener('input', enableSelfSave)

  selfSave.addEventListener('click', reJoin)

  nextStep.addEventListener('click', stepForward)


  initialize()
})()


// @fixme cannot send emoji
// index out of range
// https://cdn.discordapp.com/attachments/1001550328719753237/1019047931636088892/unknown.png