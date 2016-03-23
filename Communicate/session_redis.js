var session_storage = require('socket.io/node_module/redis').createClient(),
    EXPIRE_TIME = 3 * 60 * 60,
    createSID = function (prefix){
        prefix = prefix ? prefix : 'NS';
        var time = (new Date()).getTime() + "",
            id = prefix + '_' +(time).substring(time.length - 6) + '_' + (Math.round(Math.random() * 1000));
        return id;
    },
    session = function (SID) {

    }
