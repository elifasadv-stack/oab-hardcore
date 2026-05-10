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
  itens: CorrecaoItem[];
  pontosFortes: string[];
  pontosFracos: string[];
  planoMelhoria: string[];
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
    palavras: ["direito líquido", "direito liquido", "prova pré-constituída", "prova pre-constituida", "lei 12.016"],
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
    palavras: ["ctn", "constituição", "crfb", "lei complementar", "súmula", "sumula", "legalidade", "imunidade", "prescrição", "decadência"],
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
    titulo: "Nome da peça",
    pontos: 0.5,
    palavras: ["ação", "acao", "embargos", "consignação", "consignacao", "repetição", "repeticao"],
    erro: "Nome da peça não identificado.",
    melhoria: "Indique expressamente o nome da peça.",
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
    pontos: 1.4,
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
    pontos: 0.6,
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
  {
    id: 3,
    titulo: "Questão 3 — Decadência e ITBI progressivo",
    enunciado:
      "Município cobra ITBI em 2025 por fato de 2018 e aplica alíquota progressiva pelo valor venal. Analise decadência e progressividade.",
    espelho: [
      "Prazo decadencial tributário é matéria de lei complementar nacional.",
      "Regra geral de decadência é de cinco anos.",
      "ITBI não admite alíquota progressiva com base no valor venal.",
    ],
    artigos: ["art. 146", "art. 173", "súmula 656", "sumula 656"],
    pontos: 1.25,
  },
  {
    id: 4,
    titulo: "Questão 4 — Medida cautelar fiscal",
    enunciado:
      "Em cautelar fiscal, juiz concede liminar para bloquear bens. Qual recurso cabe contra a liminar e de quando conta o prazo para contestar?",
    espelho: [
      "Cabe agravo de instrumento contra a liminar.",
      "O prazo de contestação conta da juntada do mandado de execução da cautelar.",
      "Aplicação da Lei 8.397/1992.",
    ],
    artigos: ["agravo de instrumento", "art. 7", "art. 8", "lei 8.397"],
    pontos: 1.25,
  },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function corrigirPeca(tipo: TipoPeca, texto: string): CorrecaoPeca {
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

  const nota = Number(
    itens.reduce((total, item) => total + item.pontos, 0).toFixed(1)
  );

  return {
    tipo,
    nota,
    maximo: 5,
    itens,
    pontosFortes: itens
      .filter((item) => item.acertou)
      .map((item) => `${item.titulo}: item encontrado.`),
    pontosFracos: itens.filter((item) => !item.acertou).map((item) => item.erro),
    planoMelhoria: itens
      .filter((item) => !item.acertou)
      .map((item) => item.melhoria),
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

  const artigosEncontrados = questao.artigos.filter((artigo) =>
    contemAlguma(resposta, [artigo])
  );

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

const modeloMandadoSeguranca = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA VARA DA FAZENDA PÚBLICA DA COMARCA DO MUNICÍPIO ALFA

JOÃO..., nacionalidade..., estado civil..., CPF..., endereço..., por seu advogado..., com fundamento no art. 5º, LXIX, da Constituição Federal e na Lei 12.016/2009, impetra:

MANDADO DE SEGURANÇA COM PEDIDO LIMINAR

em face de ato praticado pelo SECRETÁRIO MUNICIPAL DE FINANÇAS, autoridade coatora.

I — DOS FATOS

O Impetrante sofreu ato ilegal consistente em cobrança tributária indevida e ameaça ao exercício de sua atividade.

II — DO CABIMENTO E DA TEMPESTIVIDADE

O Mandado de Segurança é cabível para proteger direito líquido e certo, comprovado por prova pré-constituída, contra ato ilegal de autoridade pública.

A impetração é tempestiva, pois ocorre dentro do prazo de 120 dias, conforme art. 23 da Lei 12.016/2009.

III — DO DIREITO LÍQUIDO E CERTO E DA TESE TRIBUTÁRIA

A cobrança viola a Constituição Federal, o CTN e o princípio da legalidade tributária.

IV — DA VEDAÇÃO À SANÇÃO POLÍTICA

A autoridade não pode utilizar restrição ao exercício da atividade econômica como meio indireto de cobrança de tributo, conforme Súmulas 70, 323 e 547 do STF.

V — DA LIMINAR

Estão presentes o fumus boni iuris e o periculum in mora, razão pela qual deve ser concedida liminar.

VI — DOS PEDIDOS

Requer:
a) concessão da liminar;
b) notificação da autoridade coatora;
c) ciência ao ente público interessado;
d) oitiva do Ministério Público;
e) concessão definitiva da segurança.

VII — DO VALOR DA CAUSA

Dá-se à causa o valor de R$...

Termos em que,
Pede deferimento.

Local..., data...

Advogado...
OAB...`;

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
    setRespostasQuestoes((atual) => ({
      ...atual,
      [id]: texto,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 md:p-8 shadow-xl">
        <h1 className="text-4xl md:text-5xl font-black">Meta OAB: 8,0 ou mais</h1>

        <p className="mt-3 text-slate-600">
          Peça vale 5,0. Questões valem 5,0. Nota final vale 10,0. O aluno só atinge a meta com 8,0 ou mais.
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

        <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="font-bold">Status</p>
          <p className={`mt-1 text-2xl font-black ${resultado.aprovado ? "text-emerald-400" : "text-red-300"}`}>
            {resultado.aprovado ? "APROVADO NA META 8,0" : "AINDA NÃO ATINGIU A META 8,0"}
          </p>
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

              <div className="mt-6 rounded-2xl bg-slate-100 p-4">
                <p className="font-bold">Comando</p>
                <p className="mt-2">
                  Faça a peça completa com endereçamento, qualificação, nome da peça, cabimento,
                  tempestividade, tese tributária, pedidos, valor da causa e fechamento.
                </p>
              </div>

              <textarea
                value={textoPeca}
                onChange={(event) => setTextoPeca(event.target.value)}
                placeholder="Digite sua peça aqui..."
                className="mt-6 h-[520px] w-full rounded-2xl border p-4"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={enviarPeca} className="rounded-2xl bg-black px-6 py-3 font-bold text-white">
                  Enviar peça para correção
                </button>

                <button
                  onClick={() => {
                    setTipoPeca("Mandado de Segurança");
                    setTextoPeca(modeloMandadoSeguranca);
                    setCorrecaoPeca(null);
                  }}
                  className="rounded-2xl bg-slate-200 px-6 py-3 font-bold"
                >
                  Inserir modelo MS
                </button>
              </div>
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
            <h2 className="text-3xl font-black">Questões Discursivas — Simulado FGV</h2>

            <p className="mt-2 text-slate-600">
              Responda as 4 questões. Cada uma vale 1,25. Total: 5,0 pontos.
            </p>

            <div className="mt-6 space-y-6">
              {questoesSimulado.map((questao) => (
                <div key={questao.id} className="rounded-3xl bg-slate-100 p-5">
                  <h3 className="text-xl font-black">{questao.titulo}</h3>
                  <p className="mt-2">{questao.enunciado}</p>

                  <textarea
                    value={respostasQuestoes[questao.id] ?? ""}
                    onChange={(event) => atualizarRespostaQuestao(questao.id, event.target.value)}
                    placeholder="Digite sua resposta fundamentada..."
                    className="mt-4 h-40 w-full rounded-2xl border p-4"
                  />
                </div>
              ))}
            </div>

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
                <p className="mt-4 text-slate-600">Envie uma peça para ver a correção individual.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="font-bold">Nota real da peça</p>
                    <p className="text-4xl font-black">{correcaoPeca.nota.toFixed(1)} / 5,0</p>
                  </div>

                  {correcaoPeca.itens.map((item) => (
                    <div
                      key={item.titulo}
                      className={`rounded-2xl border p-4 ${
                        item.acertou ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="font-black">
                        {item.acertou ? "✅" : "❌"} {item.titulo}: {item.pontos.toFixed(1)} /{" "}
                        {item.maximo.toFixed(1)}
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
                <p className="mt-4 text-slate-600">Responda o simulado na aba QUESTÕES para ver os erros.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {correcoesQuestoes.map((correcao) => (
                    <div key={correcao.id} className="rounded-2xl bg-slate-100 p-4">
                      <p className="font-black">
                        Questão {correcao.id}: {correcao.nota.toFixed(2)} / {correcao.maximo.toFixed(2)}
                      </p>

                      <p className="mt-3 font-bold text-emerald-700">Acertos</p>
                      <ul className="list-disc pl-6 text-sm">
                        {correcao.acertos.length > 0 ? (
                          correcao.acertos.map((item) => <li key={item}>{item}</li>)
                        ) : (
                          <li>Nenhum item essencial identificado.</li>
                        )}
                      </ul>

                      <p className="mt-3 font-bold text-red-700">O que faltou</p>
                      <ul className="list-disc pl-6 text-sm">
                        {correcao.erros.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {aba === "revisao" && (
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-3xl font-black">Revisão Obrigatória</h2>

            <p className="mt-2 text-slate-600">
              Aqui o aluno aprende com os erros antes de avançar.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-4">
                <h3 className="font-black">1. Refaça o item zerado</h3>
                <p className="text-sm">Pegue os erros da aba Correção e reescreva apenas aquele trecho.</p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <h3 className="font-black">2. Decore o fundamento</h3>
                <p className="text-sm">CF, CTN, LEF, LC 116, Lei 12.016 e súmulas devem aparecer no texto.</p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <h3 className="font-black">3. Treine de novo</h3>
                <p className="text-sm">Abaixo de 8,0, o treino deve ser repetido até virar automático.</p>
              </div>
            </div>
          </section>
        )}

        {aba === "testes" && (
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-3xl font-black">Testes e Simulados</h2>

            <p className="mt-2 text-slate-600">
              Simulado atual: 1 peça + 4 questões. Acesse as abas PEÇA e QUESTÕES para responder.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-100 p-5">
              <h3 className="text-xl font-black">Simulado 01 — Tributário Hard</h3>
              <p className="mt-2">Peça sugerida: Mandado de Segurança.</p>
              <p>Questões: contribuição, anistia/remissão, ITBI, cautelar fiscal.</p>
              <p className="mt-3 font-bold">
                Meta: peça mínima 4,0 + questões mínima 4,0 = nota final 8,0.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}