<?php
// Ruta: http://localhost/proyecto_5/backend/sidebar/getEscenarios.php

// Configuración para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Conexión a la base de datos
$host = 'localhost';
$db = 'tableroPresionDelGasto';
$user = 'root'; // Cambia esto según tu configuración
$password = ''; // Cambia esto según tu configuración

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta para obtener todos los escenarios
    $stmt = $conn->prepare("SELECT id_escenario, e_nombre FROM escenarios ORDER BY e_nombre");
    $stmt->execute();
    $escenarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Preparar respuesta
    $response = [
        'success' => true,
        'data' => $escenarios
    ];

    echo json_encode($response);

} catch(PDOException $e) {
    // Error en la conexión o consulta
    $response = [
        'success' => false,
        'message' => 'Error de conexión a la base de datos: ' . $e->getMessage()
    ];
    
    echo json_encode($response);
}
?>