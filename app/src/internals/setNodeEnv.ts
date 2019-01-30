if (process.argv.slice(2).indexOf('production') >= 0) {
	console.log('Production environment!');

	process.env.NODE_ENV = 'production';
} else {
	console.log('Development environment!');

	process.env.NODE_ENV = 'development';
}
