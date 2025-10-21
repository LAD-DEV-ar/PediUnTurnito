<?php
namespace Controllers;

use Model\Usuario;
use MVC\Router;

class AuthController {

    public static function login(Router $router){

        if ($_SERVER['REQUEST_METHOD'] === 'POST'){
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            $temp = new Usuario(['email' => $email, 'password' => $password]);
            $temp->validarLogin();
            $errs = Usuario::getAlertas();

            if (!empty($errs)){
                $flat = [];
                foreach ($errs as $type => $msgs) {
                    foreach ($msgs as $m) $flat[] = ['type' => $type, 'message' => $m];
                }
                $router->render('auth/login', ['alerts' => $flat, 'email' => $email]);
                return;
            }

            $usuario = Usuario::findBy('email', $email);

            // Verificar existencia y password
            if (!$usuario || !$usuario->comprobarPassword($password)) {
                \Model\Usuario::addAlert('error', 'Credenciales incorrectas', true);
                header('Location: /');
                exit;
            }

            session_regenerate_id(true);

            $_SESSION['id'] = (int) $usuario->id;
            $_SESSION['login'] = true;
            $_SESSION['nombre'] = $usuario->nombre;
            $_SESSION['id_barberia'] = (int) $usuario->id_barberia ?? null;
            $_SESSION['es_barbero'] = (int) $usuario->es_barbero ?? null;

            // Redirigir según rol (agrupar en condición clara)
            if ((int) $_SESSION['es_barbero'] === 1) {
                Usuario::addAlert('success', 'Bienvenido a la administración, ' . $usuario->nombre, true);
                header('Location: /admin');
                exit;
            } else {
                Usuario::addAlert('success', 'Bienvenido ' . $usuario->nombre, true);
                header('Location: /');
                exit;
            }
        }
        // GET -> mostrar login (traer alertas flash si las hay)
        $alerts = Usuario::getAllAlertsAndClear(); // trae y limpia flash + memoria
        $router->render('auth/login', [
            'alerts' => $alerts
        ]);
    }
}