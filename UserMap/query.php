<?php

    $conn = pg_connect("host=fleet-management-database.csg5vowywacr.us-east-2.rds.amazonaws.com port=5432 dbname=postgres user=postgres password=FleetRocks");
    if (!$conn){
        echo "FALSE|Could not connect to server2";
        exit;
    }
    $cartQuery = "SELECT cartid, battery_voltage, battery_current, battery_state_of_charge, cart_longitude, cart_latitude, altitude, speed FROM public.battery_measurements WHERE timestamp = ( SELECT MAX(timestamp) FROM public.battery_measurements ) ORDER BY cartid";
    $cartResults = pg_query($conn, $cartQuery);
    $reservedQuery = "SELECT reserved FROM public.carts";
    $reservedResults = pg_query($conn, $reservedQuery);
    $data = "";
    $reserved = array();
    //make an array of the true or false valuse
    while ($row = pg_fetch_row($reservedResults)){
        foreach ($row as $value) {
            array_push($reserved, $value);
            //echo $value."<br>";
        }   
    }
    $counter = 0;
    //iderate through cartResults to create string, keep counter to add the t/f data from reserved at the right place
    while ($row = pg_fetch_row($cartResults) ){
        foreach ($row as $value) {
            $data .= $value.":";
            //echo $value."<br>";
        }   
        $data .= $reserved[$counter]."|";
        $counter += 1;
    }
    echo json_encode($data);

    //$temp = pg_escape_string($conn, $data);
    //$ret = implode(':', $data).'|'.implode(':', $reserved);

    pg_close($conn);
        
    
?>