<?php

namespace Controllers;

use MVC\Router;

class DashboardController{
    public static function index(Router $router){
        start_session_if_needed();

        $router->render('dashboard/index', []);
    }
}