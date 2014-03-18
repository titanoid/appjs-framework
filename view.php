<?php

$id = $_GET['id'];

// sleep(2);
echo file_get_contents("views/$id.html");

?>