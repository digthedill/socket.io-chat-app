const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
    generateMsg,
    generateLocationMsg
} = require('../src/utils/messages')

const {
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));

io.on("connection", (socket) => {


    //ROOM!
    socket.on('join', (options, callback) => {
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            ...options
        })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit("message", generateMsg('O V E R L O R D', "Welcome to my app ;)"));
        socket.broadcast.to(user.room).emit("message", generateMsg(`${user.username} has joined`));

        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const {
            room,
            username
        } = getUser(socket.id)
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback("Profanity is not allowed");
        }
        io.to(room).emit("message", generateMsg(username, msg));
        callback();
    });

    socket.on("sendLocation", (loc, callback) => {
        const {
            room,
            username
        } = getUser(socket.id)
        io.to(room).emit(
            "locationMessage",
            generateLocationMsg(username, `https://google.com/maps?q=${loc.latitude},${loc.longitude}`)
        );
        callback();
    });


    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMsg(`${user.username} has left chatroom`));
        }
    });


});

server.listen(port, () => {
    console.log("Server live on " + port);
});