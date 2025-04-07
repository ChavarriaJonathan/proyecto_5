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

// Consulta para obtener años disponibles para el escenario
$sqlAnios = "SELECT DISTINCT a.id_años, a.a_numero_año 
            FROM datos_convocatoria dc 
            JOIN año a ON dc.id_año = a.id_años 
            WHERE dc.id_esenario = ?
            ORDER BY a.a_numero_año ASC";

$stmtAnios = $conn->prepare($sqlAnios);
$stmtAnios->bind_param("i", $id_escenario);
$stmtAnios->execute();
$resultAnios = $stmtAnios->get_result();

$anios = [];
while ($row = $resultAnios->fetch_assoc()) {
    $anios[] = $row;
}

// Consulta para obtener los datos de incremento de presupuesto para el escenario actual
$sql = "SELECT ip.*, a.a_numero_año
        FROM incremento_presupuesto ip
        JOIN año a ON ip.id_año = a.id_años
        WHERE ip.id_esenario = ?
        ORDER BY a.a_numero_año ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_escenario);
$stmt->execute();
$result = $stmt->get_result();

// Si no existen registros de incremento_presupuesto, creamos uno para cada año
$incrementoData = [];
if ($result->num_rows === 0) {
    // Valor base para el Total Bruto
    $baseValue = 704273246;
    
    foreach ($anios as $anio) {
        // Consulta para obtener presión de gastos del año
        $sqlPresion = "SELECT ad_presion_gastos 
                      FROM años_datos 
                      WHERE id_escenario = ? AND id_año = ?";
        
        $stmtPresion = $conn->prepare($sqlPresion);
        $stmtPresion->bind_param("ii", $id_escenario, $anio['id_años']);
        $stmtPresion->execute();
        $resultPresion = $stmtPresion->get_result();
        
        $presionGastos = 0;
        if ($rowPresion = $resultPresion->fetch_assoc()) {
            $presionGastos = floatval($rowPresion['ad_presion_gastos']);
        }
        
        // Crear nuevo registro para este año
        $sqlInsert = "INSERT INTO incremento_presupuesto 
                     (id_esenario, id_año, ip_total_bruto, ip_total_pre, ip_porcentaje) 
                     VALUES (?, ?, ?, ?, 0)";
        
        $stmtInsert = $conn->prepare($sqlInsert);
        $stmtInsert->bind_param("iidd", $id_escenario, $anio['id_años'], $baseValue, $presionGastos);
        $stmtInsert->execute();
        
        $newId = $conn->insert_id;
        
        $incrementoData[] = [
            'id_presupuesto' => $newId,
            'id_esenario' => $id_escenario,
            'id_año' => $anio['id_años'],
            'ip_total_bruto' => $baseValue,
            'ip_total_pre' => $presionGastos,
            'ip_porcentaje' => 0,
            'a_numero_año' => $anio['a_numero_año'],
            'ip_total_bruto_formatted' => "$" . number_format($baseValue, 2, '.', ','),
            'ip_total_pre_formatted' => "$" . number_format($presionGastos, 2, '.', ','),
            'ip_porcentaje_formatted' => "0.0%"
        ];
    }
} else {
    // Procesar resultados existentes
    while ($row = $result->fetch_assoc()) {
        // Convertir los valores a números
        $totalBruto = floatval($row['ip_total_bruto']);
        $totalPre = floatval($row['ip_total_pre']);
        $porcentaje = floatval($row['ip_porcentaje']);
        
        $incrementoData[] = [
            'id_presupuesto' => $row['id_presupuesto'],
            'id_esenario' => $row['id_esenario'],
            'id_año' => $row['id_año'],
            'ip_total_bruto' => $totalBruto,
            'ip_total_pre' => $totalPre,
            'ip_porcentaje' => $porcentaje,
            'a_numero_año' => $row['a_numero_año'],
            'ip_total_bruto_formatted' => "$" . number_format($totalBruto, 2, '.', ','),
            'ip_total_pre_formatted' => "$" . number_format($totalPre, 2, '.', ','),
            'ip_porcentaje_formatted' => number_format($porcentaje, 1) . "%"
        ];
    }
    
    // Si hay menos registros que años, creamos los que faltan
    if (count($incrementoData) < count($anios)) {
        $existingYears = array_column($incrementoData, 'id_año');
        $baseValue = 704273246;
        
        foreach ($anios as $anio) {
            if (!in_array($anio['id_años'], $existingYears)) {
                // Consulta para obtener presión de gastos del año
                $sqlPresion = "SELECT ad_presion_gastos 
                              FROM años_datos 
                              WHERE id_escenario = ? AND id_año = ?";
                
                $stmtPresion = $conn->prepare($sqlPresion);
                $stmtPresion->bind_param("ii", $id_escenario, $anio['id_años']);
                $stmtPresion->execute();
                $resultPresion = $stmtPresion->get_result();
                
                $presionGastos = 0;
                if ($rowPresion = $resultPresion->fetch_assoc()) {
                    $presionGastos = floatval($rowPresion['ad_presion_gastos']);
                }
                
                // Crear nuevo registro para este año
                $sqlInsert = "INSERT INTO incremento_presupuesto 
                             (id_esenario, id_año, ip_total_bruto, ip_total_pre, ip_porcentaje) 
                             VALUES (?, ?, ?, ?, 0)";
                
                $stmtInsert = $conn->prepare($sqlInsert);
                $stmtInsert->bind_param("iidd", $id_escenario, $anio['id_años'], $baseValue, $presionGastos);
                $stmtInsert->execute();
                
                $newId = $conn->insert_id;
                
                $incrementoData[] = [
                    'id_presupuesto' => $newId,
                    'id_esenario' => $id_escenario,
                    'id_año' => $anio['id_años'],
                    'ip_total_bruto' => $baseValue,
                    'ip_total_pre' => $presionGastos,
                    'ip_porcentaje' => 0,
                    'a_numero_año' => $anio['a_numero_año'],
                    'ip_total_bruto_formatted' => "$" . number_format($baseValue, 2, '.', ','),
                    'ip_total_pre_formatted' => "$" . number_format($presionGastos, 2, '.', ','),
                    'ip_porcentaje_formatted' => "0.0%"
                ];
            }
        }
        
        // Ordenamos los resultados por año
        usort($incrementoData, function($a, $b) {
            return $a['a_numero_año'] - $b['a_numero_año'];
        });
    }
}

// Devolver datos con formato para que sean consumidos por el componente React
echo json_encode([
    'success' => true,
    'data' => $incrementoData,
    'anios' => $anios,
    'baseValue' => 704273246
]);

$stmt->close();
$conn->close();
?>