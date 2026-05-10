"use client";

import { useMemo, useState } from "react";

// --- TIPAGENS (100% TypeScript Strict) ---

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
  palavrasObrigatorias: string[];
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

type EspelhoItem = {
  texto: string;
  peso: number;
  chaves: string[];
};

type Questao = {
  id: number;
  titulo: string;
  enunciado: string;
  espelho: EspelhoItem[];
  artigosObrigatorios: string[];
  pontos: number;
};

type CorrecaoQuestao = {
  id: number;
  nota: number;
  maximo: number;
  acertos: string[];
  erros: string[];
  artigosFaltantes: string[];
};

// --- BANCO DE DADOS LOCAL ---

const tiposPeca: TipoPeca[] = [
  "Mandado de Segurança",
  "Ação Anulatória",
  "Repetição de Indébito",
  "Embargos à Execução Fiscal",
  "Ação de Consignação em Pagamento",
];

const marcadoresPecaErrada: Record<TipoPeca, string[]> = {
  "Mandado de Segurança": ["ação anulatória", "repetição de indébito", "embargos à execução", "consignação em pagamento"],
  "Ação Anulatória": ["mandado de segurança", "autoridade coatora", "lei 12.016", "embargos", "repetição"],
  "Repetição de Indébito": ["mandado de segurança", "ação anulatória", "embargos", "consignação"],
  "Embargos à Execução Fiscal": ["mandado de segurança", "autoridade coatora", "ação anulatória", "repetição"],
  "Ação de Consignação em Pagamento": ["mandado de segurança", "ação anulatória", "repetição", "embargos"],
};

const criteriosMS: Criterio[] = [
  {
    id: "enderecamento",
    titulo: "Endereçamento",
    pontos: 0.2,
    palavrasObrigatorias: ["excelentíssimo", "vara", "federal", "fazenda"],
    erro: "Endereçamento ausente ou genérico.",
    melhoria: "Na Justiça Federal use 'Vara Federal'. Na Estadual use 'Vara da Fazenda Pública'.",
  },
  {
    id: "cabimento",
    titulo: "Cabimento (Prova Pré-constituída)",
    pontos: 0.5,
    palavrasObrigatorias: ["direito líquido", "prova pré-constituída", "12.016"],
    erro: "Não fundamentou o cabimento do MS corretamente.",
    melhoria: "Sempre cite 'direito líquido e certo', ausência de dilação probatória e Lei 12.016/09.",
  },
  {
    id: "tempestividade",
    titulo: "Tempestividade",
    pontos: 0.4,
    palavrasObrigatorias: ["120 dias", "art. 23"],
    erro: "Não demonstrou o prazo decadencial de 120 dias.",
    melhoria: "Cite o art. 23 da Lei 12.016/2009 EXPRESSAMENTE.",
  },
  {
    id: "tese",
    titulo: "Tese de Fundo (Mérito)",
    pontos: 1.5,
    palavrasObrigatorias: ["inconstitucional", "ilegal", "ctn", "constituição"],
    erro: "Fundamentação material genérica.",
    melhoria: "Aprofunde a tese. Ilegalidade? Inconstitucionalidade? Faltou cruzar os fatos com a norma.",
  },
  {
    id: "liminar",
    titulo: "Pedido Liminar",
    pontos: 0.5,
    palavrasObrigatorias: ["liminar", "fumus boni iuris", "periculum in mora", "151", "iv"],
    erro: "Não estruturou a liminar ou esqueceu a suspensão da exigibilidade.",
    melhoria: "Art. 7º, III da Lei 12.016/09 c/c Art. 151, IV do CTN (suspensão da exigibilidade).",
  },
  {
    id: "pedidos",
    titulo: "Pedidos Completos",
    pontos: 1.0,
    palavrasObrigatorias: ["notificação", "ciência", "ministério público", "concessão", "custas"],
    erro: "Pedidos incompletos. Faltou a trinca do MS.",
    melhoria: "Notificação da autoridade, ciência do ente, oitiva do MP e concessão da ordem.",
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    pontos: 0.9,
    palavrasObrigatorias: ["valor da causa", "local", "data", "advogado", "oab"],
    erro: "Encerramento mal feito.",
    melhoria: "MS exige valor da causa para efeitos fiscais. Finalize com Local, Data, Advogado e OAB.",
  },
];

const criteriosGenericos: Criterio[] = [
  {
    id: "enderecamento_gen",
    titulo: "Endereçamento",
    pontos: 0.4,
    palavrasObrigatorias: ["excelentíssimo", "vara", "juízo"],
    erro: "Endereçamento ausente.",
    melhoria: "Indique o juízo competente.",
  },
  {
    id: "cabimento_gen",
    titulo: "Cabimento",
    pontos: 0.7,
    palavrasObrigatorias: ["cabível", "ctn", "cpc", "lei"],
    erro: "Cabimento insuficiente.",
    melhoria: "Explique por que a peça é adequada ao caso.",
  },
  {
    id: "tese_gen",
    titulo: "Tese Tributária",
    pontos: 2.1,
    palavrasObrigatorias: ["ctn", "constituição", "crfb", "legalidade", "lançamento"],
    erro: "Tese tributária insuficiente.",
    melhoria: "Desenvolva a tese com fundamento legal completo e adequação típica.",
  },
  {
    id: "pedidos_gen",
    titulo: "Pedidos",
    pontos: 1.0,
    palavrasObrigatorias: ["requer", "procedência", "citação", "condenação", "honorários"],
    erro: "Pedidos incompletos.",
    melhoria: "Faça pedidos completos conforme a peça (citação, procedência, custas e honorários).",
  },
  {
    id: "fechamento_gen",
    titulo: "Fechamento",
    pontos: 0.8,
    palavrasObrigatorias: ["valor da causa", "local", "data", "advogado", "oab"],
    erro: "Fechamento incompleto.",
    melhoria: "Sempre inclua valor da causa, local, data, advogado e OAB.",
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
    enunciado: "Município instituiu contribuição para custear câmeras de segurança em logradouros públicos. Entidades religiosas alegam imunidade. Responda se a contribuição é válida e se a imunidade alcança a cobrança.",
    pontos: 2.5,
    espelho: [
      { texto: "Município NÃO pode instituir contribuição para custeio de segurança pública.", peso: 1.0, chaves: ["não pode", "inconstitucional", "segurança pública"] },
      { texto: "A imunidade religiosa restringe-se a IMPOSTOS, não alcançando contribuições.", peso: 1.0, chaves: ["imunidade", "restringe", "impostos", "apenas"] },
    ],
    artigosObrigatorios: ["149", "150", "vi", "b"],
  },
  {
    id: 2,
    titulo: "Questão 2 — Anistia, remissão e dolo",
    enunciado: "Lei concede desconto de 20% sobre tributo declarado e não pago e também afasta multa de atos praticados com dolo. Analise a natureza do desconto e a validade da anistia.",
    pontos: 2.5,
    espelho: [
      { texto: "Desconto sobre tributo configura REMISSÃO (parcial), não anistia.", peso: 1.0, chaves: ["remissão", "principal", "tributo"] },
      { texto: "Anistia atinge penalidades, mas não alcança atos com dolo, fraude ou simulação.", peso: 1.0, chaves: ["anistia", "dolo", "fraude", "simulação"] },
    ],
    artigosObrigatorios: ["156", "iv", "175", "180"],
  },
];

// --- MOTOR DE CORREÇÃO ---

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/gi, '');
}

function contemPalavrasSuficientes(texto: string, palavras: string[]): boolean {
  if (palavras.length === 0) return false;
  const base = normalizar(texto);
  const acertos = palavras.filter((palavra) => base.includes(normalizar(palavra)));
  return acertos.length / palavras.length >= 0.5; 
}

function detectarIncompatibilidade(tipo: TipoPeca, texto: string): string | null {
  const erradas = marcadoresPecaErrada[tipo];
  const base = normalizar(texto);
  const encontrouPecaErrada = erradas.find((item) => base.includes(normalizar(item)));

  if (encontrouPecaErrada) {
    return `ERRO FATAL: Você elaborou estrutura para "${encontrouPecaErrada}". A Banca zeraria sua prova por inadequação da via eleita.`;
  }
  return null;
}

function corrigirPeca(tipo: TipoPeca, texto: string): CorrecaoPeca {
  const incompatibilidade = detectarIncompatibilidade(tipo, texto);

  if (incompatibilidade) {
    return {
      tipo,
      nota: 0.0,
      maximo: 5,
      incompatibilidade: true,
      mensagemIncompatibilidade: incompatibilidade,
      itens: [{
        titulo: "Adequação da Peça (ZERADA)",
        pontos: 0,
        maximo: 5,
        acertou: false,
        erro: "Erro grosseiro de cabimento ou nome da peça.",
        melhoria: "Atenção máxima ao verbo da questão e à linha do tempo tributária. Erro de peça não tem salvação na FGV.",
      }],
    };
  }

  const criterios = criteriosPorPeca[tipo];
  const itens: CorrecaoItem[] = criterios.map((criterio) => {
    const acertou = contemPalavrasSuficientes(texto, criterio.palavrasObrigatorias);
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

  return { tipo, nota, maximo: 5, incompatibilidade: false, itens };
}

function corrigirQuestao(questao: Questao, resposta: string): CorrecaoQuestao {
  const acertos: string[] = [];
  const erros: string[] = [];
  let nota = 0;

  questao.espelho.forEach((item) => {
    const acertou = contemPalavrasSuficientes(resposta, item.chaves);
    if (acertou) {
      acertos.push(item.texto);
      nota += item.peso;
    } else {
      erros.push(item.texto);
    }
  });

  const baseResposta = normalizar(resposta);
  const artigosFaltantes = questao.artigosObrigatorios.filter(art => !baseResposta.includes(normalizar(art)));
  
  const descontoArtigo = artigosFaltantes.length * 0.10;
  nota = Math.max(0, nota - descontoArtigo);

  return {
    id: questao.id,
    nota: Number(nota.toFixed(2)),
    maximo: questao.pontos,
    acertos,
    erros,
    artigosFaltantes,
  };
}

function calcularResultadoFinal(notaPeca: number, notaQuestoes: number): ResultadoFinal {
  const final = Number((notaPeca + notaQuestoes).toFixed(1));
  return { notaPeca, notaQuestoes, notaFinal: final, aprovado: final >= 8 };
}

// --- COMPONENTE PRINCIPAL ---

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
    if (textoPeca.trim().length < 20) {
      alert("Escreva uma peça válida antes de enviar.");
      return;
    }
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
    <main className="min-h-screen bg-slate-900 p-4 md:p-8 text-slate-100 font-sans">
      <div className="mx-auto max-w-7xl rounded-3xl bg-slate-800 p-6 md:p-8 shadow-2xl border border-slate-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              APP OAB TRIBUTÁRIO <span className="text-red-600">HARDCORE</span>
            </h1>
            <p className="mt-2 text-slate-400 font-medium">Meta OAB: 8,0. Sem perdão, sem nota inflada.</p>
          </div>
          <div className={`mt-4 md:mt-0 px-6 py-3 rounded-xl border-2 font-black text-xl uppercase ${
            resultado.aprovado 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
              : 'border-red-600 text-red-500 bg-red-500/10'
          }`}>
            Status: {resultado.aprovado ? "Aprovado com folga" : "Risco de Reprovação"}
          </div>
        </div>

        {/* PLACAR */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-inner">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Peça Prática</p>
            <p className="text-5xl font-black text-white mt-2">{resultado.notaPeca.toFixed(1)}</p>
            <p className="text-slate-600 font-medium text-sm mt-1">Máx: 5,0</p>
          </div>
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-inner">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Questões</p>
            <p className="text-5xl font-black text-white mt-2">{resultado.notaQuestoes.toFixed(1)}</p>
            <p className="text-slate-600 font-medium text-sm mt-1">Máx: 5,0</p>
          </div>
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${resultado.notaFinal >= 8 ? 'bg-emerald-500' : 'bg-red-600'}`}></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Nota Final</p>
            <p className={`text-6xl font-black mt-2 ${resultado.notaFinal >= 8 ? "text-emerald-400" : "text-red-500"}`}>
              {resultado.notaFinal.toFixed(1)}
            </p>
            <p className="text-slate-600 font-medium text-sm mt-1">Máx: 10,0</p>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <div className="my-8 flex flex-wrap gap-3">
          {(["peca", "questoes", "correcao", "revisao"] as Aba[]).map((item) => (
            <button
              key={item}
              onClick={() => setAba(item)}
              className={`rounded-xl px-5 py-3 text-sm font-black uppercase transition-all ${
                aba === item 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30" 
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ABA: PEÇA */}
        {aba === "peca" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full block"></span> Rascunho da Peça
              </h2>

              <label className="mt-6 block text-sm font-bold text-slate-400">Selecione o Rito Corretamente</label>
              <select
                value={tipoPeca}
                onChange={(e) => {
                  setTipoPeca(e.target.value as TipoPeca);
                  setCorrecaoPeca(null);
                }}
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 p-4 text-white focus:border-red-500 outline-none"
              >
                {tiposPeca.map((peca) => <option key={peca}>{peca}</option>)}
              </select>

              <textarea
                value={textoPeca}
                onChange={(e) => setTextoPeca(e.target.value)}
                placeholder="Redija sua peça profissionalmente. O rigor da correção será alto..."
                className="mt-6 h-[500px] w-full rounded-xl border border-slate-600 bg-slate-800 p-5 text-white placeholder:text-slate-600 focus:border-red-500 outline-none font-mono text-sm leading-relaxed"
              />

              <button onClick={enviarPeca} className="mt-6 w-full rounded-xl bg-red-600 hover:bg-red-700 transition-colors px-6 py-4 font-black text-white text-lg uppercase tracking-wider shadow-lg shadow-red-600/20">
                Submeter Peça à Banca IA
              </button>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-2xl font-black text-white">Espelho Preliminar de Avaliação</h2>
              <p className="text-slate-400 mt-2 text-sm">Tópicos obrigatórios (Estrutura FGV) para a peça selecionada:</p>
              <div className="mt-6 space-y-3">
                {criteriosPorPeca[tipoPeca].map((criterio) => (
                  <div key={criterio.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex justify-between items-center">
                    <p className="font-bold text-slate-200">{criterio.titulo}</p>
                    <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs font-black">{criterio.pontos.toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ABA: QUESTÕES */}
        {aba === "questoes" && (
          <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
             <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
                <span className="w-2 h-6 bg-red-600 rounded-full block"></span> Caderno de Questões Discursivas
              </h2>

            {questoesSimulado.map((questao) => (
              <div key={questao.id} className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black text-white">{questao.titulo}</h3>
                  <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs font-black">{questao.pontos.toFixed(2)} pts</span>
                </div>
                <p className="mt-4 text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-700">{questao.enunciado}</p>
                <textarea
                  value={respostasQuestoes[questao.id] ?? ""}
                  onChange={(e) => atualizarRespostaQuestao(questao.id, e.target.value)}
                  placeholder="Responda fundamentando jurídica e legalmente..."
                  className="mt-6 h-40 w-full rounded-xl border border-slate-600 bg-slate-900 p-5 text-white placeholder:text-slate-600 focus:border-red-500 outline-none"
                />
              </div>
            ))}

            <button onClick={corrigirTodasQuestoes} className="mt-8 w-full md:w-auto rounded-xl bg-red-600 hover:bg-red-700 px-8 py-4 font-black text-white text-lg uppercase tracking-wider">
              Corrigir Questões
            </button>
          </section>
        )}

        {/* ABA: CORREÇÃO */}
        {aba === "correcao" && (
          <section className="grid gap-8 lg:grid-cols-2">
            {/* Peça */}
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full block"></span> Avaliação da Peça
              </h2>

              {!correcaoPeca ? (
                <div className="mt-8 p-8 border border-dashed border-slate-600 rounded-2xl text-center text-slate-500">
                  Nenhuma peça submetida para avaliação.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className={`rounded-2xl p-6 border-2 ${correcaoPeca.incompatibilidade ? "bg-red-950 border-red-800" : "bg-slate-800 border-slate-700"}`}>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Nota Oficial Atribuída</p>
                    <p className={`text-5xl font-black mt-2 ${correcaoPeca.incompatibilidade ? "text-red-500" : "text-white"}`}>
                      {correcaoPeca.nota.toFixed(1)} <span className="text-2xl text-slate-600">/ 5.0</span>
                    </p>
                    
                    {correcaoPeca.incompatibilidade && (
                      <div className="mt-4 bg-red-600/20 text-red-400 p-4 rounded-xl border border-red-500/30">
                        <p className="font-black flex items-center gap-2">⚠️ PEÇA ZERADA PELA BANCA</p>
                        <p className="text-sm mt-1">{correcaoPeca.mensagemIncompatibilidade}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mt-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento por Tópico</h3>
                    {correcaoPeca.itens.map((item) => (
                      <div key={item.titulo} className={`rounded-xl border p-4 transition-all ${
                        item.acertou 
                          ? "border-emerald-500/30 bg-emerald-500/10" 
                          : "border-red-500/30 bg-red-500/10"
                      }`}>
                        <div className="flex justify-between items-start">
                          <p className={`font-black ${item.acertou ? "text-emerald-400" : "text-red-400"}`}>
                            {item.acertou ? "✅" : "❌"} {item.titulo}
                          </p>
                          <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-900 ${item.acertou ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.pontos.toFixed(1)} / {item.maximo.toFixed(1)}
                          </span>
                        </div>
                        
                        {!item.acertou && (
                          <div className="mt-3 pl-6 border-l-2 border-red-500/30">
                            <p className="text-sm text-red-300 font-medium">Motivo: {item.erro}</p>
                            <p className="mt-1 text-xs text-slate-400"><strong>Correção:</strong> {item.melhoria}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Questões */}
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full block"></span> Avaliação das Questões
              </h2>

              {correcoesQuestoes.length === 0 ? (
                 <div className="mt-8 p-8 border border-dashed border-slate-600 rounded-2xl text-center text-slate-500">
                 Responda o caderno de questões para gerar a avaliação.
               </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {correcoesQuestoes.map((correcao) => (
                    <div key={correcao.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                      <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                        <p className="font-black text-lg text-white">Questão {correcao.id}</p>
                        <span className="text-lg font-black text-amber-400">{correcao.nota.toFixed(2)} <span className="text-slate-500 text-sm">/ {correcao.maximo.toFixed(2)}</span></span>
                      </div>

                      {correcao.acertos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-black uppercase text-emerald-500 mb-2">Fundamentos Atingidos</p>
                          <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                            {correcao.acertos.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {correcao.erros.length > 0 && (
                        <div className="mb-4 bg-red-950/50 p-3 rounded-lg border border-red-900/50">
                          <p className="text-xs font-black uppercase text-red-500 mb-2">Faltou Abordar (Zerou)</p>
                          <ul className="list-disc pl-5 text-sm text-red-300 space-y-1">
                            {correcao.erros.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {correcao.artigosFaltantes.length > 0 && (
                        <div className="bg-amber-950/50 p-3 rounded-lg border border-amber-900/50">
                          <p className="text-xs font-black uppercase text-amber-500 mb-1">Penalidade por Dispositivo Legal Ausente</p>
                          <p className="text-sm text-amber-300">Você não citou explicitamente: {correcao.artigosFaltantes.join(", ")}. (-0.10 pts por omissão).</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* ABA: REVISÃO */}
        {aba === "revisao" && (
          <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full block"></span> Caderno de Revisão e Erros
            </h2>
            <p className="mt-4 text-slate-400">Aqui você deverá revisar os pontos zerados antes de partir para um novo simulado. A repetição espaçada é o segredo da aprovação na FGV.</p>
          </section>
        )}
      </div>
    </main>
  );
}