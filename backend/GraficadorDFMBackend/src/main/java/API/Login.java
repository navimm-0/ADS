package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "Login", urlPatterns = {"/login"})
public class Login extends HttpServlet {

    private static final String DB_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DB_URL =
        "jdbc:mysql://localhost:3306/usuarios?useSSL=false&serverTimezone=UTC";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        String usuario = request.getParameter("usuario");
        String password = request.getParameter("password");

        boolean ok = false;
        String tipoUsuario = null;
        String mensaje;

        DB db = new DB();
        ResultSet rs = null;

        try {
            // Conexión a BD 'usuarios'
            db.setConnection(DB_DRIVER, DB_URL);

            // 👉 USAMOS LA TABLA 'login', NO 'usuarios'
            String sql = "SELECT TIPOUSUARIO FROM login " +
                         "WHERE USERNAME='" + usuario + "' " +
                         "AND PASSWORD='" + password + "'";

            rs = db.executeQuery(sql);

            if (rs.next()) {
                ok = true;
                tipoUsuario = rs.getString("TIPOUSUARIO");
                mensaje = "Bienvenido " + usuario;
            } else {
                mensaje = "Usuario o password incorrectos";
            }

        } catch (SQLException e) {
            e.printStackTrace();
            ok = false;
            mensaje = "Error interno en el servidor: " + e.getMessage();
        } finally {
            try {
                if (rs != null) rs.close();
                db.closeConnection();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }

        try (PrintWriter out = response.getWriter()) {
            if (ok) {
                out.print("{\"ok\":true,"
                        + "\"mensaje\":\"" + escapeJson(mensaje) + "\","
                        + "\"tipoUsuario\":\"" + escapeJson(tipoUsuario) + "\"}");
            } else {
                out.print("{\"ok\":false,"
                        + "\"mensaje\":\"" + escapeJson(mensaje) + "\"}");
            }
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}
