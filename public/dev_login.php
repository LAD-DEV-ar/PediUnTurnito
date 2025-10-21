<?php
// public/dev_login.php  (¡BORRAR antes de pasar a producción!)
session_start();

$_SESSION['id'] = 1;           // id de usuario ejemplo (ajustar según tu DB)
$_SESSION['login'] = true;
$_SESSION['es_admin'] = 1;
$_SESSION['id_barberia'] = 1;
$_SESSION['nombre'] = 'Elias (dev)';

header('Location: /admin');
exit;