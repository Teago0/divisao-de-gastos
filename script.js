const gastos = []; // Armazena os gastos inseridos

// Função para remover acentos, espaços extras e padronizar para minúsculas
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Adiciona um novo gasto à lista
function adicionarGasto() {
  const pessoaInput = document.getElementById('pessoa');
  const valorInput = document.getElementById('valor');

  const pessoa = normalizarTexto(pessoaInput.value);
  const valor = parseFloat(valorInput.value);

  if (!pessoa || isNaN(valor)) return;

  gastos.push({ pessoa, valor });
  atualizarTabela();

  pessoaInput.value = '';
  valorInput.value = '';
  pessoaInput.focus();
}

// Remove um gasto da lista pelo índice
function removerGasto(index) {
  gastos.splice(index, 1);
  atualizarTabela();
}

let filtroAtual = null; // Armazena o nome da pessoa filtrada (ou null para todos)

// Atualiza a tabela de gastos na tela
function atualizarTabela() {
  const corpo = document.querySelector('#tabela tbody');
  corpo.innerHTML = '';

  const gastosFiltrados = filtroAtual
    ? gastos.filter(g => normalizarTexto(g.pessoa) === filtroAtual)
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

// Calcula o total geral e o total por pessoa
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

// Permite usar a tecla Enter para ir ao próximo campo ou adicionar
document.getElementById('pessoa').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('valor').focus();
  }
});

document.getElementById('valor').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarGasto();
  }
});

// Cria os botões de filtro por pessoa
function atualizarFiltros() {
  const container = document.getElementById('filtros');
  container.innerHTML = '';

  const nomesUnicos = [...new Set(gastos.map(g => g.pessoa))];

  // Botão "Todos"
  const botaoTodos = document.createElement('button');
  botaoTodos.textContent = 'Todos';
  botaoTodos.classList.toggle('ativo', filtroAtual === null);
  botaoTodos.onclick = () => {
    filtroAtual = null;
    atualizarTabela();
  };
  container.appendChild(botaoTodos);

  // Botões individuais por pessoa
  nomesUnicos.forEach(nome => {
    const botao = document.createElement('button');
    botao.textContent = nome;
    botao.classList.toggle('ativo', filtroAtual === nome);
    botao.onclick = () => {
      filtroAtual = normalizarTexto(nome);
      atualizarTabela();
    };
    container.appendChild(botao);
  });
}

// Exporta os dados para um arquivo Excel
function exportarParaExcel() {
  if (gastos.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const dados = gastos.map(g => ({
    Pessoa: g.pessoa,
    Valor: g.valor.toFixed(2).replace('.', ',') // Formata para vírgula decimal (pt-BR)
  }));

  const planilha = XLSX.utils.json_to_sheet(dados);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, "Gastos");

  XLSX.writeFile(livro, "divisao_de_gastos.xlsx");
}
