const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express(); // Instancia de express
app.use(express.json()); // Middleware Configuración de express para usar JSON
app.use(cors()); // Evita errores al hacer solicitudes de Postman con CORS

const mongoUri = process.env.MONGODEB_URI;

try {
    mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB");
} catch (error) {
    console.log("Error de conexión", error);
}

const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
});

const Libro = mongoose.model("Libro", libroSchema);

// Autenticación por token (middleware)
app.use((req, res, next) => {
    const authToken = req.headers["authorization"];

    if (authToken === "miTokenSecreto123") {
        next();
    } else {
        res.status(401).send("Acceso no autorizado");
    }
});

// Endpoints API
// Crear libro
app.post("/libros", async (req, res) => {
    const libro = new Libro({
        titulo: req.body.titulo,
        autor: req.body.autor,
    });

    try {
        await libro.save();
        res.json(libro);
    } catch (error) {
        res.status(500).send("Error al guardar libro", error);
    }
});

// Pedir listado de libros
app.get("/libros", async (req, res) => {
    try {
        const libros = await Libro.find();
        res.json(libros);
    } catch (error) {
        res.status(500).send("Error al obtener los libros", error);
    }
});

// Actualizar información de un libro
app.put("/libros/:id/", async (req, res) => {
    try {
        let id = req.params.id;
        const libro = await Libro.findByIdAndUpdate(
            id,
            { titulo: req.body.titulo, autor: req.body.autor },
            { new: true }
        );

        if (libro) {
            res.json(libro);
        } else {
            res.status(404).send("Libro no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al actualizar el libro", error);
    }
});

// Eliminar libro
app.delete("/libros/:id", async (req, res) => {
    try {
        const libro = await Libro.findByIdAndDelete(req.params.id);

        if (libro) {
            res.status(204).send("Libro eliminado");
        } else {
            res.status(404).send("Libro no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al eliminar el libro", error);
    }
});

// Pedir libro por id
app.get("/libros/:id", async (req, res) => {
    try {
        const libro = await Libro.findById(req.params.id);

        if (libro) {
            res.json(libro);
        } else {
            res.status(404).send("Libro no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al obtener el libro", error);
    }
});

// Levanta el servidor local
app.listen(3000, () => {
    console.log("Servidor está ejecutandose en http://localhost:3000/");
});
