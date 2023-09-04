<?php

	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	//$url='https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' . $_REQUEST['location'] . '&radius=' . $_REQUEST['radius'] . '&key=AIzaSyDR1qJo_pIHbkyziqrdGmEnlfdDfusqb7s'; 
    //'https://api.opentripmap.com/0.1/en/places/radius?radius=50000&lon=23.727539&lat=37.983810&apikey=5ae2e3f221c38a28845f05b644bb87f0396849387f0638fd1a11fa8a'
    $url='https://api.opentripmap.com/0.1/en/places/radius?radius=500000000000000&lon=' . $_REQUEST['lon'] . '&lat=' . $_REQUEST['lat'] . '&apikey=5ae2e3f221c38a28845f05b644bb87f0396849387f0638fd1a11fa8a'; 
    
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
	$output['data'] = $decode['features'];
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>