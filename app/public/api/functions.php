<?php

use \GraphQL\Error\ClientAware;

class SafeException extends \Exception implements ClientAware {
	public function isClientSafe() {
		return true;
	}

	public function getCategory() {
		return 'app';
	}
}

/**
 * Convert under_score type array's keys to camelCase type array's keys
 */
function camelCaseKeys($array, $arrayHolder = array()) {
	$camelCaseArray = !empty($arrayHolder) ? $arrayHolder : array();

	foreach ($array as $key => $val) {
		$newKey = @explode('_', $key);

		// array_walk($newKey, create_function('&$v', '$v = ucwords($v);'));
		array_walk($newKey, function (&$v) {
			$v = ucwords($v);
		});

		$newKey = @implode('', $newKey);
		$newKey{0} = strtolower($newKey{0});

		if (!is_array($val)) {
			$camelCaseArray[$newKey] = $val;
		} else {
			$camelCaseArray[$newKey] = camelCaseKeys($val, $camelCaseArray[$newKey]);
		}
	}

	return $camelCaseArray;
}

/**
 * parse a postgres array (string) into a PHP array
 */
function from_pg_array($arraystring, $reset = true) {
	static $i = 0;

	if ($reset) {
		$i = 0;
	}

	$matches = array();
	$indexer = 1; // by default sql arrays start at 1

	// handle [0,2]= cases
	if (preg_match('/^\[(?P<index_start>\d+):(?P<index_end>\d+)]=/', substr($arraystring, $i), $matches)) {
		$indexer = (int)$matches['index_start'];
		$i = strpos($arraystring, '{');
	}

	if ($arraystring[$i] != '{') {
		return NULL;
	}

	if (is_array($arraystring)) {
		return $arraystring;
	}

	// handles btyea and blob binary streams
	if (is_resource($arraystring)) {
		return fread($arraystring, 4096);
	}

	$i++;
	$work = array();
	$curr = '';
	$length = strlen($arraystring);
	$count = 0;
	$quoted = false;

	while ($i < $length) {
		switch ($arraystring[$i]) {
		case '{':
			$sub = from_pg_array($arraystring, false);

			if(!empty($sub)) {
				$work[$indexer++] = $sub;
			}

			break;
		case '}':
			$i++;

			if (strlen($curr) > 0) {
				$work[$indexer++] = $curr;
			}

			return $work;

			break;
		case '\\':
			$i++;
			$curr .= $arraystring[$i];
			$i++;

			break;
		case '"':
			$quoted = true;
			$openq = $i;

			do {
				$closeq = strpos($arraystring, '"' , $i + 1);
				$escaped = $closeq > $openq &&
					preg_match('/(\\\\+)$/', substr($arraystring, $openq + 1, $closeq - ($openq + 1)), $matches) &&
					(strlen($matches[1])%2);

				if ($escaped) {
					$i = $closeq;
				} else {
					break;
				}
			} while(true);

			if ($closeq <= $openq) {
				throw new Exception('Unexpected condition');
			}

			$curr .= substr($arraystring, $openq + 1, $closeq - ($openq + 1));

			$i = $closeq + 1;

			break;
		case ',':
			if (strlen($curr) > 0){
				if (!$quoted && (strtoupper($curr) == 'NULL')) {
					$curr = null;
				}

				$work[$indexer++] = $curr;
			}

			$curr = '';
			$quoted = false;
			$i++;

			break;
		default:
			$curr .= $arraystring[$i];
			$i++;
		}
	}

	throw new Exception('Unexpected line end');
}

function to_pg_array($set) {
	if (is_null($set) || !is_array($set)) {
		return 'NULL';
	}

	// can be called with a scalar or array
	settype($set, 'array');

	$result = array();

	foreach ($set as $t) {
		// Element is array : recursion
		if (is_array($t)) {
			$result[] = to_pg_array($t);
		} else {
			if (is_null($t)) { // PHP NULL
				$result[] = 'NULL';
			} elseif (is_bool($t) && $t == TRUE) { // PHP TRUE::boolean
				$result[] = 'TRUE';
			} elseif (is_bool($t) && $t == FALSE) { // PHP FALSE::boolean
				$result[] = 'FALSE';
			} else { // Other scalar value
				// Escape
				$t = pg_escape_string($t);

				// quote only non-numeric values
				if (!is_numeric($t)) {
					$t = '"' . $t . '"';
				}

				$result[] = $t;
			}
		}
	}

	return '{' . implode(",", $result) . '}'; // format
}

function readUserWithUuid($uuid) {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM users WHERE uuid = $1', [$uuid]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$user = camelCaseKeys(pg_fetch_assoc($result, 0));
	$user['isVerified'] = $user['isVerified'] === 't' ? true : false;

	return $user;
}

function readUserWithEmail($email) {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM users WHERE email = $1', [$email]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$user = camelCaseKeys(pg_fetch_assoc($result, 0));
	$user['isVerified'] = $user['isVerified'] === 't' ? true : false;

	return $user;
}

function readUsers() {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM users', []);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$result = pg_fetch_all($result);
	$users = [];

	foreach ($result as $key => $value) {
		$users[$key] = camelCaseKeys($result[$key]);
		$users[$key]['isVerified'] = $users[$key]['isVerified'] === 't' ? true : false;
	}

	return $users;
}

function readUsersToBuffer(&$buffer) {
	global $dbConnectionString;

	$uuids = [];

	foreach ($buffer as $key => $value) {
		if ($value === NULL) {
			$uuids[] = $key;
		}
	}

	if (count($uuids) <= 0) {
		return $buffer;
	}

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM users WHERE uuid = ANY ($1)', [
		'{"' . implode('","', $uuids) . '"}'
	]);

	if (!$result) {
		return $buffer;
	}

	if (!pg_fetch_assoc($result)) {
		throw new Exception(pg_last_error($dbConnection));

		return $buffer;
	}

	$result = pg_fetch_all($result);

	for($i = 0; $i < count($result); ++$i) {
		$buffer[$result[$i]['uuid']] = camelCaseKeys($result[$i]);
		$buffer[$result[$i]['uuid']]['isVerified'] = $buffer[$result[$i]['uuid']]['isVerified'] === 't' ? true : false;
	}
}

function createUser($user) {
	global $dbConnectionString;

	$existingUser = readUserWithEmail($user['email']);

	if ($existingUser) {
		return NULL;
	}

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'INSERT INTO users (email, name, password_hash, role, is_verified, affiliation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [
		isset($user['email']) ? $user['email'] : NULL,
		isset($user['name']) ? $user['name'] : NULL,
		isset($user['passwordHash']) ? $user['passwordHash'] : NULL,
		isset($user['role']) ? $user['role'] : 'USER',
		isset($user['isVerified']) ? $user['isVerified'] : 'false',
		isset($user['affiliation']) ? $user['affiliation'] : NULL,
	]);

	if (!$result) {
		return NULL;
	}

	$newUser = camelCaseKeys(pg_fetch_assoc($result, 0));
	$newUser['isVerified'] = $newUser['isVerified'] === 't' ? true : false;

	return $newUser;
}

function updateUser($user) {
	global $dbConnectionString;

	// update user
	$dbConnection = pg_connect($dbConnectionString);
	$queryString = 'UPDATE users SET';
	$queryParams = [isset($user['uuid']) ? $user['uuid'] : NULL];

	if (array_key_exists('password', $user)) {
		$queryParams[] = password_hash($user['password'], PASSWORD_BCRYPT, ['cost' => 10]);
		$queryString .= ' password_hash = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('name', $user)) {
		$queryParams[] = $user['name'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('affiliation', $user)) {
		$queryParams[] = $user['affiliation'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' affiliation = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	$queryString .=  ' WHERE uuid = $1 RETURNING *';

	if (count($queryParams) === 1) {
		return readMethodWithUuid($queryParams[0]);
	}

	$result = pg_query_params($dbConnection, $queryString, $queryParams);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$updatedUser = camelCaseKeys(pg_fetch_assoc($result, 0));
	$updatedUser['isVerified'] = $updatedUser['isVerified'] === 't' ? true : false;

	return $updatedUser;
}

function readMethodWithUuid($uuid) {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM methods WHERE uuid = $1', [$uuid]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$method = camelCaseKeys(pg_fetch_assoc($result, 0));
	$method['tags'] = from_pg_array($method['tags']);
	$method['authors'] = from_pg_array($method['authors']);
	$method['isHidden'] = $method['isHidden'] === 't' ? true : false;

	return $method;
}

function readMethods() {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM methods', []);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$result = pg_fetch_all($result);
	$methods = [];

	foreach ($result as $key => $value) {
		$methods[$key] = camelCaseKeys($result[$key]);
		$methods[$key]['tags'] = from_pg_array($methods[$key]['tags']);
		$methods[$key]['authors'] = from_pg_array($methods[$key]['authors']);
		$methods[$key]['isHidden'] = $methods[$key]['isHidden'] === 't' ? true : false;
	}

	return $methods;
}

function readMethodsToBuffer(&$buffer) {
	global $dbConnectionString;

	$uuids = [];

	foreach ($buffer as $key => $value) {
		if ($value === NULL) {
			$uuids[] = $key;
		}
	}

	if (count($uuids) <= 0) {
		return $buffer;
	}

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM methods WHERE uuid = ANY ($1)', [
		'{"' . implode('","', $uuids) . '"}'
	]);

	if (!$result) {
		return $buffer;
	}

	if (!pg_fetch_assoc($result)) {
		return $buffer;
	}

	$result = pg_fetch_all($result);

	for($i = 0; $i < count($result); ++$i) {
		$buffer[$result[$i]['uuid']] = camelCaseKeys($result[$i]);
		$buffer[$result[$i]['uuid']]['tags'] = from_pg_array($buffer[$result[$i]['uuid']]['tags']);
		$buffer[$result[$i]['uuid']]['authors'] = from_pg_array($buffer[$result[$i]['uuid']]['authors']);
		$buffer[$result[$i]['uuid']]['isHidden'] = $buffer[$result[$i]['uuid']]['isHidden'] === 't' ? true : false;
	}
}

function createMethod($method, $ownerUuid) {
	global $dbConnectionString;

	// create method
	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'INSERT INTO methods (owner_uuid, name, short_name, local_name, local_short_name, description, tags, authors, source) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [
		$ownerUuid,
		isset($method['name']) ? $method['name'] : NULL,
		isset($method['shortName']) ? $method['shortName'] : NULL,
		isset($method['localName']) ? $method['localName'] : NULL,
		isset($method['localShortName']) ? $method['localShortName'] : NULL,
		isset($method['description']) ? $method['description'] : NULL,
		isset($method['tags']) ? to_pg_array($method['tags']) : NULL,
		isset($method['authors']) ? to_pg_array($method['authors']) : NULL,
		isset($method['source']) ? $method['source'] : NULL
	]);

	if (!$result) {
		return NULL;
	}

	$newMethod = camelCaseKeys(pg_fetch_assoc($result, 0));
	$newMethod['tags'] = from_pg_array($newMethod['tags']);
	$newMethod['authors'] = from_pg_array($newMethod['authors']);
	$newMethod['isHidden'] = $newMethod['isHidden'] === 't' ? true : false;

	return $newMethod;
}

function updateMethod($method) {
	global $dbConnectionString;

	// update method
	$dbConnection = pg_connect($dbConnectionString);
	$queryString = 'UPDATE methods SET';
	$queryParams = [isset($method['uuid']) ? $method['uuid'] : NULL];

	if (array_key_exists('name', $method)) {
		$queryParams[] = $method['name'];
		$queryString .= ' name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('shortName', $method)) {
		$queryParams[] = $method['shortName'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' short_name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('localName', $method)) {
		$queryParams[] = $method['localName'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' local_name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('localShortName', $method)) {
		$queryParams[] = $method['localShortName'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' local_short_name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('description', $method)) {
		$queryParams[] = $method['description'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' description = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('tags', $method)) {
		$queryParams[] = $method['tags'] === NULL ? NULL : to_pg_array($method['tags']);
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' tags = NULLIF($' . count($queryParams) .  ', \'{}\')::character varying[]';
	}

	if (array_key_exists('authors', $method)) {
		$queryParams[] = $method['authors'] === NULL ? NULL : to_pg_array($method['authors']);
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' authors = NULLIF($' . count($queryParams) .  ', \'{}\')::character varying[]';
	}

	if (array_key_exists('source', $method)) {
		$queryParams[] = $method['source'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' source = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	$queryString .=  ' WHERE uuid = $1 RETURNING *';

	if (count($queryParams) === 1) {
		return readMethodWithUuid($queryParams[0]);
	}

	$result = pg_query_params($dbConnection, $queryString, $queryParams);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$updatedMethod = camelCaseKeys(pg_fetch_assoc($result, 0));
	$updatedMethod['tags'] = from_pg_array($updatedMethod['tags']);
	$updatedMethod['authors'] = from_pg_array($updatedMethod['authors']);
	$updatedMethod['isHidden'] = $updatedMethod['isHidden'] === 't' ? true : false;

	return $updatedMethod;
}

function deleteMethod($method) {
	global $dbConnectionString;

	// create method
	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'DELETE FROM methods WHERE uuid = $1 RETURNING *', [
		isset($method['uuid']) ? $method['uuid'] : NULL
	]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$deletedMethod = camelCaseKeys(pg_fetch_assoc($result, 0));
	$deletedMethod['tags'] = from_pg_array($deletedMethod['tags']);
	$deletedMethod['authors'] = from_pg_array($deletedMethod['authors']);

	return $deletedMethod;
}

function readResourceWithUuid($uuid) {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM resources WHERE uuid = $1', [$uuid]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$resource = camelCaseKeys(pg_fetch_assoc($result, 0));
	$resource['isHidden'] = $resource['isHidden'] === 't' ? true : false;

	return $resource;
}

function readResources() {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM resources', []);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$result = pg_fetch_all($result);
	$resources = [];

	foreach ($result as $key => $value) {
		$resources[$key] = camelCaseKeys($result[$key]);
		$resources[$key]['isHidden'] = $resources[$key]['isHidden'] === 't' ? true : false;
	}

	return $resources;
}

function readResourcesToBuffer(&$buffer) {
	global $dbConnectionString;

	$uuids = [];

	foreach ($buffer as $key => $value) {
		if ($value === NULL) {
			$uuids[] = $key;
		}
	}

	if (count($uuids) <= 0) {
		return $buffer;
	}

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM resources WHERE uuid = ANY ($1)', [
		'{"' . implode('","', $uuids) . '"}'
	]);

	if (!$result) {
		return $buffer;
	}

	if (!pg_fetch_assoc($result)) {
		return $buffer;
	}

	$result = pg_fetch_all($result);

	for($i = 0; $i < count($result); ++$i) {
		$buffer[$result[$i]['uuid']] = camelCaseKeys($result[$i]);
		$buffer[$result[$i]['uuid']]['isHidden'] = $buffer[$result[$i]['uuid']]['isHidden'] === 't' ? true : false;
	}
}

function readResourcesToBufferWithMethodUuids(&$buffer, &$resourceMethodUuids) {
	global $dbConnectionString;

	if (count($resourceMethodUuids) <= 0) {
		return $buffer;
	}

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM resources WHERE method_uuid = ANY ($1)', [
		'{"' . implode('","', $resourceMethodUuids) . '"}'
	]);

	if (!$result) {
		throw new Exception(pg_last_error($dbConnection));

		return $buffer;
	}

	if (!pg_fetch_assoc($result)) {
		return $buffer;
	}

	$result = pg_fetch_all($result);

	for($i = 0; $i < count($result); ++$i) {
		$buffer[$result[$i]['uuid']] = camelCaseKeys($result[$i]);
		$buffer[$result[$i]['uuid']]['isHidden'] = $buffer[$result[$i]['uuid']]['isHidden'] === 't' ? true : false;
	}

	$resourceMethodUuids = [];
}

function readResourcesWithMethodUuid($methodUuid) {
	global $dbConnectionString;

	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'SELECT * FROM resources WHERE method_uuid = $1', [$methodUuid]);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$result = pg_fetch_all($result);
	$resources = [];

	foreach ($result as $key => $value) {
		$resources[$key] = camelCaseKeys($result[$key]);
		$resources[$key]['isHidden'] = $resources[$key]['isHidden'] === 't' ? true : false;
	}

	return $resources;
}

function createResource($resourceInput, $ownerUuid) {
	global $dbConnectionString;

	// create resource
	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'INSERT INTO resources (owner_uuid, method_uuid, type, name, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', [
		$ownerUuid,
		isset($resourceInput['methodUuid']) ? $resourceInput['methodUuid'] : NULL,
		isset($resourceInput['type']) ? $resourceInput['type'] : NULL,
		isset($resourceInput['name']) ? $resourceInput['name'] : NULL,
		isset($resourceInput['description']) ? $resourceInput['description'] : NULL
	]);

	if (!$result) {
		return NULL;
	}

	$newResource = camelCaseKeys(pg_fetch_assoc($result, 0));
	$newResource['isHidden'] = $newResource['isHidden'] === 't' ? true : false;

	return $newResource;
}

function updateResource($resourceInput) {
	global $dbConnectionString;

	// update resource
	$dbConnection = pg_connect($dbConnectionString);
	$queryString = 'UPDATE resources SET';
	$queryParams = [isset($resourceInput['uuid']) ? $resourceInput['uuid'] : NULL];

	if (array_key_exists('methodUuid', $resourceInput)) {
		$queryParams[] = $resourceInput['methodUuid'];
		$queryString .= ' method_uuid = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('type', $resourceInput)) {
		$queryParams[] = $resourceInput['type'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' type = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('name', $resourceInput)) {
		$queryParams[] = $resourceInput['name'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' name = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	if (array_key_exists('description', $resourceInput)) {
		$queryParams[] = $resourceInput['description'];
		$queryString .= (count($queryParams) > 2 ? ', ' : '') . ' description = NULLIF($' . count($queryParams) .  ', \'\')';
	}

	$queryString .=  ' WHERE uuid = $1 RETURNING *';

	if (count($queryParams) === 1) {
		return readResourceWithUuid($queryParams[0]);
	}

	$result = pg_query_params($dbConnection, $queryString, $queryParams);

	if (!$result) {
		return NULL;
	}

	if (!pg_fetch_assoc($result)) {
		return NULL;
	}

	$updatedResource = camelCaseKeys(pg_fetch_assoc($result, 0));
	$updatedResource['isHidden'] = $updatedResource['isHidden'] === 't' ? true : false;

	return $updatedResource;
}

function deleteResource($resourceInput) {
	global $dbConnectionString;

	// create resource
	$dbConnection = pg_connect($dbConnectionString);
	$result = pg_query_params($dbConnection, 'DELETE FROM resources WHERE uuid = $1 RETURNING *', [
		isset($resourceInput['uuid']) ? $resourceInput['uuid'] : NULL
	]);

	if (!$result) {
		return NULL;
	}

	$deletedResource = camelCaseKeys(pg_fetch_assoc($result, 0));
	$deletedResource['isHidden'] = $deletedResource['isHidden'] === 't' ? true : false;

	return $deletedResource;
}
