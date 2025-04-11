<?php
// Ruta: http://localhost/proyecto_5/backend/sidebar/createScenario.php

// Configuración para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), respondemos con los encabezados CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar si es una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere una solicitud POST'
    ]);
    exit;
}

// Obtener y decodificar los datos enviados
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Verificar si se recibió un nombre de escenario
if (!isset($input['name']) || empty($input['name'])) {
    echo json_encode([
        'success' => false,
        'message' => 'El nombre del escenario es requerido'
    ]);
    exit;
}

$scenarioName = $input['name'];

// Conexión a la base de datos
$host = 'localhost';
$db = 'tableroPresionDelGasto';
$user = 'root'; // Cambia esto según tu configuración
$password = ''; // Cambia esto según tu configuración

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si ya existe un escenario con ese nombre
    $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM escenarios WHERE e_nombre = :nombre");
    $stmtCheck->bindParam(':nombre', $scenarioName, PDO::PARAM_STR);
    $stmtCheck->execute();
    
    if ($stmtCheck->fetchColumn() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Ya existe un escenario con ese nombre'
        ]);
        exit;
    }
    
    // Insertar el nuevo escenario
    $stmt = $conn->prepare("INSERT INTO escenarios (e_nombre) VALUES (:nombre)");
    $stmt->bindParam(':nombre', $scenarioName, PDO::PARAM_STR);
    $stmt->execute();
    
    // Obtener el ID del escenario recién creado
    $id_escenario = $conn->lastInsertId();
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Escenario creado correctamente',
        'id_escenario' => $id_escenario
    ]);
    
} catch(PDOException $e) {
    // Error en la conexión o consulta
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
?>