const express = require('express');
const path = require('path');
const debug = require('debug')('lumen-visual:server');
const http = require('http');
const commonMsg = require('./configs/common_messages.json');
let app = express();

/** setup express **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const cors = require('cors');
app.use(cors());

app.use((err, req, res, next) => {
    res.status(200).send(commonMsg.service_not_responding);
});
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
let port = normalizePort(process.env.PORT || '3077');
app.set('port', port);
let server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function normalizePort(val) {
    let port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}
function onError(error) {
    if (error.syscall !== 'listen') throw error;
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
module.exports = app;
let index = require('./routes/index');
let files = require('./routes/file');
app.use('/', index);
app.use('/files', files);

/** if route not found**/
app.use((req, res) => {
    res.status(200).send(commonMsg.routes_not_found);
});