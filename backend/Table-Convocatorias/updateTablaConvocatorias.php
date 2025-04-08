<?php
// Ruta: http://localhost/proyecto_5/backend/Table-Convocatorias/updateTablaConvocatorias.php

// Configuración para CORS - UPDATED HEADERS
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), solo respondemos con los encabezados CORS
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

// Conexión a la base de datos
$host = 'localhost';
$db = 'tableroPresionDelGasto';
$user = 'root'; // Cambia esto según tu configuración
$password = ''; // Cambia esto según tu configuración

try {
    $conn = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Iniciar transacción para asegurar que todas las actualizaciones se realicen o ninguna
    $conn->beginTransaction();
    
    // Preparar la consulta de actualización
    $stmt = $conn->prepare("
        UPDATE datos_convocatoria 
        SET 
            dc_nuevos_proyectos = :dc_nuevos_proyectos,
            dc_costo_x_proyecto = :dc_costo_x_proyecto,
            dc_subtotal = :dc_subtotal,
            dc_porcentaje_x_año = :dc_porcentaje_x_anio
        WHERE 
            id_datos_conv = :id_datos_conv
    ");
    
    // Procesar cada registro
    foreach ($input['data'] as $record) {
        // Verificar que tenga los campos necesarios
        if (!isset($record['id_datos_conv']) || 
            !isset($record['dc_nuevos_proyectos']) || 
            !isset($record['dc_costo_x_proyecto']) || 
            !isset($record['dc_subtotal']) || 
            !isset($record['dc_porcentaje_x_año'])) {
            
            // Si falta algún campo, revertir la transacción
            $conn->rollBack();
            
            echo json_encode([
                'success' => false,
                'message' => 'Datos incompletos en uno de los registros'
            ]);
            exit;
        }
        
        // Eliminar el símbolo $ y las comas del costo y subtotal si existen
        $costo = is_string($record['dc_costo_x_proyecto']) ? 
            floatval(str_replace(['$', ','], '', $record['dc_costo_x_proyecto'])) : 
            floatval($record['dc_costo_x_proyecto']);
            
        $subtotal = is_string($record['dc_subtotal']) ? 
            floatval(str_replace(['$', ','], '', $record['dc_subtotal'])) : 
            floatval($record['dc_subtotal']);
            
        // Eliminar el símbolo % del porcentaje si existe
        $porcentaje = is_string($record['dc_porcentaje_x_año']) ? 
            floatval(str_replace('%', '', $record['dc_porcentaje_x_año'])) : 
            floatval($record['dc_porcentaje_x_año']);
            
        // Ejecutar la actualización
        $stmt->execute([
            ':id_datos_conv' => $record['id_datos_conv'],
            ':dc_nuevos_proyectos' => intval($record['dc_nuevos_proyectos']),
            ':dc_costo_x_proyecto' => $costo,
            ':dc_subtotal' => $subtotal,
            ':dc_porcentaje_x_anio' => $porcentaje
        ]);
    }
    
    // Confirmar la transacción
    $conn->commit();
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Datos actualizados correctamente',
        'records_updated' => count($input['data'])
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