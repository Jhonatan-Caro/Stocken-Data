import express from 'express';
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/api/chat', verifyToken, async (req, res) => {
    console.log("➡️ Nueva solicitud recibida en /api/chat");
    const usuario_id = req.user.id
    const { question } = req.body;
    console.log("Pregunta:", question);
    console.log("Usuario ID extraído del token:", usuario_id);

    try{
        const response = await fetch('http://172.30.0.1:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question, 
                usuario_id: usuario_id, // Asegúrate de que el usuario esté autenticado y tenga un ID
            }),
    })
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.message || 'Error en la solicitud al ChatBot');
    }
    console.log("Respuesta del ChatBot:", data.respuesta);

    res.status(200).json({ respuesta: data.respuesta });

    }catch (error) {
        console.error('Error al procesar la solicitud del ChatBot:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud del ChatBot' });
    }
    
});

export default router;