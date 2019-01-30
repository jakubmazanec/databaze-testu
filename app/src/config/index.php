<?php

function loadConfig() {
	$privateConfig = json_decode(file_get_contents('../config/private.json'), true);
	$commonConfig = json_decode(file_get_contents('../config/common.json'), true);
	$serverConfig = json_decode(file_get_contents('../config/server.json'), true);

	return array_merge_recursive($privateConfig, $commonConfig, $serverConfig);
}

$config = loadConfig();

$dbConnectionString = "host=localhost port=5432 dbname=databaze-testu user={$config['db']['user']} password={$config['db']['password']}";
