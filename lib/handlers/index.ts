const helpers = require('../helpers');

type Handlers = {
  index?: Function,
  favicon?: Function

};

const handlers: Handlers = {};

// const acceptableMethods = ['post', 'get', 'put', 'delete'];

handlers.index = (data: { method: string }, callback: Function) => {
	const templateData = {
		'head.title': 'Main Page',
		'head.description': 'This is a study project',
		'body.title': 'This is a study project with Node',
		'body.class': 'main'
	};
	if (data.method === 'GET') {
		helpers.getTemplate('index', templateData, (err, template) => {
			if (err || !template) return callback(500, undefined, 'html');
			callback(200, template, 'html');
		});
	}

	else callback(405, undefined, 'html');
};

handlers.favicon = (data, callback) => {
	if (data.method !== 'GET') return callback(405);

	helpers.getStaticAsset('favicon.ico', (err, data) => {
		if (err) return callback(500);

		callback(200, data, 'favicon');
	})
};

module.exports = handlers;
