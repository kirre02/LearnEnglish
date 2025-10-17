import express from 'express';
import { saveResult, getUserResults } from '../controllers/resultController.js';

const router = express.Router();

// Spara nytt quiz-resultat
router.post('/results', saveResult);

// Hämta alla resultat för en användare
router.get('/results/:userId', getUserResults);

export default router;