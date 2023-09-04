<?php
    if(isset($_POST['iso_a2'])){
        $iso_a2 = $_POST['iso_a2'];

        $str = file_get_contents('../datasources/countryBorders.geo.json');
        $arr = json_decode($str);

        foreach ($arr->features as $item) {
            if ($item->properties->iso_a2 == $iso_a2) {
                $geometry =  $item->geometry;
                echo json_encode($geometry);
            }
        }
    }  

?>