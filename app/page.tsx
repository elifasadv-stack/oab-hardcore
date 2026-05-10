"use client";

import { useMemo, useState } from "react";

type Aba = "peca" | "questoes" | "correcao" | "revisao" | "testes";

type TipoPeca =
  | "Mandado de Segurança"
  | "Ação Anulatória"
  | "Repetição de Indébito"
  | "Embargos à Execução Fiscal"
  | "Ação de Consignação em Pagamento";

type Criterio = {
  id: string;
  titulo: string;
  pontos: number;
  palavras: string[];
  erro: string;
  melhoria: string;
};

type CorrecaoItem = {
  titulo: string;
  pontos: number;
  maximo: number;
  acertou: boolean;
  erro: string;
  melhoria: string;
};

type CorrecaoPeca = {
  tipo: TipoPeca;
  nota: number;
  maximo: number;
  incompatibilidade: boolean;
  mensagemIncompatibilidade?: string;
  itens: CorrecaoItem[];
};

type ResultadoFinal = {
  notaPeca: number;
  notaQuestoes: number;
  notaFinal: number;
  aprovado: boolean;
};

type Questao = {
  id: number;
  titulo: string;
  enunciado: string;
  espelho: string[];
  artigos: string[];
  pontos: number;
};

type CorrecaoQuestao = {
  id: number;
  nota: number;
  maximo: number;
  acertos: string[];
  erros: string[];
};

const tiposPeca: TipoPeca[] = [
  "Mandado de Segurança",
  "Ação Anulatória",
  "Repetição de Indébito",
  "Embargos à Execução Fiscal",
  "Ação de Consignação em Pagamento",
];

const assinaturasObrigatorias: Record<TipoPeca, string[]> = {
  "Mandado de Segurança": [
    "mandado de segurança",
    "autoridade coatora",
    "direito líquido",
    "lei 12.016",
    "120 dias",
  ],
  "Ação Anulatória": [
    "ação anulatória",
    "lançamento",
    "art. 38",
    "desconstituir",
    "crédito tributário",
  ],
  "Repetição de Indébito": [
    "repetição de indébito",
    "pagamento indevido",
    "art. 165",
    "art. 168",
    "restituição",
  ],
  "Embargos à Execução Fiscal": [
    "embargos à execução fiscal",
    "execução fiscal",
    "garantia do juízo",
    "30 dias",
    "cda",
  ],
  "Ação de Consignação em Pagamento": [
    "consignação em pagamento",
    "art. 164",
    "recusa",
    "depósito",
    "extinção do crédito",
  ],
};

const marcadoresPecaErrada: Record<TipoPeca, string[]> = {
  "Mandado de Segurança": [
    "ação anulatória",
    "repetição de indébito",
    "embargos à execução fiscal",
    "consignação em pagamento",
  ],
  "Ação Anulatória": [
    "mandado de segurança",
    "autoridade coatora",
    "lei 12.016",
    "embargos à execução fiscal",
    "repetição de indébito",
  ],
  "Repetição de Indébito": [
    "mandado de segurança",
    "ação anulatória",
    "embargos à execução fiscal",
    "consignação em pagamento",
  ],
  "Embargos à Execução Fiscal": [
    "mandado de segurança",
    "autoridade coatora",
    "lei 12.016",
    "ação anulatória",
    "repetição de indébito",
  ],
  "Ação de Consignação em Pagamento": [
    "mandado de segurança",
    "ação anulatória",
    "repetição de indébito",
    "embargos à execução fiscal",
  ],
};

const criteriosMS: Criterio[] = [
  {
    id: "enderecamento",
    titulo: "Endereçamento",
    pontos: 0.3,
    palavras: ["excelentíssimo", "vara", "juízo", "juizo"],
    erro: "Endereçamento ausente ou genérico.",
    melhoria: "Indique o juízo competente.",
  },
  {
    id: "qualificacao",
    titulo: "Qualificação",
    pontos: 0.3,
    palavras: ["nacionalidade", "estado civil", "cpf", "cnpj", "endereço"],
    erro: "Qualificação incompleta.",
    melhoria: "Inclua dados completos da parte e advogado.",
  },
  {
    id: "nome",
    titulo: "Nome da peça",
    pontos: 0.3,
    palavras: ["mandado de segurança"],
    erro: "Nome da peça não identificado.",
    melhoria: "Use: MANDADO DE SEGURANÇA COM PEDIDO LIMINAR.",
  },
  {
    id: "autoridade",
    titulo: "Autoridade coatora",
    pontos: 0.4,
    palavras: ["autoridade coatora", "secretário", "delegado", "fiscal"],
    erro: "Autoridade coatora ausente.",
    melhoria: "Indique quem praticou o ato ilegal.",
  },
  {
    id: "cabimento",
    titulo: "Cabimento",
    pontos: 0.5,
    palavras: ["direito líquido", "direito liquido", "prova pré-constituída", "lei 12.016"],
    erro: "Cabimento do MS fraco.",
    melhoria: "Explique direito líquido e certo, prova documental e ato ilegal.",
  },
  {
    id: "tempestividade",
    titulo: "Tempestividade",
    pontos: 0.4,
    palavras: ["120 dias", "cento e vinte", "art. 23"],
    erro: "Não demonstrou o prazo de 120 dias.",
    melhoria: "Cite o art. 23 da Lei 12.016/2009.",
  },
  {
    id: "tese",
    titulo: "Tese tributária principal",
    pontos: 0.9,
    palavras: ["ctn", "constituição", "crfb", "lei complementar", "súmula", "sumula", "legalidade", "imunidade"],
    erro: "Tese tributária principal insuficiente.",
    melhoria: "Fundamente com CF, CTN, lei aplicável e súmulas.",
  },
  {
    id: "sancao",
    titulo: "Tese contra sanção política",
    pontos: 0.4,
    palavras: ["sanção política", "sancao politica", "súmula 70", "súmula 323", "súmula 547", "sumula 70", "sumula 323", "sumula 547"],
    erro: "Não trabalhou sanção política.",
    melhoria: "Use Súmulas 70, 323 e 547 do STF quando houver restrição indireta.",
  },
  {
    id: "liminar",
    titulo: "Liminar",
    pontos: 0.5,
    palavras: ["liminar", "fumus boni iuris", "periculum in mora", "urgência", "urgencia"],
    erro: "Liminar incompleta.",
    melhoria: "Demonstre fumus boni iuris e periculum in mora.",
  },
  {
    id: "pedidos",
    titulo: "Pedidos",
    pontos: 0.6,
    palavras: ["requer", "notificação", "notificacao", "ministério público", "ministerio publico", "concessão definitiva", "concessao definitiva"],
    erro: "Pedidos incompletos.",
    melhoria: "Inclua liminar, notificação, ciência do ente, MP e concessão definitiva.",
  },
  {
    id: "valor",
    titulo: "Valor da causa",
    pontos: 0.2,
    palavras: ["valor da causa"],
    erro: "Faltou valor da causa.",
    melhoria: "Inclua tópico próprio do valor da causa.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    pontos: 0.3,
    palavras: ["local", "data", "advogado", "oab"],
    erro: "Fechamento incompleto.",
    melhoria: "Finalize com local, data, advogado e OAB.",
  },
];

const criteriosGenericos: Criterio[] = [
  {
    id: "enderecamento",
    titulo: "Endereçamento",
    pontos: 0.4,
    palavras: ["excelentíssimo", "vara", "juízo", "juizo"],
    erro: "Endereçamento ausente.",
    melhoria: "Indique o juízo competente.",
  },
  {
    id: "nome",
    titulo: "Nome correto da peça",
    pontos: 0.8,
    palavras: ["ação", "acao", "embargos", "consignação", "consignacao", "repetição", "repeticao"],
    erro: "Nome da peça não identificado.",
    melhoria: "Indique expressamente o nome da peça correta.",
  },
  {
    id: "cabimento",
    titulo: "Cabimento",
    pontos: 0.7,
    palavras: ["cabível", "cabivel", "ctn", "lef", "cpc", "lei"],
    erro: "Cabimento insuficiente.",
    melhoria: "Explique por que a peça é adequada ao caso.",
  },
  {
    id: "tese",
    titulo: "Tese tributária",
    pontos: 1.3,
    palavras: ["ctn", "constituição", "crfb", "legalidade", "imunidade", "prescrição", "decadência", "lançamento"],
    erro: "Tese tributária insuficiente.",
    melhoria: "Desenvolva a tese com fundamento legal completo.",
  },
  {
    id: "pedidos",
    titulo: "Pedidos",
    pontos: 1.0,
    palavras: ["requer", "procedência", "procedencia", "citação", "citacao", "condenação", "condenacao"],
    erro: "Pedidos incompletos.",
    melhoria: "Faça pedidos completos conforme a peça.",
  },
  {
    id: "valor",
    titulo: "Valor da causa",
    pontos: 0.4,
    palavras: ["valor da causa"],
    erro: "Faltou valor da causa.",
    melhoria: "Inclua valor da causa.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    pontos: 0.4,
    palavras: ["local", "data", "advogado", "oab"],
    erro: "Fechamento incompleto.",
    melhoria: "Finalize com local, data, advogado e OAB.",
  },
];

const criteriosPorPeca: Record<TipoPeca, Criterio[]> = {
  "Mandado de Segurança": criteriosMS,
  "Ação Anulatória": criteriosGenericos,
  "Repetição de Indébito": criteriosGenericos,
  "Embargos à Execução Fiscal": criteriosGenericos,
  "Ação de Consignação em Pagamento": criteriosGenericos,
};

const questoesSimulado: Questao[] = [
  {
    id: 1,
    titulo: "Questão 1 — Imunidade e contribuição",
    enunciado:
      "Município instituiu contribuição para custear câmeras de segurança em logradouros públicos. Entidades religiosas alegam imunidade. Responda se a contribuição é válida e se a imunidade alcança a cobrança.",
    espelho: [
      "Município pode instituir contribuição para custeio, expansão e melhoria de sistemas de monitoramento.",
      "A imunidade religiosa do art. 150, VI, b, da CF restringe-se a impostos.",
      "Contribuições não são abrangidas por essa imunidade específica.",
    ],
    artigos: ["art. 149-a", "art. 150", "vi", "b"],
    pontos: 1.25,
  },
  {
    id: 2,
    titulo: "Questão 2 — Anistia, remissão e dolo",
    enunciado:
      "Lei concede desconto de 20% sobre tributo declarado e não pago e também afasta multa de atos praticados com dolo. Analise a natureza do desconto e a validade da anistia.",
    espelho: [
      "Desconto sobre o tributo configura remissão parcial, não anistia.",
      "Anistia atinge penalidades, não o tributo principal.",
      "Anistia não alcança atos praticados com dolo, fraude ou simulação.",
    ],
    artigos: ["art. 156", "art. 175", "art. 180", "ctn"],
    pontos: 1.25,
  },
];

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function contemAlguma(texto: string, palavras: string[]): boolean {
  const base = normalizar(texto);
  return palavras.some((palavra) => base.includes(normalizar(palavra)));
}

function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-amber-600";
  return "text-red-600";
}

function detectarIncompatibilidade(tipo: TipoPeca, texto: string): string | null {
  const obrigatorias = assinaturasObrigatorias[tipo];
  const erradas = marcadoresPecaErrada[tipo];

  const acertosObrigatorios = obrigatorias.filter((item) => contemAlguma(texto, [item]));
  const encontrouPecaErrada = erradas.find((item) => contemAlguma(texto, [item]));

  const percentual = acertosObrigatorios.length / obrigatorias.length;

  if (encontrouPecaErrada && percentual < 0.6) {
    return `Peça incompatível: você selecionou "${tipo}", mas o texto contém estrutura de outra peça, especialmente "${encontrouPecaErrada}".`;
  }

  if (percentual < 0.4) {
    return `Peça incompatível ou muito incompleta para "${tipo}". Faltam elementos essenciais dessa peça.`;
  }

  return null;
}

function corrigirPeca(tipo: TipoPeca, texto: string): CorrecaoPeca {
  const incompatibilidade = detectarIncompatibilidade(tipo, texto);

  if (incompatibilidade) {
    return {
      tipo,
      nota: 0.8,
      maximo: 5,
      incompatibilidade: true,
      mensagemIncompatibilidade: incompatibilidade,
      itens: [
        {
          titulo: "Adequação da peça",
          pontos: 0,
          maximo: 5,
          acertou: false,
          erro: "A peça escolhida não corresponde ao texto apresentado.",
          melhoria:
            "Volte ao cabimento. Cada peça exige estrutura própria. Peça errada na OAB pode zerar ou derrubar drasticamente a nota.",
        },
      ],
    };
  }

  const criterios = criteriosPorPeca[tipo];

  const itens: CorrecaoItem[] = criterios.map((criterio) => {
    const acertou = contemAlguma(texto, criterio.palavras);

    return {
      titulo: criterio.titulo,
      pontos: acertou ? criterio.pontos : 0,
      maximo: criterio.pontos,
      acertou,
      erro: criterio.erro,
      melhoria: criterio.melhoria,
    };
  });

  const nota = Number(itens.reduce((total, item) => total + item.pontos, 0).toFixed(1));

  return {
    tipo,
    nota,
    maximo: 5,
    incompatibilidade: false,
    itens,
  };
}

function corrigirQuestao(questao: Questao, resposta: string): CorrecaoQuestao {
  const acertos: string[] = [];
  const erros: string[] = [];

  questao.espelho.forEach((item) => {
    const palavras = item.split(" ").filter((p) => p.length > 5);
    const acertou = palavras.some((palavra) => contemAlguma(resposta, [palavra]));

    if (acertou) acertos.push(item);
    else erros.push(item);
  });

  const artigosEncontrados = questao.artigos.filter((artigo) => contemAlguma(resposta, [artigo]));
  const proporcaoEspelho = acertos.length / questao.espelho.length;
  const bonusArtigos = Math.min(0.25, artigosEncontrados.length * 0.08);
  const nota = Math.min(questao.pontos, questao.pontos * proporcaoEspelho + bonusArtigos);

  return {
    id: questao.id,
    nota: Number(nota.toFixed(2)),
    maximo: questao.pontos,
    acertos,
    erros,
  };
}

function calcularResultadoFinal(notaPeca: number, notaQuestoes: number): ResultadoFinal {
  const peca = Math.max(0, Math.min(5, notaPeca));
  const questoes = Math.max(0, Math.min(5, notaQuestoes));
  const final = Number((peca + questoes).toFixed(1));

  return {
    notaPeca: peca,
    notaQuestoes: questoes,
    notaFinal: final,
    aprovado: final >= 8,
  };
}

export default function Home() {
  const [aba, setAba] = useState<Aba>("peca");
  const [tipoPeca, setTipoPeca] = useState<TipoPeca>("Mandado de Segurança");
  const [textoPeca, setTextoPeca] = useState<string>("");
  const [correcaoPeca, setCorrecaoPeca] = useState<CorrecaoPeca | null>(null);
  const [respostasQuestoes, setRespostasQuestoes] = useState<Record<number, string>>({});
  const [correcoesQuestoes, setCorrecoesQuestoes] = useState<CorrecaoQuestao[]>([]);

  const notaQuestoes = useMemo(() => {
    return Number(correcoesQuestoes.reduce((total, item) => total + item.nota, 0).toFixed(2));
  }, [correcoesQuestoes]);

  const resultado = useMemo(() => {
    return calcularResultadoFinal(correcaoPeca?.nota ?? 0, notaQuestoes);
  }, [correcaoPeca, notaQuestoes]);

  function enviarPeca(): void {
    setCorrecaoPeca(corrigirPeca(tipoPeca, textoPeca));
    setAba("correcao");
  }

  function corrigirTodasQuestoes(): void {
    const resultadoQuestoes = questoesSimulado.map((questao) =>
      corrigirQuestao(questao, respostasQuestoes[questao.id] ?? "")
    );
    setCorrecoesQuestoes(resultadoQuestoes);
    setAba("correcao");
  }

  function atualizarRespostaQuestao(id: number, texto: string): void {
    setRespostasQuestoes((atual) => ({ ...atual, [id]: texto }));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 md:p-8 shadow-xl">
        <h1 className="text-4xl md:text-5xl font-black">Meta OAB: 8,0 ou mais</h1>

        <p className="mt-3 text-slate-600">
          Peça vale 5,0. Questões valem 5,0. Nota final vale 10,0.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-100 p-5 text-center">
            <p className="text-sm">Peça</p>
            <p className="text-4xl font-black">{resultado.notaPeca.toFixed(1)}</p>
            <p className="text-xs">/5,0</p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-5 text-center">
            <p className="text-sm">Questões</p>
            <p className="text-4xl font-black">{resultado.notaQuestoes.toFixed(1)}</p>
            <p className="text-xs">/5,0</p>
          </div>

          <div className="rounded-2xl bg-slate-100 p-5 text-center">
            <p className="text-sm">Final</p>
            <p className={`text-4xl font-black ${scoreColor(resultado.notaFinal)}`}>
              {resultado.notaFinal.toFixed(1)}
            </p>
            <p className="text-xs">/10,0</p>
          </div>
        </div>

        <div className="my-6 flex flex-wrap gap-3">
          {(["peca", "questoes", "correcao", "revisao", "testes"] as Aba[]).map((item) => (
            <button
              key={item}
              onClick={() => setAba(item)}
              className={`rounded-2xl px-4 py-2 text-sm font-bold ${
                aba === item ? "bg-black text-white" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {aba === "peca" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6">
              <h2 className="text-3xl font-black">Treino de Peça Prática</h2>

              <label className="mt-6 block text-sm font-bold">Escolha a peça</label>
              <select
                value={tipoPeca}
                onChange={(event) => {
                  setTipoPeca(event.target.value as TipoPeca);
                  setCorrecaoPeca(null);
                }}
                className="mt-2 w-full rounded-2xl border p-3"
              >
                {tiposPeca.map((peca) => (
                  <option key={peca}>{peca}</option>
                ))}
              </select>

              <textarea
                value={textoPeca}
                onChange={(event) => setTextoPeca(event.target.value)}
                placeholder="Digite sua peça aqui..."
                className="mt-6 h-[520px] w-full rounded-2xl border p-4"
              />

              <button onClick={enviarPeca} className="mt-4 rounded-2xl bg-black px-6 py-3 font-bold text-white">
                Enviar peça para correção
              </button>
            </div>

            <div className="rounded-3xl border bg-white p-6">
              <h2 className="text-3xl font-black">Critérios desta peça</h2>
              <div className="mt-4 space-y-3">
                {criteriosPorPeca[tipoPeca].map((criterio) => (
                  <div key={criterio.id} className="rounded-2xl bg-slate-100 p-4">
                    <p className="font-bold">{criterio.titulo}</p>
                    <p className="text-sm text-slate-600">Vale {criterio.pontos.toFixed(1)} ponto(s)</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {aba === "questoes" && (
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-3xl font-black">Questões Discursivas</h2>

            {questoesSimulado.map((questao) => (
              <div key={questao.id} className="mt-6 rounded-3xl bg-slate-100 p-5">
                <h3 className="text-xl font-black">{questao.titulo}</h3>
                <p className="mt-2">{questao.enunciado}</p>
                <textarea
                  value={respostasQuestoes[questao.id] ?? ""}
                  onChange={(event) => atualizarRespostaQuestao(questao.id, event.target.value)}
                  className="mt-4 h-40 w-full rounded-2xl border p-4"
                />
              </div>
            ))}

            <button onClick={corrigirTodasQuestoes} className="mt-6 rounded-2xl bg-black px-6 py-3 font-bold text-white">
              Corrigir questões
            </button>
          </section>
        )}

        {aba === "correcao" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6">
              <h2 className="text-3xl font-black">Correção da Peça</h2>

              {!correcaoPeca ? (
                <p className="mt-4 text-slate-600">Envie uma peça para ver a correção.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className={`rounded-2xl p-4 ${correcaoPeca.incompatibilidade ? "bg-red-100" : "bg-slate-100"}`}>
                    <p className="font-bold">Nota real da peça</p>
                    <p className="text-4xl font-black">{correcaoPeca.nota.toFixed(1)} / 5,0</p>
                    {correcaoPeca.mensagemIncompatibilidade && (
                      <p className="mt-3 font-bold text-red-700">{correcaoPeca.mensagemIncompatibilidade}</p>
                    )}
                  </div>

                  {correcaoPeca.itens.map((item) => (
                    <div
                      key={item.titulo}
                      className={`rounded-2xl border p-4 ${
                        item.acertou ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="font-black">
                        {item.acertou ? "✅" : "❌"} {item.titulo}: {item.pontos.toFixed(1)} / {item.maximo.toFixed(1)}
                      </p>
                      {!item.acertou && (
                        <>
                          <p className="mt-2 text-red-700">{item.erro}</p>
                          <p className="mt-1 text-sm text-slate-700">
                            <strong>Como melhorar:</strong> {item.melhoria}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-6">
              <h2 className="text-3xl font-black">Correção das Questões</h2>
              {correcoesQuestoes.length === 0 ? (
                <p className="mt-4 text-slate-600">Responda o simulado na aba QUESTÕES.</p>
              ) : (
                correcoesQuestoes.map((correcao) => (
                  <div key={correcao.id} className="mt-4 rounded-2xl bg-slate-100 p-4">
                    <p className="font-black">
                      Questão {correcao.id}: {correcao.nota.toFixed(2)} / {correcao.maximo.toFixed(2)}
                    </p>
                    <p className="mt-3 font-bold text-red-700">O que faltou</p>
                    <ul className="list-disc pl-6 text-sm">
                      {correcao.erros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {aba === "revisao" && (
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-3xl font-black">Revisão Obrigatória</h2>
            <p className="mt-2 text-slate-600">Revise os itens zerados antes de avançar.</p>
          </section>
        )}

        {aba === "testes" && (
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-3xl font-black">Testes e Simulados</h2>
            <p className="mt-2 text-slate-600">Simulado atual: 1 peça + questões discursivas.</p>
          </section>
        )}
      </div>
    </main>
  );
}