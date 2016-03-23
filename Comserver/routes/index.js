
/*
 * GET home page.
 */
var querystring = require('querystring');

var http = require('http');
var transport = function (event){
    return function (req){
        var data = JSON.parse(req.data);
        data['event'] = event;
        var values = querystring.stringify({
            'record': JSON.stringify(data)
//            sessionid: req.io.handshake.cookie['sessionid']
        });
        var options = {
            host: 'localhost',
            port: 8000,
            path: '/hwamei/comserver/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };

        var req_cl = http.get(options, function (res){
            res.setEncoding("utf8");
            res.on('data', function (message){
                if (message != "success"){
                    req.io.emit('error', message);
                }
            });

        });
        req_cl.write(values);
        req_cl.end();
        req.io.room(data.worksp).broadcast(exports.namespace + ":" + event,JSON.stringify(data));
    }
};
var workSpaces = {};
//socket.io server
exports.namespace = "index";
exports.server = {
    'join_ws': function (req){
        var data = JSON.parse(req.data);
        if (workSpaces[data.worksp]){
            workSpaces[data.worksp]++;
        } else {
            workSpaces[data.worksp] = 1;
        }
        var msg = {
            'user': 'server',
            'worsp': 'lobby',
            'content': {
                'user': data.user
            }
        };
        req.io.join(data.worksp);
        req.io.room(data.worksp).broadcast(exports.namespace + ':user_join', JSON.stringify(msg));
    },
    'leave_ws': function (req){
        var data = JSON.parse(req.data);

        if (workSpaces[data.worksp] > 1){
            workSpaces[data.worksp]--;
        } else {
            delete workSpaces[data.worksp];
        }
        var msg = {
            'user': 'server',
            'worsp': 'lobby',
            'content': {
                'user': data.user
            }
        };
        req.io.leave(data.worksp);
        req.io.room(data.worksp).broadcast(exports.namespace + ':user_leave', JSON.stringify(msg));
    },
    'send_draw': transport('rcv_draw'),
    'send_chat': transport('rcv_chat')
};