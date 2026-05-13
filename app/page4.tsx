"use client";

import { useMemo, useState } from "react";

// --- TIPAGENS ---
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

// --- BANCO DE DADOS LOCAL (Mesmo acervo premium) ---
const bancoPecas: PecaFGV[] = [
  {
    id: "ms-repressivo-ex45",
    nome: "1. Mandado de Segurança Repressivo (Exame 45)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "A sociedade empresária '1234 Soluções Industriais Ltda.' teve sua Certidão de Regularidade Fiscal (CPEN) negada pela Receita Federal, impedindo sua participação em licitação que ocorrerá em 10 dias. Ela possui três débitos: I) PIS (Execução fiscal garantida por penhora); II) COFINS Exportação (com exigibilidade suspensa/ativa mas imune); III) IRPF constituído há mais de 6 anos sem execução ajuizada.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento",
        pontos: 0.4,
        palavrasChave: ["vara federal", "seção judiciária", "juiz federal"],
        feedbackErro: "Faltou endereçar à Justiça Federal.",
        melhoria: "Enderece ao Juízo da Vara Federal da Seção Judiciária (Art. 109, I, CF). Lógica: Envolve a União/Receita, logo, foro federal.",
      },
      {
        id: "autoridade",
        titulo: "Autoridade Coatora e Legitimidade",
        pontos: 0.6,
        palavrasChave: ["delegado da receita federal", "união", "autoridade coatora", "pessoa jurídica interessada"],
        feedbackErro: "Faltou indicar a autoridade coatora ou a pessoa jurídica (União).",
        melhoria: "Indique o Delegado da Receita Federal como autoridade coatora e a União como interessada.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento e Tempestividade",
        pontos: 0.5,
        palavrasChave: ["direito líquido e certo", "prova pré-constituída", "120 dias"],
        feedbackErro: "Não justificou o cabimento do MS.",
        melhoria: "Mencione direito líquido e certo, prova pré-constituída e o prazo de 120 dias (Lei 12.016). Lógica: MS não aceita perícia, por isso a prova já vem pronta.",
      },
      {
        id: "merito1",
        titulo: "Mérito: PIS Garantido",
        pontos: 0.8,
        palavrasChave: ["penhora", "garantia", "art. 206", "ctn", "suspensão", "efeitos de negativa"],
        feedbackErro: "Faltou tese sobre o débito de PIS.",
        melhoria: "Explique que execução garantida por penhora dá direito à CPEN (Art. 206, CTN). Lógica: Se o juízo tem garantia patrimonial, o Estado não corre risco.",
      },
      {
        id: "merito2",
        titulo: "Mérito: COFINS Exportação",
        pontos: 0.8,
        palavrasChave: ["imunidade", "exportação", "art. 149", "§ 2º", "i"],
        feedbackErro: "Faltou tese sobre a COFINS.",
        melhoria: "Alegue imunidade da COFINS sobre receitas de exportação (Art. 149, § 2º, I, CF).",
      },
      {
        id: "merito3",
        titulo: "Mérito: Prescrição IRPJ",
        pontos: 0.8,
        palavrasChave: ["prescrição", "5 anos", "cinco anos", "art. 174", "extinção do crédito"],
        feedbackErro: "Faltou alegar a prescrição do IRPJ.",
        melhoria: "Demonstre a prescrição do IRPJ após 5 anos da constituição definitiva (Art. 174, CTN). Lógica: O Direito não socorre aos que dormem.",
      },
      {
        id: "liminar",
        titulo: "Pedido Liminar",
        pontos: 0.6,
        palavrasChave: ["liminar", "fumus boni iuris", "periculum in mora", "licitação", "certidão"],
        feedbackErro: "Não formulou pedido liminar adequadamente.",
        melhoria: "Peça liminar provando o risco ineficácia da medida (licitação) e a fumaça do bom direito.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos Finais",
        pontos: 0.5,
        palavrasChave: ["concessão da segurança", "notificação", "ciência", "ministério público"],
        feedbackErro: "Pedidos incompletos.",
        melhoria: "Requeira notificação, ciência à União, oitiva do MP e concessão em definitivo da segurança.",
      }
    ],
  },
  {
    id: "apelacao-ex41",
    nome: "2. Apelação (Exame 41)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "José (aposentado) foi diagnosticado com câncer. Pediu isenção de IRPF sobre a aposentadoria e restituição dos valores pagos administrativamente, mas foi negado por 'falta de contemporaneidade' (doença após aposentadoria). Ingressou com Ação Ordinária na Vara Federal. O juiz julgou improcedente alegando: falta de interesse de agir (não esgotou via administrativa), isenção exige lei específica e a doença ocorreu após aposentadoria.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento a quo e ad quem",
        pontos: 0.5,
        palavrasChave: ["vara única federal", "juízo", "tribunal regional federal", "trf"],
        feedbackErro: "Endereçamento dúplice incorreto.",
        melhoria: "Faça petição de interposição ao Juízo Federal e razões ao TRF da respectiva Região.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento e Preparo",
        pontos: 0.5,
        palavrasChave: ["apelação", "art. 1009", "15 dias", "preparo"],
        feedbackErro: "Faltou fundamentar o recurso.",
        melhoria: "Indique Apelação (Art. 1009, CPC), prazo de 15 dias e recolhimento de preparo.",
      },
      {
        id: "preliminar",
        titulo: "Preliminar: Afastar falta de interesse",
        pontos: 0.8,
        palavrasChave: ["inafastabilidade", "acesso à justiça", "art. 5", "xxxv", "esgotamento"],
        feedbackErro: "Não rebateu a preliminar do juiz.",
        melhoria: "Alegue violação ao princípio da inafastabilidade da jurisdição (Art. 5º, XXXV, CF).",
      },
      {
        id: "merito1",
        titulo: "Mérito: Doença após aposentadoria",
        pontos: 1.0,
        palavrasChave: ["súmula 598", "súmula 627", "contemporaneidade", "lei 7.713"],
        feedbackErro: "Faltou tese do STJ sobre aposentadoria.",
        melhoria: "Fundamente na Súmula 627 do STJ e Lei 7.713/88: não se exige contemporaneidade dos sintomas.",
      },
      {
        id: "merito2",
        titulo: "Mérito: Isenção",
        pontos: 1.0,
        palavrasChave: ["neoplasia maligna", "câncer", "isenção", "art. 6", "inciso xiv"],
        feedbackErro: "Não fundamentou o direito à isenção.",
        melhoria: "Cite a Lei 7.713/88, Art. 6º, XIV, que prevê isenção expressa para neoplasia maligna.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 1.2,
        palavrasChave: ["conhecimento", "provimento", "reforma da sentença", "procedência", "restituição", "honorários"],
        feedbackErro: "Pedidos de apelação incompletos.",
        melhoria: "Peça conhecimento, provimento para reformar a sentença, restituição dos valores e inversão da sucumbência.",
      }
    ],
  },
  {
    id: "agravo-ex38",
    nome: "3. Agravo de Instrumento (Exame 38)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "Entidade beneficente de assistência social importou próteses para doação. Fisco cobrou II e IPI-importação. A entidade ajuizou Ação Anulatória pedindo Tutela de Urgência para liberar as próteses e suspender os créditos. O Juízo da Vara da Fazenda Pública indeferiu a tutela sob argumento de que a imunidade não alcança impostos sobre comércio exterior. Redija a peça para reverter a decisão liminar.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento ao Tribunal",
        pontos: 0.5,
        palavrasChave: ["tribunal de justiça", "desembargador", "presidente do tribunal"],
        feedbackErro: "Endereçamento incorreto (Agravo vai direto pro Tribunal).",
        melhoria: "Enderece a peça diretamente ao Tribunal de Justiça do Estado Beta.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento",
        pontos: 0.6,
        palavrasChave: ["agravo de instrumento", "tutela provisória", "art. 1015", "inciso i"],
        feedbackErro: "Faltou base legal do cabimento.",
        melhoria: "Cite o Art. 1.015, I, CPC (cabimento contra decisão que indefere tutela provisória).",
      },
      {
        id: "antecipacao",
        titulo: "Tutela Antecipada Recursal",
        pontos: 0.8,
        palavrasChave: ["efeito suspensivo", "tutela recursal", "art. 1019", "inciso i", "liberação das mercadorias"],
        feedbackErro: "Faltou pedir tutela antecipada recursal.",
        melhoria: "Peça a tutela recursal (Art. 1019, I, CPC) para imediata liberação das próteses.",
      },
      {
        id: "merito1",
        titulo: "Mérito: Imunidade de Entidade Beneficente",
        pontos: 1.2,
        palavrasChave: ["imunidade", "entidade de assistência social", "art. 150", "inciso vi", "alínea c", "patrimônio"],
        feedbackErro: "Não abordou a imunidade da entidade.",
        melhoria: "Alegue imunidade tributária de impostos sobre patrimônio, renda ou serviços (Art. 150, VI, 'c', CF).",
      },
      {
        id: "merito2",
        titulo: "Mérito: Abrangência a Impostos Indiretos (II e IPI)",
        pontos: 1.2,
        palavrasChave: ["imposto de importação", "ipi", "repercussão econômica", "finalidades essenciais", "stf"],
        feedbackErro: "Não afastou a tese do juiz sobre comércio exterior.",
        melhoria: "Sustente que o STF entende que a imunidade alcança II e IPI na importação de bens afetos às finalidades essenciais.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 0.7,
        palavrasChave: ["conhecimento", "provimento", "reforma", "intimação do agravado", "comunicação ao juízo"],
        feedbackErro: "Pedidos recursais incompletos.",
        melhoria: "Peça conhecimento, provimento, intimação do Estado, comunicação ao juiz a quo e liberação dos bens.",
      }
    ],
  },
  {
    id: "repeticao-ex37",
    nome: "4. Ação de Repetição de Indébito (Exame 37)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "João (Município Alfa, sem vara federal) aderiu a PDV e recebeu valores de rescisão e férias proporcionais. O IRPF foi retido na fonte sobre todas as verbas. Passado 1 ano, João te procura para recuperar os valores indevidamente tributados pela União.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Competência Delegada / Justiça Federal",
        pontos: 0.5,
        palavrasChave: ["vara federal", "seção judiciária"],
        feedbackErro: "Endereçamento incorreto.",
        melhoria: "Enderece ao Juízo da Vara Federal. (Competência delegada para Execução Fiscal não se aplica a Repetição).",
      },
      {
        id: "cabimento",
        titulo: "Peça Correta",
        pontos: 0.5,
        palavrasChave: ["ação de repetição de indébito", "art. 165", "ctn", "art. 319"],
        feedbackErro: "Peça incorreta ou fundamento legal ausente.",
        melhoria: "Use Ação de Repetição de Indébito, Art. 165, I, CTN c/c 319 do CPC.",
      },
      {
        id: "merito1",
        titulo: "Mérito: PDV",
        pontos: 1.2,
        palavrasChave: ["pdv", "programa de demissão voluntária", "indenização", "súmula 215"],
        feedbackErro: "Faltou Súmula sobre PDV.",
        melhoria: "Fundamente que verba de PDV tem caráter indenizatório e não sofre IRPF (Súmula 215/STJ). Lógica: Imposto de Renda incide sobre acréscimo patrimonial. Indenização é mera reposição de perda.",
      },
      {
        id: "merito2",
        titulo: "Mérito: Férias Proporcionais",
        pontos: 1.2,
        palavrasChave: ["férias proporcionais", "natureza indenizatória", "súmula 386"],
        feedbackErro: "Faltou Súmula sobre férias proporcionais.",
        melhoria: "Alegue que férias proporcionais e seu terço constitucional são indenizatórios (Súmula 386/STJ).",
      },
      {
        id: "correcao",
        titulo: "Juros e Correção Monetária",
        pontos: 0.8,
        palavrasChave: ["selic", "trânsito em julgado", "súmula 188", "art. 167"],
        feedbackErro: "Esqueceu de pedir a correta atualização do valor.",
        melhoria: "Mencione a taxa SELIC e/ou Juros a partir do trânsito em julgado (Art. 167, CTN / Súmula 188 STJ).",
      },
      {
        id: "pedidos",
        titulo: "Pedidos Finais",
        pontos: 0.8,
        palavrasChave: ["citação", "procedência", "restituição", "custas", "honorários", "provas", "dispensa de audiência"],
        feedbackErro: "Faltou pedidos essenciais do CPC.",
        melhoria: "Peça citação, restituição, honorários, produção de provas e opção sobre audiência de conciliação.",
      }
    ],
  },
  {
    id: "anulatoria-ex39",
    nome: "5. Ação Anulatória de Débito Fiscal (Exame 39)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "Pedro recebeu notificação para pagar Contribuição de Melhoria (em 3 parcelas) por obra asfáltica. Porém, a lei que instituiu foi publicada há 90 dias, e o imóvel de Pedro fica em outro bairro e sofreu desvalorização. O tributo não foi pago. Elabore a peça para anular o lançamento.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento",
        pontos: 0.5,
        palavrasChave: ["vara de fazenda pública", "vara única", "juiz de direito", "município"],
        feedbackErro: "Endereçamento incorreto.",
        melhoria: "Enderece à Vara da Fazenda Pública / Vara Única Estadual da Comarca.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento",
        pontos: 0.5,
        palavrasChave: ["ação anulatória", "art. 38", "lei 6.830"],
        feedbackErro: "Peça errada ou mal fundamentada.",
        melhoria: "Ação Anulatória de Débito Fiscal, com base no Art. 38 da LEF (Lei 6.830/80).",
      },
      {
        id: "tutela",
        titulo: "Tutela de Urgência",
        pontos: 0.8,
        palavrasChave: ["tutela", "art. 300", "cpc", "suspensão da exigibilidade", "art. 151"],
        feedbackErro: "Esqueceu o pedido de tutela para suspender o débito.",
        melhoria: "Peça Tutela de Urgência (Art. 300 CPC c/c Art. 151, V, CTN) para evitar a inscrição em dívida ativa.",
      },
      {
        id: "merito1",
        titulo: "Mérito: Valorização Imobiliária",
        pontos: 1.2,
        palavrasChave: ["valorização", "requisito", "desvalorização", "art. 81", "ctn", "art. 145", "inciso iii"],
        feedbackErro: "Faltou a essência da Contribuição de Melhoria.",
        melhoria: "Explique que a contribuição de melhoria exige comprovação de valorização imobiliária, o que não ocorreu (Art. 81 CTN).",
      },
      {
        id: "merito2",
        titulo: "Mérito: Anterioridade",
        pontos: 1.0,
        palavrasChave: ["anterioridade", "exercício seguinte", "anual", "art. 150", "inciso iii", "alínea b"],
        feedbackErro: "Não percebeu a pegadinha da anterioridade.",
        melhoria: "A CM exige respeito à anterioridade anual E nonagesimal. A lei publicou e cobrou no mesmo ano (violação ao art. 150, III, 'b', CF).",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 1.0,
        palavrasChave: ["procedência", "anulação do lançamento", "citação", "honorários", "provas"],
        feedbackErro: "Pedidos insuficientes.",
        melhoria: "Peça procedência para anular o débito, citação do Município, honorários e provas (especialmente perícia de engenharia).",
      }
    ],
  },
  {
    id: "embargos-execucao",
    nome: "6. Embargos à Execução Fiscal",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "O Estado 'X' ajuizou Execução Fiscal contra a empresa Ômega. Diante do não pagamento, o juiz determinou bloqueio judicial via BacenJud nas contas da empresa, garantindo integralmente o juízo. A empresa Ômega alega que o ICMS cobrado já foi extinto por decadência (passaram-se 6 anos sem lançamento). Apresente a medida de defesa cabível no prazo de 30 dias.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento aos autos anexos",
        pontos: 0.5,
        palavrasChave: ["distribuição por dependência", "juízo", "vara de execução fiscal"],
        feedbackErro: "Endereçamento incorreto.",
        melhoria: "Enderece ao juízo da execução, pedindo distribuição por dependência (Art. 914, §1º, CPC).",
      },
      {
        id: "cabimento",
        titulo: "Cabimento e Tempestividade",
        pontos: 0.8,
        palavrasChave: ["embargos à execução", "30 dias", "trinta dias", "art. 16", "lei 6.830", "lef"],
        feedbackErro: "Faltou base legal ou menção ao prazo.",
        melhoria: "Indique Embargos à Execução Fiscal, tempestivos no prazo de 30 dias (Art. 16, LEF).",
      },
      {
        id: "garantia",
        titulo: "Garantia do Juízo",
        pontos: 0.7,
        palavrasChave: ["juízo garantido", "penhora", "bloqueio", "art. 16", "§ 1º"],
        feedbackErro: "Não mencionou que o juízo está garantido.",
        melhoria: "Destaque que o cabimento depende da garantia do juízo, suprida pelo bloqueio BacenJud (Art. 16, § 1º, LEF).",
      },
      {
        id: "efeito",
        titulo: "Efeito Suspensivo",
        pontos: 0.8,
        palavrasChave: ["efeito suspensivo", "art. 919", "§ 1º", "cpc"],
        feedbackErro: "Esqueceu de pedir efeito suspensivo aos embargos.",
        melhoria: "Peça efeito suspensivo, já que o juízo está garantido e há probabilidade do direito (Art. 919, §1º, CPC).",
      },
      {
        id: "merito",
        titulo: "Mérito: Decadência",
        pontos: 1.2,
        palavrasChave: ["decadência", "5 anos", "cinco anos", "art. 150", "§ 4º", "art. 173", "extinção", "art. 156"],
        feedbackErro: "Faltou a tese de mérito (decadência).",
        melhoria: "Alegue que houve decadência do ICMS, pois o prazo de lançamento de 5 anos esgotou, causando extinção do crédito (Art. 156, V, CTN).",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 1.0,
        palavrasChave: ["procedência", "extinção da execução", "desconstituição da penhora", "intimação", "provas", "honorários"],
        feedbackErro: "Pedidos incompletos.",
        melhoria: "Peça extinção da execução, levantamento da penhora, intimação da Fazenda para impugnar e sucumbência.",
      }
    ],
  },
  {
    id: "epe-ex36",
    nome: "7. Exceção de Pré-Executividade (Exame 36)",
    area: "Direito Tributário",
    valor: 5.0,
    enunciado:
      "O Estado Beta ajuizou em agosto de 2021 Execução Fiscal contra Maria para cobrar IPVA (2015 a 2020). Ocorre que Maria faleceu em junho de 2021. A citação foi despachada. Você é contratado pelos herdeiros para extinguir o processo de plano, sem garantir o juízo.",
    espelho: [
      {
        id: "enderecamento",
        titulo: "Endereçamento aos próprios autos",
        pontos: 0.5,
        palavrasChave: ["juízo da execução", "vara de fazenda pública", "nos próprios autos"],
        feedbackErro: "Endereçamento equivocado.",
        melhoria: "Apresente petição simples atravessada nos próprios autos da Execução Fiscal.",
      },
      {
        id: "cabimento",
        titulo: "Cabimento (EPE)",
        pontos: 0.8,
        palavrasChave: ["exceção de pré-executividade", "súmula 393", "ordem pública", "desnecessidade de dilação", "sem garantia"],
        feedbackErro: "Não justificou o uso da EPE.",
        melhoria: "Invoque a Súmula 393/STJ: matéria de ordem pública, prova pré-constituída e desnecessidade de garantia.",
      },
      {
        id: "merito1",
        titulo: "Mérito: Ilegitimidade Passiva",
        pontos: 1.2,
        palavrasChave: ["ilegitimidade passiva", "óbito", "falecimento antes do ajuizamento", "capacidade processual"],
        feedbackErro: "Faltou apontar a ilegitimidade.",
        melhoria: "Alegue que o falecimento ocorreu antes do ajuizamento, havendo ilegitimidade passiva da parte executada. Lógica: Morto não é parte legítima para figurar no polo inicial.",
      },
      {
        id: "merito2",
        titulo: "Mérito: Impossibilidade de Redirecionamento",
        pontos: 1.5,
        palavrasChave: ["súmula 392", "stj", "vedado o redirecionamento", "nulidade da cda", "substituição"],
        feedbackErro: "Faltou a Súmula de ouro sobre a CDA.",
        melhoria: "Mencione a Súmula 392/STJ: a Fazenda não pode substituir a CDA para alterar o sujeito passivo (espólio/herdeiros) quando o erro ocorreu no lançamento.",
      },
      {
        id: "pedidos",
        titulo: "Pedidos",
        pontos: 1.0,
        palavrasChave: ["acolhimento", "extinção da execução", "nulidade", "condenação", "honorários"],
        feedbackErro: "Pedidos incompletos.",
        melhoria: "Peça o acolhimento da exceção, extinção da execução fiscal por nulidade da CDA e condenação em honorários advocatícios.",
      }
    ],
  }
];

const bancoQuestoes: QuestaoFGV[] = [
  {
    id: "q1-cide-exportacao-ex36",
    titulo: "1. CIDE x Exportação (Exame 36)",
    enunciado:
      "A União instituiu Contribuição de Intervenção no Domínio Econômico (CIDE) com alíquota específica por tonelada sobre a venda de determinado produto. A empresa que exporta tal produto questiona: A) A CIDE incide sobre exportação? B) É lícita a cobrança de CIDE por alíquota específica?",
    valor: 1.25,
    espelho: [
      {
        id: "a-imunidade",
        titulo: "A) Imunidade Exportação",
        pontos: 0.65,
        palavrasChave: ["não incide", "imunidade", "receitas de exportação", "art. 149", "§ 2º", "inciso i"],
        feedbackErro: "Errou sobre a imunidade nas exportações.",
        melhoria: "Responda NÃO. Existe imunidade de CIDE e Contribuições Sociais sobre receitas de exportação (Art. 149, §2º, I, CF). Lógica: O Brasil quer exportar mais para trazer dólares. Não se tributa o que vai para fora.",
      },
      {
        id: "b-aliquota",
        titulo: "B) Alíquota Específica",
        pontos: 0.60,
        palavrasChave: ["sim", "alíquota específica", "unidade de medida", "art. 149", "§ 2º", "inciso iii"],
        feedbackErro: "Errou sobre as alíquotas da CIDE.",
        melhoria: "Responda SIM. A CF autoriza expressamente a CIDE com alíquota específica baseada na unidade de medida (Art. 149, §2º, III, 'b', CF).",
      }
    ],
  },
  {
    id: "q2-iptu-locatario-ex37",
    titulo: "2. IPTU e Locatário (Exame 37)",
    enunciado:
      "O Sindicato de Empregadores aluga imóvel comercial. O contrato prevê que o inquilino paga o IPTU. O Sindicato ajuíza ação de restituição do IPTU pago: A) O locatário tem legitimidade para ajuizar a ação? B) Há imunidade do IPTU para sindicato patronal?",
    valor: 1.25,
    espelho: [
      {
        id: "a-ilegitimidade",
        titulo: "A) Ilegitimidade do Locatário",
        pontos: 0.65,
        palavrasChave: ["não possui legitimidade", "ilegitimidade", "súmula 614", "stj", "art. 123", "ctn"],
        feedbackErro: "Errou sobre a legitimidade ativa.",
        melhoria: "Responda NÃO. Contrato particular não oponível à Fazenda (Art. 123, CTN) e locatário não tem legitimidade (Súmula 614/STJ). Lógica: O Fisco não quer saber de contratos privados, só de quem é dono no cartório.",
      },
      {
        id: "b-imunidade-patronal",
        titulo: "B) Inexistência de Imunidade",
        pontos: 0.60,
        palavrasChave: ["não tem razão", "trabalhadores", "empregados", "art. 150", "inciso vi", "alínea c"],
        feedbackErro: "Errou a imunidade sindical.",
        melhoria: "Responda NÃO. A imunidade da CF abrange apenas sindicatos de trabalhadores, não patronal (Art. 150, VI, 'c', CF).",
      }
    ],
  },
  {
    id: "q3-residual-ex35",
    titulo: "3. Contribuição Residual (Exame 35)",
    enunciado:
      "A União institui Nova Contribuição Social Residual de Seguridade Social por meio de Medida Provisória, com vigência em 30 dias. A) O veículo legislativo está correto? B) O prazo de vigência está adequado?",
    valor: 1.25,
    espelho: [
      {
        id: "a-leicomplementar",
        titulo: "A) Necessidade de Lei Complementar",
        pontos: 0.65,
        palavrasChave: ["não", "lei complementar", "art. 195", "§ 4º", "art. 154", "inciso i"],
        feedbackErro: "Errou sobre a espécie normativa exigida.",
        melhoria: "Responda NÃO. Impostos e Contribuições Residuais exigem Lei Complementar obrigatoriamente (Art. 195, §4º c/c Art. 154, I, CF). Lógica: Tudo que é 'residual' (novo/extra) exige quórum maior (LC) para proteger o contribuinte.",
      },
      {
        id: "b-noventena",
        titulo: "B) Anterioridade Nonagesimal",
        pontos: 0.60,
        palavrasChave: ["não", "90 dias", "noventa dias", "anterioridade nonagesimal", "art. 195", "§ 6º"],
        feedbackErro: "Errou a regra de anterioridade para Seguridade.",
        melhoria: "Responda NÃO. Contribuições da Seguridade Social exigem anterioridade nonagesimal (90 dias) para cobrança (Art. 195, § 6º, CF).",
      }
    ],
  },
  {
    id: "q4-cpen-declaracao-ex39",
    titulo: "4. DCTF e Certidão (Exame 39)",
    enunciado:
      "Empresa envia declaração de débitos (DCTF) reconhecendo o tributo, mas não paga. A Fazenda ajuíza execução sem emitir notificação prévia de lançamento. A empresa solicita Certidão Positiva com Efeitos de Negativa (CPEN). A) A execução é válida sem lançamento de ofício? B) A empresa tem direito à CPEN?",
    valor: 1.25,
    espelho: [
      {
        id: "a-sumula436",
        titulo: "A) Constituição por Declaração",
        pontos: 0.65,
        palavrasChave: ["sim", "constitui o crédito", "dispensada", "outra providência", "súmula 436", "stj", "lançamento por homologação"],
        feedbackErro: "Errou a tese de constituição do crédito.",
        melhoria: "Responda SIM. A declaração do contribuinte constitui o crédito, dispensando notificação (Súmula 436/STJ). Lógica: Se você mesmo declarou que deve, o Fisco não precisa te avisar de novo.",
      },
      {
        id: "b-cpen",
        titulo: "B) Negativa de CPEN",
        pontos: 0.60,
        palavrasChave: ["não tem direito", "recusa", "súmula 446", "stj", "art. 206", "ctn"],
        feedbackErro: "Concedeu a certidão indevidamente.",
        melhoria: "Responda NÃO. Declarado e não pago, o débito é exigível, sendo legítima a recusa da CPEN (Súmula 446/STJ).",
      }
    ],
  }
];

// --- LÓGICA LOCAL ---
function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

function corrigirPecaLocal(texto: string, peca: PecaFGV): CorrecaoPeca {
  const itens = corrigirItens(texto, peca.espelho);
  const nota = Number(Math.min(peca.valor, itens.reduce((total, item) => total + item.pontos, 0)).toFixed(2));
  const pontosFortes = itens.filter((item) => item.atingiu).map((item) => item.titulo);
  const pontosFracos = itens.filter((item) => !item.atingiu).map((item) => item.feedbackErro);
  const planoMelhoria = itens.filter((item) => !item.atingiu).map((item) => item.melhoria);

  return { peca: peca.nome, nota, notaMaxima: peca.valor, itens, pontosFortes, pontosFracos, planoMelhoria };
}

function corrigirQuestaoLocal(texto: string, questao: QuestaoFGV): CorrecaoQuestao {
  const itens = corrigirItens(texto, questao.espelho);
  const nota = Number(Math.min(questao.valor, itens.reduce((total, item) => total + item.pontos, 0)).toFixed(2));
  return { id: questao.id, titulo: questao.titulo, nota, notaMaxima: questao.valor, itens };
}

function calcularResultadoFinal(notaPeca: number, notasQuestoes: CorrecaoQuestao[]): ResultadoFinal {
  const totalQuestoes = notasQuestoes.reduce((total, questao) => total + questao.nota, 0);
  const notaQuestoes = Number(Math.min(5, totalQuestoes).toFixed(2));
  const notaFinal = Number(Math.min(10, notaPeca + notaQuestoes).toFixed(2));
  return { notaPeca: Number(Math.min(5, notaPeca).toFixed(2)), notaQuestoes, notaFinal, aprovado: notaFinal >= 8 };
}

function classeNota(nota: number): string {
  if (nota >= 8) return "text-emerald-400 font-black";
  if (nota >= 6) return "text-amber-400 font-black";
  return "text-slate-300 font-bold";
}

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [aba, setAba] = useState<Aba>("peca");
  const [pecaId, setPecaId] = useState<string>(bancoPecas[0].id);
  const [textoPeca, setTextoPeca] = useState<string>("");
  const [respostasQuestoes, setRespostasQuestoes] = useState<Record<string, string>>({});
  
  const [correcaoPeca, setCorrecaoPeca] = useState<CorrecaoPeca | null>(null);
  const [correcoesQuestoes, setCorrecoesQuestoes] = useState<CorrecaoQuestao[]>([]);
  
  const [corrigindo, setCorrigindo] = useState(false);
  const [feedbackIA, setFeedbackIA] = useState("");
  const [hiperfoco, setHiperfoco] = useState(false);

  const pecaAtual = useMemo(() => bancoPecas.find((peca) => peca.id === pecaId) ?? bancoPecas[0], [pecaId]);
  const resultadoFinal = useMemo(() => calcularResultadoFinal(correcaoPeca?.nota ?? 0, correcoesQuestoes), [correcaoPeca, correcoesQuestoes]);

  function enviarPecaParaCorrecao() {
    if (!textoPeca.trim()) {
      alert("Sua mente está pronta. Dê o primeiro passo e escreva sua peça antes de enviar!");
      return;
    }

    setCorrigindo(true);
    setHiperfoco(false); // Desativa o hiperfoco para ver o resultado

    setTimeout(() => {
      const resultadoLocal = corrigirPecaLocal(textoPeca, pecaAtual);
      setCorrecaoPeca(resultadoLocal);

      // Comando Hipnótico de PNL: Ancorar o erro como algo positivo e induzir a lógica
      const textoFeedback = `Respire fundo. Enquanto você lê este resultado, seu cérebro já está criando novas conexões neurais. Você garantiu ${resultadoLocal.nota.toFixed(2)} de ${resultadoLocal.notaMaxima.toFixed(2)}.\n\n` +
        (resultadoLocal.pontosFracos.length > 0 
          ? `Sabe o que separa os aprovados dos demais? A capacidade de usar o erro a seu favor. O seu foco agora não é o que faltou, mas o ajuste rápido que vai garantir a sua aprovação. Pessoas brilhantes como você usam essa oportunidade como degrau.\n\nAbsorva a lógica por trás destes pequenos detalhes:\n- ${resultadoLocal.pontosFracos.join('\n- ')}\n\nVocê percebe que entender isso agora torna a prova real muito mais fácil? Desça até o espelho detalhado, olhe para cada item e repita mentalmente: "Isso faz sentido".` 
          : `Extraordinário! Sinta a satisfação de um trabalho perfeito. Sua mente já absorveu completamente o padrão FGV. A sua carteira da OAB já é uma realidade inevitável.`);

      setFeedbackIA(textoFeedback);
      setCorrigindo(false);
    }, 1500);
  }

  function corrigirTodasAsQuestoes(): void {
    const resultados = bancoQuestoes.map((questao) => corrigirQuestaoLocal(respostasQuestoes[questao.id] ?? "", questao));
    setCorrecoesQuestoes(resultados);
  }

  function alterarRespostaQuestao(id: string, texto: string): void {
    setRespostasQuestoes((prev) => ({ ...prev, [id]: texto }));
  }

  function inserirModeloBasico(): void {
    setTextoPeca(`EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA... 

(Qualificação do autor), por seu advogado, vem respeitosamente propor

NOME DA PEÇA

com fulcro nos artigos pertinentes, em face de (Qualificação do Réu/Fazenda), pelos fundamentos a seguir:

I - DOS FATOS
(Breve resumo do enunciado. Aqui o examinador só quer saber se você leu a história).

II - DO CABIMENTO E TEMPESTIVIDADE
(Mostre que você sabe a regra do jogo e o prazo legal).

III - DO DIREITO
(Sua grande tese. Lembre-se: FATO + FUNDAMENTO LOGICO + CONCLUSÃO).

IV - DO PEDIDO LIMINAR OU EFEITO SUSPENSIVO
(O risco da demora e a fumaça do bom direito).

V - DOS PEDIDOS
(Citação, procedência, custas e honorários).

Dá-se à causa o valor cabível.
Pede deferimento.
Local e data.
Advogado / OAB`);
    setCorrecaoPeca(null);
    setFeedbackIA("");
  }

  return (
    <main className={`min-h-screen transition-all duration-700 ${hiperfoco ? "bg-slate-950 p-2 md:p-4" : "bg-slate-50 p-4 md:p-8"} text-slate-900`}>
      <div className={`mx-auto max-w-7xl rounded-3xl transition-all duration-700 ${hiperfoco ? "bg-slate-900 border border-slate-800" : "bg-white shadow-2xl border-t-8 border-emerald-500"} p-5 md:p-8`}>
        
        {/* Cabeçalho que some no Modo Hiperfoco */}
        {!hiperfoco && (
          <section className="rounded-3xl bg-slate-900 p-6 text-white md:p-8 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
            
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
              Treino de Elite — Você no Controle
            </p>
            <h1 className="mt-2 text-4xl font-black md:text-6xl text-white">
              A Sua Aprovação <span className="text-emerald-400">é Inevitável</span>
            </h1>
            <p className="mt-4 max-w-3xl text-slate-300 text-lg leading-relaxed">
              Acredite: você já tem a capacidade intelectual exata para dominar a FGV. Este sistema não apenas corrige seus erros, ele trabalha junto com a sua mente para criar o <strong>hiperfoco</strong> necessário.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-800/80 p-4 text-center border border-slate-700">
                <p className="text-sm font-bold text-slate-400">Pontuação da Peça</p>
                <p className="text-4xl font-black mt-1">{resultadoFinal.notaPeca.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-slate-800/80 p-4 text-center border border-slate-700">
                <p className="text-sm font-bold text-slate-400">Questões</p>
                <p className="text-4xl font-black mt-1">{resultadoFinal.notaQuestoes.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-slate-800/80 p-4 text-center border border-emerald-900/50">
                <p className="text-sm font-bold text-emerald-400">Sua Nota Rumo à Vitória</p>
                <p className={`mt-1 text-4xl ${classeNota(resultadoFinal.notaFinal)}`}>
                  {resultadoFinal.notaFinal.toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        )}

        {!hiperfoco && (
          <nav className="my-8 flex flex-wrap gap-3 border-b border-slate-200 pb-4">
            {(["peca", "questoes", "correcao", "revisao", "banco"] as Aba[]).map((item) => (
              <button
                key={item}
                onClick={() => setAba(item)}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                  aba === item
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item === "peca" && "Sua Peça"}
                {item === "questoes" && "Suas Questões"}
                {item === "correcao" && "Diagnóstico Final"}
                {item === "revisao" && "Instalação Mental (TDAH)"}
                {item === "banco" && "Acervo FGV"}
              </button>
            ))}
          </nav>
        )}

        {aba === "peca" && (
          <section className={`grid gap-6 ${hiperfoco ? "lg:grid-cols-1 max-w-4xl mx-auto" : "lg:grid-cols-2"}`}>
            <div className={`rounded-3xl border transition-all ${hiperfoco ? "border-slate-800 bg-slate-900 p-6" : "border-slate-200 bg-white p-5 md:p-6 shadow-sm"}`}>
              
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-black ${hiperfoco ? "text-emerald-400" : "text-slate-800"}`}>
                  {hiperfoco ? "Área de Hiperfoco" : "A Prática Leva à Perfeição"}
                </h2>
                <button 
                  onClick={() => setHiperfoco(!hiperfoco)}
                  className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${hiperfoco ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                >
                  {hiperfoco ? "Sair do Hiperfoco" : "🧠 Ativar Hiperfoco (TDAH)"}
                </button>
              </div>

              {!hiperfoco && (
                <select
                  value={pecaId}
                  onChange={(event) => { setPecaId(event.target.value); setCorrecaoPeca(null); setFeedbackIA(""); }}
                  className="mt-6 w-full rounded-2xl border-2 border-slate-200 p-3.5 bg-slate-50 text-slate-700 focus:border-emerald-500 focus:ring-0 transition"
                >
                  {bancoPecas.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
                </select>
              )}

              <div className={`mt-5 rounded-2xl p-5 ${hiperfoco ? "bg-slate-800 text-slate-300" : "bg-blue-50 border border-blue-100 text-blue-800"}`}>
                <p className={`font-black ${hiperfoco ? "text-slate-400" : "text-blue-900"}`}>Caso Clínico (Foque nos dados reais)</p>
                <p className="mt-2 text-sm leading-relaxed">{pecaAtual.enunciado}</p>
              </div>

              <textarea
                value={textoPeca}
                onChange={(event) => setTextoPeca(event.target.value)}
                placeholder="Sua mente é brilhante. Comece a digitar o esqueleto da sua peça aqui..."
                className={`mt-5 w-full rounded-2xl border-2 p-5 focus:ring-0 resize-none transition-all ${hiperfoco ? "h-[600px] bg-slate-950 border-slate-800 text-emerald-50 focus:border-emerald-500" : "h-[480px] bg-white border-slate-200 text-slate-700 focus:border-emerald-500"}`}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={enviarPecaParaCorrecao}
                  disabled={corrigindo}
                  className={`rounded-2xl px-8 py-4 font-black transition-all shadow-lg w-full md:w-auto ${hiperfoco ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"}`}
                >
                  {corrigindo ? "Sincronizando com a FGV..." : "Consolidar Minha Peça e Ver o Resultado"}
                </button>
                {!hiperfoco && (
                  <button onClick={inserirModeloBasico} className="rounded-2xl bg-slate-100 px-6 py-4 font-bold text-slate-600 hover:bg-slate-200 w-full md:w-auto">
                    Carregar Esqueleto Base
                  </button>
                )}
              </div>
            </div>

            {/* Coluna de Correção - Fica oculta no Hyperfocus */}
            {!hiperfoco && (
              <div className="space-y-6">
                {feedbackIA && (
                  <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                    <h2 className="mb-3 text-2xl font-black text-emerald-900 flex items-center gap-2">
                      <span>🧠</span> Mentoria Direta
                    </h2>
                    <div className="text-[15px] leading-relaxed text-emerald-900 font-medium whitespace-pre-wrap relative z-10">{feedbackIA}</div>
                  </div>
                )}
                
                {correcaoPeca && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 mb-4">A Lógica por trás do Espelho (FGV)</h2>
                    <p className="text-sm text-slate-500 mb-4">Leia a dica abaixo de cada item que errou. Entender o <strong>porquê</strong> é 10x mais forte que decorar.</p>
                    <div className="space-y-3">
                      {correcaoPeca.itens.map((item) => (
                        <div key={item.titulo} className={`rounded-2xl border p-4 transition-all ${item.atingiu ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className={`font-bold ${item.atingiu ? "text-emerald-800" : "text-slate-700"}`}>
                              {item.atingiu ? "✅" : "⭕"} {item.titulo}
                            </p>
                            <span className={`px-2 py-1 rounded-md text-xs font-black ${item.atingiu ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                              {item.pontos.toFixed(2)} pts
                            </span>
                          </div>
                          {!item.atingiu && (
                            <div className="mt-3 text-sm pl-6 border-l-4 border-amber-400 bg-white p-3 rounded-r-xl shadow-sm">
                              <span className="font-black text-amber-600 block mb-1">A Lógica da Banca:</span>
                              <span className="text-slate-700">{item.melhoria}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {aba === "questoes" && !hiperfoco && (
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800">Sua Batalha Discursiva</h2>
              <p className="mt-2 text-slate-600">
                Sua intuição geralmente está certa. Escreva diretamente ao ponto: <strong>Sim ou Não + A Lógica + O Artigo.</strong> Confie na sua capacidade.
              </p>
            </div>

            {bancoQuestoes.map((questao, index) => {
              const correcao = correcoesQuestoes.find(c => c.id === questao.id);
              return (
                <div key={questao.id} className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-1 rounded-md">Q{index + 1}</span>
                        <h3 className="text-xl font-black text-slate-800">{questao.titulo}</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{questao.enunciado}</p>
                    </div>
                  </div>
                  <textarea
                    value={respostasQuestoes[questao.id] ?? ""}
                    onChange={(e) => alterarRespostaQuestao(questao.id, e.target.value)}
                    placeholder="Visualize a lei fazendo sentido e digite sua resposta..."
                    className="mt-5 h-32 w-full rounded-2xl border-2 border-slate-200 p-5 focus:border-emerald-500 focus:ring-0 transition"
                  />
                  {correcao && (
                    <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <p className="font-black text-emerald-600 text-lg mb-3">Nota: {correcao.nota.toFixed(2)} / {correcao.notaMaxima.toFixed(2)}</p>
                      <div className="space-y-3">
                        {correcao.itens.map((item) => (
                          <div key={item.titulo} className={`p-4 rounded-xl border ${item.atingiu ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-200"}`}>
                            <p className={`font-bold ${item.atingiu ? "text-emerald-800" : "text-slate-700"}`}>
                              {item.atingiu ? "✅" : "⭕"} {item.titulo} <span className="text-slate-400 font-normal">({item.pontos.toFixed(2)} pts)</span>
                            </p>
                            {!item.atingiu && (
                              <div className="mt-2 text-sm border-l-2 border-amber-400 pl-3">
                                <span className="font-bold text-slate-800">Entenda o porquê: </span>
                                <span className="text-slate-600">{item.melhoria}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={corrigirTodasAsQuestoes} className="rounded-2xl bg-emerald-600 px-8 py-4 font-black text-white hover:bg-emerald-700 shadow-lg w-full md:w-auto">
              Confirmar Respostas e Aprender a Lógica
            </button>
          </section>
        )}

        {aba === "revisao" && !hiperfoco && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
            <h2 className="text-3xl font-black text-slate-800">Protocolo de Instalação Mental (TDAH)</h2>
            <p className="mt-3 text-slate-600 text-lg max-w-3xl">
              Cérebros ativos e acelerados não aprendem por repetição chata, aprendem por <strong>descoberta e estímulo lógico</strong>. Siga este comando triplo antes de ir para a próxima peça e veja como é impossível esquecer o assunto.
            </p>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-blue-50 p-8 border border-blue-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black transform group-hover:scale-110 transition">1</div>
                <h3 className="font-black text-2xl text-blue-900">Quebra de Padrão</h3>
                <p className="mt-4 text-blue-800 leading-relaxed font-medium">
                  Pare o que está fazendo. Olhe para fora da tela. Respire fundo por 4 segundos e solte por 4 segundos. Ao fazer isso, seu cérebro diminui a ansiedade de performance e abre espaço para registrar informação de longo prazo.
                </p>
              </div>

              <div className="rounded-3xl bg-amber-50 p-8 border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black transform group-hover:scale-110 transition">2</div>
                <h3 className="font-black text-2xl text-amber-900">A Lógica Oculta</h3>
                <p className="mt-4 text-amber-800 leading-relaxed font-medium">
                  Volte aos pontos vermelhos (⭕) da sua correção. Não tente decorar a regra. Pergunte-se: <em>"Por que o Estado criou essa lei desse jeito?"</em> Quando a lógica faz sentido, você não precisa mais da memória de curto prazo.
                </p>
              </div>

              <div className="rounded-3xl bg-emerald-50 p-8 border border-emerald-100 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black transform group-hover:scale-110 transition">3</div>
                <h3 className="font-black text-2xl text-emerald-900">Ancoragem do Sucesso</h3>
                <p className="mt-4 text-emerald-800 leading-relaxed font-medium">
                  Feche os olhos e imagine o dia da prova. Você lê uma questão parecida com essa que acabou de errar, dá um leve sorriso e escreve a resposta certa sem esforço algum. Repita: <em>"Eu entendi o jogo da banca."</em>
                </p>
              </div>
            </div>
          </section>
        )}

        {aba === "correcao" && !hiperfoco && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-10 shadow-sm text-center">
            <h2 className="text-4xl font-black text-slate-800">Sua Imagem como Advogado(a)</h2>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">Você não está estudando para "passar". Você está sendo moldado para advogar. Olhe para os números abaixo como indicadores da sua nova profissão.</p>

            <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Domínio de Peça</p>
                <p className="text-6xl font-black text-slate-800 mt-2">{resultadoFinal.notaPeca.toFixed(2)}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Análise de Questões</p>
                <p className="text-6xl font-black text-slate-800 mt-2">{resultadoFinal.notaQuestoes.toFixed(2)}</p>
              </div>
              <div className={`rounded-3xl p-8 border shadow-inner ${resultadoFinal.notaFinal >= 8 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                <p className={`text-sm font-bold uppercase tracking-widest ${resultadoFinal.notaFinal >= 8 ? "text-emerald-600" : "text-amber-600"}`}>Sua Nota OAB</p>
                <p className={`text-7xl font-black mt-2 ${resultadoFinal.notaFinal >= 8 ? "text-emerald-600" : "text-amber-600"}`}>
                  {resultadoFinal.notaFinal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className={`mt-12 rounded-3xl p-10 max-w-4xl mx-auto ${resultadoFinal.aprovado ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' : 'bg-slate-900 text-white shadow-2xl'}`}>
              <h3 className="text-4xl font-black">
                {resultadoFinal.aprovado ? "VOCÊ É IMPARÁVEL!" : "A CONSTÂNCIA TRAZ A VITÓRIA"}
              </h3>
              <p className="mt-5 text-xl opacity-90 leading-relaxed font-medium">
                {resultadoFinal.aprovado
                  ? "Sua mente está programada para gabaritar. Salve essa sensação de vitória e use-a como combustível para o próximo desafio."
                  : "A cada pequeno erro, você bloqueia um buraco por onde a sua aprovação poderia escapar. Celebre os erros de hoje, pois eles são a garantia do seu acerto amanhã. Volte à aba Peça, ligue o Hiperfoco e reconstrua sua resposta."}
              </p>
            </div>
          </section>
        )}

        {aba === "banco" && !hiperfoco && (
          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>📚</span> Missões de Peça FGV</h2>
              <div className="space-y-4">
                {bancoPecas.map((peca) => (
                  <div key={peca.id} className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-emerald-400 transition-colors shadow-sm group">
                    <p className="font-black text-lg text-slate-800">{peca.nome}</p>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{peca.enunciado}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>🎯</span> Missões de Questões</h2>
              <div className="space-y-4">
                {bancoQuestoes.map((q) => (
                  <div key={q.id} className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-blue-400 transition-colors shadow-sm">
                    <p className="font-black text-lg text-slate-800">{q.titulo}</p>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{q.enunciado}</p>
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