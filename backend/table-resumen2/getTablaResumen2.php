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
// Estos contienen la relación con el año que necesitamos
$sqlIncremento = "SELECT ip.id_presupuesto, ip.id_esenario, ip.id_año, 
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
        $a_numero_año = $incrementoRow['a_numero_año'];
        
        // Verificar si existe un registro en resumen2 para este id_presupuesto
        $sqlResumen = "SELECT * FROM resumen2 WHERE id_presupuesto = ?";
        $stmtResumen = $conn->prepare($sqlResumen);
        $stmtResumen->bind_param("i", $id_presupuesto);
        $stmtResumen->execute();
        $resultResumen = $stmtResumen->get_result();
        
        // Obtener los proyectos de presión del escenario para este año
        $sqlPresionProyectos = "SELECT ad_num_proy_pre 
                             FROM años_datos 
                             WHERE id_escenario = ? AND id_año = ?";
        
        $stmtPresionProyectos = $conn->prepare($sqlPresionProyectos);
        $stmtPresionProyectos->bind_param("ii", $id_escenario, $id_año);
        $stmtPresionProyectos->execute();
        $resultPresionProyectos = $stmtPresionProyectos->get_result();
        
        $proyectos_presion = 0;
        if ($rowPresionProyectos = $resultPresionProyectos->fetch_assoc()) {
            $proyectos_presion = intval($rowPresionProyectos['ad_num_proy_pre']);
        }
        
        // Obtener la suma de nuevos proyectos de todas las convocatorias para este escenario y año
        $sqlProyectosComprometer = "SELECT SUM(dc.dc_nuevos_proyectos) as proyectos_comprometer
                                  FROM datos_convocatoria dc
                                  WHERE dc.id_esenario = ? AND dc.id_año = ?";
        
        $stmtProyectosComprometer = $conn->prepare($sqlProyectosComprometer);
        $stmtProyectosComprometer->bind_param("ii", $id_escenario, $id_año);
        $stmtProyectosComprometer->execute();
        $resultProyectosComprometer = $stmtProyectosComprometer->get_result();
        
        $proyectos_comprometer = 0;
        if ($rowProyectosComprometer = $resultProyectosComprometer->fetch_assoc()) {
            $proyectos_comprometer = intval($rowProyectosComprometer['proyectos_comprometer']);
        }
        
        // Calcular el total de proyectos
        $total_proyectos = $proyectos_presion + $proyectos_comprometer;
        
        if ($resultResumen->num_rows > 0) {
            // Existe un registro, actualizarlo
            $resumenRow = $resultResumen->fetch_assoc();
            $id_r2 = $resumenRow['id_r2'];
            
            $sqlUpdate = "UPDATE resumen2 SET 
                          r2_proyectos_presion = ?,
                          r2_proyectos_comprometer = ?,
                          r2_total_proyectos = ?
                          WHERE id_r2 = ?";
            
            $stmtUpdate = $conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("iiii", 
                $proyectos_presion, 
                $proyectos_comprometer, 
                $total_proyectos, 
                $id_r2
            );
            $stmtUpdate->execute();
            
            $resumenData[] = [
                'id_r2' => $id_r2,
                'id_presupuesto' => $id_presupuesto,
                'a_numero_año' => $a_numero_año,
                'r2_proyectos_presion' => $proyectos_presion,
                'r2_proyectos_comprometer' => $proyectos_comprometer,
                'r2_total_proyectos' => $total_proyectos
            ];
        } else {
            // No existe un registro, crear uno nuevo
            $sqlInsert = "INSERT INTO resumen2 (
                          id_presupuesto,
                          r2_proyectos_presion,
                          r2_proyectos_comprometer,
                          r2_total_proyectos
                          ) VALUES (?, ?, ?, ?)";
            
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bind_param("iiii", 
                $id_presupuesto, 
                $proyectos_presion, 
                $proyectos_comprometer, 
                $total_proyectos
            );
            $stmtInsert->execute();
            
            $id_r2 = $conn->insert_id;
            
            $resumenData[] = [
                'id_r2' => $id_r2,
                'id_presupuesto' => $id_presupuesto,
                'a_numero_año' => $a_numero_año,
                'r2_proyectos_presion' => $proyectos_presion,
                'r2_proyectos_comprometer' => $proyectos_comprometer,
                'r2_total_proyectos' => $total_proyectos
            ];
        }
        
        $stmtResumen->close();
        $stmtPresionProyectos->close();
        $stmtProyectosComprometer->close();
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