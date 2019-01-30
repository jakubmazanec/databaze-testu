<?php

use \GraphQL\Type\Definition\ObjectType;
use \GraphQL\Type\Definition\Type;
use \GraphQL\Type\Schema;
use \Firebase\JWT\JWT;
use \GraphQL\Error\Error;
use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\Exception;

require './api/types.php';


$publicSchema = new Schema([
	'query' => new ObjectType([
		'name' => 'Query',
		'fields' => [
			'version' => [
				'type' => Type::string(),
				'resolve' => function () {
					return '0.1.0';
				}
			],

			'token' => [
				'type' => Type::string(),'args' => [
					'email' => ['type' => Type::nonNull($emailType)],
					'password' => ['type' => Type::nonNull(Type::string())],
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					// read user
					$user = readUserWithEmail($args['email']);

					if (!$user) {
						// timing attack protection with dummy password verification
						password_verify('password', '$2y$10$CBXYIRJt0csT6DHUrw26NevjxSKZDe/T5ILOWhm3cdg4BJ3nYbZGW');

						throw new SafeException('Invalid email or password!');
					}

					// is email verified?
					if (!$user['isVerified']) {
						throw new SafeException('Unverified account.');
					}

					// verify password
					$verification = password_verify($args['password'], $user['passwordHash']);

					if (!$verification) {
						throw new SafeException('Invalid email or password!');
					}

					// create token
					$now = new DateTime();
					// $future = new DateTime('now +1 hour');

					$secret = $config['jwt']['secret'];

					$payload = [
						'uuid' => $user['uuid'],
						'role' => $user['role'],
						'scope' => 'ACCESS',
						'iat' => $now->getTimeStamp()
						// 'eat' => $future->getTimeStamp()
					];

					$token = JWT::encode($payload, $secret, 'HS256');

					return $token;
				}
			],

			'users' => [
				'type' => Type::nonNull(Type::listOf($userType)),
				'resolve' => function ($root, $args, $context) {
					return readMethods();
				}
			],

			'methods' => [
				'type' => Type::nonNull(Type::listOf($methodType)),
				'resolve' => function ($root, $args, $context) {
					return readMethods();
				}
			],

			'resources' => [
				'type' => Type::nonNull(Type::listOf($resourceType)),
				'resolve' => function ($root, $args, $context) {
					return readResources();
				}
			]
		],
	]),

	'mutation' => new ObjectType([
		'name' => 'Mutation',
		'fields' => [
			'createUser' => [
				'type' => $createUserOutputType,
				'args' => [
					'user' => ['type' => $createUserInputType]
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					// create user
					$user = createUser([
						'email' => $args['user']['email'],
						'passwordHash' => password_hash($args['user']['password'], PASSWORD_BCRYPT, ['cost' => 10])
					]);

					if (!$user) {
						return [
							'user' => NULL
						];
					}

					// create token for email verification
					$now = new DateTime();
					$future = new DateTime('now +1 hour');

					$payload = [
						'uuid' => $user['uuid'],
						'role' => $user['role'],
						'scope' => 'EMAIL_VERIFICATION',
						'iat' => $now->getTimeStamp(),
						'eat' => $future->getTimeStamp()
					];

					$token = JWT::encode($payload, $config['jwt']['secret'], 'HS256');

					// send email with the tokne
					$mailer = new PHPMailer(true);

					$mailer->SMTPDebug = 0;
					$mailer->isSMTP();
					$mailer->SMTPAuth = true;
					$mailer->Host = $config['smtp']['host'];
					$mailer->Username = $config['smtp']['username'];
					$mailer->Password = $config['smtp']['password'];
					$mailer->SMTPSecure = 'tls';
					$mailer->Port = 587;
					$mailer->From = $mailer->Username;
					$mailer->addAddress($user['email']);
					$mailer->isHTML(true);
					$mailer->CharSet = 'UTF-8';
					$mailer->Subject = 'Ověření emailové adresy';
					$mailer->Body = '<a href="http://localhost:3001/verify-email/' . $token . '">http://localhost:3001/verify-email/' . $token . '</a>';
					$mailer->AltBody = 'http://localhost:3001/verify-email/' . $token;

					$mailer->send();

					return [
						'user' => $user
					];
				}
			],

			'verifyEmail' => [
				'type' => Type::boolean(),
				'args' => [
					'email' => ['type' => Type::nonNull($emailType)]
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					// read user
					$user = readUserWithEmail($args['email']);

					// is email verified?
					if ($user['isVerified']) {
						throw new SafeException('Account already verified.');
					}

					// create token for email verification
					$now = new DateTime();
					$future = new DateTime('now +1 hour');

					$secret = $config['jwt']['secret'];

					$payload = [
						'uuid' => $user['uuid'],
						'role' => $user['role'],
						'scope' => 'EMAIL_VERIFICATION',
						'iat' => $now->getTimeStamp(),
						'eat' => $future->getTimeStamp()
					];

					$token = JWT::encode($payload, $secret, 'HS256');

					// send email with the tokne
					$mailer = new PHPMailer(true);

					$mailer->SMTPDebug = 2;
					$mailer->isSMTP();
					$mailer->SMTPAuth = true;
					$mailer->Host = $config['smtp']['host'];
					$mailer->Username = $config['smtp']['username'];
					$mailer->Password = $config['smtp']['password'];
					$mailer->SMTPSecure = 'tls';
					$mailer->Port = 587;
					$mailer->From = $mailer->Username;
					$mailer->addAddress($user['email']);
					$mailer->isHTML(true);
					$mailer->CharSet = 'UTF-8';
					$mailer->Subject = 'Ověření emailové adresy';
					$mailer->Body = '<a href="http://localhost:3001/verify-email/' . $token . '">http://localhost:3001/verify-email/' . $token . '</a>';
					$mailer->AltBody = 'http://localhost:3001/verify-email/' . $token;

					$mailer->send();

					return true;
				}
			],

			'resetPassword' => [
				'type' => Type::boolean(),
				'args' => [
					'email' => ['type' => Type::nonNull($emailType)]
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					// read user
					$user = readUserWithEmail($args['email']);

					// create token for password reset
					$now = new DateTime();
					$future = new DateTime('now +1 hour');

					$secret = $config['jwt']['secret'];

					$payload = [
						'uuid' => $user['uuid'],
						'role' => $user['role'],
						'scope' => 'PASSWORD_RESET',
						'iat' => $now->getTimeStamp(),
						'eat' => $future->getTimeStamp()
					];

					$token = JWT::encode($payload, $secret, 'HS256');

					// send email with the tokne
					$mailer = new PHPMailer(true);

					$mailer->SMTPDebug = 0;
					$mailer->isSMTP();
					$mailer->SMTPAuth = true;
					$mailer->Host = $config['smtp']['host'];
					$mailer->Username = $config['smtp']['username'];
					$mailer->Password = $config['smtp']['password'];
					$mailer->SMTPSecure = 'tls';
					$mailer->Port = 587;
					$mailer->From = $mailer->Username;
					$mailer->addAddress($user['email']);
					$mailer->isHTML(true);
					$mailer->CharSet = 'UTF-8';
					$mailer->Subject = 'Ověření emailové adresy';
					$mailer->Body = '<a href="http://localhost:3001/reset-password/' . $token . '">http://localhost:3001/reset-password/' . $token . '</a>';
					$mailer->AltBody = 'http://localhost:3001/reset-password/' . $token;

					$mailer->send();

					return true;
				}
			]
		],
	]),
]);

$restrictedSchema = new Schema([
	'query' => new ObjectType([
		'name' => 'Query',
		'fields' => [
			'version' => [
				'type' => Type::string(),
				'resolve' => function ($root, $args, $context) {
					return '0.1.0';
				}
			],

			'users' => [
				'type' => Type::nonNull(Type::listOf($userType)),
				'resolve' => function ($root, $args, $context) {
					return readUsers();
				}
			]
		]
	]),

	'mutation' => new ObjectType([
		'name' => 'Mutation',
		'fields' => [
			'verifyEmail' => [
				'type' => $verifyEmailOutput,
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					if ($context['scope'] !== 'EMAIL_VERIFICATION') {
						throw new SafeException('Invalid token scope.');
					}

					// update user
					$dbConnection = pg_connect($dbConnectionString);
					$result = pg_query_params($dbConnection, 'UPDATE users SET is_verified = true WHERE uuid = $1', [$context['uuid']]);

					if (!$result) {
						throw new SafeException(pg_last_error($dbConnection));
					}

					return [
						'isVerified' => true
					];
				}
			],

			'resetPassword' => [
				'type' => $resetPasswordOutput,
				'args' => [
					'password' => ['type' => Type::nonNull(Type::string())]
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					if ($context['scope'] !== 'PASSWORD_RESET') {
						throw new SafeException('Invalid token scope.');
					}

					// update user
					$dbConnection = pg_connect($dbConnectionString);
					$result = pg_query_params($dbConnection, 'UPDATE users SET password_hash = $2 WHERE uuid = $1', [
						$context['uuid'],
						password_hash($args['password'], PASSWORD_BCRYPT, ['cost' => 10])
					]);

					if (!$result) {
						throw new SafeException(pg_last_error($dbConnection));
					}

					return [
						'isReset' => true
					];
				}
			],

			'updateUser' => [
				'type' => $updateUserOutputType,
				'args' => [
					'user' => ['type' => Type::nonNull($updateUserInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['uuid'] !== $args['user']['uuid']) {
						throw new SafeException('Access denied.');
					}

					// update user
					$user = updateUser($args['user']);

					return [
						'user' => $user
					];
				}
			],

			'createMethod' => [
				'type' => $createMethodOutputType,
				'args' => [
					'method' => ['type' => Type::nonNull($createMethodInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'USER' && $context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// create method
					$method = createMethod($args['method'], $context['uuid']);

					if (!$method) {
						return [
							'method' => NULL
						];
					}

					return [
						'method' => $method
					];
				}
			],

			'updateMethod' => [
				'type' => $updateMethodOutputType,
				'args' => [
					'method' => ['type' => Type::nonNull($updateMethodInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'USER' && $context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// update method
					$method = updateMethod($args['method']);

					return [
						'method' => $method
					];
				}
			],

			'deleteMethod' => [
				'type' => $deleteMethodOutputType,
				'args' => [
					'method' => ['type' => Type::nonNull($deleteMethodInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// delete method
					$method = deleteMethod($args['method']);

					return [
						'method' => $method
					];
				}
			],

			'createResource' => [
				'type' => $createResourceOutputType,
				'args' => [
					'resource' => ['type' => Type::nonNull($createResourceInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					global $config, $dbConnectionString;

					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'USER' && $context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// create resource
					$resource = createResource($args['resource'], $context['uuid']);

					if (!$resource) {
						return [
							'resource' => NULL
						];
					}

					return [
						'resource' => $resource
					];
				}
			],

			'updateResource' => [
				'type' => $updateResourceOutputType,
				'args' => [
					'resource' => ['type' => Type::nonNull($updateResourceInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'USER' && $context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// update resource
					$resource = updateResource($args['resource']);

					return [
						'resource' => $resource
					];
				}
			],

			'deleteResource' => [
				'type' => $deleteResourceOutputType,
				'args' => [
					'resource' => ['type' => Type::nonNull($deleteResourceInputType)]
				],
				'resolve' => function ($root, $args, $context) {
					if ($context['scope'] !== 'ACCESS') {
						throw new SafeException('Invalid token scope.');
					}

					if ($context['role'] !== 'ADMIN') {
						throw new SafeException('Access denied.');
					}

					// delete resource
					$resource = deleteResource($args['resource']);

					return [
						'resource' => $resource
					];
				}
			]
		],
	])
]);
