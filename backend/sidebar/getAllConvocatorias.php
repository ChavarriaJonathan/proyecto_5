<?php
// Ruta: http://localhost/proyecto_5/backend/sidebar/getAllConvocatorias.php

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

    // Consulta para obtener todas las convocatorias
    $stmt = $conn->prepare("SELECT id_convocatoria, c_nombre FROM convocatorias ORDER BY c_nombre");
    $stmt->execute();
    $convocatorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Preparar respuesta
    $response = [
        'success' => true,
        'data' => $convocatorias
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