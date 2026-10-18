import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAIAnalysis() {
    console.log('🤖 Iniciando análisis contextual con LangChain y Gemini...');

    // 1. Leer TODOS los archivos relevantes del framework E2E
    const pomPath = path.join(__dirname, '../pages/DashboardPage.ts');
    const statusEnumPath = path.join(__dirname, '../enums/OrderStatus.ts');
    const buttonEnumPath = path.join(__dirname, '../enums/ButtonActions.ts');
    const specPath = path.join(__dirname, '../tests/orders.spec.ts');

    const pomCode = fs.readFileSync(pomPath, 'utf-8');
    const statusEnumCode = fs.readFileSync(statusEnumPath, 'utf-8');
    const buttonEnumCode = fs.readFileSync(buttonEnumPath, 'utf-8');
    const specCode = fs.readFileSync(specPath, 'utf-8');

    // 2. Configurar el modelo
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
        maxOutputTokens: 2048,
        temperature: 0.8,
    });

    // 3. Crear el Prompt Template
    const promptTemplate = PromptTemplate.fromTemplate(`
    Eres un Ingeniero de Pruebas QA Automation Senior con más de 7 años de experiencia en la construcción
    diseño, analisis y creación de escenarios, tests, pruebas E2E y automatización con playwright. Revisa la siguiente arquitectura de pruebas E2E en Playwright:
    
    Page Object Model:
    {pom}
    
    Estados de la Orden (OrderStatus):
    {statusEnum}

    Acciones de Botones (ButtonAction):
    {buttonEnum}

    Pruebas Actuales Ya Automatizadas:
    {tests}
    
    Tu tarea es generar un reporte técnico que contenga:
    1. Identificación de 3 escenarios de prueba faltantes (Edge cases, flujos negativos o alternativos) QUE AÚN NO ESTÉN CUBIERTOS en las pruebas actuales. Ten en cuenta las combinaciones de botones y estados.
    2. 2 recomendaciones de diseño de pruebas basadas en riesgo considerando la lógica vista.
    3. Una matriz de trazabilidad en formato tabla Markdown que relacione las acciones de los botones, los estados esperados de la orden y mencione si está "✅ Automatizado" o "❌ Pendiente".
    
    Responde ÚNICAMENTE en formato Markdown puro, estructurado y profesional, sin saludos ni frases de cortesía.
    Ten en cuenta las buenas practicas, Clean Code, SOLID, DRY, KISS, Y DEMAS PRINCIPIOS DE PROGRAMACIÓN, Arquitectura Hexagonal, Clean Architecture.
    Además ten en cuenta la legibilidad del código, la maintainability, escalabilidad, y robustez, las pruebas deben ser mantenibles, escalables y robustas.
  `);

    const chain = promptTemplate.pipe(model);

    // 5. Ejecutar la IA
    console.log('⏳ Evaluando cobertura y calculando escenarios faltantes...');
    const response = await chain.invoke({
        pom: pomCode,
        statusEnum: statusEnumCode,
        buttonEnum: buttonEnumCode,
        tests: specCode
    });

    // 6. Guardar el resultado
    const outputPath = path.join(__dirname, '../../AI_TEST_RECOMMENDATIONS.md');
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    fs.writeFileSync(outputPath, content);

    console.log(`✅ ¡Análisis completado! La IA ha generado recomendaciones basadas en todo tu ecosistema. Revisa: AI_TEST_RECOMMENDATIONS.md`);
}

runAIAnalysis().catch(console.error);