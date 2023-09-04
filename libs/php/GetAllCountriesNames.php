<?php

    $str = file_get_contents('../datasources/countryBorders.geo.json');
    $arr = json_decode($str);

    $countryNamesCodesArray = array();
    class CodeAndName {
        public $iso_a2;
        public $name;
    }
    foreach ($arr->features as $item) {
        if ($item->properties->iso_a2 && $item->properties->name) {
            $country = new CodeAndName();
            $country->iso_a2 = $item->properties->iso_a2;
            $country->name = $item->properties->name;
            $countryNamesCodesArray[] = $country;          
        }       
    }

    echo json_encode($countryNamesCodesArray);
    
?>

