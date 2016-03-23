var http = require("http"),
    session = require('session'),
    cookie_reader = require('cookie'),
    server = http.createServer().listen(4000),
    redis = require('socket.io/node_module/redis'),
    io = require("socket.io").listen(server);
        //配置socket.io来存储Django设置的cookie
        io.configure(function(){
            io.set('authorization', function(data, accept){
                if(data.headers.cookie){
                    data.cookie = cookie_reader.parse(data.headers.cookie);
                    return accept(null, true);
                }
                return accept('error', false);
            });
            io.set('log level', 1);
        });
    var querystring = require('querystring'),
        sub = redis.createClient().subscribe('chat'),
    chat = io.sockets.on('connection',function(socket) {
            var room_id;
            socket.on('join room', function (roomid, accept){
                socket.join(roomid);
                room_id = roomid;
                socket.to(roomid).broadcast.emit("new commer");
                accept(true);
                console.log("joined room " + room_id);

            });
            socket.on('message', function (message){
               console.log(room_id);
               socket.broadcast.to(room_id).send(message);
            });

    });
//var options = {
//                    host: 'localhost',
//                    port: 8000,
//                    path: '/node_api',
//                    method: 'POST',
//                    headers: {
//                        'Content-Type': 'application/x-www-form-urlencoded',
//                        'Content-Length': message.length
//                    }
//                   },
//                   values = querystring.stringify(message),
//                   req = http.get(options,function (res){
//                       res.setEncoding("utf8");
//                       res.on('data', function (message){
//                           if(message != "true"){
//                               socket.broadcast.emit('error',message);
//                               console.log(message);
//                           }
//                       });
//                       req.write(values);
//                       req.end();
//                   });