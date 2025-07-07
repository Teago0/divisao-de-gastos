const gastos = [];

function adicionarGasto() {
  const pessoaInput = document.getElementById('pessoa');
  const valorInput = document.getElementById('valor');

  const pessoa = pessoaInput.value.trim();
  const valor = parseFloat(valorInput.value);

  if (!pessoa || isNaN(valor)) return;

  gastos.push({ pessoa, valor });
  atualizarTabela();

  // Limpar campos e voltar para o nome
  pessoaInput.value = '';
  valorInput.value = '';
  pessoaInput.focus();
}

function removerGasto(index) {
  gastos.splice(index, 1);
  atualizarTabela();
}

function atualizarTabela() {
  const corpo = document.querySelector('#tabela tbody');
  corpo.innerHTML = '';
  gastos.forEach((gasto, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${gasto.pessoa}</td>
      <td>R$ ${gasto.valor.toFixed(2)}</td>
      <td><button onclick="removerGasto(${i})">X</button></td>
    `;
    corpo.appendChild(tr);
  });
  document.getElementById('resultado').innerText = '';
}

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

// Atalhos com ENTER
document.getElementById('pessoa').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('valor').focus();
  }
});

document.getElementById('valor').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarGasto(); // já adiciona e volta para o campo nome
  }
});
