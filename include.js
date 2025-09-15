// =======================
// DOCUMENT READY
// =======================
document.addEventListener("DOMContentLoaded", function () {

  // =======================
  // VARIÁVEIS SACOLA
  // =======================
  window.sacola = [];
  window.listaSacola = document.getElementById("sacola-itens");
  window.totalSacola = document.getElementById("sacola-total");

  // Atualiza sacola e contador no carregamento
  atualizarSacola();
  atualizarContadorSacola();

  // =======================
  // FORMULÁRIO DE CONTATO
  // =======================
  const formContato = document.querySelector(".contato-form");
  if (formContato) {
    formContato.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Obrigado! Sua mensagem foi enviada com sucesso.");
      this.reset();
    });
  }

  // =======================
  // HEADER OFFSET
  // =======================
  updateHeaderOffset();

  // Adiciona listeners para os botões do modal de entrega
  document.getElementById("btnEntrega").addEventListener("click", selecionarEntrega);
  document.getElementById("btnRetirada").addEventListener("click", selecionarRetirada);
});

// Atualiza header height ao redimensionar
window.addEventListener("resize", updateHeaderOffset);

// Fechar modal com ESC
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
      closeModal();
      fecharModalEntrega();
      fecharSacola();
  }
});

// =======================
// MODAL DE IMAGENS
// =======================
function openModal(src, alt) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "flex";
  modalImg.src = src;
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

// Fechar modal ao clicar fora
window.addEventListener("click", function (event) {
  const modal = document.getElementById("imageModal");
  const modalEntrega = document.getElementById("modalEntrega");
  
  if (event.target === modal) closeModal();
  if (event.target === modalEntrega) fecharModalEntrega();
});

// =======================
// MENU RESPONSIVO
// =======================
function toggleMenu() {
  const nav = document.querySelector("nav ul");
  if (nav) nav.classList.toggle("show");
}

// =======================
// SACOLA DE COMPRAS
// =======================
function atualizarContadorSacola() {
  const contador = document.getElementById("contador-sacola");
  if (contador) contador.textContent = sacola.length;
}

function adicionarASacola(nome, preco) {
  const itemExistente = sacola.find((item) => item.nome === nome);
  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    sacola.push({ nome, preco, qtd: 1 });
  }
  atualizarSacola();
  atualizarContadorSacola();
  exibirNotificacao(nome);
}

function exibirNotificacao(nomeItem) {
  const notificacao = document.getElementById("notificacao-sacola");
  const paragrafo = notificacao.querySelector('p');

  paragrafo.textContent = `${nomeItem} adicionado à sacola!`;
  notificacao.classList.add("show");

  // Esconde a notificação após 3 segundos
  setTimeout(() => {
    notificacao.classList.remove("show");
  }, 3000);
}

function removerDaSacola(index) {
  sacola.splice(index, 1);
  atualizarSacola();
  atualizarContadorSacola();
}

function atualizarSacola() {
  if (!listaSacola || !totalSacola) return;
  listaSacola.innerHTML = "";
  let total = 0;

  sacola.forEach((item) => {
    total += item.preco * item.qtd;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} x${item.qtd}
      <div>
        <button onclick="alterarQtd('${item.nome}', -1)">-</button>
        <button onclick="alterarQtd('${item.nome}', 1)">+</button>
      </div>
    `;
    listaSacola.appendChild(li);
  });

  totalSacola.innerHTML = `<strong>Total:</strong> R$ ${total.toFixed(2).replace(".", ",")}`;
}

function alterarQtd(nome, delta) {
  const item = sacola.find((i) => i.nome === nome);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) sacola = sacola.filter((i) => i.nome !== nome);
  atualizarSacola();
  atualizarContadorSacola();
}

// Abrir e fechar sacola
function abrirSacola() {
  document.getElementById("sacola").classList.add("ativa");
}

function fecharSacola() {
  document.getElementById("sacola").classList.remove("ativa");
}

// Limpar sacola
function limparSacola() {
  sacola = [];
  atualizarSacola();
  atualizarContadorSacola();
}

// =======================
// FUNÇÕES DO MODAL DE ENTREGA - CORRIGIDAS
// =======================
function abrirModalEntrega() {
  if (sacola.length === 0) {
    alert("Sua sacola está vazia!");
    return;
  }
  document.getElementById("modalEntrega").style.display = "flex";
}

function fecharModalEntrega() {
  document.getElementById("modalEntrega").style.display = "none";
  // Oculta o formulário de endereço ao fechar
  document.getElementById("enderecoForm").classList.add("hidden");
  // Limpa os campos do formulário
  limparCamposEntrega();
}

function limparCamposEntrega() {
  document.getElementById("nome-entrega").value = "";
  document.getElementById("telefone-entrega").value = "";
  document.getElementById("endereco-entrega").value = "";
  document.getElementById("complemento-entrega").value = "";
}

function selecionarEntrega() {
  document.getElementById("enderecoForm").classList.remove("hidden");
}

// FUNÇÃO CORRIGIDA - Agora usa os IDs corretos dos campos
function confirmarEntrega() {
  const nome = document.getElementById("nome-entrega").value;
  const telefone = document.getElementById("telefone-entrega").value;
  const endereco = document.getElementById("endereco-entrega").value;
  const complemento = document.getElementById("complemento-entrega").value;

  // Validação corrigida - verifica se os campos obrigatórios estão preenchidos
  if (!nome.trim() || !telefone.trim() || !endereco.trim()) {
    alert("Por favor, preencha todos os campos obrigatórios (nome, telefone e endereço) para a entrega.");
    return;
  }

  finalizarPedido("Entrega em Domicílio", `*Endereço:* ${endereco}${complemento ? `, ${complemento}` : ''}`);
  fecharModalEntrega();
}

function selecionarRetirada() {
  finalizarPedido("Retirada no Local", "");
  fecharModalEntrega();
}

// =======================
// FINALIZAR PEDIDO (WHATSAPP) - ATUALIZADA
// =======================
function finalizarPedido(tipoEntrega, detalhesEntrega) {
  const formaPagamento = document.querySelector('input[name="pagamento"]:checked').value;

  // Geração de número de pedido e data
  const numeroPedido = Math.floor(Math.random() * 900000) + 100000;
  const data = new Date().toLocaleDateString('pt-BR');

  // Captura dos dados do cliente (apenas se for entrega)
  let nomeCliente = 'Não Informado';
  let telefoneCliente = 'Não Informado';
  if (tipoEntrega === "Entrega em Domicílio") {
      nomeCliente = document.getElementById("nome-entrega").value || 'Não Informado';
      telefoneCliente = document.getElementById("telefone-entrega").value || 'Não Informado';
  }

  // Monta a mensagem do pedido
  let mensagem = `*Pedido:* ${numeroPedido}\n*Data:* ${data}\n\n`;
  if (tipoEntrega === "Entrega em Domicílio") {
      mensagem += `*Cliente:* ${nomeCliente}\n`;
      mensagem += `*Telefone:* ${telefoneCliente}\n`;
      mensagem += `${detalhesEntrega}\n`;
  } else {
      mensagem += `*Cliente:* ${nomeCliente}\n`;
      mensagem += `*Telefone:* ${telefoneCliente}\n`;
      mensagem += `*Tipo de Serviço:* Retirada no Local\n`;
  }
  mensagem += `------------------------------\n`;

  let subtotal = 0;
  sacola.forEach((item) => {
    const valorItem = item.preco * item.qtd;
    subtotal += valorItem;
    mensagem += `${item.nome}\n  *${item.qtd} UN x R$ ${item.preco.toFixed(2).replace(".", ",")} = R$ ${valorItem.toFixed(2).replace(".", ",")}\n\n`;
  });

  let taxaEntrega = 0;
  if (tipoEntrega === "Entrega em Domicílio") {
    taxaEntrega = 7.00;
    mensagem += `*Taxa de entrega*\n  *TAXA DE ENTREGA = R$ ${taxaEntrega.toFixed(2).replace(".", ",")}\n`;
  }

  mensagem += `------------------------------\n`;
  const total = subtotal + taxaEntrega;
  mensagem += `*SUBTOTAL:* R$ ${total.toFixed(2).replace(".", ",")}\n\n`;
  mensagem += `*Pagamento:* ${formaPagamento}`;

  const url = `https://wa.me/551491091093?text=${encodeURIComponent(mensagem )}`;
  window.open(url, "_blank");
}

// =======================
// HEADER OFFSET FUNCTION
// =======================
function updateHeaderOffset() {
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight : 0;
  document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
}
