const app = require('express')();
const http = require('http').createServer(app);

// jwt secret
const JWT_SECRET = 'myRandomHash';

const io = require("socket.io")(http, {
  cors: {
    origins: "*",
    credentials: true
  },
});

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

let countChatRoom = -1;

const getClientRoomStranger = (preRoom, id) => {
  let i = 0;
  let nameChatRoom = "";
  console.log("id",id);
  for (i = 0; i <= countChatRoom; i++) {
    nameChatRoom = ('stranger-chat-room-' + i).toString();
    if (nameChatRoom === preRoom) continue;
    if (io.sockets.adapter.rooms.get(nameChatRoom) && io.sockets.adapter.rooms.get(nameChatRoom).size == 1) {
      const members = io.sockets.adapter.rooms.get(nameChatRoom);
      for(const member of members){
        if(member === id){
          break;
        }
        else return nameChatRoom;
      }
      continue;
    }
  }
  
  return ('stranger-chat-room-' + (++countChatRoom)).toString();
}

function getTime() {
  let today = new Date();
  let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = time + ' ' + date;
  return dateTime;
}

io.on('connection', (socket) => {
  let preRoom = "";
  let clientRoom = getClientRoomStranger(preRoom, socket.id);
  console.log("clientRoom: " + clientRoom + ".....");
  socket.join(clientRoom);

  socket.on("nextRoomStranger", data => {
    preRoom = data;
    console.log("preRoom: " + preRoom + "......");
    io.in(preRoom).emit('statusRoomStranger', {
      content: 'NextRoomNextRoomNgười lạ đã rời đi. Đang đợi người lạ ...',
      createAt: getTime()
    });
    socket.leave(preRoom);
    clientRoom = getClientRoomStranger(preRoom, socket.id);
    console.log("clientRoomNew: " + clientRoom + ".....");
    socket.join(clientRoom);
    if (io.sockets.adapter.rooms.get(clientRoom).size < 2) {//.length < 2) {
      io.in(clientRoom).emit('statusRoomStranger', {
        content: 'Đang đợi người lạ ...',
        createAt: getTime()
      });
    } else {
      io.in(clientRoom).emit('statusRoomStranger', {
        content: 'Người lạ đã vào phòng|' + clientRoom,
        createAt: getTime()
      });
    }
  })

  if (io.sockets.adapter.rooms.get(clientRoom).size < 2) {//.length < 2) {
    io.in(clientRoom).emit('statusRoomStranger', {
      content: 'Đang đợi người lạ ...',
      createAt: getTime()
    });
  } else {
    io.in(clientRoom).emit('statusRoomStranger', {
      content: 'Người lạ đã vào phòng|' + clientRoom,
      createAt: getTime()
    });
  }
  // find user's all channels from the database and call join event on all of them.
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.to(clientRoom).emit('statusRoomStranger', {
      content: 'Người lạ đã rời đi. Đang đợi người lạ kế tiếp ...',
      createAt: getTime()
    });
  });

  socket.on('sendMessageStranger', function (message, callback) {
    socket.to(clientRoom).emit('receiveMessageStranger', {
      ...message, 
      createAt: getTime()
    });

    callback({
      "status": "ok",
      "createAt": getTime()
    })
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});