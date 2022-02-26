export {};
const fs = require('fs');
const path = require('path');

const config = require('./config');

type Helpers = {
    getStaticAsset?: Function,
    getTemplate?: Function,
    addUniversalTemplates?: Function,
    interpolate?: Function,
}

const helpers: Helpers = {};

helpers.getStaticAsset = (fileName, callback) => {
	if (!fileName) return callback('fileName is required in getStaticAsset');

	const publicDir = path.join(__dirname, '../public/');
	fs.readFile(
		`${publicDir}${fileName}`,
		(err, data) => {
			if (err) return callback(err);
			callback(false, data)
		}
	);
};

helpers.getTemplate = (templateName, data, callback) => {
	if (!templateName) return callback('Template name is required');

	const templateDir = path.join(__dirname, '../templates/');
	fs.readFile(
		`${templateDir}${templateName}.html`,
		'utf8',
		(err, template) => {
			if (err) return callback(err);
			const final = helpers.interpolate(template, data);
			callback(err, final)
		}
	);
};

helpers.addUniversalTemplates = (template, data, callback) => {
	helpers.getTemplate('_header', data, (err, headerTemplate) => {
		if (err) return callback(err);
		helpers.getTemplate('_footer', data, (err, footerTemplate) => {
			if (err) return callback(err);
			callback(false, headerTemplate + template + footerTemplate);
		});
	});
};

helpers.interpolate = (str, data) => {
	for (let key in config.templateGlobal) {
		if (config.templateGlobal.hasOwnProperty(key)) {
			data['global.' + key] = config.templateGlobal[key];
		}
	}

	for (let key in data) {
		if (data.hasOwnProperty(key)) {
			data['global.' + key] = config.templateGlobal[key];
			const replace = data[key];
			const find = `{${key}}`;

			str = str.replace(find, replace);
		}
	}
	return str;
};

module.exports = helpers;
