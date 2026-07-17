// Socket.io handler - emits real-time upload progress events
module.exports = function registerUploadSocket(io) {
  io.on('connection', (socket) => {
    // socket.on('upload:progress', ...)
  });
};
