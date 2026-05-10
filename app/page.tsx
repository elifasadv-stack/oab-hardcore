"use client";

import { useMemo, useState } from "react";

type Aba = "peca" | "questoes" | "correcao" | "revisao" | "testes";

type ResultadoFinal = {
  questoes: number;
  final: number;
  aprovado: boolean;
};

type CriterioPeca = {
  nome: string;
  pontos: number;
};

type QuestaoHard = {
  enunciado: string;
  foco: string;
};

const criteriosPeca: CriterioPeca[] = [
  { nome: "enderecamento", pontos: 0.4 },
  { nome: "qualificacao", pontos: 0.3 },
  { nome: "fundamento", pontos: 1.0 },
  { nome: "liminar", pontos: 0.5 },
  { nome: "autoridade", pontos: 0.5 },
  { nome: "pedidos", pontos: 0.8 },
  { nome: "valorCausa", pontos: 0.3 },
  { nome: "fechamento", pontos: 0.2 },
];

const questoesHard: QuestaoHard[] = [
  {
    enunciado:
      "Lei municipal instituiu taxa de fiscalização com base de cálculo idêntica ao IPTU.",
    foco: "Taxa, especificidade/divisibilidade, base de cálculo.",
  },
  {
    enunciado:
      "Estado aumentou ICMS por decreto e cobrou imediatamente.",
    foco: "Legalidade e anterioridade.",
  },
  {
    enunciado:
      "Município condicionou alvará ao pagamento de tributo.",
    foco: "Sanções políticas e Súmulas do STF.",
  },
];

function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-amber-600";
  return "text-red-600";
}

function calcularNotaPeca(checks: Record<string, boolean>): number {
  return criteriosPeca.reduce((total, criterio) => {
    return total + (checks[criterio.nome] ? criterio.pontos : 0);
  }, 0);
}

function calcularResultado(
  notaPeca: number,
  notaQuestoes: number
): ResultadoFinal {
  const questoes = Math.max(0, Math.min(5, Number(notaQuestoes)));
  const final = Math.min(10, notaPeca + questoes);

  return {
    questoes,
    final,
    aprovado: final >= 8,
  };
}

function gerarCorrecao(texto: string): {
  nota: number;
  erros: string[];
} {
  const lower = texto.toLowerCase();

  const checks: Record<string, boolean> = {
    enderecamento:
      lower.includes("excelentíssimo") ||
      lower.includes("vara"),
    qualificacao:
      lower.includes("nacionalidade") ||
      lower.includes("estado civil"),
    fundamento:
      lower.includes("art.") ||
      lower.includes("constituição") ||
      lower.includes("lei 12.016"),
    liminar: lower.includes("liminar"),
    autoridade:
      lower.includes("autoridade coatora") ||
      lower.includes("secretário"),
    pedidos:
      lower.includes("requer") ||
      lower.includes("pedido"),
    valorCausa:
      lower.includes("valor da causa"),
    fechamento:
      lower.includes("termos em que") ||
      lower.includes("pede deferimento"),
  };

  const erros: string[] = [];

  if (!checks.enderecamento) {
    erros.push("Faltou endereçamento.");
  }

  if (!checks.qualificacao) {
    erros.push("Faltou qualificação das partes.");
  }

  if (!checks.fundamento) {
    erros.push("Fundamentação jurídica fraca.");
  }

  if (!checks.liminar) {
    erros.push("Não pediu liminar.");
  }

  if (!checks.autoridade) {
    erros.push("Não indicou autoridade coatora.");
  }

  if (!checks.pedidos) {
    erros.push("Pedidos incompletos.");
  }

  if (!checks.valorCausa) {
    erros.push("Faltou valor da causa.");
  }

  if (!checks.fechamento) {
    erros.push("Faltou fechamento da peça.");
  }

  return {
    nota: Number(calcularNotaPeca(checks).toFixed(1)),
    erros,
  };
}

export default function Home() {
  const [aba, setAba] = useState<Aba>("peca");

  const [pecaSelecionada, setPecaSelecionada] =
    useState<string>("Mandado de Segurança");

  const [resposta, setResposta] = useState<string>("");

  const [notaQuestoes, setNotaQuestoes] =
    useState<number>(4);

  const [correcao, setCorrecao] =
    useState<string>("");

  const resultado = useMemo(() => {
    const dados = gerarCorrecao(resposta);

    return calcularResultado(
      dados.nota,
      notaQuestoes
    );
  }, [resposta, notaQuestoes]);

  function corrigirPeca(): void {
    const dados = gerarCorrecao(resposta);

    const texto =
      `Nota da peça: ${dados.nota.toFixed(1)}/5,0\n\n` +
      (dados.erros.length > 0
        ? `Pontos cegos:\n- ${dados.erros.join(
            "\n- "
          )}`
        : "Excelente estrutura. Peça muito forte.");

    setCorrecao(texto);
  }

  const modeloMandadoSeguranca = `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA DA FAZENDA PÚBLICA DA COMARCA DO MUNICÍPIO ALFA

JOÃO..., nacionalidade..., estado civil..., comerciante..., portador do RG..., CPF..., residente..., por intermédio de seu advogado..., com fundamento no art. 5º, LXIX, da Constituição Federal e na Lei 12.016/2009, impetrar:

MANDADO DE SEGURANÇA COM PEDIDO LIMINAR

em face de ato praticado pelo SECRETÁRIO MUNICIPAL DE FINANÇAS DO MUNICÍPIO ALFA.

I — DOS FATOS

O Impetrante exerce regularmente atividade comercial.

Todavia, recebeu cobrança de ISS sobre atividade não prevista na LC 116/2003.

II — DO CABIMENTO

O Mandado de Segurança é cabível para proteção de direito líquido e certo.

III — DA ILEGALIDADE

A cobrança viola:
- art. 156, III, da CF;
- LC 116/2003;
- princípio da legalidade tributária.

IV — DOS PEDIDOS

Diante do exposto, requer:

a) concessão da liminar;

b) notificação da autoridade coatora;

c) procedência do pedido.

V — DO VALOR DA CAUSA

Dá-se à causa o valor de R$ ...

Termos em que,
Pede deferimento.

ADVOGADO
OAB/UF
`;

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-5xl font-black">
              Meta OAB: 8,0 ou mais
            </h1>

            <p className="mt-3 text-slate-600">
              Treino hardcore de Direito Tributário
              focado em peça prática e correção.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {[
              "peca",
              "questoes",
              "correcao",
              "revisao",
              "testes",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  setAba(item as Aba)
                }
                className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                  aba === item
                    ? "bg-black text-white"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          {aba === "peca" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border bg-white p-6">
                  <h2 className="mb-4 text-3xl font-black">
                    Treino de Peça Prática
                  </h2>

                  <label className="mb-2 block text-sm font-bold">
                    Peça do dia
                  </label>

                  <select
                    value={pecaSelecionada}
                    onChange={(e) =>
                      setPecaSelecionada(
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border p-3"
                  >
                    <option>
                      Mandado de Segurança
                    </option>
                    <option>
                      Ação Anulatória
                    </option>
                    <option>
                      Repetição de Indébito
                    </option>
                    <option>
                      Embargos à Execução Fiscal
                    </option>
                  </select>

                  <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                    <p className="font-bold">
                      Comando
                    </p>

                    <p className="mt-2">
                      Elabore a estrutura completa da
                      peça com fundamento legal,
                      teses e pedidos.
                    </p>
                  </div>

                  <textarea
                    value={resposta}
                    onChange={(e) =>
                      setResposta(
                        e.target.value
                      )
                    }
                    placeholder="Digite sua peça aqui..."
                    className="mt-6 h-[500px] w-full rounded-2xl border p-4"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={corrigirPeca}
                      className="rounded-2xl bg-black px-6 py-3 font-bold text-white transition hover:scale-105"
                    >
                      Enviar para correção
                    </button>

                    <button
                      onClick={() =>
                        setResposta(
                          modeloMandadoSeguranca
                        )
                      }
                      className="rounded-2xl bg-slate-200 px-6 py-3 font-bold"
                    >
                      Inserir modelo
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border bg-white p-6">
                    <h2 className="text-3xl font-black">
                      Resultado
                    </h2>

                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-slate-100 p-4 text-center">
                        <p className="text-sm">
                          Peça
                        </p>

                        <p className="text-3xl font-black">
                          {gerarCorrecao(
                            resposta
                          ).nota.toFixed(1)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-100 p-4 text-center">
                        <p className="text-sm">
                          Questões
                        </p>

                        <p className="text-3xl font-black">
                          {resultado.questoes.toFixed(
                            1
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-100 p-4 text-center">
                        <p className="text-sm">
                          Final
                        </p>

                        <p
                          className={`text-3xl font-black ${scoreColor(
                            resultado.final
                          )}`}
                        >
                          {resultado.final.toFixed(
                            1
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                      <p className="font-bold">
                        Status
                      </p>

                      <p
                        className={`mt-2 text-xl font-black ${
                          resultado.aprovado
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {resultado.aprovado
                          ? "APROVADO"
                          : "REPROVADO"}
                      </p>
                    </div>

                    {correcao && (
                      <div className="mt-6 rounded-2xl bg-slate-100 p-4 whitespace-pre-line">
                        {correcao}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border bg-white p-6">
                    <h2 className="text-2xl font-black">
                      Questões Hardcore
                    </h2>

                    <div className="mt-4 space-y-4">
                      {questoesHard.map(
                        (questao, index) => (
                          <div
                            key={index}
                            className="rounded-2xl bg-slate-100 p-4"
                          >
                            <p className="font-bold">
                              {questao.enunciado}
                            </p>

                            <p className="mt-2 text-sm text-slate-600">
                              Foco:{" "}
                              {questao.foco}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {aba !== "peca" && (
            <div className="rounded-3xl border bg-white p-10 text-center">
              <h2 className="text-4xl font-black">
                Em construção
              </h2>

              <p className="mt-4 text-slate-600">
                Próxima etapa: IA de correção
                estilo FGV.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}