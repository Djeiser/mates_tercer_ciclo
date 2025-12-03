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
            const structures = [
                "Primero una multiplicación y luego una resta",
                "Primero una suma y luego una división",
                "Una división y luego una suma",
                "Dos multiplicaciones y luego sumar los resultados",
                "Una resta y luego una multiplicación"
            ];
            const structure = structures[Math.floor(Math.random() * structures.length)];

            return `
            Genera un problema de matemáticas para 5º de Primaria (10-11 años).
            TEMA OBLIGATORIO: ${context}.
            
            Requisitos de DIFICULTAD (Nivel 5º Avanzado):
            - ESTRUCTURA OBLIGATORIA: ${structure}.
            - Incluye números que requieran cálculo: Multiplicaciones por 2 cifras (ej: 345 x 23) o Divisiones por 2 cifras (ej: 4500 : 15).
            - Evita números demasiado simples o redondos.
            - Enunciado claro pero que obligue a pensar. Máximo 4 frases.
            
            Formato JSON: { 
                "type": "solve", 
                "question": "Enunciado del problema", 
                "hint": "Pista: Piensa qué tienes que calcular primero.",
                "solution": "Solo el número resultado final (ej: 1450)"
            }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'reformulate':
            return `
            Genera un ejercicio de "Reformular la pregunta" para 5º de Primaria.
            TEMA OBLIGATORIO: ${context}.
            
            Te doy unos datos complejos (ej: precios con decimales, cantidades grandes, varias operaciones).
            El alumno debe escribir una pregunta que requiera al menos 2 pasos para responderse.
            
            Formato JSON: { 
                "type": "reformulate", 
                "question": "Escribe todas las preguntas que se puedan responder con este enunciado:", 
                "context": "El enunciado del problema sin pregunta...", 
                "hint": "Busca una pregunta que use todos los datos." 
            }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'create':
            const ops = [
                "una multiplicación de 2 cifras y una resta",
                "una división de 2 cifras y una suma",
                "dos multiplicaciones y una suma",
                "una resta y una división"
            ];
            const selectedOp = ops[Math.floor(Math.random() * ops.length)];
            return `
            Pide al alumno que INVENTE un problema de 5º de Primaria.
            Requisito: Debe resolverse usando ${selectedOp}.
            TEMA: ${context}.
            
            Formato JSON: { "type": "create", "question": "Inventa un problema matemático de ${context} (breve) que se resuelva con:", "context": "La operación/dato concreto (${selectedOp})...", "hint": "Piensa en una situación real." }
            (Semilla de aleatoriedad: ${randomNum})
            `;
        case 'multiples':
            return `
            Genera un ejercicio de Múltiplos y Divisores para 5º de primaria.
            
            IMPORTANTE: NO incluyas ninguna historia, ni contexto, ni nombres de personajes.
            Quiero SOLO la pregunta matemática directa.
            
            Elige ALEATORIAMENTE uno de estos 3 tipos de preguntas:
            1. "Escribe todos los divisores de [número entre 20 y 80]".
            2. "Escribe los múltiplos de [número entre 5 y 15] que hay entre [Rango A] y [Rango B]".
            3. "¿Es [NumGrande] múltiplo de [NumPequeño]?" o "¿Es [NumPequeño] divisor de [NumGrande]?".
            
            Formato JSON: { 
                "type": "multiples", 
                "question": "La pregunta directa (ej: Escribe los múltiplos de 8 entre 30 y 70)", 
                "hint": "Pista: Recuerda las tablas.",
                "solution": "La respuesta correcta (ej: 32, 40, 48...)"
            }
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
            
            Formato JSON: { 
                "type": "mental", 
                "question": "Operación matemática (ej: 450 + 20)", 
                "hint": "Pista: ${strategy}",
                "solution": "El resultado numérico"
            }
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
            // Multiplicand 500-99,999. Multiplier 10-99 (2 digits).
            num1 = getRandomInt(500, 99999);
            num2 = getRandomInt(10, 99);
            answer = num1 * num2;
            return {
                type,
                question: `Calcula: ${formatNumber(num1)} × ${formatNumber(num2)}`,
                correctAnswer: answer.toString(),
                hint: "Multiplica primero por las unidades, luego decenas..."
            };

        case 'division':
            // Dividend 500-99,999. Divisor 10-99 (2 digits).
            num2 = getRandomInt(10, 99); // Divisor 2 digits
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
            const parsed = JSON.parse(jsonStr);
            // Map 'solution' from JSON to 'correctAnswer' in our internal model
            return {
                ...parsed,
                type: selectedType,
                correctAnswer: parsed.solution || parsed.correctAnswer // Handle both just in case
            };
        }
        throw new Error("Invalid JSON");
    } catch (error) {
        console.error("Error generando ejercicio:", error);

        // Fallback robusto por tipo de ejercicio
        switch (selectedType) {
            case 'mental':
                // GENERADOR ALGORÍTMICO LOCAL (Variedad Infinita Real)
                const operations = ['sum', 'sub', 'mult', 'div', 'double', 'half'];
                const opType = operations[Math.floor(Math.random() * operations.length)];

                let q = "", h = "";
                let ans = "";

                switch (opType) {
                    case 'sum':
                        const a1 = Math.floor(Math.random() * 400) + 50;
                        const b1 = Math.floor(Math.random() * 400) + 50;
                        q = `Calcula: ${a1} + ${b1}`;
                        h = "Suma las centenas, luego las decenas.";
                        ans = (a1 + b1).toString();
                        break;
                    case 'sub':
                        const a2 = Math.floor(Math.random() * 800) + 100;
                        const b2 = Math.floor(Math.random() * 100) + 10;
                        q = `Calcula: ${a2} - ${b2}`;
                        h = "Resta primero las decenas.";
                        ans = (a2 - b2).toString();
                        break;
                    case 'mult':
                        const a3 = Math.floor(Math.random() * 20) + 2;
                        const b3 = Math.floor(Math.random() * 9) + 2;
                        if (Math.random() > 0.7) {
                            const zeros = Math.random() > 0.5 ? 10 : 100;
                            q = `Calcula: ${a3} x ${zeros}`;
                            h = "Añade los ceros al final.";
                            ans = (a3 * zeros).toString();
                        } else {
                            q = `Calcula: ${a3} x ${b3}`;
                            h = "Usa las tablas de multiplicar.";
                            ans = (a3 * b3).toString();
                        }
                        break;
                    case 'div':
                        const divisor = Math.floor(Math.random() * 8) + 2;
                        const quotient = Math.floor(Math.random() * 50) + 10;
                        const dividend = divisor * quotient;
                        q = `Calcula: ${dividend} : ${divisor}`;
                        h = "Busca un número que multiplicado por el divisor dé el dividendo.";
                        ans = quotient.toString();
                        break;
                    case 'double':
                        const numD = Math.floor(Math.random() * 200) + 10;
                        q = `El doble de ${numD}`;
                        h = "Multiplica por 2.";
                        ans = (numD * 2).toString();
                        break;
                    case 'half':
                        const numH = (Math.floor(Math.random() * 200) + 10) * 2; // Par
                        q = `La mitad de ${numH}`;
                        h = "Divide entre 2.";
                        ans = (numH / 2).toString();
                        break;
                }
                return { type: 'mental', question: q, hint: h, correctAnswer: ans };

            case 'solve':
                // ALGORÍTMICO PARA PROBLEMAS (Variedad Infinita Local)
                const solveTemplates = [
                    {
                        t: "Un camión lleva ${n1} cajas de ${n2} kg. Si descargan ${n3} kg, ¿cuántos kg quedan?",
                        gen: () => {
                            const n1 = getRandomInt(50, 200);
                            const n2 = getRandomInt(10, 50);
                            const total = n1 * n2;
                            const n3 = getRandomInt(100, total - 100);
                            return { q: `Un camión lleva ${n1} cajas de ${n2} kg. Si descargan ${n3} kg, ¿cuántos kg quedan?`, a: (total - n3).toString() };
                        },
                        h: "Calcula el peso total y resta lo que descargan."
                    },
                    {
                        t: "En un cine hay ${n1} filas con ${n2} butacas. Si se han vendido ${n3} entradas, ¿cuántas butacas quedan libres?",
                        gen: () => {
                            const n1 = getRandomInt(10, 30);
                            const n2 = getRandomInt(10, 40);
                            const total = n1 * n2;
                            const n3 = getRandomInt(50, total - 10);
                            return { q: `En un cine hay ${n1} filas con ${n2} butacas. Si se han vendido ${n3} entradas, ¿cuántas butacas quedan libres?`, a: (total - n3).toString() };
                        },
                        h: "Calcula el total de butacas y resta las entradas vendidas."
                    },
                    {
                        t: "He comprado ${n1} libros a ${n2}€ cada uno. Si pago con un billete de ${n3}€, ¿cuánto me devuelven?",
                        gen: () => {
                            const n1 = getRandomInt(3, 12);
                            const n2 = getRandomInt(10, 25);
                            const cost = n1 * n2;
                            const n3 = Math.ceil(cost / 50) * 50 + (Math.random() > 0.5 ? 0 : 50); // Billete mayor al coste
                            return { q: `He comprado ${n1} libros a ${n2}€ cada uno. Si pago con un billete de ${n3}€, ¿cuánto me devuelven?`, a: (n3 - cost).toString() };
                        },
                        h: "Multiplica precio por cantidad y resta al dinero que entregas."
                    },
                    {
                        t: "Un depósito tiene ${n1} litros. Se sacan ${n2} litros y luego se echan ${n3} litros. ¿Cuántos litros hay ahora?",
                        gen: () => {
                            const n1 = getRandomInt(1000, 5000);
                            const n2 = getRandomInt(100, 900);
                            const n3 = getRandomInt(100, 900);
                            return { q: `Un depósito tiene ${n1} litros. Se sacan ${n2} litros y luego se echan ${n3} litros. ¿Cuántos litros hay ahora?`, a: (n1 - n2 + n3).toString() };
                        },
                        h: "Sigue los pasos: resta lo que sacas y suma lo que echas."
                    },
                    {
                        t: "Repartimos ${n1} caramelos entre ${n2} niños. Si sobran ${n3}, ¿cuántos caramelos tenía al principio? (Inversa)",
                        gen: () => {
                            const n2 = getRandomInt(5, 25); // Niños
                            const cociente = getRandomInt(10, 50); // Caramelos por niño
                            const n3 = getRandomInt(1, n2 - 1); // Resto
                            const n1 = (n2 * cociente) + n3;
                            return { q: `He repartido caramelos entre ${n2} niños. A cada uno le han tocado ${cociente} y han sobrado ${n3}. ¿Cuántos caramelos tenía?`, a: n1.toString() };
                        },
                        h: "Prueba de la división: divisor x cociente + resto."
                    }
                ];

                const selectedTemplate = solveTemplates[Math.floor(Math.random() * solveTemplates.length)];
                const generated = selectedTemplate.gen();
                return { type: 'solve', question: generated.q, hint: selectedTemplate.h, correctAnswer: generated.a };

            case 'reformulate':
                const refTemplates = [
                    "He comprado 5 camisetas a 12€ y 3 pantalones a 25€.",
                    "Un tren recorre 450 km en 3 horas y otro recorre 600 km en 5 horas.",
                    "En una granja hay 120 vacas y el doble de ovejas.",
                    "Tengo 50€ y quiero comprar 3 juegos que cuestan 18€ cada uno.",
                    "Un libro tiene 240 páginas. He leído la mitad ayer y hoy 30 páginas más."
                ];
                const refText = refTemplates[Math.floor(Math.random() * refTemplates.length)];
                return {
                    type: 'reformulate',
                    question: `Escribe una pregunta matemática para este enunciado: "${refText}"`,
                    hint: "Piensa qué dato podrías calcular con esa información."
                };

            case 'create':
                const createOps = [
                    "(125 x 4) - 150",
                    "2500 : 25 + 100",
                    "50 x 12 + 30",
                    "1000 - (15 x 10)",
                    "La mitad de 500 más 150"
                ];
                const cOp = createOps[Math.floor(Math.random() * createOps.length)];
                return {
                    type: 'create',
                    question: `Inventa un problema que se resuelva con: ${cOp}`,
                    context: "La operación está dada, tú pones la historia.",
                    hint: "Imagina una situación de compras, viajes o reparto."
                };

            case 'multiples':
                const mType = Math.random();
                if (mType < 0.33) {
                    const n = getRandomInt(12, 40);
                    return { type: 'multiples', question: `Escribe los 5 primeros múltiplos de ${n}.`, hint: "Multiplica por 1, 2, 3..." };
                } else if (mType < 0.66) {
                    const n = getRandomInt(20, 60);
                    return { type: 'multiples', question: `Escribe todos los divisores de ${n}.`, hint: "Busca divisiones exactas." };
                } else {
                    const n1 = getRandomInt(3, 9);
                    const n2 = getRandomInt(100, 900);
                    return { type: 'multiples', question: `¿Es ${n2} múltiplo de ${n1}?`, hint: "Divide y mira si el resto es 0." };
                }

            default:
                // Si todo falla, un problema básico
                return { type: 'solve', question: "Calcula 12 + 12", hint: "Suma básica", correctAnswer: "24" };
        }
    }
};

export const evaluateAnswer = async (exercise: Exercise, userAnswer: string): Promise<EvaluationResult> => {
    // Helper for loose comparison
    const checkAnswer = (user: string, correct: string): boolean => {
        const cleanUser = user.toLowerCase().replace(/[.,€$]/g, '').trim();
        const cleanCorrect = correct.toLowerCase().replace(/[.,€$]/g, '').trim();

        // Exact match
        if (cleanUser === cleanCorrect) return true;

        // Number match (if user wrote "2500 kg" and answer is "2500")
        const userNums = cleanUser.match(/\d+/g);
        const correctNums = cleanCorrect.match(/\d+/g);
        if (userNums && correctNums && userNums.join('') === correctNums.join('')) return true;

        return false;
    };

    // 1. Local evaluation (Backup & Validation)
    let localIsCorrect: boolean | null = null;
    if (exercise.correctAnswer) {
        localIsCorrect = checkAnswer(userAnswer, exercise.correctAnswer);
    }

    const prompt = `
    Actúa como un maestro de matemáticas de primaria amable y constructivo.
    Ejercicio (${exercise.type}):
    Enunciado/Contexto: ${exercise.question} ${exercise.context || ''}
    ${exercise.correctAnswer ? `SOLUCIÓN CORRECTA ESPERADA: ${exercise.correctAnswer}` : ''}
    
    Respuesta del alumno: "${userAnswer}"
    
    Evalúa la respuesta.
    - Si es correcta, felicítalo y explica brevemente por qué (o el paso clave).
    - Si es incorrecta o incompleta, explica el error y da la solución correcta de forma pedagógica.
    - Si es un ejercicio abierto (inventar problema), valora la creatividad y si tiene sentido matemático.
    
    Responde en español, con tono animado.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return {
            // Trust local validation if available (for strict checking), otherwise assume success (for open-ended AI evaluation)
            isCorrect: localIsCorrect !== null ? localIsCorrect : true,
            feedback: response.text()
        };
    } catch (error) {
        console.error("Error evaluando respuesta:", error);

        // Fallback if AI fails
        if (localIsCorrect !== null) {
            return {
                isCorrect: localIsCorrect,
                feedback: localIsCorrect
                    ? "¡Correcto! (Validado automáticamente)"
                    : `No es correcto. La solución era: ${exercise.correctAnswer}. ¡Inténtalo de nuevo!`
            };
        }

        return {
            isCorrect: false,
            feedback: "Hubo un error al evaluar tu respuesta y no tengo la solución guardada. ¡Pero seguro que lo has hecho genial! Inténtalo de nuevo."
        };
    }
};
