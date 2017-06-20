'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];

let Client = function(socket, nickname){
  this.nickname = nickname;
  this.socket = socket;
};



server.on('connection', (socket) => {
  let client = new Client(socket, `${Math.floor(Math.random() * (1000 - 1) + 1)}`);

  socket.write(`Hello Summoner, welcome to my chatroom!!\n\n
               type /nick to chang your name\n
               type /dm <username> to send a direct message\n
               type /troll <single digit number> <message> to have a little fun\n
               type /quite to quit!\n`);
  socket.nickname = client.nickname;
  console.log(`${socket.nickname} connected!`);
  clientPool = [...clientPool, client];

  let handleDisconnect = () => {
    console.log(`${socket.nickname} left! :(`);
    clientPool = clientPool.filter((item) => {
      item != socket;
    });
  };

  socket.on('error', handleDisconnect);

  socket.on('close', handleDisconnect);


  socket.on('data', (buffer) => {
    let data = buffer.toString();

    if(data.startsWith('/nick')) {
      socket.nickname = data.split('/nick')[1] || socket.nickname;
      socket.nickname = socket.nickname.trim();
      client.nickname = socket.nickname;
      socket.write(`You are now known as ${socket.nickname}!\n`);
      return;
    }

    if(data.startsWith('/dm')){
      let content = data.split('/dm ')[1] || '';
      content = content.trim();
      let to = content.split(' ')[0].trim();
      clientPool.forEach((user) => {
        if(to == user.nickname){
          user.socket.write(`${socket.nickname}: ${data.split(to)[1]}\n`);
        }
      });
      return;
    }

    if(data.startsWith('/troll')){
      let troll = data.split('/troll ')[1].slice(0,1);
      let content = data.split(' ').slice(2).join(' ');
      console.log(troll);
      for (var i = 0; i < troll; i++){
        clientPool.forEach((user) => {
          user.socket.write(`${socket.nickname}: ${content}\n`);
        });
      }
      return;
    }

    if(data.startsWith('/quit')){
      clientPool.forEach((user) => {
        user.socket.write(`\n${socket.nickname} is a quitter!!! :O\n`);
      });
      client.socket.end();
      return;
    }

    clientPool.forEach((user) => {
      user.socket.write(`${socket.nickname}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
