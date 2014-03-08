<?php

$id = $_GET['id'];

// sleep(2);
if ($id == 'test') {
	echo file_get_contents("views/$id.html");
}

?>