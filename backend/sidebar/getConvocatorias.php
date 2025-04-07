<?php
// Ruta: http://localhost/proyecto_5/backend/sidebar/getConvocatorias.php

// Configuración para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Verificar si se recibió un ID de escenario
if (!isset($_GET['id_escenario']) || empty($_GET['id_escenario'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Se requiere un ID de escenario'
    ]);
    exit;
}

$id_escenario = $_GET['id_escenario'];

// Conexión a la base de datos
$host = 'localhost';
$db = 'tableroPresionDelGasto';
$user = 'root'; // Cambia esto según tu configuración
$password = ''; // Cambia esto según tu configuración

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta para obtener las convocatorias únicas para el escenario seleccionado
    $query = "
        SELECT DISTINCT 
            c.id_convocatoria, 
            c.c_nombre
        FROM 
            convocatorias c
        JOIN 
            datos_convocatoria dc ON c.id_convocatoria = dc.id_convocatoria
        WHERE 
            dc.id_esenario = :id_escenario
        ORDER BY 
            c.c_nombre
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_escenario', $id_escenario, PDO::PARAM_INT);
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