<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Actualizar la tabla principal (años_datos) - No la vista
    $stmt = $conn->prepare("UPDATE años_datos SET 
                            ad_presion_gastos = ?, 
                            ad_num_proy_pre = ?, 
                            ad_costo_x_proyecto = ? 
                            WHERE id_años_datos = ?");

    foreach ($data['data'] as $item) {
        // Convertir los valores formateados a numéricos
        $presion_gastos = floatval(str_replace(['$', ','], '', $item['ad_presion_gastos']));
        $costo_x_proyecto = floatval(str_replace(['$', ','], '', $item['ad_costo_x_proyecto']));
        $num_proy_pre = intval($item['ad_num_proy_pre']);
        $id = intval($item['id_años_datos']);
        
        // Registrar valores procesados para depuración
        error_log("ID: $id, PG: $presion_gastos, NPP: $num_proy_pre, CXP: $costo_x_proyecto");
        
        $stmt->bind_param("didi", $presion_gastos, $num_proy_pre, $costo_x_proyecto, $id);
        
        if (!$stmt->execute()) {
            throw new Exception("Error al actualizar registro: " . $stmt->error);
        }
    }

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Datos actualizados correctamente'
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