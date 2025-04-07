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
    // Actualizar la tabla incremento_presupuesto
    $stmt = $conn->prepare("UPDATE incremento_presupuesto SET 
                            ip_total_bruto = ?, 
                            ip_total_pre = ?, 
                            ip_porcentaje = ? 
                            WHERE id_presupuesto = ?");

    foreach ($data['data'] as $item) {
        // Convertir los valores formateados a numéricos
        $totalBruto = floatval(str_replace(['$', ','], '', $item['ip_total_bruto_formatted'] ?? $item['ip_total_bruto']));
        $totalPre = floatval(str_replace(['$', ','], '', $item['ip_total_pre_formatted'] ?? $item['ip_total_pre']));
        
        // Asegurarnos de obtener el porcentaje correctamente
        $porcentaje = isset($item['ip_porcentaje']) ? floatval($item['ip_porcentaje']) : 
                     floatval(str_replace('%', '', $item['ip_porcentaje_formatted']));
        
        $id = intval($item['id_presupuesto']);
        
        // Registrar valores procesados para depuración
        error_log("Actualizando registro - ID: $id, TB: $totalBruto, TP: $totalPre, P: $porcentaje");
        
        $stmt->bind_param("dddi", $totalBruto, $totalPre, $porcentaje, $id);
        
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
exit; // Asegurarse de que el script termine aquí
?>