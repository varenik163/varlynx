export {};
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { StringDecoder } = require('string_decoder');
const util = require('util');

const config = require('./config');
const handlers = require('./handlers');

const debug = util.debuglog('server');

interface Server { listen?: Function }

interface ServerModel {
  server?: Function,
  router?: Object,
  init?: Function,
  httpsServerOptions?: Object,
  httpServer?: Server,
  httpsServer?: Server
}

const serverModel: ServerModel = {};

const { httpPort, httpsPort } = config;

serverModel.server = (req, res) => {
	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// regular expression to trim slashes
	const trimRegExp = /^\/+|\/+$/g;

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(trimRegExp, '');

	//Get query string as an object
	const { query } = parsedUrl;

	// req destructure
	const { method, headers } = req;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');
	let buffer = '';
	req.on('data', data => {
		buffer += decoder.write(data)
	});
	req.on('end', () => {
		buffer += decoder.end();
		let chosenHandler = serverModel.router[trimmedPath] // || serverModel.router.notFound;
		if (trimmedPath.includes('public/')) {
			// chosenHandler = serverModel.router.public;
		}
		console.log(trimmedPath)
		const data = {
			trimmedPath,
			query,
			method,
			headers,
			payload: buffer && JSON.parse(buffer)
		};
		chosenHandler(data, (statusCode = 200, payload = {}, contentType = 'json') => {
			let payloadString: any = '';

			if (contentType === 'json') {
				payloadString = JSON.stringify(payload);
				res.setHeader('Content-Type', 'application/json');
			}
			if (contentType === 'html') {
				res.setHeader('Content-Type', 'text/html');
				if (typeof(payload) === 'string') payloadString = payload;
			}
			if (contentType === 'favicon') {
				res.setHeader('Content-Type', 'image/x-icon');
				payloadString = payload;
			}
			if (contentType === 'css') {
				res.setHeader('Content-Type', 'text/css');
				payloadString = payload;
			}
			if (contentType === 'js') {
				res.setHeader('Content-Type', 'text/js');
				payloadString = payload;
			}
			if (contentType === 'png') {
				res.setHeader('Content-Type', 'image/png');
				payloadString = payload;
			}
			if (contentType === 'jpg') {
				res.setHeader('Content-Type', 'image/jpeg');
				payloadString = payload;
			}
			if (contentType === 'plain') {
				res.setHeader('Content-Type', 'text/plain ');
				if (typeof(payload) === 'string') payloadString = payload;
			}
			res.writeHead(statusCode);
			res.end(payloadString);

			if(statusCode === 200) {
				debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
			} else {
				debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
			}
			console.log(
				req.url,
				'Returning this response: ',
				statusCode
			)
		});
	});
};

serverModel.httpServer = http.createServer((req, res) => {
	serverModel.server(req, res);
});

serverModel.httpsServerOptions = {
	'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
};
serverModel.httpsServer = https.createServer(
    serverModel.httpsServerOptions,
    (req, res) => {
	    serverModel.server(req, res);
    }
);

serverModel.router = {
	// static
	'': handlers.index,
	'favicon.ico': handlers.favicon
};

serverModel.init = () => {
	serverModel.httpServer.listen(httpPort, () => {
		console.log(
			'\x1b[36m%s\x1b[0m',
			`The server is listening on port ${httpPort}`
		);
	});
	serverModel.httpsServer.listen(httpsPort, () => {
		console.log(
			'\x1b[35m%s\x1b[0m',
			`The server is listening on port ${httpsPort}`
		);
	});
};

module.exports = serverModel;
