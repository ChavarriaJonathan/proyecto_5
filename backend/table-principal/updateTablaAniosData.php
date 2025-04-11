<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Importante: manejar primero la solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Solo enviamos los encabezados y terminamos
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
        
        // Ahora necesitamos obtener el id_escenario e id_año para este registro
        $stmtSelect = $conn->prepare("SELECT id_escenario, id_año FROM años_datos WHERE id_años_datos = ?");
        $stmtSelect->bind_param("i", $id);
        $stmtSelect->execute();
        $resultSelect = $stmtSelect->get_result();
        
        if ($row = $resultSelect->fetch_assoc()) {
            $id_escenario = $row['id_escenario'];
            $id_año = $row['id_año'];
            
            // Ahora actualizamos la tabla incremento_presupuesto
            // Nota: en algunas tablas es id_esenario, en otras es id_escenario
            $stmtIncremento = $conn->prepare("UPDATE incremento_presupuesto SET 
                                             ip_total_pre = ? 
                                             WHERE id_esenario = ? AND id_año = ?");
            
            $stmtIncremento->bind_param("dii", $presion_gastos, $id_escenario, $id_año);
            
            if (!$stmtIncremento->execute()) {
                // Si hay un error, verificamos si es porque el campo se llama diferente
                $stmtCheck = $conn->prepare("SHOW COLUMNS FROM incremento_presupuesto LIKE 'id_esenario'");
                $stmtCheck->execute();
                $resultCheck = $stmtCheck->get_result();
                
                if ($resultCheck->num_rows > 0) {
                    // El campo es 'id_esenario'
                    error_log("Usando id_esenario");
                } else {
                    // Intentar con 'id_escenario'
                    $stmtIncrementoAlt = $conn->prepare("UPDATE incremento_presupuesto SET 
                                                      ip_total_pre = ? 
                                                      WHERE id_escenario = ? AND id_año = ?");
                    
                    $stmtIncrementoAlt->bind_param("dii", $presion_gastos, $id_escenario, $id_año);
                    
                    if (!$stmtIncrementoAlt->execute()) {
                        throw new Exception("Error al actualizar incremento_presupuesto (alternativo): " . $stmtIncrementoAlt->error);
                    }
                    
                    $stmtIncrementoAlt->close();
                }
            }
            
            // También necesitamos actualizar resumen1 para este escenario y año
            // Primero necesitamos obtener el id_presupuesto
            $stmtPresupuesto = $conn->prepare("SELECT id_presupuesto FROM incremento_presupuesto 
                                              WHERE id_esenario = ? AND id_año = ?");
            $stmtPresupuesto->bind_param("ii", $id_escenario, $id_año);
            $stmtPresupuesto->execute();
            $resultPresupuesto = $stmtPresupuesto->get_result();
            
            if ($rowPresupuesto = $resultPresupuesto->fetch_assoc()) {
                $id_presupuesto = $rowPresupuesto['id_presupuesto'];
                
                // Ahora actualizamos r1_presion_gasto_realv en resumen1
                $stmtResumen = $conn->prepare("UPDATE resumen1 SET 
                                             r1_presion_gasto_realv = ? 
                                             WHERE id_presupuesto = ?");
                
                $stmtResumen->bind_param("di", $presion_gastos, $id_presupuesto);
                
                if (!$stmtResumen->execute()) {
                    throw new Exception("Error al actualizar resumen1: " . $stmtResumen->error);
                }
                
                // También actualizar r1_presupuesto_comprometer = r1_presupuestio_bruto - r1_presion_gasto_realv
                $stmtUpdateComprometer = $conn->prepare("UPDATE resumen1 SET 
                                                      r1_presupuesto_comprometer = r1_presupuestio_bruto - ? 
                                                      WHERE id_presupuesto = ?");
                
                $stmtUpdateComprometer->bind_param("di", $presion_gastos, $id_presupuesto);
                
                if (!$stmtUpdateComprometer->execute()) {
                    throw new Exception("Error al actualizar presupuesto comprometer: " . $stmtUpdateComprometer->error);
                }
                
                // Finalmente, actualizar r1_monto_total_comprometido = r1_presion_gasto_realv + r1_presion_gasto_proyectada
                $stmtUpdateTotal = $conn->prepare("UPDATE resumen1 SET 
                                               r1_monto_total_comprometido = ? + r1_presion_gasto_proyectada 
                                               WHERE id_presupuesto = ?");
                
                $stmtUpdateTotal->bind_param("di", $presion_gastos, $id_presupuesto);
                
                if (!$stmtUpdateTotal->execute()) {
                    throw new Exception("Error al actualizar monto total comprometido: " . $stmtUpdateTotal->error);
                }
                
                // Y actualizar r1_deficit = r1_presupuestio_bruto - r1_monto_total_comprometido
                $stmtUpdateDeficit = $conn->prepare("UPDATE resumen1 SET 
                                                r1_deficit = r1_presupuestio_bruto - r1_monto_total_comprometido 
                                                WHERE id_presupuesto = ?");
                
                $stmtUpdateDeficit->bind_param("i", $id_presupuesto);
                
                if (!$stmtUpdateDeficit->execute()) {
                    throw new Exception("Error al actualizar déficit: " . $stmtUpdateDeficit->error);
                }
            }
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