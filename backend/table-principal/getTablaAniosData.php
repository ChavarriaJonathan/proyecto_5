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

// Consulta para obtener los datos de años_datos para el escenario seleccionado
$sql = "SELECT ad.*, a.a_numero_año 
        FROM años_datos ad 
        JOIN año a ON ad.id_año = a.id_años 
        WHERE ad.id_escenario = ?
        ORDER BY a.a_numero_año ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_escenario);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Extraer los valores numéricos de los campos formateados
        $pg_raw = str_replace(['$', ','], '', $row['ad_presion_gastos']);
        $cxp_raw = str_replace(['$', ','], '', $row['ad_costo_x_proyecto']);
        $ppto_raw = str_replace(['$', ','], '', $row['ad_2025_ppto_x_comp']);
        
        // Agregar tanto valores formateados como valores crudos
        $row['ad_presion_gastos_raw'] = $pg_raw;
        $row['ad_costo_x_proyecto_raw'] = $cxp_raw;
        $row['ad_2025_ppto_x_comp_raw'] = $ppto_raw;
        
        // Asegurar que los valores tengan formato de moneda
        // Esto es crucial porque React depende de estos valores formateados
        if (!strpos($row['ad_presion_gastos'], '$') !== false) {
            $row['ad_presion_gastos'] = '$' . number_format((float)$pg_raw, 2, '.', ',');
        }
        
        if (!strpos($row['ad_costo_x_proyecto'], '$') !== false) {
            $row['ad_costo_x_proyecto'] = '$' . number_format((float)$cxp_raw, 2, '.', ',');
        }
        
        if (!strpos($row['ad_2025_ppto_x_comp'], '$') !== false) {
            $row['ad_2025_ppto_x_comp'] = '$' . number_format((float)$ppto_raw, 2, '.', ',');
        }
        
        $data[] = $row;
    }
    
    // Para depuración, registrar un ejemplo de los datos
    if (count($data) > 0) {
        error_log("Ejemplo de datos enviados: " . json_encode($data[0]));
    }
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} else {
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
}

$stmt->close();
$conn->close();
?>