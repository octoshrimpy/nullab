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
  var self     = document.getElementById('selfbox')
  var other    = document.getElementById('otherbox')
  
  var nextStep = document.getElementById('nextStep')

  function initialize() {
    peer = new Peer(selfIdStr, {
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

      selfId.innerText = peer.id

      status.innerHTML = 'awaiting connection'
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
        addMessage(`${c_in.peer}: ${data}`)
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

      connect.setAttribute('aria-busy', false)
      console.log(err)
      alert('' + err)
    })    
  }

  function join() {

    self.classList.add('small')
    other.classList.add('small')

    status.innerHTML = 'attempting connection...'

    
    connect.setAttribute('aria-busy', true)
    
    let connectTo = this.connectTo || otherId.innerText
    
    c_out = peer.connect(connectTo, {reliable: true})
    c_out.on('open', () => {
      status.innerHTML = 'connected to ' + c_out.peer
      console.log('connected to ' + c_out.peer)
      connect.setAttribute('aria-busy', false)
    })

    c_out.on('data', data => {
      console.log("c_out", c_out)
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
      addMessage(`${peer.id}: ${msgString}`)
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

  // nextStep.addEventListener('click', stepForward)


  initialize()
})()


// @fixme cannot send emoji
// index out of range
// https://cdn.discordapp.com/attachments/1001550328719753237/1019047931636088892/unknown.png