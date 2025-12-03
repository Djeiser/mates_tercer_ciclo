import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

console.log("API Key present:", !!API_KEY);
if (API_KEY) console.log("API Key length:", API_KEY.length);

if (!API_KEY) {
    console.error("Falta la API Key de Gemini en .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
console.log("Gemini Service initialized with model: gemini-2.0-flash");


export type ExerciseType = 'solve' | 'reformulate' | 'create' | 'multiples' | 'mental' | 'random';

export interface Exercise {
    type: ExerciseType;
    question: string;
    context?: string; // For "reformulate" or "create" types
    hint?: string;
}

export interface EvaluationResult {
    isCorrect: boolean;
    feedback: string;
    correction?: string;
}

const CONTEXTS = [
    "Espacio y astronautas", "Deportes y olimpiadas", "Cocina y recetas",
    "Videojuegos y programación", "Animales y zoológico", "Viajes y geografía",
    "Superhéroes", "Historia y castillos", "Fantasía y dragones", "Escuela y excursiones"
];

const getPrompt = (type: string): string => {
    const context = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];
    const randomNum = Math.floor(Math.random() * 1000); // Entropy seed

    switch (type) {
        case 'solve':
            return `
            Genera un problema de matemáticas para 5º de primaria (10-11 años).
            TEMA OBLIGATORIO: ${context}.
            Requisitos:
            - LONGITUD: Enunciado CORTO y directo (máximo 3 frases).
            - COMPLEJIDAD: Máximo 2 operaciones para resolverlo.
            - Operaciones permitidas: Suma, resta, multiplicación (x1 o x2 cifras), división (divisor <= 50).
            - IMPORTANTE: Usa números variados, NO uses siempre los mismos. Evita el 35 y 36.
            - Sin decimales.
            - Números < 99.999.
            - Formato JSON: { "type": "solve", "question": "Enunciado del problema", "hint": "Pista sutil" }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'reformulate':
            return `
            Genera un ejercicio de "Reformular Preguntas" para 5º de primaria.
            TEMA OBLIGATORIO: ${context}.
            Da un enunciado de un problema CORTO (2-3 líneas) PERO SIN PREGUNTA.
            El objetivo del alumno será escribir todas las preguntas posibles que se puedan responder con esos datos.
            Formato JSON: { "type": "reformulate", "question": "Escribe todas las preguntas que se puedan responder con este enunciado:", "context": "El enunciado del problema sin pregunta...", "hint": "Piensa en qué datos tienes y qué podrías calcular." }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'create':
            const ops = [
                "una multiplicación de dos números de dos cifras",
                "una división con resto",
                "una suma de tres números grandes",
                "una resta con llevadas",
                "el resultado 120",
                "el resultado 450",
                "el resultado 1500",
                "una operación combinada (suma y resta)",
                "el doble de un número",
                "la mitad de un precio",
                "tres paquetes de algo",
                "repartir caramelos entre amigos"
            ];
            const op = ops[Math.floor(Math.random() * ops.length)];
            return `
            Genera un ejercicio de "Inventar Problemas" para 5º de primaria.
            Requisito: El problema debe basarse en ${op}.
            TEMA OBLIGATORIO: ${context}.
            IMPORTANTE: VARIA LOS NÚMEROS. NO uses 35 ni 36. Usa números como 125, 840, 1500, etc.
            LONGITUD: Pide un enunciado breve.
            El objetivo del alumno es inventar un enunciado que encaje.
            Formato JSON: { "type": "create", "question": "Inventa un problema matemático de ${context} (breve) que se resuelva con:", "context": "La operación/dato concreto (${op})...", "hint": "Usa tu imaginación." }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'multiples':
            return `
            Genera un ejercicio de Múltiplos y Divisores para 5º de primaria.
            
            IMPORTANTE: NO incluyas ninguna historia, ni contexto, ni nombres de personajes.
            Quiero SOLO la pregunta matemática directa.
            
            Elige ALEATORIAMENTE uno de estos 3 tipos de preguntas:
            1. "Escribe todos los divisores de [número entre 10 y 50]".
            2. "Escribe los múltiplos de [número entre 2 y 9] que hay entre [Rango A] y [Rango B]".
            3. "¿Es [NumGrande] múltiplo de [NumPequeño]?" o "¿Es [NumPequeño] divisor de [NumGrande]?".
            
            Formato JSON: { "type": "multiples", "question": "La pregunta directa (ej: Escribe los múltiplos de 8 entre 30 y 70)", "hint": "Pista: Recuerda las tablas." }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'mental':
            const strategies = [
                "Sumar/Restar números terminados en cero (ej: 450 + 30)",
                "Multiplicar por 10, 100 o 1000",
                "Multiplicar por 11 o por 9 (trucos)",
                "Dobles y mitades (ej: doble de 145, mitad de 860)",
                "Sumar buscando el 10 o el 100 (números amigos)",
                "Restar compensando (redondeo)",
                "Divisiones exactas eliminando ceros (ej: 4500 : 90)",
                "Series numéricas (+15, -20, etc.)",
                "El 50% o el 25% de un número",
                "Multiplicar por 5 (mitad por 10) o por 50"
            ];
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];

            return `
            Genera un ejercicio de CÁLCULO MENTAL para 5º de primaria.
            ESTRATEGIA ESPECÍFICA: ${strategy}.
            
            Requisitos:
            - SOLO OPERACIONES ARITMÉTICAS.
            - PROHIBIDO poner enunciados de problemas, historias o contextos (nada de "Juan tiene...", "Un coche viaja...").
            - Formato directo: "Calcula:", "¿Cuánto es...?", o la operación directamente.
            - Usa la estrategia seleccionada (${strategy}).
            - VARIEDAD EXTREMA en los números.
            
            Formato JSON: { "type": "mental", "question": "Operación matemática (ej: 450 + 20)", "hint": "Pista: ${strategy}" }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        default:
            return "";
    }
};

export const generateExercise = async (type: ExerciseType): Promise<Exercise> => {
    let selectedType = type;
    if (type === 'random') {
        const types: ExerciseType[] = ['solve', 'reformulate', 'create', 'multiples', 'mental'];
        selectedType = types[Math.floor(Math.random() * types.length)];
    }

    const prompt = getPrompt(selectedType) + "\n Devuelve SOLO el JSON válido.";

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = text.substring(firstBrace, lastBrace + 1);
            return { ...JSON.parse(jsonStr), type: selectedType };
        }
        throw new Error("Invalid JSON");
    } catch (error) {
        console.error("Error generando ejercicio:", error);

        // GENERADOR ALGORÍTMICO LOCAL (Variedad Infinita Real)
        // Si la API falla, generamos un problema matemático al vuelo.
        const operations = ['sum', 'sub', 'mult', 'div', 'double', 'half'];
        const opType = operations[Math.floor(Math.random() * operations.length)];

        let q = "", h = "";

        switch (opType) {
            case 'sum':
                const a1 = Math.floor(Math.random() * 400) + 50;
                const b1 = Math.floor(Math.random() * 400) + 50;
                q = `Calcula: ${a1} + ${b1}`;
                h = "Suma las centenas, luego las decenas.";
                break;
            case 'sub':
                const a2 = Math.floor(Math.random() * 800) + 100;
                const b2 = Math.floor(Math.random() * 100) + 10;
                q = `Calcula: ${a2} - ${b2}`;
                h = "Resta primero las decenas.";
                break;
            case 'mult':
                const a3 = Math.floor(Math.random() * 20) + 2;
                const b3 = Math.floor(Math.random() * 9) + 2;
                // A veces x10 o x100
                if (Math.random() > 0.7) {
                    const zeros = Math.random() > 0.5 ? 10 : 100;
                    q = `Calcula: ${a3} x ${zeros}`;
                    h = "Añade los ceros al final.";
                } else {
                    q = `Calcula: ${a3} x ${b3}`;
                    h = "Usa las tablas de multiplicar.";
                }
                break;
            case 'div':
                const divisor = Math.floor(Math.random() * 8) + 2;
                const quotient = Math.floor(Math.random() * 50) + 10;
                const dividend = divisor * quotient;
                q = `Calcula: ${dividend} : ${divisor}`;
                h = "Busca un número que multiplicado por el divisor dé el dividendo.";
                break;
            case 'double':
                const numD = Math.floor(Math.random() * 200) + 10;
                q = `El doble de ${numD}`;
                h = "Multiplica por 2.";
                break;
            case 'half':
                const numH = (Math.floor(Math.random() * 200) + 10) * 2; // Par
                q = `La mitad de ${numH}`;
                h = "Divide entre 2.";
                break;
        }

        return {
            type: selectedType,
            question: q,
            hint: h
        };
    }
};

export const evaluateAnswer = async (exercise: Exercise, userAnswer: string): Promise<EvaluationResult> => {
    const prompt = `
    Actúa como un maestro de matemáticas de primaria amable y constructivo.
    Ejercicio (${exercise.type}):
    Enunciado/Contexto: ${exercise.question} ${exercise.context || ''}
    
    Respuesta del alumno: "${userAnswer}"
    
    Evalúa la respuesta.
    - Si es correcta, felicítalo y explica brevemente por qué.
    - Si es incorrecta o incompleta, explica el error y da la solución correcta de forma pedagógica.
    - Si es un ejercicio abierto (inventar problema), valora la creatividad y si tiene sentido matemático.
    
    Devuelve SOLO un JSON:
    {
      "isCorrect": boolean,
      "feedback": "Tu explicación aquí...",
      "correction": "La solución ideal (si aplica)"
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Raw evaluation response:", text); // Debug log

        // More robust JSON extraction
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonStr = text.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonStr);
        } else {
            throw new Error("No valid JSON found in response");
        }
    } catch (error: any) {
        console.error("Error evaluando respuesta:", error);
        return {
            isCorrect: false,
            feedback: `Hubo un error técnico al evaluar tu respuesta: ${error.message || error}. Inténtalo de nuevo, por favor.`,
        };
    }
};
