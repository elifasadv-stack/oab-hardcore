"use client";

import { useMemo, useState } from "react";

type Aba = "peca" | "questoes" | "correcao" | "revisao" | "banco";

type ItemEspelho = {
  id: string;
  titulo: string;
  pontos: number;
  palavrasChave: string[];
  feedbackErro: string;
  melhoria: string;
};

type PecaFGV = {
  id: string;
  nome: string;
  area: string;
  valor: number;
  enunciado: string;
  espelho: ItemEspelho[];
};

type ResultadoItem = {
  titulo: string;
  pontos: number;
  atingiu: boolean;
  feedbackErro: string;
  melhoria: string;
};

type CorrecaoPeca = {
  peca: string;
  nota: number;
  notaMaxima: number;
  itens: ResultadoItem[];
  pontosFortes: string[];
  pontosFracos: string[];
  planoMelhoria: string[];
};

type QuestaoFGV = {
  id: string;
  titulo: string;
  enunciado: string;
  valor: number;
  espelho: ItemEspelho[];
};

type CorrecaoQuestao = {
  id: string;
  titulo: string;
  nota: number;
  notaMaxima: number;
  itens: ResultadoItem[];
};

type ResultadoFinal = {
  notaPeca: number;
  notaQuestoes: number;
  notaFinal: number;
  aprovado: boolean;
};

const bancoPecas: PecaFGV[] = [
  {
    id: "ms-certidao-45",
    nome: "Mandado de Segurança com pedido liminar",
    area: "Direito Tributário",
    valor: 5,
    enunciado:
      "Empresa teve pedido administrativo de certidão positiva com efeitos de negativa indeferido e precisa participar de licitação em 15 dias. Há prova documental pré-constituída e o indeferimento ocorreu há menos de 120 dias.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento correto",
        pontos: 0.4,
        palavrasChave: ["vara federal", "seção judiciária", "juízo federal"],
        feedbackErro: "Endereçamento incorreto ou ausente.",
        melhoria:
          "Indique o Juízo da Vara Federal competente, pois envolve autoridade federal/Receita Federal.",
      },
      {
        id: "peca",
        titulo: "Identificação da peça",
        pontos: 0.5,
        palavrasChave: ["mandado de segurança", "pedido liminar", "liminar"],
        feedbackErro: "A peça não foi identificada corretamente.",
        melhoria:
          "A peça adequada é Mandado de Segurança com pedido liminar, por haver prova pré-constituída e urgência.",
      },
      {
        id: "autoridade",
        titulo: "Autoridade coatora e pessoa jurídica interessada",
        pontos: 0.5,
        palavrasChave: ["autoridade coatora", "delegado", "receita federal", "união"],
        feedbackErro: "Faltou indicar autoridade coatora ou pessoa jurídica interessada.",
        melhoria:
          "Indique a autoridade coatora e a União como pessoa jurídica interessada, conforme Lei 12.016/2009.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento do MS",
        pontos: 0.6,
        palavrasChave: ["direito líquido", "direito liquido", "prova pré-constituída", "lei 12.016", "120 dias"],
        feedbackErro: "Cabimento do Mandado de Segurança ficou incompleto.",
        melhoria:
          "Explique direito líquido e certo, prova pré-constituída e prazo decadencial de 120 dias.",
      },
      {
        id: "cpden",
        titulo: "Direito à CPEN",
        pontos: 0.8,
        palavrasChave: ["certidão positiva com efeitos de negativa", "cpen", "art. 206", "ctn"],
        feedbackErro: "Faltou fundamentar o direito à CPEN.",
        melhoria:
          "Cite o art. 206 do CTN e explique por que o contribuinte faz jus à certidão positiva com efeitos de negativa.",
      },
      {
        id: "suspensao",
        titulo: "Suspensão da exigibilidade",
        pontos: 0.6,
        palavrasChave: ["art. 151", "ctn", "suspensão da exigibilidade", "suspensao da exigibilidade"],
        feedbackErro: "Faltou tratar da suspensão da exigibilidade do crédito.",
        melhoria:
          "Cite o art. 151 do CTN quando houver causa de suspensão da exigibilidade.",
      },
      {
        id: "liminar",
        titulo: "Pedido liminar",
        pontos: 0.6,
        palavrasChave: ["fumus boni iuris", "periculum in mora", "licitação", "liminar"],
        feedbackErro: "Pedido liminar insuficiente.",
        melhoria:
          "Demonstre fumus boni iuris e periculum in mora, especialmente o risco de perder a licitação.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos finais",
        pontos: 0.7,
        palavrasChave: ["notificação", "ciência", "ministério público", "concessão da segurança", "emitir certidão"],
        feedbackErro: "Pedidos incompletos.",
        melhoria:
          "Peça notificação da autoridade, ciência do órgão de representação judicial, MP e concessão definitiva da segurança.",
      },
      {
        id: "fechamento",
        titulo: "Fechamento formal",
        pontos: 0.3,
        palavrasChave: ["termos em que", "pede deferimento", "oab"],
        feedbackErro: "Fechamento formal ausente.",
        melhoria:
          "Finalize com valor da causa, local, data, advogado e OAB.",
      },
    ],
  },
  {
    id: "anulatoria-iss-42",
    nome: "Ação Anulatória com tutela de urgência",
    area: "Direito Tributário",
    valor: 5,
    enunciado:
      "Empresa foi autuada por ISS pelo Município X, mas o serviço foi prestado no Município Y. Há multa de 150% e ameaça de interdição do estabelecimento. Será necessária dilação probatória.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento correto",
        pontos: 0.4,
        palavrasChave: ["vara única", "vara da fazenda", "comarca", "município x"],
        feedbackErro: "Endereçamento incorreto.",
        melhoria:
          "Enderece à Vara competente da Justiça Estadual, pois se trata de tributo municipal.",
      },
      {
        id: "peca",
        titulo: "Peça correta",
        pontos: 0.6,
        palavrasChave: ["ação anulatória", "acao anulatoria", "auto de infração", "lançamento"],
        feedbackErro: "Peça incorreta ou mal identificada.",
        melhoria:
          "Use ação anulatória quando o objetivo for desconstituir lançamento/auto de infração e houver dilação probatória.",
      },
      {
        id: "partes",
        titulo: "Partes corretas",
        pontos: 0.4,
        palavrasChave: ["autora", "réu", "município", "municipio"],
        feedbackErro: "Faltou identificar corretamente autor e réu.",
        melhoria:
          "A autora é a empresa contribuinte e o réu é o Município que lavrou o auto.",
      },
      {
        id: "competencia-iss",
        titulo: "Competência do ISS",
        pontos: 0.9,
        palavrasChave: ["lc 116", "art. 3", "inciso vi", "local da prestação", "município y"],
        feedbackErro: "Faltou tese sobre local devido do ISS.",
        melhoria:
          "Fundamente no art. 3º, VI, da LC 116/2003: serviços de lixo são tributados no local da execução.",
      },
      {
        id: "confisco",
        titulo: "Multa confiscatória",
        pontos: 0.7,
        palavrasChave: ["confisco", "art. 150", "iv", "150%", "multa confiscatória"],
        feedbackErro: "Faltou tese da multa confiscatória.",
        melhoria:
          "Alegue violação ao art. 150, IV, da CF quando a multa for excessiva/confiscatória.",
      },
      {
        id: "sancao-politica",
        titulo: "Sanção política",
        pontos: 0.7,
        palavrasChave: ["sanção política", "sancao politica", "súmula 70", "súmula 547", "interdição"],
        feedbackErro: "Faltou tese sobre sanção política.",
        melhoria:
          "Use Súmula 70 e/ou 547 do STF contra interdição como meio indireto de cobrança.",
      },
      {
        id: "tutela",
        titulo: "Tutela de urgência",
        pontos: 0.6,
        palavrasChave: ["tutela de urgência", "fumus boni iuris", "periculum in mora", "art. 151", "v"],
        feedbackErro: "Tutela de urgência fraca ou ausente.",
        melhoria:
          "Peça tutela de urgência para suspender exigibilidade e impedir interdição, com art. 151, V, do CTN.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 0.5,
        palavrasChave: ["anular", "auto de infração", "suspender", "exigibilidade", "citação"],
        feedbackErro: "Pedidos incompletos.",
        melhoria:
          "Peça citação, tutela, anulação do auto, afastamento da multa e impedimento de interdição.",
      },
      {
        id: "fechamento",
        titulo: "Fechamento",
        pontos: 0.2,
        palavrasChave: ["valor da causa", "provas", "pede deferimento", "oab"],
        feedbackErro: "Fechamento incompleto.",
        melhoria:
          "Inclua provas, valor da causa, local, data e assinatura/OAB.",
      },
    ],
  },
  {
    id: "excecao-pre-44",
    nome: "Exceção de Pré-Executividade",
    area: "Direito Tributário",
    valor: 5,
    enunciado:
      "Ex-sócio cotista teve execução fiscal redirecionada contra si por ICMS declarado e não pago pela empresa. Ele já havia se retirado da sociedade antes dos fatos geradores e teve veículos penhorados.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento aos autos da execução",
        pontos: 0.4,
        palavrasChave: ["vara única", "execução fiscal", "autos"],
        feedbackErro: "Endereçamento impreciso.",
        melhoria:
          "A exceção deve ser apresentada nos próprios autos da execução fiscal.",
      },
      {
        id: "peca",
        titulo: "Peça correta",
        pontos: 0.7,
        palavrasChave: ["exceção de pré-executividade", "excecao de pre-executividade", "súmula 393"],
        feedbackErro: "Faltou identificar exceção de pré-executividade.",
        melhoria:
          "Use exceção de pré-executividade quando a matéria for de ordem pública e comprovável de plano.",
      },
      {
        id: "sem-garantia",
        titulo: "Dispensa de garantia",
        pontos: 0.5,
        palavrasChave: ["sem garantia", "sem dilação probatória", "prova documental", "súmula 393"],
        feedbackErro: "Faltou explicar por que não precisa garantir o juízo.",
        melhoria:
          "Explique que a exceção não exige custas nem garantia e usa prova pré-constituída.",
      },
      {
        id: "inadimplemento",
        titulo: "Mero inadimplemento",
        pontos: 0.8,
        palavrasChave: ["súmula 430", "mero inadimplemento", "não constitui infração"],
        feedbackErro: "Faltou Súmula 430/STJ.",
        melhoria:
          "Alegue que mero inadimplemento não gera responsabilidade pessoal do sócio.",
      },
      {
        id: "art135",
        titulo: "Art. 135, III, CTN",
        pontos: 0.8,
        palavrasChave: ["art. 135", "iii", "ctn", "sócio-administrador", "gerente"],
        feedbackErro: "Faltou fundamentar ausência de responsabilidade pessoal.",
        melhoria:
          "Demonstre que o art. 135, III, do CTN alcança diretores, gerentes ou representantes, não mero sócio cotista.",
      },
      {
        id: "saida-sociedade",
        titulo: "Retirada antes do fato gerador",
        pontos: 0.8,
        palavrasChave: ["retirou", "dezembro de 2023", "fato gerador", "janeiro", "junho de 2024"],
        feedbackErro: "Faltou tese de retirada anterior aos fatos geradores.",
        melhoria:
          "Sustente que o ex-sócio não respondia por fatos geradores posteriores à sua saída.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 0.7,
        palavrasChave: ["exclusão do polo passivo", "levantamento da penhora", "restrição", "automóveis"],
        feedbackErro: "Pedidos insuficientes.",
        melhoria:
          "Peça exclusão do polo passivo e levantamento da constrição/penhora dos bens.",
      },
      {
        id: "fechamento",
        titulo: "Fechamento",
        pontos: 0.3,
        palavrasChave: ["termos em que", "pede deferimento", "oab"],
        feedbackErro: "Fechamento ausente.",
        melhoria:
          "Finalize conforme padrão forense.",
      },
    ],
  },
];

const bancoQuestoes: QuestaoFGV[] = [
  {
    id: "q1-consignacao-iptu-itr",
    titulo: "IPTU x ITR",
    enunciado:
      "Contribuinte recebeu cobrança simultânea de IPTU e ITR sobre a mesma área. Indique a ação cabível, polo passivo e competência.",
    valor: 1.25,
    espelho: [
      {
        id: "acao",
        titulo: "Ação cabível",
        pontos: 0.45,
        palavrasChave: ["consignação em pagamento", "consignacao em pagamento", "art. 164", "iii", "ctn"],
        feedbackErro: "Não indicou corretamente a consignação em pagamento.",
        melhoria:
          "Use ação de consignação em pagamento, art. 164, III, do CTN, quando há dúvida entre entes tributantes.",
      },
      {
        id: "polo",
        titulo: "Polo passivo",
        pontos: 0.35,
        palavrasChave: ["união", "município", "litisconsórcio", "litisconsorcio"],
        feedbackErro: "Polo passivo incompleto.",
        melhoria:
          "Inclua União e Município em litisconsórcio passivo.",
      },
      {
        id: "competencia",
        titulo: "Competência",
        pontos: 0.45,
        palavrasChave: ["justiça federal", "justica federal", "art. 109", "i"],
        feedbackErro: "Competência não indicada corretamente.",
        melhoria:
          "Indique Justiça Federal por presença da União, art. 109, I, da CF.",
      },
    ],
  },
  {
    id: "q2-sancao-politica",
    titulo: "Sanção política",
    enunciado:
      "Município condiciona renovação de alvará ao pagamento de tributo. Analise a legalidade.",
    valor: 1.25,
    espelho: [
      {
        id: "ilegalidade",
        titulo: "Ilegalidade da sanção política",
        pontos: 0.5,
        palavrasChave: ["sanção política", "sancao politica", "meio coercitivo", "ilegal"],
        feedbackErro: "Não reconheceu a sanção política.",
        melhoria:
          "Explique que o Estado deve cobrar por via própria, não impedir atividade econômica.",
      },
      {
        id: "sumulas",
        titulo: "Súmulas STF",
        pontos: 0.5,
        palavrasChave: ["súmula 70", "súmula 323", "súmula 547", "stf"],
        feedbackErro: "Faltou súmula do STF.",
        melhoria:
          "Cite Súmula 70, 323 ou 547 do STF.",
      },
      {
        id: "conclusao",
        titulo: "Conclusão objetiva",
        pontos: 0.25,
        palavrasChave: ["ilegal", "afastar", "não pode", "nao pode"],
        feedbackErro: "Conclusão ficou genérica.",
        melhoria:
          "Conclua expressamente pela ilegalidade da exigência.",
      },
    ],
  },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contemAlgumaPalavra(texto: string, palavras: string[]): boolean {
  const base = normalizar(texto);
  return palavras.some((palavra) => base.includes(normalizar(palavra)));
}

function corrigirItens(texto: string, espelho: ItemEspelho[]): ResultadoItem[] {
  return espelho.map((item) => {
    const atingiu = contemAlgumaPalavra(texto, item.palavrasChave);

    return {
      titulo: item.titulo,
      pontos: atingiu ? item.pontos : 0,
      atingiu,
      feedbackErro: item.feedbackErro,
      melhoria: item.melhoria,
    };
  });
}

function corrigirPeca(texto: string, peca: PecaFGV): CorrecaoPeca {
  const itens = corrigirItens(texto, peca.espelho);
  const nota = Number(
    Math.min(
      peca.valor,
      itens.reduce((total, item) => total + item.pontos, 0)
    ).toFixed(2)
  );

  const pontosFortes = itens
    .filter((item) => item.atingiu)
    .map((item) => item.titulo);

  const pontosFracos = itens
    .filter((item) => !item.atingiu)
    .map((item) => item.feedbackErro);

  const planoMelhoria = itens
    .filter((item) => !item.atingiu)
    .map((item) => item.melhoria);

  return {
    peca: peca.nome,
    nota,
    notaMaxima: peca.valor,
    itens,
    pontosFortes,
    pontosFracos,
    planoMelhoria,
  };
}

function corrigirQuestao(texto: string, questao: QuestaoFGV): CorrecaoQuestao {
  const itens = corrigirItens(texto, questao.espelho);
  const nota = Number(
    Math.min(
      questao.valor,
      itens.reduce((total, item) => total + item.pontos, 0)
    ).toFixed(2)
  );

  return {
    id: questao.id,
    titulo: questao.titulo,
    nota,
    notaMaxima: questao.valor,
    itens,
  };
}

function calcularResultadoFinal(
  notaPeca: number,
  notasQuestoes: CorrecaoQuestao[]
): ResultadoFinal {
  const totalQuestoes = notasQuestoes.reduce(
    (total, questao) => total + questao.nota,
    0
  );

  const notaQuestoes = Number(Math.min(5, totalQuestoes).toFixed(2));
  const notaFinal = Number(Math.min(10, notaPeca + notaQuestoes).toFixed(2));

  return {
    notaPeca: Number(Math.min(5, notaPeca).toFixed(2)),
    notaQuestoes,
    notaFinal,
    aprovado: notaFinal >= 8,
  };
}

function classeNota(nota: number): string {
  if (nota >= 8) return "text-emerald-600";
  if (nota >= 6) return "text-amber-600";
  return "text-red-600";
}

export default function Home() {
  const [aba, setAba] = useState<Aba>("peca");
  const [pecaId, setPecaId] = useState<string>(bancoPecas[0].id);
  const [textoPeca, setTextoPeca] = useState<string>("");
  const [respostasQuestoes, setRespostasQuestoes] = useState<Record<string, string>>({});
  const [correcaoPeca, setCorrecaoPeca] = useState<CorrecaoPeca | null>(null);
  const [correcoesQuestoes, setCorrecoesQuestoes] = useState<CorrecaoQuestao[]>([]);
  
  // CORREÇÃO 1: Os estados corrigindo e feedbackIA foram movidos para dentro do componente.
  const [corrigindo, setCorrigindo] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState("");

  const pecaAtual = useMemo(() => {
    return bancoPecas.find((peca) => peca.id === pecaId) ?? bancoPecas[0];
  }, [pecaId]);

  const resultadoFinal = useMemo(() => {
    return calcularResultadoFinal(correcaoPeca?.nota ?? 0, correcoesQuestoes);
  }, [correcaoPeca, correcoesQuestoes]);

  async function enviarPecaParaCorrecao() {
    if (!textoPeca.trim()) {
      alert("Digite sua peça.");
      return;
    }

    try {
      setCorrigindo(true);

      const response = await fetch("/api/corrigir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resposta: textoPeca,
        }),
      });

      const data = await response.json();

      if (data.resultado) {
        setFeedbackIA(data.resultado);
      } else {
        setFeedbackIA("Erro ao corrigir.");
      }
    } catch (error) {
      console.error(error);
      setFeedbackIA("Erro na IA.");
    } finally {
      setCorrigindo(false);
    }
  }

  function corrigirTodasAsQuestoes(): void {
    const resultados = bancoQuestoes.map((questao) =>
      corrigirQuestao(respostasQuestoes[questao.id] ?? "", questao)
    );

    setCorrecoesQuestoes(resultados);
  }

  function alterarRespostaQuestao(id: string, texto: string): void {
    setRespostasQuestoes((respostasAtuais) => ({
      ...respostasAtuais,
      [id]: texto,
    }));
  }

  function inserirModeloBasico(): void {
    setTextoPeca(`EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA VARA FEDERAL DA SEÇÃO JUDICIÁRIA COMPETENTE

IMPETRANTE, pessoa jurídica de direito privado, por seu advogado, vem impetrar

MANDADO DE SEGURANÇA COM PEDIDO LIMINAR

em face de ato praticado pela autoridade coatora competente, com indicação da União como pessoa jurídica interessada.

I - DOS FATOS

A impetrante teve indeferido pedido administrativo de emissão de certidão positiva com efeitos de negativa, apesar de preencher os requisitos legais.

II - DO CABIMENTO

O mandado de segurança é cabível para proteger direito líquido e certo, demonstrado por prova pré-constituída, dentro do prazo de 120 dias, nos termos do art. 5º, LXIX, da Constituição Federal e da Lei 12.016/2009.

III - DO DIREITO

A impetrante tem direito à certidão positiva com efeitos de negativa, nos termos do art. 206 do CTN.

Também há suspensão da exigibilidade do crédito tributário, conforme art. 151 do CTN.

IV - DA LIMINAR

Estão presentes o fumus boni iuris e o periculum in mora, pois a empresa precisa participar de licitação e pode sofrer grave prejuízo.

V - DOS PEDIDOS

Diante do exposto, requer:
a) concessão da liminar;
b) notificação da autoridade coatora;
c) ciência à pessoa jurídica interessada;
d) oitiva do Ministério Público;
e) concessão da segurança para determinar a emissão da certidão.

Dá-se à causa o valor cabível.

Termos em que,
Pede deferimento.

Local e data.

Advogado
OAB/UF`);
    setCorrecaoPeca(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-5 shadow-xl md:p-8">
        <section className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-300">
            Treino Hardcore Tributário — Padrão FGV
          </p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">
            Meta OAB: 8,0 ou mais
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Peça vale 5,0. Questões valem 5,0. Nota final vale 10,0. O sistema
            corrige por espelho, separa peça e questões e aponta exatamente onde
            melhorar.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 text-center text-slate-900">
              <p className="text-sm font-bold text-slate-500">Peça</p>
              <p className="text-4xl font-black">
                {resultadoFinal.notaPeca.toFixed(2)}
              </p>
              <p className="text-xs">/5,00</p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center text-slate-900">
              <p className="text-sm font-bold text-slate-500">Questões</p>
              <p className="text-4xl font-black">
                {resultadoFinal.notaQuestoes.toFixed(2)}
              </p>
              <p className="text-xs">/5,00</p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center text-slate-900">
              <p className="text-sm font-bold text-slate-500">Final</p>
              <p
                className={`text-4xl font-black ${classeNota(
                  resultadoFinal.notaFinal
                )}`}
              >
                {resultadoFinal.notaFinal.toFixed(2)}
              </p>
              <p className="text-xs">/10,00</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Status</p>
            <p
              className={`text-2xl font-black ${
                resultadoFinal.aprovado ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {resultadoFinal.aprovado
                ? "APROVADO NA META 8,0"
                : "AINDA NÃO ATINGIU A META 8,0"}
            </p>
          </div>
        </section>

        <nav className="my-6 flex flex-wrap gap-3">
          {(["peca", "questoes", "correcao", "revisao", "banco"] as Aba[]).map(
            (item) => (
              <button
                key={item}
                onClick={() => setAba(item)}
                className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                  aba === item
                    ? "bg-slate-950 text-white"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                {item.toUpperCase()}
              </button>
            )
          )}
        </nav>

        {aba === "peca" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-5 md:p-6">
              <h2 className="text-3xl font-black">Peça prática</h2>

              <label className="mt-5 block text-sm font-bold">
                Escolha o espelho FGV
              </label>
              <select
                value={pecaId}
                onChange={(event) => {
                  setPecaId(event.target.value);
                  setCorrecaoPeca(null);
                }}
                className="mt-2 w-full rounded-2xl border p-3"
              >
                {bancoPecas.map((peca) => (
                  <option key={peca.id} value={peca.id}>
                    {peca.nome}
                  </option>
                ))}
              </select>

              <div className="mt-5 rounded-2xl bg-slate-100 p-4">
                <p className="font-black">Enunciado-base</p>
                <p className="mt-2 text-sm text-slate-700">
                  {pecaAtual.enunciado}
                </p>
              </div>

              <textarea
                value={textoPeca}
                onChange={(event) => setTextoPeca(event.target.value)}
                placeholder="Digite sua peça aqui..."
                className="mt-5 h-[520px] w-full rounded-2xl border p-4"
              />

              {/* CORREÇÃO 2: A estrutura dos botões abaixo estava quebrada */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={enviarPecaParaCorrecao}
                  disabled={corrigindo}
                  className="rounded-2xl bg-black px-6 py-3 font-bold text-white hover:bg-slate-800"
                >
                  {corrigindo ? "Corrigindo..." : "Enviar para correção"}
                </button>

                <button
                  onClick={inserirModeloBasico}
                  className="rounded-2xl bg-slate-200 px-6 py-3 font-black hover:bg-slate-300"
                >
                  Inserir modelo básico
                </button>
              </div>
            </div>

            {feedbackIA && (
              <div className="mt-6 rounded-2xl border bg-white p-6 whitespace-pre-wrap">
                <h2 className="mb-4 text-2xl font-bold">Correção IA FGV</h2>

                <div className="text-sm leading-7">{feedbackIA}</div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="rounded-3xl border bg-white p-5 md:p-6">
                <h2 className="text-3xl font-black">Correção da peça</h2>

                {!correcaoPeca ? (
                  <p className="mt-4 text-slate-600">
                    Envie a peça para receber nota de 0 a 5, pontos fortes,
                    pontos fracos e plano de melhoria.
                  </p>
                ) : (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="font-bold text-slate-600">Nota real da peça</p>
                      <p className="text-4xl font-black">
                        {correcaoPeca.nota.toFixed(2)} /{" "}
                        {correcaoPeca.notaMaxima.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-black text-emerald-700">
                        Pontos fortes
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-6">
                        {correcaoPeca.pontosFortes.length > 0 ? (
                          correcaoPeca.pontosFortes.map((ponto) => (
                            <li key={ponto}>{ponto}</li>
                          ))
                        ) : (
                          <li>Nenhum item forte detectado.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-black text-red-700">Pontos fracos</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-6">
                        {correcaoPeca.pontosFracos.length > 0 ? (
                          correcaoPeca.pontosFracos.map((ponto) => (
                            <li key={ponto}>{ponto}</li>
                          ))
                        ) : (
                          <li>Nenhum ponto fraco relevante detectado.</li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4">
                      <h3 className="font-black text-amber-700">
                        Como melhorar
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-6">
                        {correcaoPeca.planoMelhoria.length > 0 ? (
                          correcaoPeca.planoMelhoria.map((ponto) => (
                            <li key={ponto}>{ponto}</li>
                          ))
                        ) : (
                          <li>
                            Avance para um caso mais difícil ou acrescente tese
                            complementar.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {correcaoPeca && (
                <div className="rounded-3xl border bg-white p-5 md:p-6">
                  <h2 className="text-2xl font-black">Espelho item a item</h2>
                  <div className="mt-4 space-y-3">
                    {correcaoPeca.itens.map((item) => (
                      <div
                        key={item.titulo}
                        className={`rounded-2xl border p-4 ${
                          item.atingiu
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-black">
                            {item.atingiu ? "✅" : "❌"} {item.titulo}
                          </p>
                          <p className="font-black">
                            {item.pontos.toFixed(2)}
                          </p>
                        </div>
                        {!item.atingiu && (
                          <p className="mt-2 text-sm text-red-700">
                            {item.melhoria}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {aba === "questoes" && (
          <section className="space-y-6">
            <div className="rounded-3xl border bg-white p-5 md:p-6">
              <h2 className="text-3xl font-black">Questões discursivas</h2>
              <p className="mt-2 text-slate-600">
                Cada questão é corrigida separadamente por espelho. A soma das
                questões é limitada a 5,00 pontos.
              </p>
            </div>

            {bancoQuestoes.map((questao) => {
              const correcao = correcoesQuestoes.find(
                (item) => item.id === questao.id
              );

              return (
                <div
                  key={questao.id}
                  className="rounded-3xl border bg-white p-5 md:p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="text-2xl font-black">{questao.titulo}</h3>
                      <p className="mt-2 text-slate-700">{questao.enunciado}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3 text-center">
                      <p className="text-xs font-bold text-slate-500">Valor</p>
                      <p className="text-2xl font-black">
                        {questao.valor.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={respostasQuestoes[questao.id] ?? ""}
                    onChange={(event) =>
                      alterarRespostaQuestao(questao.id, event.target.value)
                    }
                    placeholder="Responda usando Fato + Fundamento + Conclusão..."
                    className="mt-5 h-44 w-full rounded-2xl border p-4"
                  />

                  {correcao && (
                    <div className="mt-5 rounded-2xl bg-slate-100 p-4">
                      <p className="font-black">
                        Nota: {correcao.nota.toFixed(2)} /{" "}
                        {correcao.notaMaxima.toFixed(2)}
                      </p>

                      <div className="mt-3 space-y-2">
                        {correcao.itens.map((item) => (
                          <div
                            key={item.titulo}
                            className={`rounded-xl p-3 ${
                              item.atingiu
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-red-50 text-red-800"
                            }`}
                          >
                            <p className="font-bold">
                              {item.atingiu ? "✅" : "❌"} {item.titulo} —{" "}
                              {item.pontos.toFixed(2)}
                            </p>
                            {!item.atingiu && (
                              <p className="text-sm">{item.melhoria}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={corrigirTodasAsQuestoes}
              className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white hover:bg-slate-800"
            >
              Corrigir todas as questões
            </button>
          </section>
        )}

        {aba === "correcao" && (
          <section className="rounded-3xl border bg-white p-5 md:p-6">
            <h2 className="text-3xl font-black">Resultado final</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-5 text-center">
                <p className="text-sm font-bold text-slate-500">Peça</p>
                <p className="text-4xl font-black">
                  {resultadoFinal.notaPeca.toFixed(2)}
                </p>
                <p>/5,00</p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5 text-center">
                <p className="text-sm font-bold text-slate-500">Questões</p>
                <p className="text-4xl font-black">
                  {resultadoFinal.notaQuestoes.toFixed(2)}
                </p>
                <p>/5,00</p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5 text-center">
                <p className="text-sm font-bold text-slate-500">Final</p>
                <p
                  className={`text-4xl font-black ${classeNota(
                    resultadoFinal.notaFinal
                  )}`}
                >
                  {resultadoFinal.notaFinal.toFixed(2)}
                </p>
                <p>/10,00</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-400">Diagnóstico</p>
              <p
                className={`mt-2 text-3xl font-black ${
                  resultadoFinal.aprovado ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {resultadoFinal.aprovado
                  ? "APROVADO COM PADRÃO 8+"
                  : "AINDA ABAIXO DA META 8,0"}
              </p>

              {!resultadoFinal.aprovado && (
                <p className="mt-3 text-slate-300">
                  Refaça os itens não pontuados na peça e nas questões antes de
                  avançar para o próximo simulado.
                </p>
              )}
            </div>
          </section>
        )}

        {aba === "revisao" && (
          <section className="rounded-3xl border bg-white p-5 md:p-6">
            <h2 className="text-3xl font-black">Revisão obrigatória</h2>
            <p className="mt-2 text-slate-600">
              O app deve bloquear o avanço quando a nota final for menor que 8,0.
              Use os pontos fracos como lista de revisão.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="font-black">1. Refazer estrutura</h3>
                <p className="mt-2 text-sm">
                  Endereçamento, partes, cabimento, competência, mérito, pedidos
                  e fechamento.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="font-black">2. Lei seca</h3>
                <p className="mt-2 text-sm">
                  Reescrever os artigos e súmulas faltantes até memorizar.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <h3 className="font-black">3. Nova tentativa</h3>
                <p className="mt-2 text-sm">
                  Reenviar a peça corrigida até atingir nota mínima de segurança.
                </p>
              </div>
            </div>
          </section>
        )}

        {aba === "banco" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-5 md:p-6">
              <h2 className="text-3xl font-black">Banco de peças</h2>
              <div className="mt-5 space-y-4">
                {bancoPecas.map((peca) => (
                  <div key={peca.id} className="rounded-2xl bg-slate-100 p-4">
                    <p className="font-black">{peca.nome}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Valor: {peca.valor.toFixed(2)} pontos
                    </p>
                    <p className="mt-2 text-sm">{peca.enunciado}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-5 md:p-6">
              <h2 className="text-3xl font-black">Banco de questões</h2>
              <div className="mt-5 space-y-4">
                {bancoQuestoes.map((questao) => (
                  <div
                    key={questao.id}
                    className="rounded-2xl bg-slate-100 p-4"
                  >
                    <p className="font-black">{questao.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Valor: {questao.valor.toFixed(2)} pontos
                    </p>
                    <p className="mt-2 text-sm">{questao.enunciado}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}