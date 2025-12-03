import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
    console.error("Falta la API Key de Gemini en .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export type ExerciseType = 'solve' | 'reformulate' | 'create' | 'multiples' | 'mental' | 'random' | 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Exercise {
    type: ExerciseType;
    question: string;
    context?: string;
    hint?: string;
    correctAnswer?: string; // For local validation
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

// Local Random Number Generator
const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format number with dots for thousands (Spanish locale)
const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES');
};

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

const generateLocalExercise = (type: ExerciseType): Exercise => {
    let num1, num2, answer;

    switch (type) {
        case 'addition':
            // Two numbers between 500 and 999,999
            num1 = getRandomInt(500, 999999);
            num2 = getRandomInt(500, 999999);
            answer = num1 + num2;
            return {
                type,
                question: `Calcula: ${formatNumber(num1)} + ${formatNumber(num2)}`,
                correctAnswer: answer.toString(),
                hint: "Coloca bien los números, unidades con unidades."
            };

        case 'subtraction':
            // Minuend 500-999,999. Subtrahend < Minuend.
            num1 = getRandomInt(500, 999999);
            num2 = getRandomInt(500, num1 - 1); // Ensure positive result
            answer = num1 - num2;
            return {
                type,
                question: `Calcula: ${formatNumber(num1)} - ${formatNumber(num2)}`,
                correctAnswer: answer.toString(),
                hint: "Recuerda las llevadas."
            };

        case 'multiplication':
            // Multiplicand 500-99,999. Multiplier 1-250.
            num1 = getRandomInt(500, 99999);
            num2 = getRandomInt(1, 250);
            answer = num1 * num2;
            return {
                type,
                question: `Calcula: ${formatNumber(num1)} × ${formatNumber(num2)}`,
                correctAnswer: answer.toString(),
                hint: "Multiplica primero por las unidades, luego decenas..."
            };

        case 'division':
            // Dividend 500-99,999. Divisor 2-75.
            num2 = getRandomInt(2, 75); // Divisor
            const maxQuotient = Math.floor(99999 / num2);
            const minQuotient = Math.ceil(500 / num2);
            const quotient = getRandomInt(minQuotient, maxQuotient);

            num1 = quotient * num2; // Dividend
            answer = quotient;

            return {
                type,
                question: `Calcula: ${formatNumber(num1)} ÷ ${formatNumber(num2)}`,
                correctAnswer: answer.toString(),
                hint: "Busca un número que multiplicado por el divisor te dé el dividendo."
            };

        default:
            throw new Error("Tipo de cálculo no soportado localmente");
    }
};

export const generateExercise = async (type: ExerciseType): Promise<Exercise> => {
    // Check if it's a local calculation type
    if (['addition', 'subtraction', 'multiplication', 'division'].includes(type)) {
        // Simulate async delay for consistency
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateLocalExercise(type);
    }

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
        // Fallback to local generation if API fails (simplified for now)
        return generateLocalExercise('addition'); // Fallback to addition
    }
};

export const evaluateAnswer = async (exercise: Exercise, userAnswer: string): Promise<EvaluationResult> => {
    // Local evaluation for calculation types
    if (exercise.correctAnswer) {
        // Remove dots/commas from user answer for loose comparison
        const cleanUserAnswer = userAnswer.replace(/[.,]/g, '').trim();
        const cleanCorrectAnswer = exercise.correctAnswer.replace(/[.,]/g, '').trim();

        const isCorrect = cleanUserAnswer === cleanCorrectAnswer;

        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            isCorrect,
            feedback: isCorrect
                ? "¡Correcto! 🎉 Has hecho el cálculo perfecto."
                : `Casi... La respuesta correcta era ${exercise.correctAnswer}. ¡Revísalo!`
        };
    }

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
