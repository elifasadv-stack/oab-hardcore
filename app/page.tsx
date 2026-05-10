"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const pecas = [
  "Mandado de Segurança",
  "Ação Anulatória",
  "Ação Declaratória",
  "Repetição de Indébito",
  "Embargos à Execução Fiscal",
  "Exceção de Pré-Executividade",
];

const criteriosPeca = [
  { nome: "Endereçamento", peso: 0.4 },
  { nome: "Qualificação e legitimidade", peso: 0.4 },
  { nome: "Tempestividade/cabimento", peso: 0.5 },
  { nome: "Fatos relevantes", peso: 0.4 },
  { nome: "Fundamentação constitucional/legal", peso: 1.2 },
  { nome: "Teses de defesa", peso: 0.8 },
  { nome: "Pedidos completos", peso: 0.7 },
  { nome: "Valor da causa/fechamento", peso: 0.3 },
  { nome: "Técnica redacional", peso: 0.3 },
];

const questoesHard = [
  {
    titulo: "ICMS x ISS + imunidade recíproca",
    enunciado:
      "Município X exige ISS de empresa pública estadual que presta serviço público essencial sem finalidade lucrativa. Ao mesmo tempo, o Estado exige ICMS sobre operação acessória ligada ao mesmo serviço. Analise competência, imunidade e eventual bis in idem.",
    foco: "Competência, art. 150, VI, a, CF, serviço público, natureza da atividade e tributo incidente.",
  },
  {
    titulo: "Lançamento, decadência e prescrição",
    enunciado:
      "Contribuinte recebeu auto de infração de tributo sujeito a lançamento por homologação, referente a fato gerador antigo, sem pagamento antecipado. Discuta prazo decadencial, constituição do crédito e cobrança judicial.",
    foco: "CTN, arts. 150, §4º, 173, I, 174 e Súmula 555/STJ quando aplicável.",
  },
  {
    titulo: "Taxa com base de cálculo de imposto",
    enunciado:
      "Lei municipal instituiu taxa de fiscalização com base no faturamento bruto da empresa. O contribuinte quer impugnar a cobrança antes da inscrição em dívida ativa.",
    foco: "Taxa, especificidade/divisibilidade, base de cálculo, CF art. 145, II e §2º.",
  },
];

function Icon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-base ${className}`}
    >
      {children}
    </span>
  );
}

function scoreColor(score) {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-amber-600";
  return "text-red-600";
}

function calcularNotaPeca(checks) {
  return criteriosPeca.reduce((total, criterio) => {
    return total + (checks[criterio.nome] ? criterio.peso : 0);
  }, 0);
}

function calcularResultado(notaPeca, notaQuestoes) {
  const questoes = Math.max(0, Math.min(5, Number(notaQuestoes) || 0));
  const final = Math.min(10, notaPeca + questoes);
  return {
    notaQuestoesNormalizada: questoes,
    notaFinal: final,
    aprovadoMeta: notaPeca >= 4 && questoes >= 4 && final >= 8,
  };
}

function runInternalTests() {
  const todosMarcados = Object.fromEntries(criteriosPeca.map((c) => [c.nome, true]));
  const nenhumMarcado = {};
  const quaseTodos = Object.fromEntries(
    criteriosPeca
      .filter((c) => c.nome !== "Fundamentação constitucional/legal")
      .map((c) => [c.nome, true])
  );

  const tests = [
    {
      nome: "Peça completa deve valer 5,0",
      passou: Math.abs(calcularNotaPeca(todosMarcados) - 5) < 0.001,
    },
    {
      nome: "Peça vazia deve valer 0,0",
      passou: calcularNotaPeca(nenhumMarcado) === 0,
    },
    {
      nome: "Nota final 4,0 + 4,0 deve aprovar na meta mínima 8,0",
      passou: calcularResultado(4, 4).aprovadoMeta === true,
    },
    {
      nome: "Nota final 3,9 + 5,0 deve bloquear por peça abaixo de 4,0",
      passou: calcularResultado(3.9, 5).aprovadoMeta === false,
    },
    {
      nome: "Questões acima de 5 devem ser limitadas a 5",
      passou: calcularResultado(4, 9).notaQuestoesNormalizada === 5,
    },
    {
      nome: "Sem fundamentação completa deve reduzir 1,2 ponto da peça",
      passou: Math.abs(calcularNotaPeca(quaseTodos) - 3.8) < 0.001,
    },
  ];

  return tests;
}

export default function AppTreinoOABTributarioHardcore() {
  const [pecaEscolhida, setPecaEscolhida] = useState("Mandado de Segurança");
  const [resposta, setResposta] = useState("");
  const [checks, setChecks] = useState({});
  const [notaQuestoes, setNotaQuestoes] = useState(0);
  const [pontoCego, setPontoCego] = useState("Fundamentação legal incompleta");

  const notaPeca = useMemo(() => calcularNotaPeca(checks), [checks]);
  const { notaQuestoesNormalizada, notaFinal, aprovadoMeta } = useMemo(
    () => calcularResultado(notaPeca, notaQuestoes),
    [notaPeca, notaQuestoes]
  );
  const tests = useMemo(() => runInternalTests(), []);
  const testesOk = tests.every((t) => t.passou);

  function toggleCriterio(nome) {
    setChecks((prev) => ({ ...prev, [nome]: !prev[nome] }));
  }

  function handleNotaQuestoes(value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setNotaQuestoes(0);
      return;
    }
    setNotaQuestoes(Math.max(0, Math.min(5, parsed)));
  }

  function resetTreino() {
    setChecks({});
    setResposta("");
    setNotaQuestoes(0);
    setPontoCego("Fundamentação legal incompleta");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-slate-950 text-white p-6 md:p-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="bg-white text-slate-950">🔥</Icon>
                <Badge className="bg-white text-slate-950 hover:bg-white">Treino Hardcore Tributário</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">Meta OAB: 8,0 ou mais</h1>
              <p className="text-slate-300 mt-3 max-w-2xl">
                Peça mínima 4,0 + questões mínimas 4,0. Se ficar abaixo, o app trava o avanço e exige revisão intensiva do ponto cego.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Peça</p>
                  <p className={`text-2xl font-black ${scoreColor(notaPeca * 2)}`}>{notaPeca.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Questões</p>
                  <p className={`text-2xl font-black ${scoreColor(notaQuestoesNormalizada * 2)}`}>{notaQuestoesNormalizada.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">Final</p>
                  <p className={`text-2xl font-black ${scoreColor(notaFinal)}`}>{notaFinal.toFixed(1)}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="p-5 flex gap-3 items-start">
              <Icon>🎯</Icon>
              <div>
                <h2 className="font-bold">Regra de Ouro</h2>
                <p className="text-sm text-slate-600">Nota menor que 8,0 gera revisão obrigatória antes do próximo simulado.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="p-5 flex gap-3 items-start">
              <Icon>⚖️</Icon>
              <div>
                <h2 className="font-bold">Correção Impiedosa</h2>
                <p className="text-sm text-slate-600">Erro estrutural grave zera o item específico e exige refação.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="p-5 flex gap-3 items-start">
              <Icon>🏆</Icon>
              <div>
                <h2 className="font-bold">Padrão 8+</h2>
                <p className="text-sm text-slate-600">Fato, fundamento, conclusão e pedido preciso. Sem resposta genérica.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="peca" className="space-y-4">
          <TabsList className="grid grid-cols-5 rounded-2xl">
            <TabsTrigger value="peca">Peça</TabsTrigger>
            <TabsTrigger value="questoes">Questões</TabsTrigger>
            <TabsTrigger value="correcao">Correção</TabsTrigger>
            <TabsTrigger value="revisao">Revisão</TabsTrigger>
            <TabsTrigger value="testes">Testes</TabsTrigger>
          </TabsList>

          <TabsContent value="peca">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon>📚</Icon>
                  <h2 className="text-2xl font-black">Treino de Peça Prática</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold">Peça do dia</label>
                    <select
                      value={pecaEscolhida}
                      onChange={(e) => setPecaEscolhida(e.target.value)}
                      className="mt-2 w-full rounded-xl border p-3 bg-white"
                    >
                      {pecas.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-600">Comando</p>
                    <p className="font-semibold">Elabore a estrutura completa de {pecaEscolhida}, com fundamento legal, teses e pedidos.</p>
                  </div>
                </div>
                <Textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Digite aqui sua peça: endereçamento, qualificação, fatos, direito, liminar se cabível, pedidos, valor da causa e fechamento..."
                  className="min-h-[260px] rounded-2xl"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questoes">
            <div className="grid md:grid-cols-3 gap-4">
              {questoesHard.map((q) => (
                <Card key={q.titulo} className="rounded-3xl shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <Badge variant="outline">Nível hard</Badge>
                    <h3 className="font-black text-lg">{q.titulo}</h3>
                    <p className="text-sm text-slate-700">{q.enunciado}</p>
                    <div className="rounded-2xl bg-slate-100 p-3 text-sm">
                      <strong>Foco:</strong> {q.foco}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correcao">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-black">Checklist de Correção da Peça</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {criteriosPeca.map((c) => (
                    <button
                      key={c.nome}
                      onClick={() => toggleCriterio(c.nome)}
                      className={`rounded-2xl border p-4 text-left transition ${checks[c.nome] ? "bg-slate-950 text-white" : "bg-white hover:bg-slate-100"}`}
                    >
                      <p className="font-bold">{c.nome}</p>
                      <p className="text-sm opacity-75">Vale {c.peso.toFixed(1)} ponto</p>
                    </button>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="text-sm font-semibold">Nota das questões discursivas</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={notaQuestoes}
                      onChange={(e) => handleNotaQuestoes(e.target.value)}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                  <Button onClick={resetTreino} className="rounded-2xl">Reiniciar treino</Button>
                </div>
                {!aprovadoMeta && (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-5 flex gap-3">
                    <Icon className="bg-red-100 text-red-700">⚠️</Icon>
                    <div>
                      <h3 className="font-black text-red-700">Avanço bloqueado</h3>
                      <p className="text-sm text-red-700">Meta não atingida. Revise o ponto cego antes de fazer outro simulado.</p>
                    </div>
                  </div>
                )}
                {aprovadoMeta && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="font-black text-emerald-700">Padrão 8+ atingido</h3>
                    <p className="text-sm text-emerald-700">Você pode avançar para uma peça mais difícil ou simulado completo.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revisao">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-black">Revisão Intensiva Obrigatória</h2>
                <div>
                  <label className="text-sm font-semibold">Ponto cego detectado</label>
                  <Input value={pontoCego} onChange={(e) => setPontoCego(e.target.value)} className="mt-2 rounded-xl" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-3xl bg-slate-100 p-5">
                    <h3 className="font-black">1. Lei seca</h3>
                    <p className="text-sm text-slate-600">Reescreva os artigos essenciais da CF/CTN ligados ao erro.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-5">
                    <h3 className="font-black">2. Tese padrão</h3>
                    <p className="text-sm text-slate-600">Monte um parágrafo com fato, fundamento e conclusão.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-5">
                    <h3 className="font-black">3. Refação</h3>
                    <p className="text-sm text-slate-600">Refaça o item zerado até atingir pontuação máxima.</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-950 text-white p-5">
                  <p className="text-sm text-slate-300">Missão atual</p>
                  <p className="text-xl font-black">Corrigir: {pontoCego}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testes">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">Testes internos do app</h2>
                    <p className="text-sm text-slate-600">Validação básica dos cálculos de nota, limite de pontuação e regra de bloqueio.</p>
                  </div>
                  <Badge className={testesOk ? "bg-emerald-600" : "bg-red-600"}>{testesOk ? "Todos passaram" : "Falha detectada"}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {tests.map((test) => (
                    <div
                      key={test.nome}
                      className={`rounded-2xl border p-4 ${test.passou ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
                    >
                      <p className={`font-bold ${test.passou ? "text-emerald-700" : "text-red-700"}`}>{test.passou ? "✅" : "❌"} {test.nome}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
