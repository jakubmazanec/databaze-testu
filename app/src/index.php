<?php

use \GraphQL\Server\StandardServer;
use \GraphQL\Executor\ExecutionResult;
use \GraphQL\Error\Debug;
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \PHPMailer\PHPMailer\PHPMailer;

require '../vendor/autoload.php';
require './config/index.php';
require './api/functions.php';
require './api/schema.php';


// create Slim app
$app = new \Slim\App([
	'settings' => [
		'displayErrorDetails' => true
	],
]);

// fetch DI Container
$container = $app->getContainer();

// register Twig View helper
$container['view'] = function ($c) {
	$view = new \Slim\Views\Twig('../assets/templates');

	// Instantiate and add Slim specific extension
	$basePath = rtrim(str_ireplace('index.php', '', $c['request']->getUri()->getBasePath()), '/');
	$view->addExtension(new \Slim\Views\TwigExtension($c['router'], $basePath));

	return $view;
};

// add JWT authentication middleware
$app->add(new \Slim\Middleware\JwtAuthentication([
	'path' => '/api/restricted',
	'secret' => $config['jwt']['secret'],
	'error' => function ($request, $response, $arguments) {
		$data = [
			'errors' => [[
				'message' => $arguments['message'],
				'category' => 'app'
			]]
		];

		return $response
			->withHeader('Content-Type', 'application/json')
			->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	}
]));

// public API endpoint
$app->post('/api/public', function (Request $request, Response $response) {
	global $publicSchema;

	$server = new StandardServer([
		'schema' => $publicSchema,
		'debug' =>Debug::INCLUDE_DEBUG_MESSAGE | Debug::INCLUDE_TRACE
	]);

	return $server->processPsrRequest($request, $response, $response->getBody());
});

// restricted API endpoint
$app->post('/api/restricted', function (Request $request, Response $response) {
	global $restrictedSchema;

	$token = $request->getAttribute('token');

	$server = new StandardServer([
		'schema' => $restrictedSchema,
		'debug' =>Debug::INCLUDE_DEBUG_MESSAGE | Debug::INCLUDE_TRACE,
		'context' => [
			'uuid' => $token->uuid,
			'role' => $token->role,
			'scope' => $token->scope
		]
	]);

	return $server->processPsrRequest($request, $response, $response->getBody());
});

// DEBUG
$app->get('/debug', function (Request $request, Response $response) {
	global $config, $createUserInputType;

	// return var_dump(createUser([
	// 	'email' => 'foo@foobar.com',
	// 	'passwordHash' => '1234'
	// ]));

	return var_dump(updateMethod([
		'uuid' => '2f474349-455c-4f89-b76c-fdfaf163e343',
		'source' => 'Článek o Methoda Foo',
		'tags' => NULL
	]));


	// return var_dump(to_pg_array([]));


	// return var_dump(readResources());

	// $user = [
	// 	'uuid' => 'oj',
	// 	'email' => 'j@j.c',
	// 	'name' => '-> ' . pg_last_error($dbConnection)
	// ];

	// $error = pg_last_error($dbConnection);

	// echo '<pre>' . var_export($config, true) . '</pre>';
	// echo highlight_string("<?php\n" . var_export(pg_last_error($dbConnection), true));


	// return var_dump(password_hash('1234', PASSWORD_BCRYPT, ['cost' => 10]));
});

// serve the app
$app->get('/[{all:.*}]', function (Request $request, Response $response) {
	return $this->view->render($response, 'index.html', [
		'urlRoot' => '',
		'content' => ''
	]);
});

$app->run();
