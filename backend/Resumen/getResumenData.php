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

// Obtener información del escenario
$sqlEscenario = "SELECT id_escenario, e_nombre FROM escenarios WHERE id_escenario = ?";
$stmtEscenario = $conn->prepare($sqlEscenario);
$stmtEscenario->bind_param("i", $id_escenario);
$stmtEscenario->execute();
$resultEscenario = $stmtEscenario->get_result();
$escenarioInfo = $resultEscenario->fetch_assoc();

// Obtener número de convocatorias para este escenario
$sqlConvocatorias = "SELECT COUNT(DISTINCT id_convocatoria) as num_convocatorias 
                      FROM datos_convocatoria 
                      WHERE id_esenario = ?";
$stmtConvocatorias = $conn->prepare($sqlConvocatorias);
$stmtConvocatorias->bind_param("i", $id_escenario);
$stmtConvocatorias->execute();
$resultConvocatorias = $stmtConvocatorias->get_result();
$convocatoriasInfo = $resultConvocatorias->fetch_assoc();

// Añadir el número de convocatorias a la información del escenario
$escenarioInfo['num_convocatorias'] = $convocatoriasInfo['num_convocatorias'];

if (!$escenarioInfo) {
    echo json_encode([
        'success' => false,
        'message' => 'Escenario no encontrado'
    ]);
    exit;
}

// Obtener años disponibles para el escenario desde la tabla incremento_presupuesto
$sqlAnios = "SELECT ip.id_presupuesto, ip.id_año, ip.ip_porcentaje, a.a_numero_año 
             FROM incremento_presupuesto ip 
             JOIN año a ON ip.id_año = a.id_años 
             WHERE ip.id_esenario = ?
             ORDER BY a.a_numero_año ASC";

$stmtAnios = $conn->prepare($sqlAnios);
$stmtAnios->bind_param("i", $id_escenario);
$stmtAnios->execute();
$resultAnios = $stmtAnios->get_result();

$resumenData = [
    'escenario' => $escenarioInfo,
    'años' => []
];

while ($anioRow = $resultAnios->fetch_assoc()) {
    $id_presupuesto = $anioRow['id_presupuesto'];
    $id_año = $anioRow['id_año'];
    $año = $anioRow['a_numero_año'];
    $porcentaje = $anioRow['ip_porcentaje'];
    
    // Obtener datos de resumen1
    $sqlResumen1 = "SELECT * FROM resumen1 WHERE id_presupuesto = ?";
    $stmtResumen1 = $conn->prepare($sqlResumen1);
    $stmtResumen1->bind_param("i", $id_presupuesto);
    $stmtResumen1->execute();
    $resultResumen1 = $stmtResumen1->get_result();
    $resumen1Data = $resultResumen1->fetch_assoc();
    
    // Obtener datos de resumen2
    $sqlResumen2 = "SELECT * FROM resumen2 WHERE id_presupuesto = ?";
    $stmtResumen2 = $conn->prepare($sqlResumen2);
    $stmtResumen2->bind_param("i", $id_presupuesto);
    $stmtResumen2->execute();
    $resultResumen2 = $stmtResumen2->get_result();
    $resumen2Data = $resultResumen2->fetch_assoc();
    
    // Si no hay datos en alguna de las tablas, inicializar con valores predeterminados
    if (!$resumen1Data) {
        $resumen1Data = [
            'r1_presupuestio_bruto' => 0,
            'r1_presion_gasto_realv' => 0,
            'r1_presupuesto_comprometer' => 0,
            'r1_presion_gasto_proyectada' => 0,
            'r1_monto_total_comprometido' => 0,
            'r1_deficit' => 0
        ];
    }
    
    if (!$resumen2Data) {
        $resumen2Data = [
            'r2_proyectos_presion' => 0,
            'r2_proyectos_comprometer' => 0,
            'r2_total_proyectos' => 0
        ];
    }
    
    // Formatear valores monetarios
    $presupuesto_bruto_formatted = '$' . number_format($resumen1Data['r1_presupuestio_bruto'], 2, '.', ',');
    $presion_gasto_real_formatted = '$' . number_format($resumen1Data['r1_presion_gasto_realv'], 2, '.', ',');
    $presupuesto_comprometer_formatted = '$' . number_format($resumen1Data['r1_presupuesto_comprometer'], 2, '.', ',');
    $presion_gasto_proyectada_formatted = '$' . number_format($resumen1Data['r1_presion_gasto_proyectada'], 2, '.', ',');
    $monto_total_comprometido_formatted = '$' . number_format($resumen1Data['r1_monto_total_comprometido'], 2, '.', ',');
    $deficit_formatted = '$' . number_format($resumen1Data['r1_deficit'], 2, '.', ',');
    $incremento_porcentaje_formatted = number_format($porcentaje, 1) . '%';
    
    // Construir el objeto de datos para este año
    $añoData = [
        'id_presupuesto' => $id_presupuesto,
        'id_año' => $id_año,
        'año' => $año,
        'incremento_porcentaje' => $porcentaje,
        'incremento_porcentaje_formatted' => $incremento_porcentaje_formatted,
        'proyectos_presion' => $resumen2Data['r2_proyectos_presion'],
        'proyectos_comprometer' => $resumen2Data['r2_proyectos_comprometer'],
        'total_proyectos' => $resumen2Data['r2_total_proyectos'],
        'presupuesto_bruto' => $resumen1Data['r1_presupuestio_bruto'],
        'presion_gasto_real' => $resumen1Data['r1_presion_gasto_realv'],
        'presupuesto_comprometer' => $resumen1Data['r1_presupuesto_comprometer'],
        'presion_gasto_proyectada' => $resumen1Data['r1_presion_gasto_proyectada'],
        'monto_total_comprometido' => $resumen1Data['r1_monto_total_comprometido'],
        'deficit' => $resumen1Data['r1_deficit'],
        'presupuesto_bruto_formatted' => $presupuesto_bruto_formatted,
        'presion_gasto_real_formatted' => $presion_gasto_real_formatted,
        'presupuesto_comprometer_formatted' => $presupuesto_comprometer_formatted,
        'presion_gasto_proyectada_formatted' => $presion_gasto_proyectada_formatted,
        'monto_total_comprometido_formatted' => $monto_total_comprometido_formatted,
        'deficit_formatted' => $deficit_formatted
    ];
    
    $resumenData['años'][] = $añoData;
}

// Devolver resultado como JSON
echo json_encode([
    'success' => true,
    'data' => $resumenData
]);

// Cerrar conexiones
$stmtEscenario->close();
$stmtAnios->close();
$conn->close();
?>