import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const respostaAluno = body.resposta;

    if (!respostaAluno) {
      return NextResponse.json({
        erro: "Resposta não enviada.",
      });
    }

    const prompt = `
Você é um corretor OFICIAL da FGV/OAB especializado em Direito Tributário.

Corrija a peça abaixo exatamente no padrão da OAB.

Analise:

- estrutura da peça;
- fundamentação;
- artigos;
- teses jurídicas;
- pedidos;
- clareza;
- técnica processual;
- português jurídico.

Depois forneça:

1. Nota da peça (0 a 5)
2. Nota das questões (0 a 5)
3. Nota final (0 a 10)
4. Status:
   - APROVADO se >= 8
   - REPROVADO se < 8

Depois mostre:

- erros encontrados;
- fundamentos faltantes;
- como melhorar;
- espelho resumido estilo FGV.

RESPOSTA DO ALUNO:

${respostaAluno}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um examinador extremamente rigoroso da FGV/OAB.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const texto =
      completion.choices[0]?.message?.content ||
      "Erro na correção.";

    return NextResponse.json({
      resultado: texto,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      erro: "Erro interno da IA.",
    });
  }
}