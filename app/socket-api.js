import socketio from 'socket.io-client';

const io = (path) => {
  if (path) return socketio(path);
  return socketio('/mind');
};
export default io;
