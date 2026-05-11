"use client";

import { useMemo, useState } from "react";

// --- TIPAGENS (100% TypeScript) ---
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

// --- BANCO DE DADOS LOCAL: PEÇAS (BASEADO NOS EXAMES FGV) ---
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
        melhoria: "Enderece ao Juízo da Vara Federal da Seção Judiciária (Art. 109, I, CF).",
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
        melhoria: "Mencione direito líquido e certo, prova pré-constituída e o prazo de 120 dias (Lei 12.016).",
      },
      {
        id: "merito1",
        titulo: "Mérito: PIS Garantido",
        pontos: 0.8,
        palavrasChave: ["penhora", "garantia", "art. 206", "ctn", "suspensão", "efeitos de negativa"],
        feedbackErro: "Faltou tese sobre o débito de PIS.",
        melhoria: "Explique que execução garantida por penhora dá direito à CPEN (Art. 206, CTN).",
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
        melhoria: "Demonstre a prescrição do IRPJ após 5 anos da constituição definitiva (Art. 174, CTN).",
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
        melhoria: "Alegue violação ao princípio da inafastabilidade da jurisdição (Art. 5º, XXXV, CF). Esgotamento administrativo não é obrigatório.",
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
        melhoria: "Fundamente que verba de PDV tem caráter indenizatório e não sofre IRPF (Súmula 215/STJ).",
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
        melhoria: "Alegue que o falecimento ocorreu antes do ajuizamento, havendo ilegitimidade passiva da parte executada.",
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

// --- BANCO DE DADOS LOCAL: QUESTÕES (ALEATÓRIAS FGV) ---
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
        melhoria: "Responda NÃO. Existe imunidade de CIDE e Contribuições Sociais sobre receitas de exportação (Art. 149, §2º, I, CF).",
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
        melhoria: "Responda NÃO. Contrato particular não oponível à Fazenda (Art. 123, CTN) e locatário não tem legitimidade ativa (Súmula 614/STJ).",
      },
      {
        id: "b-imunidade-patronal",
        titulo: "B) Inexistência de Imunidade",
        pontos: 0.60,
        palavrasChave: ["não tem razão", "trabalhadores", "empregados", "art. 150", "inciso vi", "alínea c"],
        feedbackErro: "Errou a imunidade sindical.",
        melhoria: "Responda NÃO. A imunidade da CF abrange apenas sindicatos de trabalhadores (empregados), não de empregadores/patronal (Art. 150, VI, 'c', CF).",
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
        melhoria: "Responda NÃO. Impostos e Contribuições Residuais exigem Lei Complementar obrigatoriamente (Art. 195, §4º c/c Art. 154, I, CF).",
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
        melhoria: "Responda SIM. A declaração do contribuinte constitui o crédito tributário, dispensando qualquer outra notificação (Súmula 436/STJ).",
      },
      {
        id: "b-cpen",
        titulo: "B) Negativa de CPEN",
        pontos: 0.60,
        palavrasChave: ["não tem direito", "recusa", "súmula 446", "stj", "art. 206", "ctn"],
        feedbackErro: "Concedeu a certidão indevidamente.",
        melhoria: "Responda NÃO. Declarado e não pago, o débito é exigível, sendo legítima a recusa da CPEN (Súmula 446/STJ e Art. 206 CTN).",
      }
    ],
  }
];

// --- LÓGICA LOCAL DE INTELIGÊNCIA (IA Baseada em Regras) ---
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

function corrigirPecaLocal(texto: string, peca: PecaFGV): CorrecaoPeca {
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

function corrigirQuestaoLocal(texto: string, questao: QuestaoFGV): CorrecaoQuestao {
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

  const pecaAtual = useMemo(() => {
    return bancoPecas.find((peca) => peca.id === pecaId) ?? bancoPecas[0];
  }, [pecaId]);

  const resultadoFinal = useMemo(() => {
    return calcularResultadoFinal(correcaoPeca?.nota ?? 0, correcoesQuestoes);
  }, [correcaoPeca, correcoesQuestoes]);

  function enviarPecaParaCorrecao() {
    if (!textoPeca.trim()) {
      alert("Digite sua peça antes de enviar.");
      return;
    }

    setCorrigindo(true);

    setTimeout(() => {
      const resultadoLocal = corrigirPecaLocal(textoPeca, pecaAtual);
      setCorrecaoPeca(resultadoLocal);

      const textoFeedback = `Correção Rápida Concluída!\n\nSua nota nesta peça foi ${resultadoLocal.nota.toFixed(2)} de ${resultadoLocal.notaMaxima.toFixed(2)}.\n\n` +
        (resultadoLocal.pontosFracos.length > 0 
          ? `⚠️ Atenção: Você deixou de pontuar nos seguintes itens estruturais:\n- ${resultadoLocal.pontosFracos.join('\n- ')}\n\nConsulte o espelho detalhado abaixo para ver o que precisa ser ajustado.` 
          : `🎉 Excelente! Você gabaritou esta peça e atingiu todos os pontos do espelho FGV.`);

      setFeedbackIA(textoFeedback);
      setCorrigindo(false);
    }, 800);
  }

  function corrigirTodasAsQuestoes(): void {
    const resultados = bancoQuestoes.map((questao) =>
      corrigirQuestaoLocal(respostasQuestoes[questao.id] ?? "", questao)
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
    setTextoPeca(`EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA... 
(Ou EXCELENTÍSSIMO SENHOR DESEMBARGADOR PRESIDENTE DO TRIBUNAL DE...)

(Qualificação do autor), por seu advogado, vem respeitosamente propor

NOME DA PEÇA

com fulcro nos artigos pertinentes, em face de (Qualificação do Réu/Fazenda), pelos fundamentos de fato e direito a seguir:

I - DOS FATOS
Breve resumo do enunciado.

II - DO CABIMENTO E TEMPESTIVIDADE
A presente peça é cabível com base na lei aplicável e protocolada dentro do prazo legal de X dias.

III - DO DIREITO
(Tese 1 - Fundamentação em Artigo / Súmula STF ou STJ)
(Tese 2 - Fundamentação em Artigo / Súmula STF ou STJ)

IV - DO PEDIDO LIMINAR OU EFEITO SUSPENSIVO
Estão presentes os requisitos (fumus boni iuris / periculum in mora) exigidos para a suspensão imediata.

V - DOS PEDIDOS
Diante do exposto, requer:
a) recebimento da petição;
b) citação / intimação da parte contrária;
c) procedência / provimento total do pedido;
d) condenação em custas e honorários.

Dá-se à causa o valor cabível.
Pede deferimento.
Local e data.
Advogado / OAB`);
    setCorrecaoPeca(null);
    setFeedbackIA("");
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
            corrige por espelho local, separa peça e questões e aponta exatamente onde
            melhorar instantaneamente.
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
                  setFeedbackIA("");
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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={enviarPecaParaCorrecao}
                  disabled={corrigindo}
                  className="rounded-2xl bg-black px-6 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {corrigindo ? "Corrigindo (IA Local)..." : "Enviar para correção rápida"}
                </button>

                <button
                  onClick={inserirModeloBasico}
                  className="rounded-2xl bg-slate-200 px-6 py-3 font-black hover:bg-slate-300"
                >
                  Inserir modelo básico
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {feedbackIA && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 whitespace-pre-wrap">
                  <h2 className="mb-4 text-2xl font-bold text-emerald-900">Resumo da Correção</h2>
                  <div className="text-sm leading-7 text-emerald-800">{feedbackIA}</div>
                </div>
              )}
              
              <div className="rounded-3xl border bg-white p-5 md:p-6">
                <h2 className="text-3xl font-black">Correção detalhada</h2>

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
                      <h3 className="font-black text-amber-700">
                        Plano de Melhoria FGV
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-6">
                        {correcaoPeca.planoMelhoria.length > 0 ? (
                          correcaoPeca.planoMelhoria.map((ponto) => (
                            <li key={ponto}>{ponto}</li>
                          ))
                        ) : (
                          <li>
                            A peça já está no padrão máximo para este espelho!
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
              Corrigir todas as questões (IA Local)
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