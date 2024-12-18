var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var io = require("socket.io-client");
const { GameMap } = require("./main.js");

const gameId = "4fa3c5e2-2cc7-415f-a785-44a3e53a6763";
const playerId = "player1-xxx";

const socket = io("http://127.0.0.1/");

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const gameMap = new GameMap(socket, playerId);
//gameMap.run();

socket.on("connect", () => {
  console.log(`Socket connect ${socket.id}`);
  socket.emit("join game", { game_id: gameId, player_id: playerId });
});

socket.on("disconnect", () => {
  console.log(`Socket disconnect ${socket.id}`);
});

socket.on("connect_failed", () => {
  console.warn("[Socket] connect_failed");
});

socket.on("error", (err) => {
  console.error("[Socket] error ", err);
});

socket.on("join game", (res) => {
  console.log("[Socket] join-game responsed", res);
  socket.emit("register character power", {
    gameId,
    type: 2,
  });
  gameMap.onJoinGame(res);
});

//API-2
socket.on("ticktack player", (res) => {
  //console.info('> ticktack');
  //console.log('[Socket] ticktack-player responsed, map_info: ', res.map_info);
  gameMap.parseTicktack(res.id, res);
});

socket.on("drive player", (res) => {
  //res.player_id === playerId && console.log('[Socket] drive-player responsed, res: ', res);
  console.log("[Socket] drive-player responsed, res: ", res);
  gameMap.onPlayerStop(res);
});

module.exports = app;
