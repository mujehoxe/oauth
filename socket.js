
const { Chess } = require('chess.js')

module.exports = function(io) {
    io.on('connection', (socket) => {
        let roomId = socket.request.session.roomId
        console.log('socketId', socket.id);
        // console.log(socket.handshake); 
        socket.on('join room', () =>{
            socket.join(roomId)
            
            if(!io.sockets.adapter.rooms[roomId].game){
                
                io.sockets.adapter.rooms[roomId].game = new Chess()
            }
            socket.emit('moved', io.sockets.adapter.rooms[roomId].game.fen())
        })
        socket.on('move', (move) =>{
            let { source, target } = checkCastling(move)
            io.sockets.adapter.rooms[roomId].game.move({ from: source, to: target })
            io.to(roomId).emit('moved', io.sockets.adapter.rooms[roomId].game.fen())
        })
    })
}
function checkCastling(move){
    target = move.target
    source = move.source
    piece = move.piece

    switch(true){
        case (source=='e8' && target=='h8' && piece=='bK'): { target = 'g8';break }
        case (source=='e8' && (target=='a8' || target=='b8') && piece=='bK'): { target = 'c8';break }
        case (source=='e1' && target=='h1' && piece=='wK'): { target = 'g1';break }
        case (source=='e1' && (target=='a1' || target=='b1') && piece=='wK'): { target = 'c1';break }
        default: break
    }
    return { source, target }
}