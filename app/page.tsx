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
  questoesIds: string[];
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

// --- BANCO DE DADOS GIGANTE: PEÇAS (Agora com 12 peças - Bloco 1 e Bloco 2) ---
const bancoPecas: PecaFGV[] = [
  {
    id: "ms-repressivo-ex45",
    nome: "1. Mandado de Segurança Repressivo (Exame 45)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q1", "q2", "q3", "q4"],
    enunciado: "A sociedade empresária '1234 Soluções Industriais Ltda.' teve sua Certidão de Regularidade Fiscal (CPEN) negada pela Receita Federal, impedindo sua participação em licitação que ocorrerá em 10 dias. Ela possui três débitos: I) PIS (Execução fiscal garantida por penhora); II) COFINS Exportação (com exigibilidade suspensa/ativa mas imune); III) IRPF constituído há mais de 6 anos sem execução ajuizada.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.4, palavrasChave: ["vara federal", "seção judiciária", "juiz federal"], feedbackErro: "Faltou endereçar à Justiça Federal.", melhoria: "Enderece ao Juízo da Vara Federal da Seção Judiciária (Art. 109, I, CF). Lógica: Envolve a União/Receita, logo, foro federal." },
      { id: "autoridade", titulo: "Autoridade Coatora e Legitimidade", pontos: 0.6, palavrasChave: ["delegado da receita federal", "união", "autoridade coatora", "pessoa jurídica interessada"], feedbackErro: "Faltou indicar a autoridade coatora ou a pessoa jurídica (União).", melhoria: "Indique o Delegado da Receita Federal como autoridade coatora e a União como interessada." },
      { id: "cabimento", titulo: "Cabimento e Tempestividade", pontos: 0.5, palavrasChave: ["direito líquido e certo", "prova pré-constituída", "120 dias"], feedbackErro: "Não justificou o cabimento do MS.", melhoria: "Mencione direito líquido e certo, prova pré-constituída e o prazo de 120 dias (Lei 12.016). Lógica: MS não aceita perícia, por isso a prova já vem pronta." },
      { id: "merito1", titulo: "Mérito: PIS Garantido", pontos: 0.8, palavrasChave: ["penhora", "garantia", "art. 206", "ctn", "suspensão", "efeitos de negativa"], feedbackErro: "Faltou tese sobre o débito de PIS.", melhoria: "Explique que execução garantida por penhora dá direito à CPEN (Art. 206, CTN). Lógica: Se o juízo tem garantia patrimonial, o Estado não corre risco." },
      { id: "merito2", titulo: "Mérito: COFINS Exportação", pontos: 0.8, palavrasChave: ["imunidade", "exportação", "art. 149", "§ 2º", "i"], feedbackErro: "Faltou tese sobre a COFINS.", melhoria: "Alegue imunidade da COFINS sobre receitas de exportação (Art. 149, § 2º, I, CF)." },
      { id: "merito3", titulo: "Mérito: Prescrição IRPJ", pontos: 0.8, palavrasChave: ["prescrição", "5 anos", "cinco anos", "art. 174", "extinção do crédito"], feedbackErro: "Faltou alegar a prescrição do IRPJ.", melhoria: "Demonstre a prescrição do IRPJ após 5 anos da constituição definitiva (Art. 174, CTN). Lógica: O Direito não socorre aos que dormem." },
      { id: "liminar", titulo: "Pedido Liminar", pontos: 0.6, palavrasChave: ["liminar", "fumus boni iuris", "periculum in mora", "licitação", "certidão"], feedbackErro: "Não formulou pedido liminar adequadamente.", melhoria: "Peça liminar provando o risco ineficácia da medida (licitação) e a fumaça do bom direito." },
      { id: "pedidos", titulo: "Pedidos Finais", pontos: 0.5, palavrasChave: ["concessão da segurança", "notificação", "ciência", "ministério público"], feedbackErro: "Pedidos incompletos.", melhoria: "Requeira notificação, ciência à União, oitiva do MP e concessão em definitivo da segurança." }
    ],
  },
  {
    id: "apelacao-ex41",
    nome: "2. Apelação (Exame 41)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q5", "q6", "q7", "q8"],
    enunciado: "José (aposentado) foi diagnosticado com câncer. Pediu isenção de IRPF sobre a aposentadoria e restituição dos valores pagos administrativamente, mas foi negado por 'falta de contemporaneidade' (doença após aposentadoria). Ingressou com Ação Ordinária na Vara Federal. O juiz julgou improcedente alegando: falta de interesse de agir (não esgotou via administrativa), isenção exige lei específica e a doença ocorreu após aposentadoria.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento a quo e ad quem", pontos: 0.5, palavrasChave: ["vara única federal", "juízo", "tribunal regional federal", "trf"], feedbackErro: "Endereçamento dúplice incorreto.", melhoria: "Faça petição de interposição ao Juízo Federal e razões ao TRF da respectiva Região." },
      { id: "cabimento", titulo: "Cabimento e Preparo", pontos: 0.5, palavrasChave: ["apelação", "art. 1009", "15 dias", "preparo"], feedbackErro: "Faltou fundamentar o recurso.", melhoria: "Indique Apelação (Art. 1009, CPC), prazo de 15 dias e recolhimento de preparo." },
      { id: "preliminar", titulo: "Preliminar: Afastar falta de interesse", pontos: 0.8, palavrasChave: ["inafastabilidade", "acesso à justiça", "art. 5", "xxxv", "esgotamento"], feedbackErro: "Não rebateu a preliminar do juiz.", melhoria: "Alegue violação ao princípio da inafastabilidade da jurisdição (Art. 5º, XXXV, CF)." },
      { id: "merito1", titulo: "Mérito: Doença após aposentadoria", pontos: 1.0, palavrasChave: ["súmula 598", "súmula 627", "contemporaneidade", "lei 7.713"], feedbackErro: "Faltou tese do STJ sobre aposentadoria.", melhoria: "Fundamente na Súmula 627 do STJ e Lei 7.713/88: não se exige contemporaneidade dos sintomas." },
      { id: "merito2", titulo: "Mérito: Isenção", pontos: 1.0, palavrasChave: ["neoplasia maligna", "câncer", "isenção", "art. 6", "inciso xiv"], feedbackErro: "Não fundamentou o direito à isenção.", melhoria: "Cite a Lei 7.713/88, Art. 6º, XIV, que prevê isenção expressa para neoplasia maligna." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.2, palavrasChave: ["conhecimento", "provimento", "reforma da sentença", "procedência", "restituição", "honorários"], feedbackErro: "Pedidos de apelação incompletos.", melhoria: "Peça conhecimento, provimento para reformar a sentença, restituição dos valores e inversão da sucumbência." }
    ],
  },
  {
    id: "agravo-ex38",
    nome: "3. Agravo de Instrumento (Exame 38)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q9", "q10", "q11", "q12"],
    enunciado: "Entidade beneficente de assistência social importou próteses para doação. Fisco cobrou II e IPI-importação. A entidade ajuizou Ação Anulatória pedindo Tutela de Urgência para liberar as próteses e suspender os créditos. O Juízo da Vara da Fazenda Pública indeferiu a tutela sob argumento de que a imunidade não alcança impostos sobre comércio exterior. Redija a peça para reverter a decisão liminar.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento ao Tribunal", pontos: 0.5, palavrasChave: ["tribunal de justiça", "desembargador", "presidente do tribunal"], feedbackErro: "Endereçamento incorreto (Agravo vai direto pro Tribunal).", melhoria: "Enderece a peça diretamente ao Tribunal de Justiça do Estado Beta." },
      { id: "cabimento", titulo: "Cabimento", pontos: 0.6, palavrasChave: ["agravo de instrumento", "tutela provisória", "art. 1015", "inciso i"], feedbackErro: "Faltou base legal do cabimento.", melhoria: "Cite o Art. 1.015, I, CPC (cabimento contra decisão que indefere tutela provisória)." },
      { id: "antecipacao", titulo: "Tutela Antecipada Recursal", pontos: 0.8, palavrasChave: ["efeito suspensivo", "tutela recursal", "art. 1019", "inciso i", "liberação das mercadorias"], feedbackErro: "Faltou pedir tutela antecipada recursal.", melhoria: "Peça a tutela recursal (Art. 1019, I, CPC) para imediata liberação das próteses." },
      { id: "merito1", titulo: "Mérito: Imunidade de Entidade Beneficente", pontos: 1.2, palavrasChave: ["imunidade", "entidade de assistência social", "art. 150", "inciso vi", "alínea c", "patrimônio"], feedbackErro: "Não abordou a imunidade da entidade.", melhoria: "Alegue imunidade tributária de impostos sobre patrimônio, renda ou serviços (Art. 150, VI, 'c', CF)." },
      { id: "merito2", titulo: "Mérito: Abrangência a Impostos Indiretos (II e IPI)", pontos: 1.2, palavrasChave: ["imposto de importação", "ipi", "repercussão econômica", "finalidades essenciais", "stf"], feedbackErro: "Não afastou a tese do juiz sobre comércio exterior.", melhoria: "Sustente que o STF entende que a imunidade alcança II e IPI na importação de bens afetos às finalidades essenciais." },
      { id: "pedidos", titulo: "Pedidos", pontos: 0.7, palavrasChave: ["conhecimento", "provimento", "reforma", "intimação do agravado", "comunicação ao juízo"], feedbackErro: "Pedidos recursais incompletos.", melhoria: "Peça conhecimento, provimento, intimação do Estado, comunicação ao juiz a quo e liberação dos bens." }
    ],
  },
  {
    id: "repeticao-ex37",
    nome: "4. Ação de Repetição de Indébito (Exame 37)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q1", "q5", "q9", "q12"],
    enunciado: "João (Município Alfa, sem vara federal) aderiu a PDV e recebeu valores de rescisão e férias proporcionais. O IRPF foi retido na fonte sobre todas as verbas. Passado 1 ano, João te procura para recuperar os valores indevidamente tributados pela União.",
    espelho: [
      { id: "enderecamento", titulo: "Competência Delegada / Justiça Federal", pontos: 0.5, palavrasChave: ["vara federal", "seção judiciária"], feedbackErro: "Endereçamento incorreto.", melhoria: "Enderece ao Juízo da Vara Federal. (Competência delegada para Execução Fiscal não se aplica a Repetição)." },
      { id: "cabimento", titulo: "Peça Correta", pontos: 0.5, palavrasChave: ["ação de repetição de indébito", "art. 165", "ctn", "art. 319"], feedbackErro: "Peça incorreta ou fundamento legal ausente.", melhoria: "Use Ação de Repetição de Indébito, Art. 165, I, CTN c/c 319 do CPC." },
      { id: "merito1", titulo: "Mérito: PDV", pontos: 1.2, palavrasChave: ["pdv", "programa de demissão voluntária", "indenização", "súmula 215"], feedbackErro: "Faltou Súmula sobre PDV.", melhoria: "Fundamente que verba de PDV tem caráter indenizatório e não sofre IRPF (Súmula 215/STJ). Lógica: Imposto de Renda incide sobre acréscimo patrimonial. Indenização é mera reposição de perda." },
      { id: "merito2", titulo: "Mérito: Férias Proporcionais", pontos: 1.2, palavrasChave: ["férias proporcionais", "natureza indenizatória", "súmula 386"], feedbackErro: "Faltou Súmula sobre férias proporcionais.", melhoria: "Alegue que férias proporcionais e seu terço constitucional são indenizatórios (Súmula 386/STJ)." },
      { id: "correcao", titulo: "Juros e Correção Monetária", pontos: 0.8, palavrasChave: ["selic", "trânsito em julgado", "súmula 188", "art. 167"], feedbackErro: "Esqueceu de pedir a correta atualização do valor.", melhoria: "Mencione a taxa SELIC e/ou Juros a partir do trânsito em julgado (Art. 167, CTN / Súmula 188 STJ)." },
      { id: "pedidos", titulo: "Pedidos Finais", pontos: 0.8, palavrasChave: ["citação", "procedência", "restituição", "custas", "honorários", "provas", "dispensa de audiência"], feedbackErro: "Faltou pedidos essenciais do CPC.", melhoria: "Peça citação, restituição, honorários, produção de provas e opção sobre audiência de conciliação." }
    ],
  },
  {
    id: "anulatoria-ex39",
    nome: "5. Ação Anulatória de Débito Fiscal (Exame 39)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q2", "q6", "q10", "q4"],
    enunciado: "Pedro recebeu notificação para pagar Contribuição de Melhoria (em 3 parcelas) por obra asfáltica. Porém, a lei que instituiu foi publicada há 90 dias, e o imóvel de Pedro fica em outro bairro e sofreu desvalorização. O tributo não foi pago. Elabore a peça para anular o lançamento.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.5, palavrasChave: ["vara de fazenda pública", "vara única", "juiz de direito", "município"], feedbackErro: "Endereçamento incorreto.", melhoria: "Enderece à Vara da Fazenda Pública / Vara Única Estadual da Comarca." },
      { id: "cabimento", titulo: "Cabimento", pontos: 0.5, palavrasChave: ["ação anulatória", "art. 38", "lei 6.830"], feedbackErro: "Peça errada ou mal fundamentada.", melhoria: "Ação Anulatória de Débito Fiscal, com base no Art. 38 da LEF (Lei 6.830/80)." },
      { id: "tutela", titulo: "Tutela de Urgência", pontos: 0.8, palavrasChave: ["tutela", "art. 300", "cpc", "suspensão da exigibilidade", "art. 151"], feedbackErro: "Esqueceu o pedido de tutela para suspender o débito.", melhoria: "Peça Tutela de Urgência (Art. 300 CPC c/c Art. 151, V, CTN) para evitar a inscrição em dívida ativa." },
      { id: "merito1", titulo: "Mérito: Valorização Imobiliária", pontos: 1.2, palavrasChave: ["valorização", "requisito", "desvalorização", "art. 81", "ctn", "art. 145", "inciso iii"], feedbackErro: "Faltou a essência da Contribuição de Melhoria.", melhoria: "Explique que a contribuição de melhoria exige comprovação de valorização imobiliária, o que não ocorreu (Art. 81 CTN)." },
      { id: "merito2", titulo: "Mérito: Anterioridade", pontos: 1.0, palavrasChave: ["anterioridade", "exercício seguinte", "anual", "art. 150", "inciso iii", "alínea b"], feedbackErro: "Não percebeu a pegadinha da anterioridade.", melhoria: "A CM exige respeito à anterioridade anual E nonagesimal. A lei publicou e cobrou no mesmo ano (violação ao art. 150, III, 'b', CF)." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.0, palavrasChave: ["procedência", "anulação do lançamento", "citação", "honorários", "provas"], feedbackErro: "Pedidos insuficientes.", melhoria: "Peça procedência para anular o débito, citação do Município, honorários e provas (especialmente perícia de engenharia)." }
    ],
  },
  {
    id: "embargos-execucao",
    nome: "6. Embargos à Execução Fiscal",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q3", "q7", "q11", "q8"],
    enunciado: "O Estado 'X' ajuizou Execução Fiscal contra a empresa Ômega. Diante do não pagamento, o juiz determinou bloqueio judicial via BacenJud nas contas da empresa, garantindo integralmente o juízo. A empresa Ômega alega que o ICMS cobrado já foi extinto por decadência (passaram-se 6 anos sem lançamento). Apresente a medida de defesa cabível no prazo de 30 dias.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento aos autos anexos", pontos: 0.5, palavrasChave: ["distribuição por dependência", "juízo", "vara de execução fiscal"], feedbackErro: "Endereçamento incorreto.", melhoria: "Enderece ao juízo da execução, pedindo distribuição por dependência (Art. 914, §1º, CPC)." },
      { id: "cabimento", titulo: "Cabimento e Tempestividade", pontos: 0.8, palavrasChave: ["embargos à execução", "30 dias", "trinta dias", "art. 16", "lei 6.830", "lef"], feedbackErro: "Faltou base legal ou menção ao prazo.", melhoria: "Indique Embargos à Execução Fiscal, tempestivos no prazo de 30 dias (Art. 16, LEF)." },
      { id: "garantia", titulo: "Garantia do Juízo", pontos: 0.7, palavrasChave: ["juízo garantido", "penhora", "bloqueio", "art. 16", "§ 1º"], feedbackErro: "Não mencionou que o juízo está garantido.", melhoria: "Destaque que o cabimento depende da garantia do juízo, suprida pelo bloqueio BacenJud (Art. 16, § 1º, LEF)." },
      { id: "efeito", titulo: "Efeito Suspensivo", pontos: 0.8, palavrasChave: ["efeito suspensivo", "art. 919", "§ 1º", "cpc"], feedbackErro: "Esqueceu de pedir efeito suspensivo aos embargos.", melhoria: "Peça efeito suspensivo, já que o juízo está garantido e há probabilidade do direito (Art. 919, §1º, CPC)." },
      { id: "merito", titulo: "Mérito: Decadência", pontos: 1.2, palavrasChave: ["decadência", "5 anos", "cinco anos", "art. 150", "§ 4º", "art. 173", "extinção", "art. 156"], feedbackErro: "Faltou a tese de mérito (decadência).", melhoria: "Alegue que houve decadência do ICMS, pois o prazo de lançamento de 5 anos esgotou, causando extinção do crédito (Art. 156, V, CTN)." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.0, palavrasChave: ["procedência", "extinção da execução", "desconstituição da penhora", "intimação", "provas", "honorários"], feedbackErro: "Pedidos incompletos.", melhoria: "Peça extinção da execução, levantamento da penhora, intimação da Fazenda para impugnar e sucumbência." }
    ],
  },
  {
    id: "epe-ex36",
    nome: "7. Exceção de Pré-Executividade (Exame 36)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q4", "q1", "q9", "q5"],
    enunciado: "O Estado Beta ajuizou em agosto de 2021 Execução Fiscal contra Maria para cobrar IPVA (2015 a 2020). Ocorre que Maria faleceu em junho de 2021. A citação foi despachada. Você é contratado pelos herdeiros para extinguir o processo de plano, sem garantir o juízo.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento aos próprios autos", pontos: 0.5, palavrasChave: ["juízo da execução", "vara de fazenda pública", "nos próprios autos"], feedbackErro: "Endereçamento equivocado.", melhoria: "Apresente petição simples atravessada nos próprios autos da Execução Fiscal." },
      { id: "cabimento", titulo: "Cabimento (EPE)", pontos: 0.8, palavrasChave: ["exceção de pré-executividade", "súmula 393", "ordem pública", "desnecessidade de dilação", "sem garantia"], feedbackErro: "Não justificou o uso da EPE.", melhoria: "Invoque a Súmula 393/STJ: matéria de ordem pública, prova pré-constituída e desnecessidade de garantia." },
      { id: "merito1", titulo: "Mérito: Ilegitimidade Passiva", pontos: 1.2, palavrasChave: ["ilegitimidade passiva", "óbito", "falecimento antes do ajuizamento", "capacidade processual"], feedbackErro: "Faltou apontar a ilegitimidade.", melhoria: "Alegue que o falecimento ocorreu antes do ajuizamento, havendo ilegitimidade passiva da parte executada. Lógica: Morto não é parte legítima para figurar no polo inicial." },
      { id: "merito2", titulo: "Mérito: Impossibilidade de Redirecionamento", pontos: 1.5, palavrasChave: ["súmula 392", "stj", "vedado o redirecionamento", "nulidade da cda", "substituição"], feedbackErro: "Faltou a Súmula de ouro sobre a CDA.", melhoria: "Mencione a Súmula 392/STJ: a Fazenda não pode substituir a CDA para alterar o sujeito passivo (espólio/herdeiros) quando o erro ocorreu no lançamento." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.0, palavrasChave: ["acolhimento", "extinção da execução", "nulidade", "condenação", "honorários"], feedbackErro: "Pedidos incompletos.", melhoria: "Peça o acolhimento da exceção, extinção da execução fiscal por nulidade da CDA e condenação em honorários advocatícios." }
    ],
  },
  {
    id: "ms-preventivo-apreensao",
    nome: "8. Mandado de Segurança Preventivo (Apreensão de Mercadorias)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q2", "q4", "q6", "q8"],
    enunciado: "A pessoa jurídica Delta transportava mercadorias entre Estados. No posto fiscal da fronteira do Estado Beta, a autoridade fiscal estadual reteve o caminhão e as mercadorias, lavrando auto de infração por suposta irregularidade na nota fiscal e condicionando a liberação do veículo e dos bens ao pagamento imediato do ICMS cobrado e da multa aplicada. A empresa Delta precisa entregar a mercadoria com urgência. Elabore a medida judicial cabível e mais célere, que não exige dilação probatória, para liberar as mercadorias.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.5, palavrasChave: ["vara de fazenda pública", "comarca", "estado beta"], feedbackErro: "Faltou endereçar ao juízo estadual correto.", melhoria: "Enderece ao Juízo da Vara da Fazenda Pública da Comarca ... do Estado Beta." },
      { id: "autoridade", titulo: "Autoridade Coatora e Pessoa Jurídica", pontos: 0.6, palavrasChave: ["autoridade fiscal", "delegado regional", "secretário de fazenda", "estado beta"], feedbackErro: "Faltou a autoridade coatora ou o Estado.", melhoria: "Indique a Autoridade Fiscal/Delegado Regional como coator e o Estado Beta como pessoa jurídica interessada." },
      { id: "cabimento", titulo: "Cabimento do MS", pontos: 0.5, palavrasChave: ["mandado de segurança", "direito líquido e certo", "prova pré-constituída", "dilação probatória"], feedbackErro: "Não justificou adequadamente o MS.", melhoria: "Mencione o cabimento do MS (Art. 5º, LXIX, CF) por ato abusivo, sem necessidade de dilação probatória." },
      { id: "merito1", titulo: "Mérito: Súmula 323 STF", pontos: 1.2, palavrasChave: ["súmula 323", "stf", "inadmissível", "apreensão", "meio coercitivo", "pagamento de tributos"], feedbackErro: "Faltou a Súmula principal da peça.", melhoria: "Alegue que é inadmissível a apreensão de mercadorias como meio coercitivo para pagamento de tributos (Súmula 323 do STF)." },
      { id: "merito2", titulo: "Mérito: Princípios Constitucionais", pontos: 1.0, palavrasChave: ["livre exercício", "atividade econômica", "devido processo legal", "confisco"], feedbackErro: "Faltou fundamentação constitucional.", melhoria: "Indique violação ao livre exercício da atividade econômica (Art. 170, parágrafo único, CF) e ao devido processo legal." },
      { id: "liminar", titulo: "Pedido Liminar", pontos: 0.7, palavrasChave: ["liminar", "fumus boni iuris", "periculum in mora", "urgência", "liberação"], feedbackErro: "Não formulou o pedido liminar corretamente.", melhoria: "Peça liminar provando a urgência da entrega e a fumaça do bom direito embasada na jurisprudência do STF." },
      { id: "pedidos", titulo: "Pedidos Finais", pontos: 0.5, palavrasChave: ["concessão", "segurança", "notificação", "ciência", "ministério público", "documentos"], feedbackErro: "Faltaram pedidos processuais obrigatórios do MS.", melhoria: "Requeira notificação da autoridade, ciência ao Estado, oitiva do MP, juntada de provas e concessão definitiva." }
    ],
  },
  {
    id: "ms-repressivo-itbi",
    nome: "9. Mandado de Segurança Repressivo (ITBI - Base de Cálculo)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q1", "q3", "q5", "q7"],
    enunciado: "O contribuinte Roberto adquiriu um imóvel urbano no Município Alfa pelo valor real de R$ 300.000,00, conforme contrato de compra e venda e comprovante de transferência bancária. Ao solicitar a guia para pagamento do ITBI e registro no cartório, o Município Alfa enviou cobrança calculada sobre R$ 500.000,00, alegando ser este o valor de referência estabelecido unilateralmente em decreto municipal. Roberto precisa registrar o imóvel imediatamente para obter um financiamento. Apresente a medida judicial cabível (sem dilação probatória) para recolher o tributo sobre o valor real.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.5, palavrasChave: ["vara de fazenda pública", "comarca", "município alfa"], feedbackErro: "Endereçamento incorreto.", melhoria: "Enderece ao Juízo de Direito da Vara da Fazenda Pública da Comarca do Município Alfa." },
      { id: "autoridade", titulo: "Autoridade Coatora e Pessoa Jurídica", pontos: 0.6, palavrasChave: ["secretário de finanças", "secretário de fazenda", "município alfa"], feedbackErro: "Faltou indicar as partes corretamente.", melhoria: "Indique o Secretário de Finanças/Fazenda do Município como autoridade coatora e o Município Alfa como interessado." },
      { id: "cabimento", titulo: "Cabimento e Tempestividade", pontos: 0.5, palavrasChave: ["mandado de segurança", "120 dias", "direito líquido e certo", "prova pré-constituída"], feedbackErro: "Faltou o cabimento do MS.", melhoria: "Fundamente o uso do MS no prazo decadencial de 120 dias, com prova documental pré-constituída." },
      { id: "merito1", titulo: "Mérito: Valor da Transação", pontos: 1.5, palavrasChave: ["base de cálculo", "valor da transação", "valor venal", "tema 1113", "stj", "art. 38", "ctn"], feedbackErro: "Faltou a tese central do STJ sobre ITBI.", melhoria: "Sustente que a base de cálculo do ITBI é o valor da transação imobiliária declarada, nos termos do Art. 38 do CTN e Tema 1113 do STJ." },
      { id: "merito2", titulo: "Mérito: Arbitramento Unilateral", pontos: 0.7, palavrasChave: ["arbitramento", "unilateral", "valor de referência", "ilegalidade", "processo administrativo"], feedbackErro: "Não rebateu o ato do Município.", melhoria: "Alegue a ilegalidade do arbitramento prévio e unilateral com base em valor de referência sem processo administrativo prévio." },
      { id: "liminar", titulo: "Pedido Liminar", pontos: 0.7, palavrasChave: ["liminar", "fumus boni iuris", "periculum in mora", "emissão da guia", "registro", "financiamento"], feedbackErro: "Pedido liminar ausente ou genérico.", melhoria: "Peça liminar para emissão da guia pelo valor real e liberação do registro, demonstrando o risco da perda do financiamento." },
      { id: "pedidos", titulo: "Pedidos", pontos: 0.5, palavrasChave: ["concessão da segurança", "notificação", "ciência", "ministério público", "recolhimento"], feedbackErro: "Pedidos finais incompletos.", melhoria: "Peça notificação, ciência ao Município, parecer do MP e concessão definitiva para confirmar o recolhimento pelo valor real." }
    ],
  },
  {
    id: "acao-declaratoria-ex40",
    nome: "10. Ação Declaratória de Inexistência de Relação Jurídica",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q9", "q2", "q5", "q8"],
    enunciado: "O Município Ômega publicou lei instituindo IPTU sobre templos de qualquer culto. A Igreja Luz da Vida, preocupada com o lançamento iminente do imposto para o próximo exercício, o procura para evitar a cobrança antes mesmo que o lançamento ocorra. Apresente a medida judicial cabível com pedido de urgência.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.5, palavrasChave: ["vara de fazenda pública", "vara cível", "município ômega"], feedbackErro: "Faltou endereçar à Vara da Fazenda Pública ou Cível.", melhoria: "Enderece ao Juízo de Direito da Vara de Fazenda Pública da Comarca do Município Ômega." },
      { id: "cabimento", titulo: "Cabimento (Ação Declaratória)", pontos: 0.5, palavrasChave: ["ação declaratória", "inexistência de relação jurídica", "art. 19", "cpc"], feedbackErro: "Não justificou a ação declaratória.", melhoria: "Indique Ação Declaratória, pois o lançamento ainda não ocorreu (prevenção), conforme Art. 19, I, do CPC." },
      { id: "tutela", titulo: "Tutela de Urgência", pontos: 0.8, palavrasChave: ["tutela", "urgência", "art. 300", "cpc", "art. 151", "ctn", "suspensão"], feedbackErro: "Faltou o pedido de tutela.", melhoria: "Peça Tutela de Urgência para impedir o lançamento do tributo e suspender a exigibilidade, provando o periculum in mora." },
      { id: "merito1", titulo: "Mérito: Imunidade Tributária", pontos: 1.5, palavrasChave: ["imunidade", "templos de qualquer culto", "art. 150", "inciso vi", "alínea b"], feedbackErro: "Faltou a tese de imunidade.", melhoria: "Invoque a imunidade de impostos para templos de qualquer culto (Art. 150, VI, 'b', da CF)." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.2, palavrasChave: ["procedência", "citação", "declaração de inexistência", "honorários", "dispensa de audiência"], feedbackErro: "Pedidos incompletos.", melhoria: "Peça procedência para declarar a inexistência da relação jurídica, condenação em honorários e citação do réu." }
    ]
  },
  {
    id: "consignacao-ex34",
    nome: "11. Ação de Consignação em Pagamento (Exame 34)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q10", "q6", "q1", "q11"],
    enunciado: "A empresa de software 'Inova Tech' foi contratada para desenvolver um programa sob encomenda para um cliente. Ao faturar o serviço, o Município Alfa enviou cobrança de ISS. Ao mesmo tempo, o Estado Beta enviou cobrança de ICMS sobre a mesma operação. Querendo pagar, mas sem saber a quem, a empresa o contrata para depositar o valor em juízo e afastar a mora.",
    espelho: [
      { id: "enderecamento", titulo: "Endereçamento", pontos: 0.5, palavrasChave: ["vara de fazenda pública", "vara cível", "município alfa", "estado beta"], feedbackErro: "Endereçamento incorreto.", melhoria: "Enderece ao Juízo de Direito da Vara de Fazenda Pública." },
      { id: "cabimento", titulo: "Cabimento", pontos: 0.5, palavrasChave: ["ação de consignação em pagamento", "art. 164", "inciso iii", "ctn"], feedbackErro: "Peça errada ou base legal incorreta.", melhoria: "Ação de Consignação em Pagamento por exigência de mais de uma pessoa jurídica (bitributação), Art. 164, III, CTN." },
      { id: "deposito", titulo: "Pedido de Depósito", pontos: 0.8, palavrasChave: ["depósito", "suspensão da exigibilidade", "art. 151", "inciso ii", "ctn"], feedbackErro: "Faltou pedir o depósito.", melhoria: "Peça a autorização para depósito do valor para afastar a mora e suspender a exigibilidade (Art. 151, II, CTN)." },
      { id: "merito1", titulo: "Mérito: Incidência de ISS", pontos: 1.5, palavrasChave: ["iss", "software sob encomenda", "serviço", "não incide icms", "súmula"], feedbackErro: "Faltou tese sobre qual imposto incide.", melhoria: "Alegue que desenvolvimento de software sob encomenda é prestação de serviço sujeita apenas ao ISS (Município), afastando o ICMS do Estado." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.2, palavrasChave: ["citação", "procedência", "extinção do crédito", "honorários", "art. 156"], feedbackErro: "Pedidos incompletos.", melhoria: "Peça citação dos DOIS réus, procedência para declarar o pagamento e extinção do crédito (Art. 156, VIII, CTN)." }
    ]
  },
  {
    id: "roc-ex32",
    nome: "12. Recurso Ordinário Constitucional (ROC)",
    area: "Direito Tributário",
    valor: 5.0,
    questoesIds: ["q3", "q4", "q7", "q12"],
    enunciado: "O Governador do Estado Alfa publicou decreto determinando o confisco de mercadorias de contribuintes em débito com o ICMS. A empresa Delta impetrou Mandado de Segurança perante o Tribunal de Justiça do Estado (competência originária), mas o TJ denegou a segurança em acórdão unânime. Apresente a medida judicial para o Tribunal Superior competente.",
    espelho: [
      { id: "enderecamento1", titulo: "Endereçamento: Interposição", pontos: 0.5, palavrasChave: ["presidente", "vice-presidente", "tribunal de justiça"], feedbackErro: "Endereçamento da interposição incorreto.", melhoria: "A petição de interposição deve ser dirigida ao Presidente/Vice do Tribunal de Justiça (a quo)." },
      { id: "enderecamento2", titulo: "Endereçamento: Razões", pontos: 0.5, palavrasChave: ["superior tribunal de justiça", "stj", "ministros"], feedbackErro: "Endereçamento das razões incorreto.", melhoria: "As razões recursais devem ser dirigidas ao Superior Tribunal de Justiça (STJ)." },
      { id: "cabimento", titulo: "Cabimento", pontos: 0.5, palavrasChave: ["recurso ordinário", "roc", "art. 105", "inciso ii", "alínea b", "cf", "art. 1027", "cpc"], feedbackErro: "Fundamentação legal do ROC incorreta.", melhoria: "Cabe ROC ao STJ contra acórdão denegatório de MS em única/originária instância por TJ (Art. 105, II, 'b', CF e Art. 1027, II, 'a', CPC)." },
      { id: "merito1", titulo: "Mérito: Súmula 323 STF", pontos: 1.5, palavrasChave: ["confisco", "mercadorias", "súmula 323", "meio coercitivo"], feedbackErro: "Esqueceu a Súmula de apreensão.", melhoria: "É inadmissível a apreensão de mercadorias como meio coercitivo para pagamento de tributos (Súmula 323 STF)." },
      { id: "pedidos", titulo: "Pedidos", pontos: 1.0, palavrasChave: ["conhecimento", "provimento", "reforma", "concessão da segurança", "intimação"], feedbackErro: "Pedidos recursais incompletos.", melhoria: "Peça conhecimento, provimento para reformar o acórdão e conceder a segurança, e intimação do recorrido." }
    ]
  }
];

// --- BANCO DE DADOS INTACTO: AS MESMAS 12 QUESTÕES ---
const bancoQuestoes: QuestaoFGV[] = [
  {
    id: "q1",
    titulo: "1. CIDE x Exportação",
    enunciado: "A União instituiu CIDE com alíquota específica por tonelada sobre produto X. A empresa exportadora questiona: A) A CIDE incide sobre exportação? B) É lícita a cobrança por alíquota específica?",
    valor: 1.25,
    espelho: [
      { id: "q1a", titulo: "A) Imunidade Exportação", pontos: 0.65, palavrasChave: ["não", "imunidade", "receitas de exportação", "art. 149", "inciso i"], feedbackErro: "Errou a imunidade.", melhoria: "NÃO. Imunidade de CIDE sobre exportação (Art. 149, §2º, I, CF). O Brasil não exporta tributos." },
      { id: "q1b", titulo: "B) Alíquota Específica", pontos: 0.60, palavrasChave: ["sim", "alíquota específica", "unidade de medida", "art. 149", "inciso iii"], feedbackErro: "Errou a alíquota.", melhoria: "SIM. A CF autoriza CIDE com alíquota baseada em unidade de medida (Art. 149, §2º, III, 'b', CF)." }
    ],
  },
  {
    id: "q2",
    titulo: "2. IPTU e Locatário",
    enunciado: "Sindicato Patronal aluga imóvel. Contrato diz que inquilino paga IPTU. O Sindicato ajuíza ação de restituição: A) Locatário tem legitimidade ativa? B) Há imunidade de IPTU para sindicato patronal?",
    valor: 1.25,
    espelho: [
      { id: "q2a", titulo: "A) Ilegitimidade", pontos: 0.65, palavrasChave: ["não", "ilegitimidade", "súmula 614", "art. 123"], feedbackErro: "Errou a legitimidade.", melhoria: "NÃO. Contrato não é oponível ao Fisco. Locatário não tem legitimidade (Súmula 614/STJ)." },
      { id: "q2b", titulo: "B) Sem Imunidade", pontos: 0.60, palavrasChave: ["não", "trabalhadores", "empregados", "art. 150", "alínea c"], feedbackErro: "Errou a imunidade.", melhoria: "NÃO. A imunidade é só para sindicatos de trabalhadores, não patronais (Art. 150, VI, 'c', CF)." }
    ],
  },
  {
    id: "q3",
    titulo: "3. Contribuição Residual",
    enunciado: "A União institui Nova Contribuição Residual da Seguridade Social por Medida Provisória, vigência em 30 dias. A) Veículo legislativo está correto? B) Prazo de vigência está adequado?",
    valor: 1.25,
    espelho: [
      { id: "q3a", titulo: "A) Lei Complementar", pontos: 0.65, palavrasChave: ["não", "lei complementar", "art. 195", "§ 4º", "art. 154"], feedbackErro: "Errou a espécie normativa.", melhoria: "NÃO. Contribuição Residual exige Lei Complementar (Art. 195, §4º c/c Art. 154, I, CF)." },
      { id: "q3b", titulo: "B) Noventena", pontos: 0.60, palavrasChave: ["não", "90 dias", "noventa dias", "anterioridade nonagesimal", "art. 195", "§ 6º"], feedbackErro: "Errou a vigência.", melhoria: "NÃO. Seguridade exige anterioridade nonagesimal (90 dias) (Art. 195, § 6º, CF)." }
    ],
  },
  {
    id: "q4",
    titulo: "4. DCTF e Certidão",
    enunciado: "Empresa envia declaração de débitos (DCTF) reconhecendo o tributo, mas não paga. O Fisco executa sem notificar. A empresa pede CPEN. A) A execução é válida sem notificação? B) Tem direito à CPEN?",
    valor: 1.25,
    espelho: [
      { id: "q4a", titulo: "A) Súmula 436 STJ", pontos: 0.65, palavrasChave: ["sim", "constitui o crédito", "dispensada", "súmula 436", "lançamento por homologação"], feedbackErro: "Errou o lançamento.", melhoria: "SIM. A declaração constitui o crédito, dispensando notificação (Súmula 436/STJ)." },
      { id: "q4b", titulo: "B) Recusa Legítima", pontos: 0.60, palavrasChave: ["não", "recusa", "súmula 446", "art. 206"], feedbackErro: "Deu a certidão indevidamente.", melhoria: "NÃO. Declarado e não pago, é legítima a recusa da CPEN (Súmula 446/STJ)." }
    ],
  },
  {
    id: "q5",
    titulo: "5. IPTU Progressivo Extra-Fiscal",
    enunciado: "Município Alfa institui IPTU com alíquota progressiva no tempo sobre um imóvel edificado e utilizado comercialmente, visando aumentar a arrecadação. A medida é constitucional?",
    valor: 1.25,
    espelho: [
      { id: "q5a", titulo: "Inconstitucionalidade", pontos: 0.65, palavrasChave: ["não", "inconstitucional", "função social", "art. 182", "§ 4º", "plano diretor"], feedbackErro: "Errou a progressividade.", melhoria: "NÃO. O IPTU progressivo no tempo só cabe como punição por descumprimento da função social (Art. 182, §4º, II, CF)." },
      { id: "q5b", titulo: "Finalidade Arrecadatória Vedada", pontos: 0.60, palavrasChave: ["arrecadatória", "confisco", "fiscal", "extra-fiscal"], feedbackErro: "Faltou justificar o motivo.", melhoria: "O Município usou a progressividade no tempo (que é sanção) com finalidade apenas arrecadatória (fiscal), o que é vedado." }
    ],
  },
  {
    id: "q6",
    titulo: "6. ITBI e Integralização",
    enunciado: "A empresa Imobiliária Morar Bem Ltda, cuja atividade principal é a compra e venda de imóveis, adquire um galpão para integralizar seu capital social. A) Incide ITBI? B) Qual o ente tributante?",
    valor: 1.25,
    espelho: [
      { id: "q6a", titulo: "A) Exceção da Imunidade", pontos: 0.80, palavrasChave: ["sim", "incide", "exceção", "compra e venda", "art. 156", "§ 2º", "inciso i"], feedbackErro: "Errou a regra do ITBI.", melhoria: "SIM. A regra é a imunidade, mas há EXCEÇÃO se a empresa atuar no ramo imobiliário (Art. 156, §2º, I, CF)." },
      { id: "q6b", titulo: "B) Competência", pontos: 0.45, palavrasChave: ["município", "local do imóvel", "art. 156", "inciso ii"], feedbackErro: "Errou a competência.", melhoria: "A competência para o ITBI é do Município da situação do bem (Art. 156, II, CF)." }
    ],
  },
  {
    id: "q7",
    titulo: "7. IPVA e Veículo Roubado",
    enunciado: "João teve o carro furtado em novembro de 2023. Em janeiro de 2024, o Estado cobra IPVA do ano corrente, alegando que o nome de João ainda consta no Detran. A cobrança é devida?",
    valor: 1.25,
    espelho: [
      { id: "q7a", titulo: "Cobrança Indevida", pontos: 0.65, palavrasChave: ["não", "indevida", "perda", "propriedade", "posse", "fato gerador"], feedbackErro: "Validou a cobrança absurda.", melhoria: "NÃO. O IPVA exige a propriedade plena. O furto retira o domínio útil do bem, não ocorrendo o fato gerador." },
      { id: "q7b", titulo: "Registro no Detran", pontos: 0.60, palavrasChave: ["presunção", "detran", "afastada", "registro"], feedbackErro: "Focou só no Detran.", melhoria: "O registro no Detran é presunção relativa de propriedade, que cai por terra diante do Boletim de Ocorrência do furto." }
    ],
  },
  {
    id: "q8",
    titulo: "8. Taxa de Limpeza Pública",
    enunciado: "Município institui Taxa de Limpeza Pública para custear a varrição de praças e ruas, cobrando-a junto com o IPTU. A cobrança dessa taxa é lícita?",
    valor: 1.25,
    espelho: [
      { id: "q8a", titulo: "Ilicitude da Cobrança", pontos: 0.65, palavrasChave: ["não", "inconstitucional", "ilícita", "súmula vinculante 19", "sv 19"], feedbackErro: "Esqueceu a SV.", melhoria: "NÃO. A taxa de limpeza urbana (varrição de rua) ofende a Constituição. Cobrança indevida conforme Súmula Vinculante 19." },
      { id: "q8b", titulo: "Requisito das Taxas", pontos: 0.60, palavrasChave: ["uti universi", "indivisível", "específico e divisível", "art. 145", "inciso ii"], feedbackErro: "Errou o conceito de taxa.", melhoria: "Varrição de rua beneficia toda a sociedade (uti universi). Taxas exigem serviços específicos e divisíveis (uti singuli) (Art. 145, II, CF)." }
    ],
  },
  {
    id: "q9",
    titulo: "9. Imunidade de Templos (Imóvel Alugado)",
    enunciado: "Uma Igreja possui um imóvel extra e o aluga para um banco. Toda a renda do aluguel é usada para manter a creche da Igreja. O Município cobrou IPTU do imóvel. É devido?",
    valor: 1.25,
    espelho: [
      { id: "q9a", titulo: "Imunidade Mantida", pontos: 0.70, palavrasChave: ["não", "indevido", "súmula 724", "súmula vinculante 52", "sv 52"], feedbackErro: "Errou a Súmula do STF.", melhoria: "NÃO. A imunidade tributária de templos alcança os imóveis alugados a terceiros (Súmula Vinculante 52 / Súmula 724 STF)." },
      { id: "q9b", titulo: "Requisito da Renda", pontos: 0.55, palavrasChave: ["renda revertida", "finalidades essenciais", "art. 150", "§ 4º"], feedbackErro: "Esqueceu o requisito.", melhoria: "Desde que o valor dos aluguéis seja revertido para as finalidades essenciais da entidade (Art. 150, §4º, CF)." }
    ],
  },
  {
    id: "q10",
    titulo: "10. ICMS na Importação (Pessoa Física)",
    enunciado: "Carlos, pessoa física que não atua com comércio, compra um computador dos Estados Unidos para uso próprio. O Estado onde Carlos reside exige ICMS. É lícita a cobrança?",
    valor: 1.25,
    espelho: [
      { id: "q10a", titulo: "Liceidade da Cobrança", pontos: 0.70, palavrasChave: ["sim", "lícita", "pessoa física", "qualquer pessoa", "uso próprio"], feedbackErro: "Achou que só PJ paga ICMS.", melhoria: "SIM. O ICMS incide sobre importação realizada por pessoa física ou jurídica, ainda que para uso próprio." },
      { id: "q10b", titulo: "Fundamentação CF", pontos: 0.55, palavrasChave: ["art. 155", "§ 2º", "inciso ix", "alínea a", "emenda 33"], feedbackErro: "Faltou a base constitucional.", melhoria: "A previsão está expressa no Art. 155, §2º, IX, 'a', da Constituição Federal (incluído pela EC 33/2001)." }
    ],
  },
  {
    id: "q11",
    titulo: "11. Decadência (Homologação)",
    enunciado: "Empresa declarou e pagou a menor o ICMS referente a março de 2018. Em maio de 2024, o Fisco lança de ofício a diferença alegando dolo. A) Ocorreu a decadência? B) Como se conta o prazo em caso de dolo?",
    valor: 1.25,
    espelho: [
      { id: "q11a", titulo: "A) Inocorrência de Decadência", pontos: 0.65, palavrasChave: ["não", "não decaiu", "dolo", "fraude"], feedbackErro: "Calculou a decadência errado.", melhoria: "NÃO decaiu. Houve dolo (fraude), o que afasta a regra benéfica de contagem do prazo da data do fato gerador." },
      { id: "q11b", titulo: "B) Regra do Dolo", pontos: 0.60, palavrasChave: ["art. 173", "inciso i", "primeiro dia do exercício seguinte", "ctn"], feedbackErro: "Errou o artigo do CTN.", melhoria: "Em caso de dolo, conta-se 5 anos do primeiro dia do exercício seguinte ao que poderia ser lançado (Art. 173, I, CTN)." }
    ],
  },
  {
    id: "q12",
    titulo: "12. Responsabilidade na Sucessão",
    enunciado: "Alfa compra o fundo de comércio de Beta e continua explorando a mesma atividade. Beta encerra suas atividades. Quem responde pelos tributos devidos por Beta até a data do negócio?",
    valor: 1.25,
    espelho: [
      { id: "q12a", titulo: "Responsabilidade Integral", pontos: 0.65, palavrasChave: ["alfa", "adquirente", "integralmente", "cessou", "encerrou"], feedbackErro: "Errou o sucessor.", melhoria: "A empresa ALFA (adquirente) responde integralmente pelos tributos da sucedida, pois Beta cessou suas atividades." },
      { id: "q12b", titulo: "Fundamentação Legal", pontos: 0.60, palavrasChave: ["art. 133", "inciso i", "ctn", "sucessão empresarial"], feedbackErro: "Faltou o artigo.", melhoria: "Aplica-se a regra de sucessão do Art. 133, inciso I, do Código Tributário Nacional." }
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

  // Seleciona a Peça atual
  const pecaAtual = useMemo(() => bancoPecas.find((peca) => peca.id === pecaId) ?? bancoPecas[0], [pecaId]);
  
  // Seleciona dinamicamente as questões ligadas à peça atual
  const questoesAtuais = useMemo(() => {
    return bancoQuestoes.filter(q => pecaAtual.questoesIds.includes(q.id));
  }, [pecaAtual]);

  const resultadoFinal = useMemo(() => calcularResultadoFinal(correcaoPeca?.nota ?? 0, correcoesQuestoes), [correcaoPeca, correcoesQuestoes]);

  function alterarPeca(novoPecaId: string) {
    setPecaId(novoPecaId);
    setCorrecaoPeca(null);
    setFeedbackIA("");
    setRespostasQuestoes({});
    setCorrecoesQuestoes([]);
  }

  function enviarPecaParaCorrecao() {
    if (!textoPeca.trim()) {
      alert("A sua mente está pronta. Dê o primeiro passo e escreva a sua peça antes de enviar!");
      return;
    }

    setCorrigindo(true);
    setHiperfoco(false);

    setTimeout(() => {
      const resultadoLocal = corrigirPecaLocal(textoPeca, pecaAtual);
      setCorrecaoPeca(resultadoLocal);

      const textoFeedback = `Respire fundo. Enquanto você lê este resultado, o seu cérebro já está a criar novas ligações neuronais. Você garantiu ${resultadoLocal.nota.toFixed(2)} de ${resultadoLocal.notaMaxima.toFixed(2)}.\n\n` +
        (resultadoLocal.pontosFracos.length > 0 
          ? `Sabe o que separa os aprovados dos demais? A capacidade de usar o erro a seu favor. O seu foco agora não é o que faltou, mas o ajuste rápido que vai garantir a sua aprovação. Pessoas brilhantes como você usam esta oportunidade como degrau.\n\nAbsorva a lógica por detrás destes pequenos detalhes:\n- ${resultadoLocal.pontosFracos.join('\n- ')}\n\nVocê percebe que entender isto agora torna a prova real muito mais fácil? Desça até o espelho detalhado, olhe para cada item e repita mentalmente: "Isto faz sentido".` 
          : `Extraordinário! Sinta a satisfação de um trabalho perfeito. A sua mente já absorveu completamente o padrão FGV. A sua carteira da OAB já é uma realidade inevitável.`);

      setFeedbackIA(textoFeedback);
      setCorrigindo(false);
    }, 1500);
  }

  function corrigirTodasAsQuestoes(): void {
    const resultados = questoesAtuais.map((questao) => corrigirQuestaoLocal(respostasQuestoes[questao.id] ?? "", questao));
    setCorrecoesQuestoes(resultados);
  }

  function alterarRespostaQuestao(id: string, texto: string): void {
    setRespostasQuestoes((prev) => ({ ...prev, [id]: texto }));
  }

  function inserirModeloBasico(): void {
    setTextoPeca(`EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA... \n\n(Qualificação do autor), por seu advogado, vem respeitosamente propor\n\nNOME DA PEÇA\n\ncom fulcro nos artigos pertinentes, em face de (Qualificação do Réu/Fazenda), pelos fundamentos a seguir:\n\nI - DOS FATOS\n(Breve resumo do enunciado).\n\nII - DO CABIMENTO E TEMPESTIVIDADE\n(Mostre que você sabe a regra do jogo e o prazo legal).\n\nIII - DO DIREITO\n(A sua grande tese. FATO + FUNDAMENTO LOGICO + CONCLUSÃO).\n\nIV - DO PEDIDO LIMINAR OU EFEITO SUSPENSIVO\n(O risco da demora e a fumaça do bom direito).\n\nV - DOS PEDIDOS\n(Citação, procedência, custas e honorários).\n\nDá-se à causa o valor cabível.\nPede deferimento.\nLocal e data.\nAdvogado / OAB`);
    setCorrecaoPeca(null);
    setFeedbackIA("");
  }

  return (
    <main className={`min-h-screen transition-all duration-700 ${hiperfoco ? "bg-slate-950 p-2 md:p-4" : "bg-slate-50 p-4 md:p-8"} text-slate-900`}>
      <div className={`mx-auto max-w-7xl rounded-3xl transition-all duration-700 ${hiperfoco ? "bg-slate-900 border border-slate-800" : "bg-white shadow-2xl border-t-8 border-emerald-500"} p-5 md:p-8`}>
        
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
              Acredite: você já tem a capacidade intelectual exata para dominar a FGV. Este sistema não apenas corrige os seus erros, ele trabalha junto com a sua mente para criar o <strong>hiperfoco</strong> necessário.
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
                <p className="text-sm font-bold text-emerald-400">A Sua Nota Rumo à Vitória</p>
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
                {item === "peca" && "A Sua Peça"}
                {item === "questoes" && "As Suas Questões"}
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
                  onChange={(event) => alterarPeca(event.target.value)}
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
                placeholder="A sua mente é brilhante. Comece a digitar o esqueleto da sua peça aqui..."
                className={`mt-5 w-full rounded-2xl border-2 p-5 focus:ring-0 resize-none transition-all ${hiperfoco ? "h-[600px] bg-slate-950 border-slate-800 text-emerald-50 focus:border-emerald-500" : "h-[480px] bg-white border-slate-200 text-slate-700 focus:border-emerald-500"}`}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={enviarPecaParaCorrecao}
                  disabled={corrigindo}
                  className={`rounded-2xl px-8 py-4 font-black transition-all shadow-lg w-full md:w-auto ${hiperfoco ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"}`}
                >
                  {corrigindo ? "A sincronizar com a FGV..." : "Consolidar A Minha Peça e Ver o Resultado"}
                </button>
                {!hiperfoco && (
                  <button onClick={inserirModeloBasico} className="rounded-2xl bg-slate-100 px-6 py-4 font-bold text-slate-600 hover:bg-slate-200 w-full md:w-auto">
                    Carregar Esqueleto Base
                  </button>
                )}
              </div>
            </div>

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
                    <h2 className="text-xl font-black text-slate-800 mb-4">A Lógica por detrás do Espelho (FGV)</h2>
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
              <h2 className="text-2xl font-black text-slate-800">A Sua Batalha Discursiva</h2>
              <p className="mt-2 text-slate-600">
                A sua intuição geralmente está certa. Escreva diretamente ao ponto: <strong>Sim ou Não + A Lógica + O Artigo.</strong> Confie na sua capacidade. O sistema selecionou questões específicas para a <strong>{pecaAtual.nome}</strong>.
              </p>
            </div>

            {questoesAtuais.map((questao, index) => {
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
                    placeholder="Visualize a lei a fazer sentido e digite a sua resposta..."
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
                  Pare o que está a fazer. Olhe para fora do ecrã. Respire fundo por 4 segundos e solte por 4 segundos. Ao fazer isto, o seu cérebro diminui a ansiedade de performance e abre espaço para registar informação de longo prazo.
                </p>
              </div>

              <div className="rounded-3xl bg-amber-50 p-8 border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black transform group-hover:scale-110 transition">2</div>
                <h3 className="font-black text-2xl text-amber-900">A Lógica Oculta</h3>
                <p className="mt-4 text-amber-800 leading-relaxed font-medium">
                  Volte aos pontos vermelhos (⭕) da sua correção. Não tente decorar a regra. Pergunte-se: <em>"Por que o Estado criou esta lei desta forma?"</em> Quando a lógica faz sentido, você não precisa mais da memória de curto prazo.
                </p>
              </div>

              <div className="rounded-3xl bg-emerald-50 p-8 border border-emerald-100 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black transform group-hover:scale-110 transition">3</div>
                <h3 className="font-black text-2xl text-emerald-900">Ancoragem do Sucesso</h3>
                <p className="mt-4 text-emerald-800 leading-relaxed font-medium">
                  Feche os olhos e imagine o dia da prova. Você lê uma questão parecida com esta que acabou de errar, dá um leve sorriso e escreve a resposta certa sem esforço algum. Repita: <em>"Eu entendi o jogo da banca."</em>
                </p>
              </div>
            </div>
          </section>
        )}

        {aba === "correcao" && !hiperfoco && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-10 shadow-sm text-center">
            <h2 className="text-4xl font-black text-slate-800">A Sua Imagem como Advogado(a)</h2>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">Você não está a estudar para "passar". Você está a ser moldado para advogar. Olhe para os números abaixo como indicadores da sua nova profissão.</p>

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
                <p className={`text-sm font-bold uppercase tracking-widest ${resultadoFinal.notaFinal >= 8 ? "text-emerald-600" : "text-amber-600"}`}>A Sua Nota OAB</p>
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
                  ? "A sua mente está programada para gabaritar. Salve esta sensação de vitória e use-a como combustível para o próximo desafio."
                  : "A cada pequeno erro, você bloqueia um buraco por onde a sua aprovação poderia escapar. Celebre os erros de hoje, pois eles são a garantia do seu acerto amanhã. Volte à aba Peça, ligue o Hiperfoco e reconstrua a sua resposta."}
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