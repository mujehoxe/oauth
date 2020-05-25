var socket = io();
// socket.on('connect', function() {
//     
// });
socket.emit('join room')
socket.on('joined', (roomId) => {
    console.log(roomId)
    window.history.replaceState({ 'page_id': roomId, 'user_id': 5 }, 'game',`?game=${roomId}`);
})

socket.on('moved', (fen) => {
    console.log('lkdshg',fen)
    board.position(fen)
})

var board = Chessboard('board', {
    draggable: true,
    dropOffBoard: 'trash',
    onDrop: onDrop,
    orientation: 'black'
})

function onDrop (source, target, piece, newPos, oldPos, orientation) {

    newPos = Chessboard.objToFen(newPos)
    oldPos = Chessboard.objToFen(oldPos)
    
    const move = {source, target, piece, newPos, oldPos, orientation}

    if(newPos !== oldPos){
        socket.emit('move', move)
    }
}