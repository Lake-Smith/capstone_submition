<?php
    $inp = explode("|", $_GET['q']);
   
    $conn = pg_connect("host=fleet-management-database.csg5vowywacr.us-east-2.rds.amazonaws.com port=5432 dbname=postgres user=postgres password=FleetRocks");
    if (!$conn){
        echo "FALSE|Could not connect to server2";
        exit;
    }
    $query = "UPDATE public.carts SET reserved = $inp[1] WHERE cartid = $inp[0] RETURNING *";
    $results = pg_query($conn, $query);
    $data = array();
    while ($row = pg_fetch_row($results)){
        array_push($data, $row);
    }
    if(!$data){
        echo("PostgreSQL request did not return properly");
        exit;
    }
    echo $data;
    pg_close($conn);
    

?>