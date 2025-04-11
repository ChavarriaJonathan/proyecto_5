<?php
// Ruta: http://localhost/proyecto_5/backend/sidebar/saveConvocatoriaData.php

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

// Verificar si se recibieron datos válidos
if (!isset($input['data']) || !is_array($input['data']) || empty($input['data'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No se recibieron datos válidos'
    ]);
    exit;
}

$convocatoriaData = $input['data'];

// Conexión a la base de datos
$host = 'localhost';
$db = 'tableroPresionDelGasto';
$user = 'root'; // Cambia esto según tu configuración
$password = ''; // Cambia esto según tu configuración

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Iniciar transacción para asegurar todas las inserciones
    $conn->beginTransaction();
    
    // Imprimimos la estructura de la tabla para verificación
    $stmt_check = $conn->prepare("DESCRIBE datos_convocatoria");
    $stmt_check->execute();
    $table_structure = $stmt_check->fetchAll(PDO::FETCH_ASSOC);
    
    // Para depuración: registramos la estructura de la tabla
    error_log("Estructura de tabla: " . json_encode($table_structure));
    
    // Usamos un enfoque más directo para asegurarnos de que todo coincida
    foreach ($convocatoriaData as $data) {
        // Verificar campos requeridos
        if (!isset($data['id_convocatoria']) || !isset($data['id_escenario']) || !isset($data['id_año'])) {
            $conn->rollBack();
            echo json_encode([
                'success' => false,
                'message' => 'Datos incompletos en uno de los registros'
            ]);
            exit;
        }
        
        // Preparamos la inserción con valores directamente (sin usar parámetros nombrados)
        $sql = "INSERT INTO datos_convocatoria 
                (id_convocatoria, id_esenario, id_año, dc_nuevos_proyectos, dc_costo_x_proyecto, dc_subtotal, dc_porcentaje_x_año)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        // Usamos parámetros posicionales (?) en lugar de nombrados (:name)
        $stmt->execute([
            $data['id_convocatoria'],       // 1: id_convocatoria
            $data['id_escenario'],          // 2: id_esenario (en la tabla)
            $data['id_año'],                // 3: id_año
            0,                              // 4: dc_nuevos_proyectos (valor por defecto 0)
            0,                              // 5: dc_costo_x_proyecto (valor por defecto 0)
            0,                              // 6: dc_subtotal (valor por defecto 0)
            0                               // 7: dc_porcentaje_x_año (valor por defecto 0)
        ]);
    }
    
    // Crear registros en años_datos para este escenario
    $escenarioId = $convocatoriaData[0]['id_escenario'];
    
    // Obtener los años únicos
    $uniqueYears = [];
    foreach ($convocatoriaData as $data) {
        if (!in_array($data['id_año'], $uniqueYears)) {
            $uniqueYears[] = $data['id_año'];
        }
    }
    
    // Insertar registros en años_datos para cada año - usando parámetros posicionales
    foreach ($uniqueYears as $yearId) {
        $sql_anios = "INSERT INTO años_datos 
                    (id_escenario, id_año, ad_presion_gastos, ad_num_proy_pre, ad_costo_x_proyecto, ad_2025_ppto_x_comp) 
                    VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt_anios = $conn->prepare($sql_anios);
        $stmt_anios->execute([
            $escenarioId,   // 1: id_escenario
            $yearId,        // 2: id_año
            0,              // 3: ad_presion_gastos (valor 0)
            0,              // 4: ad_num_proy_pre (valor 0)
            0,              // 5: ad_costo_x_proyecto (valor 0)
            0               // 6: ad_2025_ppto_x_comp (valor 0)
        ]);
    }
    
    // Crear registros de incremento_presupuesto para este escenario - usando parámetros posicionales
    foreach ($uniqueYears as $yearId) {
        $sql_incremento = "INSERT INTO incremento_presupuesto 
                         (id_esenario, id_año, ip_total_bruto, ip_total_pre, ip_porcentaje) 
                         VALUES (?, ?, ?, ?, ?)";
        
        $stmt_incremento = $conn->prepare($sql_incremento);
        $stmt_incremento->execute([
            $escenarioId,   // 1: id_esenario
            $yearId,        // 2: id_año
            704273246,      // 3: ip_total_bruto (valor por defecto)
            0,              // 4: ip_total_pre (valor 0)
            0               // 5: ip_porcentaje (valor 0)
        ]);
    }
    
    // Confirmar la transacción
    $conn->commit();
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Datos guardados correctamente',
        'records_created' => count($convocatoriaData)
    ]);
    
} catch(PDOException $e) {
    // Si hay algún error, revertir la transacción
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    // Error en la conexión o consulta
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
}
?>