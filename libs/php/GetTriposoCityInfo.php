<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//$url='https://www.triposo.com/api/20221011/location.json?part_of=' . $_REQUEST['part_of'] . '&tag_labels=city&count=10&order_by=-score&fields=name,id,snippet,parent_id,score,type,coordinates&token=8jezxmeoyg8t84qghjg7jt6q6yba1qep&account=6CXD6FK3'; 
	$url='https://www.triposo.com/api/20220104/location.json?countrycode=' . $_REQUEST['countrycode'] . '&tag_labels=city&count=50&order_by=-score&fields=name,id,snippet,parent_id,score,type,coordinates&token=8jezxmeoyg8t84qghjg7jt6q6yba1qep&account=6CXD6FK3'; 


	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['results'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>
