<?php
namespace Controllers;

use MVC\Router;
use Model\Barberia;

class HomeController {
    // GET /
    public static function index(Router $router) {
        // mostrar algunas barberías destacadas (limit 8) para la UI inicial
        $featured = Barberia::get(8);
        $router->render('home/index', [
            'featured' => $featured
        ]);
    }

    // POST /barberias/search
    // Espera POST: q (query de búsqueda)
    public static function search(Router $router) {
        $q = trim($_POST['q'] ?? '');

        header('Content-Type: application/json; charset=utf-8');

        if ($q === '') {
            // devolver las primeras 20 barberías si no hay query
            $items = Barberia::get(20);
            // normalizamos a array simple
            $out = array_map(function($b){
                return [
                    'id' => $b->id,
                    'nombre' => $b->nombre,
                    'localidad' => $b->localidad,
                    'calle' => $b->calle,
                    'altura' => $b->altura
                ];
            }, $items);
            echo json_encode(['items'=>$out]);
            return;
        }

        // búsqueda por nombre / localidad / calle (LIKE) usando ActiveRecord helper
        $found = Barberia::whereLikeMultiple([
            'nombre' => $q,
            'localidad' => $q,
            'calle' => $q
        ]);

        $out = array_map(function($b){
            return [
                'id' => $b->id,
                'nombre' => $b->nombre,
                'localidad' => $b->localidad,
                'calle' => $b->calle,
                'altura' => $b->altura
            ];
        }, $found);

        echo json_encode(['items'=>$out]);
    }
    
}
