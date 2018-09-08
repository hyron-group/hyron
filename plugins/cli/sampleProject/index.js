const HyronApp = require('hyron');

var apiServer = new HyronApp(3000, 'localhost', 'api');
apiServer.enableModule(require('./api'))
apiServer.startServer();

var webServer = new HyronApp(3001, 'localhost');
webServer.enableModule(require('./www'));
webServer.startServer();