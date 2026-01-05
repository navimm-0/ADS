package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;

@WebServlet(name = "Crud", urlPatterns = {"/crud"})
public class Crud extends HttpServlet {

    // CONEXIÓN A LA BASE DE DATOS 'crudjson'
    private static final String DB_DRIVER = "com.mysql.cj.jdbc.Driver";
    // Asegúrate de que la contraseña (último parámetro en DB.java) coincida con la tuya
    private static final String DB_URL = "jdbc:mysql://localhost:3306/crudjson?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";

    // --- VER DATOS (GET) ---
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        configurarCORS(response);
        response.setContentType("application/json;charset=UTF-8");
        
        DB db = new DB();
        ResultSet rs = null;
        
        try (PrintWriter out = response.getWriter()) {
            db.setConnection(DB_DRIVER, DB_URL);
            String sql = "SELECT idEjercicio, columnajson FROM tablajson";
            rs = db.executeQuery(sql);
            
            StringBuilder jsonArray = new StringBuilder("[");
            boolean primero = true;
            
            while (rs.next()) {
                if (!primero) jsonArray.append(",");
                int idDb = rs.getInt("idEjercicio");
                String contenidoJson = rs.getString("columnajson");
                
                // Validación básica para evitar nulls
                if (contenidoJson == null) contenidoJson = "{}";

                jsonArray.append("{")
                         .append("\"id_db\":").append(idDb).append(",")
                         .append("\"datos\":").append(contenidoJson)
                         .append("}");
                primero = false;
            }
            jsonArray.append("]");
            out.print(jsonArray.toString());
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try { if(rs != null) rs.close(); db.closeConnection(); } catch(Exception e){}
        }
    }

    // --- GUARDAR NUEVO (POST) ---
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // 1. Configuración básica
        configurarCORS(response);
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        
        // 2. ¿Viene un ID en la URL? (Ej: .../crud?id=5)
        String id = request.getParameter("id");
        
        // 3. Leemos el JSON del cuerpo
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }
        String jsonRecibido = sb.toString().replace("'", "\\'"); // Evitar error de comillas

        DB db = new DB();
        try (PrintWriter out = response.getWriter()) {
            db.setConnection(DB_DRIVER, DB_URL);
            String sql;
            
            // --- LÓGICA INTELIGENTE ---
            if (id != null && !id.isEmpty() && !id.equals("null") && !id.equals("undefined")) {
                // Si HAY ID -> Es una EDICIÓN (UPDATE)
                System.out.println("Modo EDITAR ID: " + id);
                sql = "UPDATE tablajson SET columnajson='" + jsonRecibido + "' WHERE idEjercicio=" + id;
            } else {
                // Si NO hay ID -> Es NUEVO (INSERT)
                System.out.println("Modo NUEVO (Guardar)");
                sql = "INSERT INTO tablajson (columnajson) VALUES ('" + jsonRecibido + "')";
            }
            
            // Ejecutamos
            db.executeUpdate(sql);
            out.print("{\"ok\":true, \"mensaje\":\"Operación Exitosa\"}");
            
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().print("{\"ok\":false, \"error\":\"" + e.getMessage() + "\"}");
        } finally {
            try { db.closeConnection(); } catch(Exception e){}
        }
    }

    // --- ACTUALIZAR (PUT) ---
    // Este método captura la petición PUT que envía React y la manda al doPost
    // donde ya tienes la lógica de "UPDATE ... WHERE id=..."
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }
    // --- ELIMINAR (DELETE) ---
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        configurarCORS(response);
        String idDb = request.getParameter("id"); 
        
        DB db = new DB();
        try (PrintWriter out = response.getWriter()) {
            db.setConnection(DB_DRIVER, DB_URL);
            String sql = "DELETE FROM tablajson WHERE idEjercicio=" + idDb;
            db.executeUpdate(sql);
            out.print("{\"ok\":true, \"mensaje\":\"Eliminado\"}");
        } catch (Exception e) {
             response.getWriter().print("{\"ok\":false}");
        } finally {
            try { db.closeConnection(); } catch(Exception e){}
        }
    }
    
    
    
    // Configuración CORS para que React pueda conectarse
    private void configurarCORS(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        configurarCORS(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }
}