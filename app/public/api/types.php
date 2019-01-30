<?php

use \GraphQL\Error\Error;
use \GraphQL\Type\Definition\ObjectType;
use \GraphQL\Type\Definition\InputObjectType;
use \GraphQL\Type\Definition\Type;
use \GraphQL\Type\Definition\CustomScalarType;
use \GraphQL\Type\Definition\EnumType;

$userBuffer = [];
$methodBuffer = [];
$resourceBuffer = [];
$resourceMethodUuids = [];

$emailType = new CustomScalarType([
	'name' => 'Email',

	'serialize' => function ($value) {
		// Assuming internal representation of email is always correct:
		return $value;
	},

	'parseValue' => function ($value) {
		if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
			throw new Error("Cannot represent following value as email: " . Utils::printSafeJson($value));
		}

		return $value;
	},

	'parseLiteral' => function ($valueNode) {
		// Note: throwing GraphQL\Error\Error vs \UnexpectedValueException to benefit from GraphQL
		// error location in query:
		if ($valueNode->kind != 'StringValue') {
			throw new Error('Query error: Can only parse strings got: ' . $valueNode->kind, [$valueNode]);
		}

		if (!filter_var($valueNode->value, FILTER_VALIDATE_EMAIL)) {
			throw new Error("Not a valid email", [$valueNode]);
		}

		return $valueNode->value;
	}
]);

$userRoleType = new EnumType([
	'name' => 'UserRole',
	'description' => 'One of the films in the Star Wars Trilogy',
	'values' => [
		'GUEST' => [
			'value' => 'GUEST',
			'description' => 'Guest.'
		],
		'USER' => [
			'value' => 'USER',
			'description' => 'User.'
		],
		'ADMIN' => [
			'value' => 'ADMIN',
			'description' => 'Admin.'
		],
	]
]);

$userType = new ObjectType([
	'name' => 'User',
	'description' => 'User.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		],
		'email' => [
			'type' => Type::nonNull($emailType),
			'description' => 'Email.'
		],
		'role' => [
			'type' => Type::nonNull($userRoleType),
			'description' => 'Role.'
		],
		'name' => [
			'type' => Type::string(),
			'description' => 'Name.'
		],
		'affiliation' => [
			'type' => Type::string(),
			'description' => 'Affiliation.'
		]
	]
]);

$createUserInputType = new InputObjectType([
	'name' => 'CreateUserInput',
	'description' => 'CreateUserInput.',
	'fields' => [
		'email' => [
			'type' => Type::nonNull($emailType),
			'description' => 'Email.'
		],
		'password' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Password.'
		]
	]
]);

$createUserOutputType = new ObjectType([
	'name' => 'CreateUserOutput',
	'description' => 'CreateUserOutput.',
	'fields' => [
		'user' => [
			'type' => $userType,
			'description' => 'New user.'
		]
	]
]);

$updateUserInputType = new InputObjectType([
	'name' => 'UpdateUserInput',
	'description' => 'UpdateUserInput.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		],
		// 'email' => [
		// 	'type' => $emailType,
		// 	'description' => 'Email.'
		// ],
		'password' =>  [
			'type' => Type::string(),
			'description' => 'Password.'
		],
		'name' => [
			'type' => Type::string(),
			'description' => 'Name.'
		],
		'affiliation' => [
			'type' => Type::string(),
			'description' => 'Affiliation.'
		]
	]
]);

$updateUserOutputType = new ObjectType([
	'name' => 'UpdateUserOutput',
	'description' => 'UpdateUserOutput.',
	'fields' => [
		'user' => [
			'type' => $userType,
			'description' => 'Updated user.'
		]
	]
]);

$methodType = new ObjectType([
	'name' => 'Method',
	'description' => 'Method.',
	'fields' => function () use (&$resourceType, &$userType) {
		return [
			'uuid' => [
				'type' => Type::nonNull(Type::string()),
				'description' => 'UUID.'
			],
			'owner' => [
				'type' => Type::nonNull($userType),
				'description' => 'Owner UUID.',
				'resolve' => function ($value, $args, $context) {
					global $userBuffer;

					$userBuffer[$value['ownerUuid']] = NULL;

					return new \GraphQL\Deferred(function () use ($value) {
						global $userBuffer;

						readUsersToBuffer($userBuffer);

						return $userBuffer[$value['ownerUuid']];
					});
				}
			],
			'name' => [
				'type' => Type::nonNull(Type::string()),
				'description' => 'Name.'
			],
			'shortName' => [
				'type' => Type::string(),
				'description' => 'Short name.'
			],
			'localName' => [
				'type' => Type::string(),
				'description' => 'Local name.'
			],
			'localShortName' => [
				'type' => Type::string(),
				'description' => 'Local short name.'
			],
			'description' => [
				'type' => Type::string(),
				'description' => 'Description'
			],
			'tags' => [
				'type' => Type::listOf(Type::nonNull(Type::string())),
				'description' => 'Tags.'
			],
			'authors' => [
				'type' => Type::listOf(Type::nonNull(Type::string())),
				'description' => 'Authors.'
			],
			'source' => [
				'type' => Type::string(),
				'description' => 'Source.'
			],
			'resources' => [
				'type' => Type::nonNull(Type::listOf($resourceType)),
				'description' => 'Resources.',
				'resolve' => function ($value, $args, $context) {
					global $resourceMethodUuids;

					$resourceMethodUuids[] = $value['uuid'];

					return new \GraphQL\Deferred(function () use ($value) {
						global $resourceBuffer, $resourceMethodUuids;

						readResourcesToBufferWithMethodUuids($resourceBuffer, $resourceMethodUuids);

						return array_filter($resourceBuffer, function ($resource) use ($value) {
							return $resource['methodUuid'] === $value['uuid'];
						});
					});
				}
			]
		];
	}
]);

$createMethodInputType = new InputObjectType([
	'name' => 'CreateMethodInput',
	'description' => 'CreateMethodInput.',
	'fields' => [
		'name' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Name.'
		],
		'shortName' => [
			'type' => Type::string(),
			'description' => 'Short name.'
		],
		'localName' => [
			'type' => Type::string(),
			'description' => 'Local name.'
		],
		'localShortName' => [
			'type' => Type::string(),
			'description' => 'Local short name.'
		],
		'description' => [
			'type' => Type::string(),
			'description' => 'Description'
		],
		'tags' => [
			'type' => Type::listOf(Type::nonNull(Type::string())),
			'description' => 'Tags.'
		],
		'authors' => [
			'type' => Type::listOf(Type::nonNull(Type::string())),
			'description' => 'Authors.'
		],
		'source' => [
			'type' => Type::string(),
			'description' => 'Source.'
		]
	]
]);

$createMethodOutputType = new ObjectType([
	'name' => 'CreateMethodOutput',
	'description' => 'CreateMethodOutput.',
	'fields' => [
		'method' => [
			'type' => $methodType,
			'description' => 'New method.'
		]
	]
]);

$updateMethodInputType = new InputObjectType([
	'name' => 'UpdateMethodInput',
	'description' => 'UpdateMethodInput.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		],
		'name' => [
			'type' => Type::string(),
			'description' => 'Name.'
		],
		'shortName' => [
			'type' => Type::string(),
			'description' => 'Short name.'
		],
		'localName' => [
			'type' => Type::string(),
			'description' => 'Local name.'
		],
		'localShortName' => [
			'type' => Type::string(),
			'description' => 'Local short name.'
		],
		'description' => [
			'type' => Type::string(),
			'description' => 'Description'
		],
		'tags' => [
			'type' => Type::listOf(Type::nonNull(Type::string())),
			'description' => 'Tags.'
		],
		'authors' => [
			'type' => Type::listOf(Type::nonNull(Type::string())),
			'description' => 'Authors.'
		],
		'source' => [
			'type' => Type::string(),
			'description' => 'Source.'
		]
	]
]);

$updateMethodOutputType = new ObjectType([
	'name' => 'UpdateMethodOutput',
	'description' => 'UpdateMethodOutput.',
	'fields' => [
		'method' => [
			'type' => $methodType,
			'description' => 'Updated method.'
		]
	]
]);

$deleteMethodInputType = new InputObjectType([
	'name' => 'DeleteMethodInput',
	'description' => 'DeleteMethodInput.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		]
	]
]);

$deleteMethodOutputType = new ObjectType([
	'name' => 'DeleteMethodOutput',
	'description' => 'DeleteMethodOutput.',
	'fields' => [
		'method' => [
			'type' => $methodType,
			'description' => 'Deleted method.'
		]
	]
]);

$resourceType = new ObjectType([
	'name' => 'Resource',
	'description' => 'Resource.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		],
		'owner' => [
			'type' => Type::nonNull($userType),
			'description' => 'Owner UUID.',
			'resolve' => function ($value, $args, $context) {
				global $userBuffer;

				$userBuffer[$value['ownerUuid']] = NULL;

				return new \GraphQL\Deferred(function () use ($value) {
					global $userBuffer;

					readUsersToBuffer($userBuffer);

					return $userBuffer[$value['ownerUuid']];
				});
			}
		],
		'method' => [
			// 'type' => Type::nonNull($methodType),
			'type' => $methodType,
			'description' => 'Method UUID.',
			'resolve' => function ($value, $args, $context) {
				global $methodBuffer;

				$methodBuffer[$value['methodUuid']] = NULL;

				return new \GraphQL\Deferred(function () use ($value) {
					global $methodBuffer;

					readMethodsToBuffer($methodBuffer);

					return $methodBuffer[$value['methodUuid']];
				});
			}
		],
		'type' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Name.'
		],
		'name' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Name.'
		],
		'description' => [
			'type' => Type::string(),
			'description' => 'Description'
		]
	]
]);

$createResourceInputType = new InputObjectType([
	'name' => 'CreateResourceInput',
	'description' => 'CreateResourceInput.',
	'fields' => [
		'methodUuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Method UUID.'
		],
		'type' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Name.'
		],
		'name' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'Name.'
		],
		'description' => [
			'type' => Type::string(),
			'description' => 'Description'
		]
	]
]);

$createResourceOutputType = new ObjectType([
	'name' => 'CreateResourceOutput',
	'description' => 'CreateResourceOutput.',
	'fields' => [
		'resource' => [
			'type' => $resourceType,
			'description' => 'New resource.'
		]
	]
]);

$updateResourceInputType = new InputObjectType([
	'name' => 'UpdateResourceInput',
	'description' => 'UpdateResourceInput.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		],
		'methodUuid' => [
			'type' => Type::string(),
			'description' => 'Method UUID.'
		],
		'type' => [
			'type' => Type::string(),
			'description' => 'Name.'
		],
		'name' => [
			'type' => Type::string(),
			'description' => 'Name.'
		],
		'description' => [
			'type' => Type::string(),
			'description' => 'Description'
		]
	]
]);

$updateResourceOutputType = new ObjectType([
	'name' => 'UpdateResourceOutput',
	'description' => 'UpdateResourceOutput.',
	'fields' => [
		'resource' => [
			'type' => $resourceType,
			'description' => 'Updated resource.'
		]
	]
]);

$deleteResourceInputType = new InputObjectType([
	'name' => 'DeleteResourceInput',
	'description' => 'DeleteResourceInput.',
	'fields' => [
		'uuid' => [
			'type' => Type::nonNull(Type::string()),
			'description' => 'UUID.'
		]
	]
]);

$deleteResourceOutputType = new ObjectType([
	'name' => 'DeleteResourceOutput',
	'description' => 'DeleteResourceOutput.',
	'fields' => [
		'resource' => [
			'type' => $resourceType,
			'description' => 'Deleted resource.'
		]
	]
]);

$verifyEmailOutput = new ObjectType([
	'name' => 'VerifyEmailOutput',
	'description' => 'VerifyEmailOutput.',
	'fields' => [
		'isVerified' => [
			'type' => Type::nonNull(Type::boolean()),
			'description' => 'Is verifed?'
		]
	]
]);

$resetPasswordOutput = new ObjectType([
	'name' => 'ResetPasswordOutput',
	'description' => 'ResetPasswordOutput.',
	'fields' => [
		'isReset' => [
			'type' => Type::nonNull(Type::boolean()),
			'description' => 'Is reset?'
		]
	]
]);
