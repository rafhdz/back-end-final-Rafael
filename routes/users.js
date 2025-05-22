const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const { sql, pool, poolConnect } = require("../db");

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       409:
 *         description: El nombre de usuario ya está en uso
 */
router.post("/", async (req, res) => {
  await poolConnect;
  const { username, password, correo } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const request = pool.request();
    await request
      .input("NombreUsuario", sql.NVarChar, username)
      .input("ContrasenaHash", sql.NVarChar, hashed)
      .input("CorreoElectronico", sql.NVarChar, correo || null).query(`
        INSERT INTO Usuarios_Rafael (NombreUsuario, ContrasenaHash, CorreoElectronico)
        VALUES (@NombreUsuario, @ContrasenaHash, @CorreoElectronico)
      `);
    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res
        .status(409)
        .json({ message: "El nombre de usuario ya está en uso" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Autenticar usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generado
 */
router.post("/login", async (req, res) => {
  await poolConnect;
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  try {
    const result = await pool
      .request()
      .input("NombreUsuario", sql.NVarChar, username)
      .query(
        "SELECT * FROM Usuarios_Rafael WHERE NombreUsuario = @NombreUsuario"
      );
    const user = result.recordset[0];
    if (!user)
      return res.status(401).json({ message: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.ContrasenaHash);
    if (!valid)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const payload = {
      id: user.UsuarioID,
      username: user.NombreUsuario,
      correo: user.CorreoElectronico,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", authenticateToken, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool
      .request()
      .query(
        "SELECT UsuarioID, NombreUsuario, CorreoElectronico, FechaRegistro, EsActivo FROM Usuarios_Rafael"
      );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: No encontrado
 */
router.get("/:id", authenticateToken, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool
      .request()
      .input("UsuarioID", sql.Int, req.params.id)
      .query(
        "SELECT UsuarioID, NombreUsuario, CorreoElectronico, FechaRegistro, EsActivo FROM Usuarios_Rafael WHERE UsuarioID = @UsuarioID"
      );
    if (!result.recordset[0])
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               correo:
 *                 type: string
 *               esActivo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 */
router.put("/:id", authenticateToken, async (req, res) => {
  await poolConnect;
  const { username, password, correo, esActivo } = req.body;
  try {
    let fields = [];
    const request = pool.request().input("UsuarioID", sql.Int, req.params.id);
    if (username) {
      fields.push("NombreUsuario=@NombreUsuario");
      request.input("NombreUsuario", sql.NVarChar, username);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("ContrasenaHash=@ContrasenaHash");
      request.input("ContrasenaHash", sql.NVarChar, hashed);
    }
    if (correo !== undefined) {
      fields.push("CorreoElectronico=@CorreoElectronico");
      request.input("CorreoElectronico", sql.NVarChar, correo);
    }
    if (esActivo !== undefined) {
      fields.push("EsActivo=@EsActivo");
      request.input("EsActivo", sql.Bit, esActivo);
    }
    if (fields.length === 0)
      return res.status(400).json({ message: "No hay campos para actualizar" });
    const query = `UPDATE Usuarios_Rafael SET ${fields.join(
      ", "
    )} WHERE UsuarioID = @UsuarioID`;
    await request.query(query);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res
        .status(409)
        .json({ message: "El nombre de usuario ya está en uso" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  await poolConnect;
  try {
    await pool
      .request()
      .input("UsuarioID", sql.Int, req.params.id)
      .query("DELETE FROM Usuarios_Rafael WHERE UsuarioID = @UsuarioID");
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
