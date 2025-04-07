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
    // Actualizar la tabla resumen1
    $stmt = $conn->prepare("UPDATE resumen1 SET 
                            r1_presupuestio_bruto = ?, 
                            r1_presion_gasto_realv = ?, 
                            r1_presupuesto_comprometer = ?,
                            r1_presion_gasto_proyectada = ?,
                            r1_monto_total_comprometido = ?,
                            r1_deficit = ?
                            WHERE id_r1 = ?");

    foreach ($data['data'] as $item) {
        // Convertir los valores formateados a numéricos
        $presupuestio_bruto = floatval(str_replace(['$', ','], '', $item['r1_presupuestio_bruto_formatted'] ?? $item['r1_presupuestio_bruto']));
        $presion_gasto_realv = floatval(str_replace(['$', ','], '', $item['r1_presion_gasto_realv_formatted'] ?? $item['r1_presion_gasto_realv']));
        $presupuesto_comprometer = floatval(str_replace(['$', ','], '', $item['r1_presupuesto_comprometer_formatted'] ?? $item['r1_presupuesto_comprometer']));
        $presion_gasto_proyectada = floatval(str_replace(['$', ','], '', $item['r1_presion_gasto_proyectada_formatted'] ?? $item['r1_presion_gasto_proyectada']));
        $monto_total_comprometido = floatval(str_replace(['$', ','], '', $item['r1_monto_total_comprometido_formatted'] ?? $item['r1_monto_total_comprometido']));
        $deficit = floatval(str_replace(['$', ','], '', $item['r1_deficit_formatted'] ?? $item['r1_deficit']));
        
        $id = intval($item['id_r1']);
        
        // Registrar valores procesados para depuración
        error_log("Actualizando resumen1 - ID: $id, Presupuesto Bruto: $presupuestio_bruto, Presión Gasto Real: $presion_gasto_realv");
        
        $stmt->bind_param("ddddddi", 
            $presupuestio_bruto, 
            $presion_gasto_realv, 
            $presupuesto_comprometer, 
            $presion_gasto_proyectada, 
            $monto_total_comprometido, 
            $deficit, 
            $id
        );
        
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