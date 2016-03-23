
/**
 * Module dependencies.
 */

var express = require('express.io')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
   , index= require('./routes/index');
var cookie_reader = require('cookie');
var app = express();
app.http().io();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({secret: 'hwamei'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.io.configure(function(){
    app.io.set('authorization', function(data, accept){
        if(data.headers.cookie){
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        return accept('error', false);
    });
    app.io.set('log level', 1);
});

app.io.route(index.namespace,index.server);
app.get('/', function (req,res){
    if (!req.session.name || !req.session.pw)
        res.sendfile(__dirname + "/views/test.html");
});

app.listen(app.get('port'),function (){
    console.log('Express server listening on port ' + app.get('port'));
});
module.exports = app