let   Peer              = require('simple-peer')
const SimplePeerWrapper = require('simple-peer-wrapper');

let peer = new Peer({
  initiator: location.hash === '#init',
  trickle: false
})

peer.on('error', err => console.log('error', err))

peer.on('connect', () => {
  console.log('connected!')
  peer.send("connected!")
})

peer.on('signal', (data) => {
  console.log(JSON.stringify(data))
  document.getElementById('selfId').value = JSON.stringify(data)
})

peer.on('data', (data) => {
  console.log(data)
  document.getElementById('convo').textContent += data + '\n'
})


document.getElementById('connect').addEventListener('click', () => {
  console.log('connecting...')
  let otherId = JSON.parse(document.getElementById('otherId').value)

  peer.signal(otherId)
})

document.getElementById('send').addEventListener('click', () => {
  let daMsg = document.getElementById('msg').value
  console.log(daMsg)
  peer.send(daMsg)
})