const express = require('express');
const app = express();

const PORT = 3030;
const server = require('http').server(app);
const { v4: uuidv4 } = require('uuid'); 4k (gzipped: 1.8k)
const io = require('socket.io')(server);
const{ ExpressPeerServer } = require("peer");
const url   = require('url');
const peerServer = ExpressPeerServer(server, {
    debug : true
});
const path = require('path');
const { query } = require('express');
const { Socket } = require('dgram');

//middlewares

app.set("view engine","ejs");
app.use("/public",express.static(path.join(__dirname,"static")));
app.use("/peerjs",peerServer);

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,"static","index.html"));
});

app.get("/join", (req,res) => {
    res.redirect(
        url.format({
            pathname: `/join/${uuidv4()}`,
            query: req.query
        })
    )
});

app.get("/joinoId/:meeting_id", (req,res) => {
    res.redirect(
        url.format({
            pathname: req.params.meeting_id,
            query: req.query    
        })
    )
});

app.get("join/:room", (req,res) => {
    res.render("room",{roomid: req.params.room, myname: req.query.name});
});

io.on("connection" , (Socket) => {
    Socket.on("join-room", (roomid, id , myname) => {
        Socket.join(roomid);
        Socket.to(roomid).broadcast.emit("user-connected", id , myname);
        
        Socket.on("tellName", (myname) => {
            Socket.to(roomid).broadcast.emit("Add Name", myname);
        });

        Socket.on("disconnect", () => {
            Socket.to(roomid).broadcast.emit("user-disconnected", id);
        })  
    }) 
})
server.listen(PORT);