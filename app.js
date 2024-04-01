var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Socket } = require('socket.io-client');
const io = new Server(server,{
  cors:true
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

  const emailtoSocketMapping = new Map();
  const SockettoemailMapping = new Map();
  const roomUsers = {};

  io.on('connection',(socket)=>{
    console.log("User Connected");
    socket.on('join-room',(data)=>{
      // console.log(data);
      const {roomID, emailID} = data;
      emailtoSocketMapping.set(emailID, socket.id);
      SockettoemailMapping.set(socket.id, emailID);
      io.to(roomID).emit("user-joined",  {emailID:emailID,id:socket.id});
      socket.join(roomID);
      if (!roomUsers[roomID]) {
        roomUsers[roomID] = [];
      }
      roomUsers[roomID].push({ emailID, socketID: socket.id });
      // Emit updated user list to all clients in the room
      socket.to(roomID).emit('update-users', roomUsers[roomID]);
      socket.on("Setremotesocketid", (data) =>{

        io.to(data.remoteSocketID).emit("Settingremotesocketid", {youremail:data.youremail,id:socket.id});
      });
  
      socket.to(socket.id).emit('room:join',data);
      // console.log(`Emitted 'room:join' to ${socket.id}`, data);
      socket.on("user-call",({to, offer})=>{
        io.to(to).emit("incoming-call",{offer, from:socket.id});
      });
      socket.on("call-accepted",({to, ans})=>{
        // console.log("pehla user",to)
        // console.log("dusra",socket.id)
        io.to(to).emit("call-connected",{ans,from: socket.id});
      });
      socket.on("setuptracks",(to)=>{
        io.to(to).emit("remotetracksetup");
      });
      socket.on("peer-nego-needed",({to,offer})=>{
        io.to(to).emit("peer-nego-needed",{from:socket.id,offer});
      });
      socket.on("peer-nego-done",({to,ans})=>{
        io.to(to).emit("peer-nego-final",{from:socket.id,ans});

      });
      socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { from: socket.id, candidate });
        // console.log(candidate);
      });
      socket.on("screenshareID",({to, SSID})=>{
        io.to(to).emit("peerSSID",{from: socket.id, SSID:SSID});
      })
      socket.on("srcobjremove",(to)=>{
        io.to(to).emit("removesrcobj")
      })


      })
      socket.on('disconnect', () => {
        // Find the user in roomUsers and remove them
        for (const roomID in roomUsers) {
            const index = roomUsers[roomID].findIndex(user => user.socketID === socket.id);
            if (index !== -1) {
                const removedUser = roomUsers[roomID].splice(index, 1)[0];

                // Emit updated user list to all clients in the room
                io.to(roomID).emit('update-users', roomUsers[roomID]);
                io.to(roomID).emit('disconnected-users', removedUser.emailID);


                console.log(`${removedUser.emailID} disconnected from ${roomID}`);
                break; // Stop searching after finding and removing the user
            }
          }})
          

      // io.to(roomID).emit("user-joined",{emailID});
    });
  server.listen(3001);
  module.exports = app;
