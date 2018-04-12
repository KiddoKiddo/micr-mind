import socketio from 'socket.io-client';

const io = socketio('http://localhost:3000/mind');
export default io;
