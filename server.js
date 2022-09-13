// const SimplePeerServer = require('simple-peer-server')

// let   port             = 1045

// const http     = require('http')
// const server   = http.createServer()
// const spServer = new SimplePeerServer(server)

// server.listen(port)
// console.log(`p2p  @ [ :${port} ]`)
// console.log("live @ [ :3000 ]")

// ========================================

const express = require('express')
const path    = require('path');
let   app     = express()

let mainpage = 'index.html'

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, mainpage))
})
// app.get('/peerjs', require('peer'.ExpressPeerServer))


app.listen(3000, () => {
  console.log("live @ [ :3000 ]")
})