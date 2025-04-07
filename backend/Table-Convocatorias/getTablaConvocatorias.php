<?php
// Ruta: http://localhost/proyecto_5/backend/Table-Convocatorias/getTablaConvocatorias.php

// Configuración para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS (preflight), solo respondemos con los encabezados CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

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

    // Consulta para obtener los datos para la tabla manteniendo el orden original
    $query = "
        SELECT 
            dc.id_datos_conv,
            dc.id_convocatoria,
            dc.id_esenario,
            dc.id_año,
            dc.dc_nuevos_proyectos,
            dc.dc_costo_x_proyecto,
            dc.dc_subtotal,
            dc.dc_porcentaje_x_año,
            c.c_nombre,
            a.a_numero_año
        FROM 
            datos_convocatoria dc
        JOIN 
            convocatorias c ON dc.id_convocatoria = c.id_convocatoria
        JOIN 
            año a ON dc.id_año = a.id_años
        WHERE 
            dc.id_esenario = :id_escenario
        ORDER BY 
            dc.id_convocatoria, a.a_numero_año
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id_escenario', $id_escenario, PDO::PARAM_INT);
    $stmt->execute();
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear datos de moneda y porcentaje para que se vean más bonitos en la interfaz
    foreach ($datos as &$dato) {
        // Formatear costo por proyecto con símbolo de moneda
        $dato['dc_costo_x_proyecto'] = '$' . number_format($dato['dc_costo_x_proyecto'], 2);
        
        // Formatear subtotal con símbolo de moneda
        $dato['dc_subtotal'] = '$' . number_format($dato['dc_subtotal'], 2);
        
        // Formatear porcentaje
        $dato['dc_porcentaje_x_año'] = $dato['dc_porcentaje_x_año'] . '%';
    }

    // Preparar respuesta
    $response = [
        'success' => true,
        'data' => $datos
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