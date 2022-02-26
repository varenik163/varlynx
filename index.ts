const server = require('./lib/server');
// const workers = require('./lib/workers');
// const cli = require('./lib/cli');

interface App {
    init?: () => void
}

const app: App = {};

app.init = () => {
	server.init();
};

app.init();

module.exports = app;
