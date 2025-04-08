<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['data']) || !is_array($data['data'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos'
    ]);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tableroPresionDelGasto";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8");

$conn->begin_transaction();

try {
    // Actualizar la tabla resumen2
    $stmt = $conn->prepare("UPDATE resumen2 SET 
                            r2_proyectos_presion = ?, 
                            r2_proyectos_comprometer = ?, 
                            r2_total_proyectos = ?
                            WHERE id_r2 = ?");

    foreach ($data['data'] as $item) {
        $proyectos_presion = intval($item['r2_proyectos_presion']);
        $proyectos_comprometer = intval($item['r2_proyectos_comprometer']);
        $total_proyectos = intval($item['r2_total_proyectos']);
        $id = intval($item['id_r2']);
        
        // Registrar valores procesados para depuración
        error_log("Actualizando resumen2 - ID: $id, Proyectos Presión: $proyectos_presion, Proyectos Comprometer: $proyectos_comprometer, Total: $total_proyectos");
        
        $stmt->bind_param("iiii", 
            $proyectos_presion, 
            $proyectos_comprometer, 
            $total_proyectos, 
            $id
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error al actualizar registro: " . $stmt->error);
        }
    }

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Datos de resumen de proyectos actualizados correctamente'
    ]);
} catch (Exception $e) {
    $conn->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>