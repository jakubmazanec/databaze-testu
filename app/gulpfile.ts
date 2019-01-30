import './src/internals/setNodeEnv';
import './src/internals/polyfills';

import * as path from 'path';
import * as gulp from 'gulp';
import * as del from 'del';
import * as babel from 'gulp-babel';
import * as replace from 'gulp-replace';
import * as webpack from 'webpack';
import * as fs from 'fs';
import * as ExtractText from 'extract-text-webpack-plugin';
import * as autoprefixer from 'autoprefixer';
import * as postcssCustomProperties from 'postcss-custom-properties';
import * as postcssVerticalRhythm from 'postcss-vertical-rhythm';
import * as postcssNested from 'postcss-nested';
import * as postcssPxToRem from 'postcss-pxtorem';
import * as postcssCalc from 'postcss-calc';
import * as postcssConditionals from 'postcss-conditionals';
import * as postcssCustomMedia from 'postcss-custom-media';
import * as postcssColorFunction from 'postcss-color-function';
import * as util from 'gulp-util';
import * as uglify from 'gulp-uglify';
import * as cssnano from 'gulp-cssnano';
import * as gulpDebug from 'gulp-debug';
import * as gulpRename from 'gulp-rename';
import * as hydra from 'gulp-hydra';
import * as gulpTypescript from 'gulp-typescript';
import * as gulpLineEndings from 'gulp-line-ending-corrector';
import * as merge from 'merge2';
import * as chalk from 'chalk';
import * as favicons from 'gulp-favicons';

import flattenTree from './src/internals/flattenTree';
import config from './src/config/common';
import urlRoot from './src/internals/urlRoot';
import createTemplateVariableRegExp from './src/internals/createTemplateVariableRegExp';


let loadVariables = (): {[index: string]: number | string} => flattenTree(config.styles, {valuesToString: true, separator: '-'});
let variables = loadVariables();

console.log(chalk.white('Variables:'));
console.log(chalk.grey(JSON.stringify(variables, null, ' ')));

const enum PATHS {
	buildDir = './build/',
	publicAssetsDir = './public/assets',
	publicDistDir = './public/dist',
	publicDir = './public',

	srcJavascriptFiles = './src/**/*.ts*',
	srcPhpFiles = './src/**/*.php',
	srcDataFiles = './src/**/*.json',
	typingsFiles = './typings/index.d.ts',
	buildJavascriptFiles = './build/**/*.js*',
	clientBuildFile = './build/client.js',
	serviceWorkerBuildFile = './build/sw.js',
	clientJavaScriptDistFile = './public/dist/client.js',
	clientServiceWorkerDistFile = './public/dist/sw.js',
	clientStylesDistFile = './public/dist/client.css',
	imageFiles = './assets/images/**/*',
	faviconFile = './assets/images/favicon.svg',
	fontFiles = './assets/fonts/**/*.woff*',
	publicFiles = './public/**/*',
	stylesFiles = './src/**/*.css',
	templateFiles = './assets/templates/**/*',
	htaccessFiles = './assets/templates/**/.htaccess'
}

const enum TASKS {
	watch = 'watch',
	build = 'build',

	cleanup = 'cleanup',
	javascriptBuild = 'js-build',
	phpBuild = 'php-build',
	dist = 'dist',
	distLineEndings = 'dist-line-endings',
	data = 'data',
	styles = 'styles',
	images = 'images',
	favicons = 'favicons',
	fonts = 'fonts',
	templates = 'templates',
	htaccess = 'htaccess',
	minifyScripts = 'minifiy-scripts',
	minifyStyles = 'minify-styles'
}

let mediaQueries = {
	'--tinyMenu-start-min': `(min-width: ${variables['breakpoints.tinyMenu.start']}px)`,
	'--tinyMenu-start-max': `(max-width: ${variables['breakpoints.tinyMenu.start']}px)`,
	'--tinyMenu-end-min': `(min-width: ${variables['breakpoints.tinyMenu.end']}px)`,
	'--tinyMenu-end-max': `(max-width: ${variables['breakpoints.tinyMenu.end']}px)`,
	'--compactMenu-start-min': `(min-width: ${variables['breakpoints.compactMenu.start']}px)`,
	'--compactMenu-start-max': `(max-width: ${variables['breakpoints.compactMenu.start']}px)`,
	'--compactMenu-end-min': `(min-width: ${variables['breakpoints.compactMenu.end']}px)`,
	'--compactMenu-end-max': `(max-width: ${variables['breakpoints.compactMenu.end']}px)`,
	'--compactPage-start-min': `(min-width: ${variables['breakpoints.compactPage.start']}px)`,
	'--compactPage-start-max': `(max-width: ${variables['breakpoints.compactPage.start']}px)`,
	'--compactPage-end-min': `(min-width: ${variables['breakpoints.compactPage.end']}px)`,
	'--compactPage-end-max': `(max-width: ${variables['breakpoints.compactPage.end']}px)`,
	'--singleColumnPage-start-min': `(min-width: ${variables['breakpoints.singleColumnPage.start']}px)`,
	'--singleColumnPage-start-max': `(max-width: ${variables['breakpoints.singleColumnPage.start']}px)`,
	'--singleColumnPage-middle-min': `(min-width: ${variables['breakpoints.singleColumnPage.middle']}px)`,
	'--singleColumnPage-middle-max': `(max-width: ${variables['breakpoints.singleColumnPage.middle']}px)`,
	'--singleColumnPage-end-min': `(min-width: ${variables['breakpoints.singleColumnPage.end']}px)`,
	'--singleColumnPage-end-max': `(max-width: ${variables['breakpoints.singleColumnPage.end']}px)`,
};


/**
 * Cleans all files created by other build tasks.
 */
gulp.task(TASKS.cleanup, () => del([PATHS.publicFiles, PATHS.buildDir]));


/**
 * Builds source TypeScript files into JavaScript files.
 */
let typescriptSettings: any = {module: 'ES2015'};
let typescriptProject = gulpTypescript.createProject('tsconfig.json', typescriptSettings);
let babelConfig = JSON.parse(fs.readFileSync('.babelrc', {encoding: 'utf8'}));

gulp.task(TASKS.javascriptBuild, (done: () => void) => {
	let result = merge([gulp.src(PATHS.typingsFiles), gulp.src(PATHS.srcJavascriptFiles, {since: gulp.lastRun(TASKS.javascriptBuild)})])
		.pipe(gulpDebug({title: TASKS.javascriptBuild}))
		.pipe(typescriptProject());

	return merge([
		result.dts.pipe(gulp.dest(PATHS.buildDir)),
		result.js
			.pipe(gulpRename({
				extname: '.js'
			}))
			.pipe(babel(babelConfig).on('error', (error: any) => {
				console.log(`${chalk.red(`${error.fileName}${(error.loc ?	`(${error.loc.line}, ${error.loc.column}): ` :	': ')}`)}error Babel: ${error.message}\n${error.codeFrame}`);

				done();
			}))
			.pipe(gulp.dest(PATHS.buildDir))
	]);
});

/*gulp.task(TASKS.javascriptBuild, (done: () => void) => gulp.src(PATHS.srcJavascriptFiles, {since: gulp.lastRun(TASKS.javascriptBuild)})
	.pipe(gulpRename({
		extname: '.js'
	}))
	.pipe(babel(babelConfig).on('error', (error: any) => {
		console.log(error);
		console.log(`${chalk.red(`${error.fileName}${(error.loc ?	`(${error.loc.line}, ${error.loc.column}): ` :	': ')}`)}error Babel: ${error.message}\n${error.codeFrame}`);

		done();
	}))
	.pipe(gulp.dest(PATHS.buildDir)));*/


/**
 * Create dist files
 *
 * Create dist files of scripts and styles.
 */
let babelCompatConfig = JSON.parse(fs.readFileSync(process.env.NODE_ENV === 'production' ? '.babelrc-compat-prod' : '.babelrc-compat-dev', {encoding: 'utf8'}));
let webpackCompiler = webpack({
	target: 'web',
	context: path.resolve(__dirname),
	entry: {
		client: PATHS.clientBuildFile,
		sw: PATHS.serviceWorkerBuildFile
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, PATHS.publicDistDir)
	},
	cache: true,
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			options: babelCompatConfig,
			exclude: [/node_modules/],
		}, {
			test: /\.css$/,
			use: ExtractText.extract({
				use: [{
					loader: 'css-loader',
					options: {
						modules: true,
						url: false,
						importLoaders: 1,
						localIdentName: '[name]__[local]__[hash:base64:4]'
					}
				}, {
					loader: 'postcss-loader',
					options: {
						ident: 'postcss',
						plugins: () => [
							postcssNested(),
							postcssCustomProperties({variables: loadVariables()}),
							postcssCustomMedia({extensions: mediaQueries}),
							postcssConditionals(),
							postcssVerticalRhythm({
								unit: 'bh',
								baselineHeight: config.styles.grid.baselineHeight
							}),
							postcssCalc({precision: 8}),
							postcssPxToRem({
								rootValue: config.styles.typographicScale.base,
								unitPrecision: 8,
								propWhiteList: ['font', 'font-size', 'line-height', 'letter-spacing', 'width', 'height', 'left', 'right', 'top', 'bottom', 'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom', 'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'border', 'border-left', 'border-right', 'border-top', 'border-bottom', 'background', 'background-size', 'transform', 'transition', 'box-shadow'],
								replace: true,
								mediaQuery: false,
								selectorBlackList: ['html']
							}),
							postcssColorFunction(),
							autoprefixer({remove: false})
						]
					}
				}]
			})
		}]
	},
	plugins: [
		new ExtractText({
			filename: path.basename(PATHS.clientStylesDistFile),
			disable: false,
			allChunks: true
		}),
		new webpack.DefinePlugin({
			'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}
		}),
		new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|cs)$/)
	],
	watch: false
} as any);

gulp.task(TASKS.dist, (done: () => void) => {
	webpackCompiler.run((error, stats) => {
		if (error) {
			util.log(error);

			if (done) {
				done();
			}
		} else {
			(stats as any).compilation.errors.forEach((compilationError: any) => {
				util.log(compilationError.error);
			});

			Object.keys((stats as any).compilation.assets).forEach((key) => {
				util.log('Webpack: output ', util.colors.green(key));
			});

			if (done) {
				done();
			}
		}
	});
});


/**
 * Converts line endings to LF.
 */
gulp.task(TASKS.distLineEndings, () => gulp.src([PATHS.clientJavaScriptDistFile, PATHS.clientServiceWorkerDistFile])
	.pipe(gulpLineEndings({verbose: true, eolc: 'LF'}))
	.pipe(gulp.dest(PATHS.publicDistDir)));


/**
 * Copies PHP source files.
 */
gulp.task(TASKS.phpBuild, () => gulp.src(PATHS.srcPhpFiles, {
	since: gulp.lastRun(TASKS.phpBuild),
	base: './src'
})
	.pipe(gulpDebug({title: TASKS.phpBuild}))
	.pipe(gulp.dest(PATHS.publicDir)));


/**
 * Copy styles
 *
 * Copy styles to all the scripts build directories.
 */
gulp.task(TASKS.styles, () => gulp.src(PATHS.stylesFiles, {since: gulp.lastRun(TASKS.styles)})
	.pipe(gulpDebug({title: TASKS.styles}))
	.pipe(replace(createTemplateVariableRegExp('urlRoot'), urlRoot))
	.pipe(gulp.dest(PATHS.buildDir)));


/**
 * Copy data files
 *
 * Copy data files to all the scripts build directories.
 */
gulp.task(TASKS.data, () => gulp.src(PATHS.srcDataFiles, {since: gulp.lastRun(TASKS.data)})
	.pipe(gulpDebug({title: TASKS.data}))
	.pipe(replace(createTemplateVariableRegExp('urlRoot'), urlRoot))
	.pipe(gulp.dest(PATHS.buildDir)));


/**
 * Copy fonts
 */
gulp.task(TASKS.fonts, () => gulp.src(PATHS.fontFiles)
	.pipe(gulp.dest(PATHS.publicAssetsDir)));


/**
 * Copy images
 */
gulp.task(TASKS.images, () => gulp.src(PATHS.imageFiles)
	.pipe(gulp.dest(PATHS.publicAssetsDir)));


/**
 * Create favicons.
 */
gulp.task(TASKS.favicons, (done: () => void) => {
	let result = gulp.src(PATHS.faviconFile).pipe(favicons({
		appName: config.appName,
		appDescription: config.appDescription,
		developerName: config.developerName,
		developerURL: config.developerUrl,
		theme_color: config.themeColor,
		background: config.backgroundColor,
		path: '{{urlRoot}}/assets/',
		url: '',
		display: 'standalone',
		orientation: 'portrait',
		start_url: '/', // eslint-disable-line camelcase
		version: config.version,
		logging: false,
		online: true,
		html: 'index.html',
		pipeHTML: true,
		replace: true,
		icons: {
			android: true,
			appleIcon: true,
			appleStartup: true,
			coast: false,
			favicons: true,
			firefox: false,
			windows: true,
			yandex: false
		}
	}))
		.on('error', (error: any) => {
			util.log(error);

			done();
		})
		.pipe(hydra({
			html: {type: 'filename', filter: ['index.html']},
			manifest: {type: 'filename', filter: ['manifest.json']},
			assets: {type: 'ext', filter: ['.png', '.ico', '.json', '.xml']}
		}));

	result.html
		.pipe(gulpRename('favicons.html'))
		.pipe(gulp.dest('./assets/templates'));

	result.manifest
		.pipe(replace(createTemplateVariableRegExp('urlRoot'), urlRoot))
		.pipe(gulp.dest(PATHS.publicAssetsDir));

	return result.assets
		.pipe(gulp.dest(PATHS.publicAssetsDir));
});


/**
 * Copy templates
 */
gulp.task(TASKS.templates, () => gulp.src(PATHS.templateFiles)
	.pipe(replace(createTemplateVariableRegExp('urlRoot'), urlRoot))
	.pipe(gulp.dest(PATHS.publicDir)));


/**
 * Copy htaccess files.
 */
gulp.task(TASKS.htaccess, () => gulp.src(PATHS.htaccessFiles)
	.pipe(replace(createTemplateVariableRegExp('urlRoot'), urlRoot))
	.pipe(gulp.dest(PATHS.publicDir)));


/**
 * Minify dist script files
 */
gulp.task(TASKS.minifyScripts, () => gulp.src(PATHS.clientJavaScriptDistFile)
	.pipe(uglify())
	.pipe(gulp.dest(PATHS.publicDistDir)));


/**
 * Minify dist styles file
 */
gulp.task(TASKS.minifyStyles, () => gulp.src(PATHS.clientStylesDistFile)
	.pipe(cssnano({
		mergeLonghand: false,
		autoprefixer: false,
		safe: true
	}))
	.pipe(gulp.dest(PATHS.publicDistDir)));


/**
 * Watch task
 */
gulp.task(TASKS.watch, (done: () => void) => {
	gulp.watch([PATHS.srcJavascriptFiles], gulp.series(TASKS.javascriptBuild, TASKS.dist, TASKS.distLineEndings));
	gulp.watch([PATHS.srcPhpFiles], gulp.series(TASKS.phpBuild));
	gulp.watch([PATHS.stylesFiles], gulp.series(TASKS.styles, TASKS.dist));
	gulp.watch([PATHS.srcDataFiles], gulp.series(TASKS.data, TASKS.dist));
	gulp.watch([PATHS.imageFiles], gulp.series(TASKS.images));
	// gulp.watch([PATHS.templateFiles], gulp.series(TASKS.templates));

	done();
});


/**
 * Default task
 *
 * Builds development build and starts watching for changes.
 */
gulp.task('default', gulp.series(
	TASKS.cleanup,
	gulp.parallel(
		// TASKS.templates,
		TASKS.htaccess,
		TASKS.favicons,
		TASKS.images,
		TASKS.fonts,
		TASKS.phpBuild,
		gulp.series(
			gulp.parallel(TASKS.data, TASKS.styles, TASKS.javascriptBuild),
			TASKS.dist,
			TASKS.distLineEndings,
			TASKS.watch
		)
	)
));


/**
 * Build task
 */
gulp.task(TASKS.build, process.env.NODE_ENV === 'production' ? gulp.series(
	TASKS.cleanup,
	gulp.parallel(
		// TASKS.templates,
		TASKS.htaccess,
		TASKS.favicons,
		TASKS.images,
		TASKS.fonts,
		TASKS.phpBuild,
		gulp.series(
			gulp.parallel(TASKS.data, TASKS.styles, TASKS.javascriptBuild),
			TASKS.dist,
			TASKS.distLineEndings,
			gulp.parallel(TASKS.minifyScripts, TASKS.minifyStyles)
		)
	)
) : gulp.series(
	TASKS.cleanup,
	gulp.parallel(
		// TASKS.templates,
		TASKS.htaccess,
		TASKS.favicons,
		TASKS.images,
		TASKS.fonts,
		TASKS.phpBuild,
		gulp.series(
			gulp.parallel(TASKS.data, TASKS.styles, TASKS.javascriptBuild),
			TASKS.dist,
			TASKS.distLineEndings
		)
	)
));
