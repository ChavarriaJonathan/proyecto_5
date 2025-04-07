<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tableroPresionDelGasto";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $conn->connect_error
    ]));
}

// Establecer codificación de caracteres
$conn->set_charset("utf8");

// Verificar que se proporcionó el ID del escenario
if (!isset($_GET['id_escenario'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de escenario no proporcionado'
    ]);
    exit;
}

$id_escenario = $_GET['id_escenario'];

// Primero obtenemos los datos de incremento_presupuesto para el escenario
$sqlIncremento = "SELECT ip.id_presupuesto, ip.id_año, ip.ip_total_bruto, ip.ip_total_pre, 
                        a.a_numero_año
                 FROM incremento_presupuesto ip
                 JOIN año a ON ip.id_año = a.id_años
                 WHERE ip.id_esenario = ?
                 ORDER BY a.a_numero_año ASC";

$stmtIncremento = $conn->prepare($sqlIncremento);
$stmtIncremento->bind_param("i", $id_escenario);
$stmtIncremento->execute();
$resultIncremento = $stmtIncremento->get_result();

$resumenData = [];

if ($resultIncremento->num_rows > 0) {
    while ($incrementoRow = $resultIncremento->fetch_assoc()) {
        $id_presupuesto = $incrementoRow['id_presupuesto'];
        $id_año = $incrementoRow['id_año'];
        $total_bruto = $incrementoRow['ip_total_bruto'];
        $total_pre = $incrementoRow['ip_total_pre'];
        $año = $incrementoRow['a_numero_año'];
        
        // Verificar si existe un registro en resumen1 para este id_presupuesto
        $sqlResumen = "SELECT * FROM resumen1 WHERE id_presupuesto = ?";
        $stmtResumen = $conn->prepare($sqlResumen);
        $stmtResumen->bind_param("i", $id_presupuesto);
        $stmtResumen->execute();
        $resultResumen = $stmtResumen->get_result();
        
        // Calculo del presupuesto por comprometer
        $presupuesto_comprometer = $total_bruto - $total_pre;
        
        // Calcular la suma de subtotales de datos_convocatoria para este escenario y año
        $sqlSubtotales = "SELECT SUM(dc.dc_subtotal) as presion_proyectada 
                         FROM datos_convocatoria dc 
                         WHERE dc.id_esenario = ? AND dc.id_año = ?";
        $stmtSubtotales = $conn->prepare($sqlSubtotales);
        $stmtSubtotales->bind_param("ii", $id_escenario, $id_año);
        $stmtSubtotales->execute();
        $resultSubtotales = $stmtSubtotales->get_result();
        $subtotalesRow = $resultSubtotales->fetch_assoc();
        
        $presion_proyectada = $subtotalesRow['presion_proyectada'] ?? 0;
        
        // Calculo del monto total comprometido
        $monto_comprometido = $total_pre + $presion_proyectada;
        
        // Calculo del déficit o superávit
        $deficit = $total_bruto - $monto_comprometido;
        
        if ($resultResumen->num_rows > 0) {
            // Existe un registro, actualizarlo
            $resumenRow = $resultResumen->fetch_assoc();
            $id_r1 = $resumenRow['id_r1'];
            
            $sqlUpdate = "UPDATE resumen1 SET 
                          r1_presupuestio_bruto = ?,
                          r1_presion_gasto_realv = ?,
                          r1_presupuesto_comprometer = ?,
                          r1_presion_gasto_proyectada = ?,
                          r1_monto_total_comprometido = ?,
                          r1_deficit = ?
                          WHERE id_r1 = ?";
            
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("ddddddi", 
                $total_bruto, 
                $total_pre, 
                $presupuesto_comprometer, 
                $presion_proyectada, 
                $monto_comprometido, 
                $deficit, 
                $id_r1
            );
            $stmtUpdate->execute();
            
            $resumenData[] = [
                'id_r1' => $id_r1,
                'id_presupuesto' => $id_presupuesto,
                'a_numero_año' => $año,
                'id_año' => $id_año,
                'r1_presupuestio_bruto' => $total_bruto,
                'r1_presupuestio_bruto_formatted' => '$' . number_format($total_bruto, 2, '.', ','),
                'r1_presion_gasto_realv' => $total_pre, 
                'r1_presion_gasto_realv_formatted' => '$' . number_format($total_pre, 2, '.', ','),
                'r1_presupuesto_comprometer' => $presupuesto_comprometer,
                'r1_presupuesto_comprometer_formatted' => '$' . number_format($presupuesto_comprometer, 2, '.', ','),
                'r1_presion_gasto_proyectada' => $presion_proyectada,
                'r1_presion_gasto_proyectada_formatted' => '$' . number_format($presion_proyectada, 2, '.', ','),
                'r1_monto_total_comprometido' => $monto_comprometido,
                'r1_monto_total_comprometido_formatted' => '$' . number_format($monto_comprometido, 2, '.', ','),
                'r1_deficit' => $deficit,
                'r1_deficit_formatted' => '$' . number_format($deficit, 2, '.', ',')
            ];
        } else {
            // No existe un registro, crear uno nuevo
            $sqlInsert = "INSERT INTO resumen1 (
                          id_presupuesto,
                          r1_presupuestio_bruto,
                          r1_presion_gasto_realv,
                          r1_presupuesto_comprometer,
                          r1_presion_gasto_proyectada,
                          r1_monto_total_comprometido,
                          r1_deficit
                          ) VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bind_param("idddddd", 
                $id_presupuesto, 
                $total_bruto, 
                $total_pre, 
                $presupuesto_comprometer, 
                $presion_proyectada, 
                $monto_comprometido, 
                $deficit
            );
            $stmtInsert->execute();
            
            $id_r1 = $conn->insert_id;
            
            $resumenData[] = [
                'id_r1' => $id_r1,
                'id_presupuesto' => $id_presupuesto,
                'a_numero_año' => $año,
                'id_año' => $id_año,
                'r1_presupuestio_bruto' => $total_bruto,
                'r1_presupuestio_bruto_formatted' => '$' . number_format($total_bruto, 2, '.', ','),
                'r1_presion_gasto_realv' => $total_pre, 
                'r1_presion_gasto_realv_formatted' => '$' . number_format($total_pre, 2, '.', ','),
                'r1_presupuesto_comprometer' => $presupuesto_comprometer,
                'r1_presupuesto_comprometer_formatted' => '$' . number_format($presupuesto_comprometer, 2, '.', ','),
                'r1_presion_gasto_proyectada' => $presion_proyectada,
                'r1_presion_gasto_proyectada_formatted' => '$' . number_format($presion_proyectada, 2, '.', ','),
                'r1_monto_total_comprometido' => $monto_comprometido,
                'r1_monto_total_comprometido_formatted' => '$' . number_format($monto_comprometido, 2, '.', ','),
                'r1_deficit' => $deficit,
                'r1_deficit_formatted' => '$' . number_format($deficit, 2, '.', ',')
            ];
        }
        
        $stmtResumen->close();
        $stmtSubtotales->close();
    }
    
    // Ordenar por año
    usort($resumenData, function($a, $b) {
        return $a['a_numero_año'] - $b['a_numero_año'];
    });
    
    echo json_encode([
        'success' => true,
        'data' => $resumenData
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No hay datos de incremento de presupuesto para este escenario'
    ]);
}

$stmtIncremento->close();
$conn->close();
?>