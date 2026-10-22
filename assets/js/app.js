const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let carrinho = [];
let filtroAtual = "todos";

/* ---------- CARRINHO SALVO ---------- */
const CHAVE_CARRINHO = "espettus-carrinho";

function salvarCarrinho() {
    try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho)); } catch {}
}

function carregarCarrinho() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
        // descarta itens que não existem mais no cardápio
        carrinho = salvo.filter(i => i.qtd > 0 && produtos.some(p => p.id === i.id));
    } catch {
        carrinho = [];
    }
}

/* ---------- NAVEGAÇÃO ---------- */
function irPara(id) {
    $$(".pagina").forEach(p => p.classList.remove("ativa"));
    $("#" + id).classList.add("ativa");
    $$(".menu-item").forEach(b => b.classList.toggle("ativo", b.dataset.pagina === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id === "pedidos") renderCarrinho();
}

document.addEventListener("click", e => {
    const alvo = e.target.closest("[data-pagina]");
    if (alvo) {
        e.preventDefault();

        // indo para Categorias: abre já na categoria do botão (ou em "Todos")
        if (alvo.dataset.pagina === "categorias") {
            const cat = alvo.dataset.categoria;
            filtroAtual = categorias.some(c => c.id === cat) ? cat : "todos";
            renderFiltros();
        }

        irPara(alvo.dataset.pagina);
    }
    const add = e.target.closest("[data-add]");
    if (add) adicionar(Number(add.dataset.add), add);
});

/* ---------- CARDS ---------- */
function cardProduto(p) {
    const foto = p.img
        ? `<div class="produto-foto"><img src="${p.img}" alt="${p.nome}" loading="lazy">${p.popular ? '<span class="selo">Popular</span>' : ""}</div>`
        : `<div class="produto-foto vazia">${p.emoji || "🍽️"}${p.popular ? '<span class="selo">Popular</span>' : ""}</div>`;

    return `
    <article class="produto">
        ${foto}
        <div class="produto-info">
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
            <div class="produto-rodape">
                <span class="preco">${brl(p.preco)}</span>
                <button class="add" data-add="${p.id}" aria-label="Adicionar ${p.nome}">+</button>
            </div>
        </div>
    </article>`;
}

function renderLista(seletor, lista) {
    $(seletor).innerHTML = lista.map(cardProduto).join("");
}

/* ---------- CATEGORIAS ---------- */
function renderFiltros() {
    const todos = [{ id: "todos", nome: "Todos" }, ...categorias];
    $("#filtros").innerHTML = todos.map(c =>
        `<button class="filtro ${c.id === filtroAtual ? "ativo" : ""}" data-filtro="${c.id}">${c.nome}</button>`
    ).join("");

    const lista = filtroAtual === "todos" ? produtos : produtos.filter(p => p.categoria === filtroAtual);
    renderLista("#grid-categoria", lista);
}

$("#filtros").addEventListener("click", e => {
    const b = e.target.closest("[data-filtro]");
    if (!b) return;
    filtroAtual = b.dataset.filtro;
    renderFiltros();
});

/* ---------- CARRINHO ---------- */
function adicionar(id, btnElement = null) {
    const item = carrinho.find(i => i.id === id);
    item ? item.qtd++ : carrinho.push({ id, qtd: 1 });
    
    atualizarBadge();
    toast(produtos.find(p => p.id === id).nome + " adicionado");
    if ($("#pedidos").classList.contains("ativa")) renderCarrinho();

    // Animação do badge no cabeçalho
    const badge = $("#badge");
    badge.classList.remove("animar");
    void badge.offsetWidth; // Força o reflow do navegador para reiniciar a animação
    badge.classList.add("animar");

    // Feedback no botão clicado
    if (btnElement) {
            // guarda o conteúdo original só na primeira vez (senão um 2º clique guardaria o "✔")
            if (!btnElement.dataset.original) btnElement.dataset.original = btnElement.innerHTML;

            clearTimeout(btnElement._timer); // cancela o retorno do clique anterior
            btnElement.innerHTML = "✔";
            btnElement.classList.add("sucesso");

            btnElement._timer = setTimeout(() => {
                btnElement.innerHTML = btnElement.dataset.original;
                btnElement.classList.remove("sucesso");
            }, 1000);
        }
}

function alterar(id, delta) {
    const item = carrinho.find(i => i.id === id);
    if (!item) return;
    item.qtd += delta;
    carrinho = carrinho.filter(i => i.qtd > 0);
    atualizarBadge();
    renderCarrinho();
}

function atualizarBadge() {
    const itens = carrinho.reduce((s, i) => s + i.qtd, 0);
    $("#badge").textContent = itens;

    // barra fixa "Ver pedido"
    $("#barra-pedido").hidden = itens === 0;
    $("#barra-itens").textContent = itens === 1 ? "1 item" : itens + " itens";
    $("#barra-total").textContent = brl(totalCarrinho());

    salvarCarrinho();
}

function totalCarrinho() {
    return carrinho.reduce((s, i) => s + produtos.find(p => p.id === i.id).preco * i.qtd, 0);
}

function renderCarrinho() {
    const box = $("#carrinho");

    if (!carrinho.length) {
        box.innerHTML = `<div class="vazio">Seu pedido está vazio.<br>Adicione pratos no cardápio.</div>`;
        return;
    }

    box.innerHTML = carrinho.map(i => {
        const p = produtos.find(x => x.id === i.id);
        return `
        <div class="item-carrinho">
            <div class="nome">${p.nome}<small>${brl(p.preco)} cada</small></div>
            <div class="qtd">
                <button onclick="alterar(${p.id}, -1)">−</button>
                <strong>${i.qtd}</strong>
                <button onclick="alterar(${p.id}, 1)">+</button>
            </div>
            <strong>${brl(p.preco * i.qtd)}</strong>
        </div>`;
    }).join("") + `
        <div class="total"><span>Total</span><span>${brl(totalCarrinho())}</span></div>
        <button class="btn grande" onclick="finalizar()">Finalizar pelo WhatsApp</button>`;
}

/* ---------- ENTREGA ---------- */
const valor = id => $("#" + id).value.trim();

function marcarInvalido(ids) {
    ids.forEach(id => $("#" + id).classList.add("invalido"));
    $("#" + ids[0]).focus();
}

// tirar o vermelho assim que o cliente começa a corrigir
document.addEventListener("input", e => e.target.classList.remove("invalido"));

function finalizar() {
    const entrega = $("#tipo-entrega").checked;

    // campos obrigatórios (endereço só quando for entrega)
    const obrigatorios = ["cliente-nome", "pagamento"];
    if (entrega) obrigatorios.push("end-rua", "end-numero", "end-bairro");

    const faltando = obrigatorios.filter(id => !valor(id));
    if (faltando.length) {
        marcarInvalido(faltando);
        toast(entrega ? "Preencha os dados de entrega" : "Preencha nome e pagamento");
        return;
    }

    // troco: só vale se o pagamento for em dinheiro
    const troco = valor("pagamento") === "Dinheiro"
        ? parseFloat(valor("troco").replace(",", ".")) || 0
        : 0;
    if (troco && troco < totalCarrinho()) {
        marcarInvalido(["troco"]);
        toast("O troco deve ser maior que o total do pedido");
        return;
    }

    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

    let msg = `*Novo Pedido - Espettus*\n${saudacao}! Gostaria de fazer o seguinte pedido:\n\n`;

    carrinho.forEach(i => {
        const p = produtos.find(x => x.id === i.id);
        msg += `▪️ *${i.qtd}x* ${p.nome} — ${brl(p.preco * i.qtd)}\n`;
    });

    msg += `\n🛒 *Total do Pedido: ${brl(totalCarrinho())}*\n`;
    msg += `\n👤 *Nome:* ${valor("cliente-nome")}`;

        if (entrega) {
        const comp = valor("end-complemento");
        const ref = valor("end-referencia");
        msg += `\n🛵 *Entrega*`;
        msg += `\n📍 ${valor("end-rua")}, ${valor("end-numero")}${comp ? " - " + comp : ""}`;
        msg += `\n🏘️ Bairro: ${valor("end-bairro")}`;
        if (ref) msg += `\n📌 Referência: ${ref}`;
    } else {
        msg += `\n🏪 *Retirada no local*`;
    }

    msg += `\n💳 *Pagamento:* ${valor("pagamento")}`;
    if (troco) msg += `\n💵 *Troco para:* ${brl(troco)}`;

    const obs = valor("observacao");
    if (obs) msg += `\n📝 *Obs:* ${obs}`;

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    
        // pedido enviado: limpa o carrinho e mostra a confirmação
    // (nome, endereço e pagamento ficam preenchidos para o próximo pedido)
    carrinho = [];
    atualizarBadge();
    $("#carrinho").innerHTML = `
        <div class="vazio enviado">
            <h3>Pedido enviado!</h3>
            <p>Confirme o envio no WhatsApp para a Espettus receber seu pedido.</p>
            <button class="btn" data-pagina="home">Voltar ao cardápio</button>
        </div>`;
    toast("Pedido enviado!");
}

/* ---------- TOAST ---------- */
let t;
function toast(texto) {
    const el = $("#toast");
    el.textContent = texto;
    el.classList.add("mostrar");
    clearTimeout(t);
    t = setTimeout(() => el.classList.remove("mostrar"), 1800);
}

/* ---------- ABERTO AGORA ---------- */
// [abre, fecha] em horas; 24 = meia-noite
const HORARIOS = [[11, 14], [17, 24]];

function atualizarStatus() {
    const el = $("#status-loja");
    if (!el) return;

    const d = new Date();
    const agora = d.getHours() + d.getMinutes() / 60;
    const aberto = HORARIOS.some(([abre, fecha]) => agora >= abre && agora < fecha);
    const proxima = HORARIOS.find(([abre]) => abre > agora);

    el.className = "status " + (aberto ? "aberto" : "fechado");
    el.textContent = aberto
        ? "Aberto agora"
        : "Fechado agora" + (proxima ? " · abre às " + proxima[0] + "h" : "");
}

/* ---------- BANNERS: troca automática ---------- */
function iniciarBanners() {
    const faixa = $(".banners-faixa");
    if (!faixa) return;

    const slides = [...faixa.children];
    if (slides.length < 2) return;           // com um banner só, não há o que alternar

    const INTERVALO = 5000;                  // tempo de cada banner, em ms
    let timer = null;
    let hover = false, tocando = false, foco = false;

    // bolinhas indicadoras
    const pontos = document.createElement("div");
    pontos.className = "banners-pontos";
    pontos.innerHTML = slides.map((_, i) =>
        `<button aria-label="Ir para o banner ${i + 1}" data-banner="${i}"></button>`
    ).join("");
    faixa.after(pontos);

    const origem = () => slides[0].offsetLeft;

    // qual banner está mais perto do início da faixa
    function atual() {
        const x = faixa.scrollLeft + origem();
        let melhor = 0;
        slides.forEach((s, i) => {
            if (Math.abs(s.offsetLeft - x) < Math.abs(slides[melhor].offsetLeft - x)) melhor = i;
        });
        return melhor;
    }

    function ir(i) {
        faixa.scrollTo({ left: slides[i].offsetLeft - origem(), behavior: "smooth" });
    }

    function marcar() {
        const a = atual();
        [...pontos.children].forEach((p, i) => p.classList.toggle("ativo", i === a));
    }

    function proximo() {
        // não troca se o cliente está mexendo, se a aba está em segundo plano
        // ou se a Home não está na tela (faixa escondida tem largura 0)
        if (hover || tocando || foco || document.hidden || !faixa.offsetWidth) return;
        ir((atual() + 1) % slides.length);
    }

    function reiniciar() {
        clearInterval(timer);
        // quem pediu "menos movimento" no aparelho não recebe troca automática
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        timer = setInterval(proximo, INTERVALO);
    }

    faixa.addEventListener("scroll", marcar, { passive: true });

    pontos.addEventListener("click", e => {
        const b = e.target.closest("[data-banner]");
        if (!b) return;
        ir(Number(b.dataset.banner));
        reiniciar();                         // recomeça a contagem depois do clique
    });

    // pausas: mouse em cima, dedo na tela, foco por teclado
    faixa.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });
    faixa.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { hover = false; reiniciar(); } });
    faixa.addEventListener("touchstart", () => { tocando = true; }, { passive: true });
    faixa.addEventListener("touchend", () => { tocando = false; reiniciar(); });
    faixa.addEventListener("touchcancel", () => { tocando = false; reiniciar(); });
    faixa.addEventListener("focusin", () => { foco = true; });
    faixa.addEventListener("focusout", () => { foco = false; reiniciar(); });

    marcar();
    reiniciar();
}

/* ---------- INICIAR ---------- */
carregarCarrinho();
atualizarBadge();
atualizarStatus();
setInterval(atualizarStatus, 60000);
renderLista("#grid-recomendados", produtos.filter(p => p.popular).slice(0, 4));
renderLista("#grid-carnes", produtos.filter(p => p.categoria === "carnes"));
renderLista("#grid-hamburgueres", produtos.filter(p => p.categoria === "hamburgueres"));
renderLista("#grid-bebidas", produtos.filter(p => p.categoria === "bebidas"));
renderFiltros();
renderCarrinho();
iniciarBanners();