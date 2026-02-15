
// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

const CATEGORIAS = [
	"eletrodoméstico",
	"decoração",
	"materiais de construção",
	"vestuário",
	"alimentos"
];

const IVA_POR_CATEGORIA = {
	"eletrodoméstico": 0.23,
	"decoração": 0.23,
	"materiais de construção": 0.23,
	"vestuário": 0.23,
	"alimentos": 0.06
};

function round2(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatBRL(value) {
	return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

function assertPositiveNumber(value, label) {
	if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} deve ser um número positivo.`);
	}
}

function assertNonNegativeInt(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${label} deve ser um inteiro >= 0.`);
	}
}

function assertCategoriaValida(categoria) {
	if (!CATEGORIAS.includes(categoria)) {
		throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
	}
}

// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)

class Produto {
    constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {

        if (!sku) throw new Error("SKU é obrigatório.");
        if (!nome) throw new Error("Nome é obrigatório.");
        if (typeof preco !== "number" || preco <= 0)
            throw new Error("Preço deve ser um número maior que zero.");

        if (!Number.isInteger(numeroMaximoParcelas) ||
            numeroMaximoParcelas < 1 ||
            numeroMaximoParcelas > 24)
            throw new Error("numeroMaximoParcelas deve ser um inteiro entre 1 e 24.");

        this.sku = sku;
        this.nome = nome;
        this.preco = preco;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.numeroMaximoParcelas = numeroMaximoParcelas;
    }

    getValorDeParcela(numeroDeParcelas) {
        if (!Number.isInteger(numeroDeParcelas) ||
            numeroDeParcelas < 1 ||
            numeroDeParcelas > this.numeroMaximoParcelas) {
            throw new Error(`Número de parcelas inválido. Deve ser entre 1 e ${this.numeroMaximoParcelas}.`);
        }

        return Number((this.preco / numeroDeParcelas).toFixed(2));
    }
}


// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida

class Cliente {
    constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
        if (!id || !nome) {
            throw new Error("Cliente precisa de id e nome.");
        }

        if (tipo !== "REGULAR" && tipo !== "VIP") {
            throw new Error("Tipo de cliente inválido. Use 'REGULAR' ou 'VIP'.");
        }

        if (saldoPontos < 0) {
            throw new Error("Saldo de pontos não pode ser negativo.");
        }

        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.saldoPontos = saldoPontos;
    }

    adicionarPontos(pontos) {
        if (pontos <= 0) {
            throw new Error("Os pontos adicionados devem ser maiores que zero.");
        }

        this.saldoPontos += pontos;
        return this.saldoPontos;
    }

    resgatarPontos(pontos) {
        if (pontos <= 0) {
            throw new Error("Os pontos a resgatar devem ser maiores que zero.");
        }

        if (pontos > this.saldoPontos) {
            throw new Error("Saldo insuficiente para resgatar esses pontos.");
        }

        this.saldoPontos -= pontos;
        return this.saldoPontos;
    }
}


// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).

class ItemCarrinho {
    constructor({ sku, quantidade, precoUnitario }) {

        if (!sku || typeof sku !== "string") {
            throw new Error("SKU inválido.");
        }

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            throw new Error("Quantidade deve ser um inteiro >= 1.");
        }

        if (typeof precoUnitario !== "number" || precoUnitario <= 0) {
            throw new Error("Preço unitário deve ser um número maior que zero.");
        }

        this.sku = sku;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario; 
    }

    getTotal() {
        return Number((this.quantidade * this.precoUnitario).toFixed(2));
    }
}


// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)

class Estoque {
    constructor() {
        this.itens = new Map();
    }

    definirQuantidade(sku, quantidade) {
        if (!sku) throw new Error("SKU inválido.");
        if (!Number.isInteger(quantidade) || quantidade < 0)
            throw new Error("Quantidade deve ser um inteiro >= 0.");

        this.itens.set(sku, quantidade);
    }

    adicionar(sku, quantidade) {
        if (!sku) throw new Error("SKU inválido.");
        if (!Number.isInteger(quantidade) || quantidade <= 0)
            throw new Error("Quantidade deve ser um inteiro > 0.");

        const atual = this.getQuantidade(sku);
        this.itens.set(sku, atual + quantidade);
    }

    remover(sku, quantidade) {
        if (!sku) throw new Error("SKU inválido.");
        if (!Number.isInteger(quantidade) || quantidade <= 0)
            throw new Error("Quantidade deve ser um inteiro > 0.");

        const atual = this.getQuantidade(sku);

        if (quantidade > atual) {
            throw new Error(`Stock insuficiente. Disponível: ${atual}`);
        }

        this.itens.set(sku, atual - quantidade);
    }

    getQuantidade(sku) {
        return this.itens.get(sku) ?? 0;
    }

    garantirDisponibilidade(sku, quantidade) {
        const disponivel = this.getQuantidade(sku);

        if (quantidade <= 0) {
            throw new Error("Quantidade deve ser maior que zero.");
        }

        if (disponivel < quantidade) {
            throw new Error(`Stock insuficiente para SKU ${sku}. Disponível: ${disponivel}, necessário: ${quantidade}`);
        }

        return true;
    }
}


// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)

class Catalogo {
    constructor() {
        this.produtos = new Map(); 
    }

    adicionarProduto(produto) {
        if (!produto || !produto.sku) {
            throw new Error("Produto inválido.");
        }

        if (this.produtos.has(produto.sku)) {
            throw new Error(`Produto com SKU '${produto.sku}' já existe no catálogo.`);
        }

        this.produtos.set(produto.sku, produto);
    }

    getProduto(sku) {
        if (!sku) throw new Error("SKU inválido.");
        return this.produtos.get(sku) || null;
    }

    listarPorCategoria(categoria) {
        if (!categoria) throw new Error("Categoria inválida.");

        const lista = [];

        for (const produto of this.produtos.values()) {
            if (produto.categoria === categoria) {
                lista.push(produto);
            }
        }

        return lista;
    }

    atualizarPreco(sku, novoPreco) {
        if (!sku) throw new Error("SKU inválido.");
        if (typeof novoPreco !== "number" || novoPreco <= 0) {
            throw new Error("Preço inválido.");
        }

        const produto = this.getProduto(sku);

        if (!produto) {
            throw new Error(`Produto com SKU '${sku}' não encontrado.`);
        }

        produto.preco = novoPreco;
    }
}


// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class CarrinhoDeCompras {
    constructor({ catalogo, estoque }) {
        if (!catalogo || !estoque) {
            throw new Error("Carrinho precisa de catálogo e estoque.");
        }

        this.catalogo = catalogo;
        this.estoque = estoque;

        this.itens = new Map();
    }

    adicionarItem(sku, quantidade) {
        if (!sku) throw new Error("SKU inválido.");
        if (!Number.isInteger(quantidade) || quantidade < 1)
            throw new Error("Quantidade deve ser >= 1.");

        const produto = this.catalogo.getProduto(sku);
        if (!produto) throw new Error("Produto não encontrado no catálogo.");

        this.estoque.garantirDisponibilidade(sku, quantidade);

        if (this.itens.has(sku)) {
            const item = this.itens.get(sku);
            const novaQuantidade = item.quantidade + quantidade;

            this.estoque.garantirDisponibilidade(sku, novaQuantidade);

            item.quantidade = novaQuantidade;
            return;
        }

        const precoUnitario = produto.preco;

        const novoItem = new ItemCarrinho({
            sku,
            quantidade,
            precoUnitario
        });

        this.itens.set(sku, novoItem);
    }

    removerItem(sku) {
        if (!this.itens.has(sku)) {
            throw new Error("Item não existe no carrinho.");
        }

        this.itens.delete(sku);
    }

    alterarQuantidade(sku, novaQuantidade) {
        if (!this.itens.has(sku)) {
            throw new Error("Item não existe no carrinho.");
        }

        if (!Number.isInteger(novaQuantidade) || novaQuantidade < 1) {
            throw new Error("Quantidade deve ser >= 1.");
        }

        this.estoque.garantirDisponibilidade(sku, novaQuantidade);

        const item = this.itens.get(sku);
        item.quantidade = novaQuantidade;
    }

    listarItens() {
        return [...this.itens.values()];
    }

    getSubtotal() {
        let total = 0;

        for (const item of this.itens.values()) {
            total += item.getTotal();
        }

        return Number(total.toFixed(2));
    }
}


// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()
class MotorDePrecos {
    constructor({ catalogo }) {
        if (!catalogo) throw new Error("MotorDePrecos precisa de um catálogo.");
        this.catalogo = catalogo;
        this.freteBase = 10;
    }

    calcular({ cliente, itens, cupomCodigo }) {
        if (!cliente) throw new Error("Cliente é obrigatório.");
        if (!Array.isArray(itens)) throw new Error("Itens inválidos.");

        const breakdown = {
            subtotal: 0,
            descontos: [],
            totalDescontos: 0,
            impostoPorCategoria: {},
            totalImpostos: 0,
            frete: this.freteBase,
            total: 0
        };

        breakdown.subtotal = itens.reduce((s, item) => s + item.getTotal(), 0);

        const descontoVestu = this._descontoVestuário(itens);
        if (descontoVestu > 0) {
            breakdown.descontos.push({
                codigo: "L3P2",
                descricao: "Leve 3 pague 2 (vestuário)",
                valor: descontoVestu
            });
        }

        if (cliente.tipo === "VIP" && cupomCodigo !== "SEM-VIP") {
            const valor = breakdown.subtotal * 0.05;
            breakdown.descontos.push({
                codigo: "VIP",
                descricao: "Desconto cliente VIP",
                valor
            });
        }

        if (cupomCodigo) {
            this._aplicarCupom(breakdown, cupomCodigo);
        }

        if (breakdown.subtotal >= 500) {
            breakdown.descontos.push({
                codigo: "VALOR500",
                descricao: "Desconto por compras acima de 500€",
                valor: 30
            });
        }

        breakdown.totalDescontos = breakdown.descontos.reduce((s, d) => s + d.valor, 0);

        if (breakdown.totalDescontos > breakdown.subtotal) {
            breakdown.totalDescontos = breakdown.subtotal;
        }

        const baseImposto = breakdown.subtotal - breakdown.totalDescontos;

        breakdown.impostoPorCategoria = this._calcularImpostos(itens, baseImposto);
        breakdown.totalImpostos = Object.values(breakdown.impostoPorCategoria)
            .reduce((s, v) => s + v, 0);

        breakdown.total = baseImposto + breakdown.totalImpostos + breakdown.frete;

        return breakdown;
    }

    _descontoVestuário(itens) {
        const lista = [];

        for (const item of itens) {
            const produto = this.catalogo.getProduto(item.sku);
            if (produto.categoria === "vestuário") {
                for (let i = 0; i < item.quantidade; i++) {
                    lista.push(produto.preco);
                }
            }
        }

        if (lista.length < 3) return 0;

        lista.sort((a, b) => a - b);

        const grupos = Math.floor(lista.length / 3);
        let desconto = 0;

        for (let i = 0; i < grupos; i++) {
            desconto += lista[i * 3]; 
        }

        return desconto;
    }
    _aplicarCupom(breakdown, cupom) {
        switch (cupom) {
            case "ETIC10":
                breakdown.descontos.push({
                    codigo: "ETIC10",
                    descricao: "Cupom 10%",
                    valor: breakdown.subtotal * 0.10
                });
                break;

            case "FRETEGRATIS":
                breakdown.frete = 0;
                break;

            case "SEM-VIP":
                break;

            default:
                throw new Error("Cupom inválido.");
        }
    }

    _calcularImpostos(itens, baseImposto) {
        const impostos = {};

        const subtotalPorCategoria = {};

        for (const item of itens) {
            const produto = this.catalogo.getProduto(item.sku);
            const categoria = produto.categoria;

            if (!subtotalPorCategoria[categoria]) {
                subtotalPorCategoria[categoria] = 0;
            }

            subtotalPorCategoria[categoria] += item.getTotal();
        }

        const totalSubtotal = Object.values(subtotalPorCategoria).reduce((s, v) => s + v, 0);
        const fator = baseImposto / totalSubtotal;

        for (const categoria in subtotalPorCategoria) {
            const subtotalCat = subtotalPorCategoria[categoria] * fator;
            const iva = IVA_POR_CATEGORIA[categoria];
            impostos[categoria] = Number((subtotalCat * iva).toFixed(2));
        }

        return impostos;
    }
}

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteId
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()

class Pedido {
    constructor({ id, clienteId, itens, breakdown }) {
        if (!id) throw new Error("Pedido precisa de um id.");
        if (!clienteId) throw new Error("Pedido precisa de clienteId.");
        if (!Array.isArray(itens)) throw new Error("Itens inválidos.");
        if (!breakdown || typeof breakdown !== "object")
            throw new Error("Breakdown inválido.");

        this.id = id;
        this.clienteId = clienteId;
        this.itens = itens;
        this.breakdown = breakdown;

        this.status = "ABERTO"; 
        this.createdAt = new Date();
    }

    pagar() {
        if (this.status !== "ABERTO") {
            throw new Error(`Não é possível pagar um pedido com status '${this.status}'.`);
        }

        this.status = "PAGO";
    }

    cancelar() {
        if (this.status === "PAGO") {
            throw new Error("Não é possível cancelar um pedido já pago.");
        }

        if (this.status === "CANCELADO") {
            throw new Error("Pedido já está cancelado.");
        }

        this.status = "CANCELADO";
    }
}


// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)

class CaixaRegistradora {
    constructor({ catalogo, estoque, motorDePrecos }) {
        if (!catalogo) throw new Error("CaixaRegistradora precisa de um catálogo.");
        if (!estoque) throw new Error("CaixaRegistradora precisa de um estoque.");
        if (!motorDePrecos) throw new Error("CaixaRegistradora precisa de um motor de preços.");

        this.catalogo = catalogo;
        this.estoque = estoque;
        this.motorDePrecos = motorDePrecos;
    }

    fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
        if (!cliente) throw new Error("Cliente é obrigatório.");
        if (!carrinho) throw new Error("Carrinho é obrigatório.");

        const itens = carrinho.listarItens();

        for (const item of itens) {
            const produto = this.catalogo.getProduto(item.sku);

            if (numeroDeParcelas > produto.numeroMaximoParcelas) {
                throw new Error(
                    `Produto '${produto.nome}' permite no máximo ${produto.numeroMaximoParcelas} parcelas.`
                );
            }
        }

        const breakdown = this.motorDePrecos.calcular({
            cliente,
            itens,
            cupomCodigo
        });

        for (const item of itens) {
            this.estoque.remover(item.sku, item.quantidade);
        }

        const pedido = new Pedido({
            id: "PED-" + Date.now(),
            clienteId: cliente.id,
            itens,
            breakdown
        });

        pedido.resumoParcelas = this._gerarResumoParcelas(itens, numeroDeParcelas);

        return pedido;
    }

    _gerarResumoParcelas(itens, numeroDeParcelas) {
        const resumo = [];

        for (const item of itens) {
            const produto = this.catalogo.getProduto(item.sku);

            const valorParcela = produto.getValorDeParcela(numeroDeParcelas);

            resumo.push({
                sku: item.sku,
                nome: produto.nome,
                quantidade: item.quantidade,
                parcelas: numeroDeParcelas,
                valorParcela,
                totalParcelado: Number((valorParcela * numeroDeParcelas).toFixed(2))
            });
        }

        return resumo;
    }
}



// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, total
// - status do pedido
class CupomFiscal {
    constructor({ pedido, catalogo }) {
        if (!pedido) throw new Error("CupomFiscal precisa de um pedido.");
        if (!catalogo) throw new Error("CupomFiscal precisa de um catálogo.");

        this.pedido = pedido;
        this.catalogo = catalogo;
    }

    gerarLinhas() {
        const linhas = [];
        const { itens, breakdown, status } = this.pedido;

        linhas.push("====================================");
        linhas.push("              CUPOM FISCAL          ");
        linhas.push("====================================");
        linhas.push(`Pedido: ${this.pedido.id}`);
        linhas.push(`Cliente: ${this.pedido.clienteId}`);
        linhas.push(`Data: ${this.pedido.createdAt.toLocaleString()}`);
        linhas.push("------------------------------------");

        linhas.push("Itens:");

        for (const item of itens) {
            const produto = this.catalogo.getProduto(item.sku);

            linhas.push(
                `${item.sku} | ${produto.nome} | qtd: ${item.quantidade} | ` +
                `PU: ${item.precoUnitario.toFixed(2)}€ | ` +
                `Total: ${item.getTotal().toFixed(2)}€`
            );
        }

        linhas.push("------------------------------------");

        linhas.push(`Subtotal: ${breakdown.subtotal.toFixed(2)}€`);

        if (breakdown.descontos.length > 0) {
            linhas.push("Descontos:");
            for (const d of breakdown.descontos) {
                linhas.push(` - ${d.codigo}: -${d.valor.toFixed(2)}€ (${d.descricao})`);
            }
        } else {
            linhas.push("Descontos: Nenhum");
        }

        linhas.push(`Total Descontos: -${breakdown.totalDescontos.toFixed(2)}€`);
        linhas.push("------------------------------------");

        linhas.push("Impostos:");

        for (const categoria in breakdown.impostoPorCategoria) {
            const valor = breakdown.impostoPorCategoria[categoria];
            linhas.push(` - ${categoria}: ${valor.toFixed(2)}€`);
        }

        linhas.push(`Total Impostos: ${breakdown.totalImpostos.toFixed(2)}€`);
        linhas.push("------------------------------------");

        linhas.push(`Frete: ${breakdown.frete.toFixed(2)}€`);
        linhas.push(`TOTAL FINAL: ${breakdown.total.toFixed(2)}€`);
        linhas.push("------------------------------------");

        linhas.push(`Status: ${status}`);
        linhas.push("====================================");

        return linhas;
    }
}

class Impressora {
    imprimirLinhas(linhas) {
        for (const linha of linhas) {
            console.log(linha);
        }
    }
}

// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class RelatorioVendas {
    constructor({ catalogo }) {
        this.pedidosPagos = [];
        this.catalogo = catalogo; 
    }

    registrarPedido(pedido) {
        if (!pedido) throw new Error("Pedido inválido.");

        if (pedido.status !== "PAGO") {
            throw new Error("Só é possível registrar pedidos pagos.");
        }

        this.pedidosPagos.push(pedido);
    }

    totalArrecadado() {
        return this.pedidosPagos.reduce(
            (soma, pedido) => soma + pedido.breakdown.total,
            0
        );
    }

    totalImpostos() {
        return this.pedidosPagos.reduce(
            (soma, pedido) => soma + pedido.breakdown.totalImpostos,
            0
        );
    }

    totalDescontos() {
        return this.pedidosPagos.reduce(
            (soma, pedido) => soma + pedido.breakdown.totalDescontos,
            0
        );
    }

    rankingProdutosPorQuantidade(topN = 5) {
        const mapa = new Map(); 

        for (const pedido of this.pedidosPagos) {
            for (const item of pedido.itens) {
                const atual = mapa.get(item.sku) || 0;
                mapa.set(item.sku, atual + item.quantidade);
            }
        }

        const ranking = [...mapa.entries()]
            .sort((a, b) => b[1] - a[1]) 
            .slice(0, topN);

        return ranking.map(([sku, quantidade]) => ({ sku, quantidade }));
    }

    arrecadadoPorCategoria() {
        const mapa = new Map();

        for (const pedido of this.pedidosPagos) {
            for (const item of pedido.itens) {
                const produto = this.catalogo.getProduto(item.sku);
                const categoria = produto.categoria;

                const atual = mapa.get(categoria) || 0;
                mapa.set(categoria, atual + item.getTotal());
            }
        }

        const resultado = {};
        for (const [categoria, valor] of mapa.entries()) {
            resultado[categoria] = Number(valor.toFixed(2));
        }

        return resultado;
    }

}


// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
	const catalogo = new Catalogo();
	const estoque = new Estoque();

	const produtos = [
		{ sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
		{ sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
		{ sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 15 },
		{ sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
	];

	for (const p of produtos) {
		const produto = new Produto(p);
		catalogo.adicionarProduto(produto);
	}

	// Estoque inicial
	estoque.definirQuantidade("ARROZ", 50);
	estoque.definirQuantidade("FEIJAO", 50);
	estoque.definirQuantidade("OLEO", 50);
	estoque.definirQuantidade("CAMISETA", 20);
	estoque.definirQuantidade("CALCA", 10);
	estoque.definirQuantidade("MEIA", 30);
	estoque.definirQuantidade("MICRO", 5);
	estoque.definirQuantidade("LIQUID", 8);
	estoque.definirQuantidade("VASO", 10);
	estoque.definirQuantidade("CIMENTO", 100);

	return { catalogo, estoque };
}

// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
    const relatorio = new RelatorioVendas({ catalogo });
	const impressora = new Impressora();

	const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
	const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

	// Cenário A
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("CAMISETA", 2);
		carrinho.adicionarItem("MEIA", 1);
		carrinho.adicionarItem("CALCA", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteVip,
			carrinho,
			cupomCodigo: null,
			numeroDeParcelas: 3
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário B
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("MICRO", 1);
		carrinho.adicionarItem("VASO", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteRegular,
			carrinho,
			cupomCodigo: "ETIC10",
			numeroDeParcelas: 10
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário C (cupom inválido)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("ARROZ", 1);

		try {
			caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
		} catch (err) {
			console.log("(OK) Cupom inválido gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário D (estoque insuficiente)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		try {
			carrinho.adicionarItem("MICRO", 999);
		} catch (err) {
			console.log("(OK) Estoque insuficiente gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário E (relatório)
	{
		console.log("==============================");
		console.log("Relatório");
		console.log("==============================");
		console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
		console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
		console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
		console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
		console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
	}
}

runDemo();