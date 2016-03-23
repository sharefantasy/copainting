
    var port = 3000;
    var path = "index";
    var configure = {
        'worksp': "{{ workspace }}",
        'user': "{{ user_name }}",
        'content': 'configure'
    };

    var content_parse = function (content){
        return content;
    };

    var socket = io.connect(window.location.hostname,{'port':port});
    socket.on('connect', function (){
        console.log('connect to server');
    });

    socket.emit(path + ":join_ws", JSON.stringify(configure));


    var users = [];
    socket.on(path + ':user_join', function (data){
        var msg = JSON.parse(data);
        users.push(msg.content.user);
        var userN = $('#users').val("");
        var usertext = "";
        for (var u in users){
            usertext += users[u] + '\n';
        }
        userN.val(usertext);
        $('#achat').val($('achat').val()+"added user " +msg.content.user);
    });

    socket.on(path + ':user_leave',function (data){
        var msg = JSON.parse(data);
        console.log(msg.content.user);
    });

    $('#leave').on('click', function (e){

        socket.emit(path + ':leave_ws', JSON.stringify(configure));
    });

    var msglist = "";
    $('#send_chat').on('click', function (e){
        var chat_msg = $("#chat_msg");
        var msg = {
            'user': configure.user,
            'worksp': configure.worksp,
            'content': chat_msg.val()
        };
        chat_msg.val("");
        msglist += msg.user + ": " + content_parse(msg.content) + "\n";
        socket.emit(path + ':send_chat',JSON.stringify(msg));
    });
    socket.on(path + ':rcv_chat', function (data){
        var msg = JSON.parse(data);
        msglist += msg.user + ": " + content_parse(msg.content) + "\n";
        $('#achat').val(msglist);
    });

    var cp = CanvasPlane(document.getElementById('cp'));
    socket.on(path + ':rcv_draw', function (data){
        var msg = JSON.parse(data);
        console.log(msg);
        if (VerifyDrawData(msg.content)){
            cp.append(msg.content);
            cp.Update();
        }
    });
    cp.OnNewDraw = function (data){
        var msg = {
            'user': configure.user,
            'worksp': configure.worksp,
            'content': data
        };
        socket.emit(path + ':send_draw',JSON.stringify(msg));
    };

