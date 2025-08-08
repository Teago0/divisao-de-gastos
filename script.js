// Variáveis e constantes
const gastosPorMes = {};  // Objeto para armazenar gastos por mês ("YYYY-MM": [gastos])
let mesSelecionado = null;

const pessoaInput = document.getElementById('pessoa');
const valorInput = document.getElementById('valor');
const mesAnoInput = document.getElementById('mesAno');
const filtroAtual = { nome: null }; // Usar objeto para manter referência em closures

const gastos = []; // Array temporário para o mês atual (vai ser sincronizado)


// Normaliza texto para facilitar filtros
function normalizarTexto(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Salva no localStorage
function salvarLocalStorage() {
  localStorage.setItem('gastosPorMes', JSON.stringify(gastosPorMes));
}

// Carrega do localStorage
function carregarLocalStorage() {
  const dados = localStorage.getItem('gastosPorMes');
  if (dados) {
    const obj = JSON.parse(dados);
    for (const key in obj) {
      gastosPorMes[key] = obj[key];
    }
  }
}

// Atualiza o array gastos com os dados do mês selecionado
function carregarGastosMes() {
  if (!mesSelecionado) return;
  gastos.length = 0; // limpa o array temporário
  if (gastosPorMes[mesSelecionado]) {
    gastos.push(...gastosPorMes[mesSelecionado]);
  } else {
    gastosPorMes[mesSelecionado] = [];
  }
}

// Atualiza a tabela de gastos conforme filtro e mês
function atualizarTabela() {
  const corpo = document.querySelector('#tabela tbody');
  corpo.innerHTML = '';

  const gastosFiltrados = filtroAtual.nome
    ? gastos.filter(g => normalizarTexto(g.pessoa) === filtroAtual.nome)
    : gastos;

  gastosFiltrados.forEach((gasto, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${gasto.pessoa}</td>
      <td>R$ ${gasto.valor.toFixed(2)}</td>
      <td><button onclick="removerGasto(${i})">X</button></td>
    `;
    corpo.appendChild(tr);
  });

  document.getElementById('resultado').innerText = '';

  atualizarFiltros();
}

// Atualiza filtros por pessoa
function atualizarFiltros() {
  const container = document.getElementById('filtros');
  container.innerHTML = '';

  const nomesUnicos = [...new Set(gastos.map(g => g.pessoa))];

  const botaoTodos = document.createElement('button');
  botaoTodos.textContent = 'Todos';
  botaoTodos.classList.toggle('ativo', filtroAtual.nome === null);
  botaoTodos.onclick = () => {
    filtroAtual.nome = null;
    atualizarTabela();
  };
  container.appendChild(botaoTodos);

  nomesUnicos.forEach(nome => {
    const botao = document.createElement('button');
    botao.textContent = nome;
    botao.classList.toggle('ativo', filtroAtual.nome === nome);
    botao.onclick = () => {
      filtroAtual.nome = normalizarTexto(nome);
      atualizarTabela();
    };
    container.appendChild(botao);
  });
}

// Adiciona gasto na lista e salva no storage
function adicionarGasto() {
  const pessoa = normalizarTexto(pessoaInput.value);
  const valor = parseFloat(valorInput.value);

  if (!pessoa || isNaN(valor)) return alert('Informe nome e valor válidos.');

  const gasto = { pessoa, valor };
  gastos.push(gasto);
  gastosPorMes[mesSelecionado] = gastos;
  salvarLocalStorage();

  atualizarTabela();

  pessoaInput.value = '';
  valorInput.value = '';
  pessoaInput.focus();
}

// Remove gasto pelo índice no array gastos e salva
function removerGasto(index) {
  gastos.splice(index, 1);
  gastosPorMes[mesSelecionado] = gastos;
  salvarLocalStorage();
  atualizarTabela();
}

// Calcula totais e exibe
function calcularTotais() {
  const totais = {};
  let totalGeral = 0;

  gastos.forEach(({ pessoa, valor }) => {
    totais[pessoa] = (totais[pessoa] || 0) + valor;
    totalGeral += valor;
  });

  let resultado = `Total Geral: R$ ${totalGeral.toFixed(2)}\n\n`;
  for (const [pessoa, total] of Object.entries(totais)) {
    resultado += `${pessoa}: R$ ${total.toFixed(2)}\n`;
  }

  document.getElementById('resultado').innerText = resultado;
}

// Eventos para Enter em inputs
pessoaInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    valorInput.focus();
  }
});
valorInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarGasto();
  }
});

// Evento para troca do mês
mesAnoInput.addEventListener('change', () => {
  mesSelecionado = mesAnoInput.value;
  carregarGastosMes();
  filtroAtual.nome = null;
  atualizarTabela();
  document.getElementById('resultado').innerText = '';
});

// Inicialização
function inicializar() {
  carregarLocalStorage();

  // Define mês atual padrão no input
  const hoje = new Date();
  const mesFormatado = hoje.toISOString().slice(0,7); // "YYYY-MM"
  mesAnoInput.value = mesFormatado;
  mesSelecionado = mesFormatado;

  carregarGastosMes();
  atualizarTabela();
}

inicializar();
