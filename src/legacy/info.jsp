<html>
<head>
    <title>Legacy Application Status</title>
</head>
<body>
    <h1>✅ Aplicación Heretada (Tomcat / JSP)</h1>
    <p>Este servicio está funcionando en el puerto interno 8080.</p>
    <p>Simula un servicio antiguo que el Task Worker podría consumir a través de la red `legacy-net`.</p>
    <h2>Conexión a MariaDB</h2>
    <%
        // Simulación de la conexión (sin implementar JDBC real)
        String dbStatus = "MARIADB: Conexión simulada OK a la-mariadb.";
        out.println("<p><strong>" + dbStatus + "</strong></p>");
    %>
</body>
</html>
