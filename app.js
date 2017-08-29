var express = require('express');
var router = require('./router');

var app = express();

var bodyParser = require('body-parser');

var server = app.listen(9000, function() {
    console.log('Express server listening on port ' + server.address().port);
});

//将提交限制在50MB以内
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/', router);

process.on('uncaughtException', function(err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});