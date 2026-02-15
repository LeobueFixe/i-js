const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function validText(valor, repetir) {
  let texto = String(valor).trim();

  const apenasTexto = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!apenasTexto.test(texto)) {
    console.log("Apenas letras e espaços são permitidos.");
    return repetir(); 
  }

  texto = texto.toLowerCase().replace(/\s+/g, " ").replace(/(?:^|\s)\S/g, c => c.toUpperCase());

  return texto;
}

function validNumber(valor, repetir) {
  const numero = Number(valor);
  if (isNaN(numero)) {
    console.log("Valor inválido.");
    return repetir();
  }
  return Math.round(numero);
}

function generateSKU(category) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (!category) {
        return random;
    }

    if (category === "cart") {
        return `CART-${random}`;
    }

    const code = MARCAS_POR_CATEGORIA[category];
    return `${code}-${timestamp}-${random}`;
}

//class e constructor
class Stock {
    constructor() {
        this.itens = new Map();
    }

    adicionarQuantidade(id, quantidade) {
        const atual = this.itens.get(id) || 0;
        this.itens.set(id, atual + quantidade);
    }

    removerQuantidade(id, quantidade) {
        const atual = this.itens.get(id) || 0;
        if (quantidade > atual) throw new Error("Stock insuficiente");
        this.itens.set(id, atual - quantidade);
    }

    getQuantidade(id) {
        return this.itens.get(id) || 0;
    }

    getDisponibilidade(id) {
        const atual = this.itens.get(id);

        if (!atual) {
            console.log("O stock está vazio ou não existe.");
        } else {
            console.log(`Ainda está disponível: ${atual} unidades.`);
        }
    }
    
}

class Product {
    constructor(name, price, maxParcelas, manufacturer, category) {
        this.id = generateSKU(category);
        this.name = name;
        this.price = price;
        this.maxParcelas = maxParcelas;
        this.manufacturer = manufacturer;
        this.category = category;
        this.finalPrice = price * (1+ IVA_POR_CATEGORIA[category]);
    }

    info(stock) {
        const quantidade = stock.getQuantidade(this.id);
        return `${this.name} | ${this.manufacturer} | ${this.category} | ${quantidade} unidades | ${this.maxParcelas}x | ${this.finalPrice}€`;
    }
}


class User {
    constructor(name, role, type, points) {
        this.id = generateSKU();
        this.name = name;
        this.role = role;
        this.type = type;
        this.points = points;
    }

    adicionarPontos(points, conta) {
        const eurosPorPonto = 10;
        const pontosGanhos = Math.floor(conta / eurosPorPonto);

        return points + pontosGanhos;
    }

    resgatarPontos(points, valorConta) {
        const pontosPorEuro = 20;

        const desconto = Math.floor(points / pontosPorEuro);
        const valorFinal = Math.max(0, valorConta - desconto);
        const pontosRestantes = points - (desconto * pontosPorEuro);

        return {
            valorFinal,
            pontosRestantes,
            desconto
        };
    }

}

class Carrinho {
    constructor() {
        this.id = generateSKU("cart");
        this.itens = [];
    }

    adicionarItem(id, quantidade, priceUnidade) {
        const existente = this.itens.find(item => item.id === id);

        if (existente) {
            existente.quantidade += quantidade;
        } else {
            this.itens.push({
                id,
                quantidade,
                priceUnidade
            });
        }
    }

    removerItem(id) {
        this.itens = this.itens.filter(item => item.id !== id);
    }

    getTotal() {
        return this.itens.reduce((soma, item) => soma + (item.quantidade * item.priceUnidade), 0);
    }

    verCarrinho(catalogo) {
        if (this.itens.length === 0) {
            console.log("O carrinho está vazio.");
            return;
        }

        console.log("\n--- Carrinho ---");

        this.itens.forEach(item => {
            const produto = catalogo.getProduto(item.id);

            console.log(
                `${produto.name} | ${item.quantidade} unidades | ` +
                `${item.priceUnidade}€ cada | Total: ${item.quantidade * item.priceUnidade}€`
            );
        });

        console.log("----------------");
        console.log(`Total do carrinho: ${this.getTotal()}€\n`);
    }

    alterarQuantidade(id, value) {
        const item = this.itens.find(i => i.id === id);

        const novaQuantidade = item.quantidade + value;

        if (novaQuantidade <= 0) {
            item.quantidade = 0; 
        } else {
            item.quantidade = novaQuantidade;
        }
    }

}

class Catalogo {
    constructor() {
        this.produtos = new Map();
    }

    adicionarProduto(produto) {
        if (!(produto instanceof Product)) {
            throw new Error("Só é possível adicionar instâncias de Product.");
        }

        if (this.produtos.has(produto.id)) {
            console.log("Produto já existe no catálogo.");
            return false;
        }

        this.produtos.set(produto.id, produto);
        return true;
    }

    getProduto(id) {
        return this.produtos.get(id) || null;
    }

    listarTodos() {
        return [...this.produtos.values()];
    }

    listarPorCategoria(categoria) {
        const lista = [];

        for (const produto of this.produtos.values()) {
            if (produto.category === categoria) {
                lista.push(produto);
            }
        }

        return lista;
    }

    atualizarProduto(id, novosDados) {
        const produto = this.getProduto(id);

        if (!produto) {
            console.log("Produto não encontrado.");
            return false;
        }

        if (novosDados.name) produto.name = novosDados.name;
        if (novosDados.price) {
            produto.price = novosDados.price;
            produto.finalPrice = novosDados.price * (1 + IVA_POR_CATEGORIA[produto.category]);
        }
        if (novosDados.manufactur) produto.manufactur = novosDados.manufactur;
        if (novosDados.category) produto.category = novosDados.category;

        return true;
    }

    atualizarPreco(id, novoPreco) {
        const produto = this.getProduto(id);

        if (!produto) {
            throw new Error("Produto não encontrado.");
        }

        produto.price = novoPreco;
        produto.finalPrice = novoPreco * (1 + IVA_POR_CATEGORIA[produto.category]);
    }

    removerProduto(id) {
        if (!this.produtos.has(id)) {
            console.log("Produto não encontrado.");
            return false;
        }

        this.produtos.delete(id);
        return true;
    }
}


class Caixa {
    constructor(carrinho, catalogo, stock) {
        this.carrinho = carrinho;
        this.catalogo = catalogo;
        this.stock = stock;
    }

    verificarStock() {
        for (const item of this.carrinho.itens) {
            const quantidadeStock = this.stock.getQuantidade(item.id);

            if (quantidadeStock < item.quantidade) {
                const produto = this.catalogo.getProduto(item.id);
                console.log(`Stock insuficiente para '${produto.name}'.`);
                console.log(`Disponível: ${quantidadeStock}, Necessário: ${item.quantidade}`);
                return false;
            }
        }
        return true;
    }

    descontarStock() {
        for (const item of this.carrinho.itens) {
            this.stock.remover(item.id, item.quantidade);
        }
    }

    gerarListaProdutos() {
        let texto = "";

        this.carrinho.itens.forEach(item => {
            const produto = this.catalogo.getProduto(item.id);
            const totalItem = item.quantidade * item.priceUnidade;

            texto += `${produto.name} | ${item.quantidade} unidades | ` +
                     `${item.priceUnidade}€ cada | Total: ${totalItem}€\n`;
        });

        return texto;
    }

    fecharConta() {
        if (this.carrinho.itens.length === 0) {
            return "O carrinho está vazio. Não é possível finalizar a compra.";
        }

        if (!this.verificarStock()) {
            return "Não foi possível finalizar a compra devido a falta de stock.";
        }

        const total = this.carrinho.getTotal();
        const lista = this.gerarListaProdutos();

        this.descontarStock();

        return `
------------------------------ TALÃO ------------------------------

${lista}
Total a pagar: ${total}€

-------------------------------------------------------------------
`;
    }
}

class MotorDePrecos {
    constructor(carrinho, catalogo, cliente, cupom = null) {
        this.carrinho = carrinho;
        this.catalogo = catalogo;
        this.cliente = cliente;
        this.cupom = cupom;
        this.freteBase = 10; 
    }

    calcular() {
        const breakdown = {
            subtotal: 0,
            descontos: [],
            totalDescontos: 0,
            impostoPorCategoria: {},
            totalImpostos: 0,
            frete: this.freteBase,
            total: 0
        };

        breakdown.subtotal = this.carrinho.getTotal();

        const descontoVestu = this.descontoVestuário();
        if (descontoVestu > 0) {
            breakdown.descontos.push({
                codigo: "L3P2",
                descricao: "Leve 3 pague 2 (vestuário)",
                valor: descontoVestu
            });
        }

        if (this.cliente.tipo === "VIP" && this.cupom !== "SEM-VIP") {
            const valor = breakdown.subtotal * 0.05;
            breakdown.descontos.push({
                codigo: "VIP",
                descricao: "Desconto cliente VIP",
                valor
            });
        }

        if (this.cupom) {
            this.aplicarCupom(breakdown);
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

        breakdown.impostoPorCategoria = this.calcularImpostosPorCategoria(baseImposto);
        breakdown.totalImpostos = Object.values(breakdown.impostoPorCategoria)
            .reduce((s, v) => s + v, 0);

        const frete = breakdown.frete;

        breakdown.total = baseImposto + breakdown.totalImpostos + frete;

        return breakdown;
    }

    descontoVestuário() {
        const itens = [];

        for (const item of this.carrinho.itens) {
            const produto = this.catalogo.getProduto(item.id);
            if (produto.category === "vestuário") {
                for (let i = 0; i < item.quantidade; i++) {
                    itens.push(produto.finalPrice);
                }
            }
        }

        if (itens.length < 3) return 0;

        itens.sort((a, b) => a - b);

        const grupos = Math.floor(itens.length / 3);
        let desconto = 0;

        for (let i = 0; i < grupos; i++) {
            desconto += itens[i * 3]; 
        }

        return desconto;
    }

    aplicarCupom(breakdown) {
        switch (this.cupom) {
            case "ETIC10":
                breakdown.descontos.push({
                    codigo: "ETIC10",
                    descricao: "Cupom de 10%",
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

}

class Loja {
    constructor(cliente) {
        this.catalogo = new Catalogo();
        this.stock = new Stock();
        this.carrinho = new Carrinho();
        this.caixa = new Caixa();   
        this.cliente = cliente;
    }

    fecharCompra(cupom = null) {
        const motor = new MotorDePrecos(
            this.carrinho,
            this.catalogo,
            this.cliente,
            cupom
        );

        const breakdown = motor.calcular();

        const talao = this.caixa.fecharCompra(
            this.carrinho,
            this.catalogo,
            breakdown
        );

        for (const item of this.carrinho.itens) {
            this.stock.removerQuantidade(item.id, item.quantidade);
        }

        this.cliente.adicionarCompra(talao);

        this.carrinho.limpar();

        return { breakdown, talao };
    }
}


//listas
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

const MARCAS_POR_CATEGORIA = {
    "eletrodoméstico": ["Bosch","Samsung","LG"],

    "decoração": ["IKEA","Zara Home","Maisons du Monde"],

    "materiais de construção": ["Leroy Merlin","Sika","Makita"],

    "vestuário": ["Nike","Adidas","Zara"],

    "alimentos": ["Nestlé","Compal","Delta"]
};


//menus
const loja = new Loja();

function menu() {
    console.log(`

        MENU
1-Admin
2-Client
3-VIP
4-DEMO
0-Sair
`);

    rl.question("Escolha uma opção: ", opcao => {
        switch (opcao) {
            case "1": menuAdmin(); break;
            case "2": menuClient(false); break;
            case "3": menuClient(true); break;
            case "4": DEMO(); break;
            case "0": rl.close(); break;
            default:
                console.log("Opção inválida");
                menu();
        }
    });
}

function menuAdmin() {
    console.log(`
=== ADMIN ===
1 - Adicionar item  //done
2 - Remover item
3 - Alterar item
4 - Ver recibos de compras
0 - Voltar
`);

    rl.question("Escolha: ", opcao => {
        switch (opcao) {

            case "1": 
                addName(); 
                break;
            case "2": 
                adminRemoverItem(); 
                break;
            case "3": 
                adminAlterarItem(); 
                break;
            case "4": 
                adminVerRecibos(); 
                break;
            case "0": 
                return menu();

            default:
                console.log("Opção inválida");
                menuAdmin();
        }
    });
}

function menuClient(isVIP) {
    const cliente = {
        id: 1,
        nome: isVIP ? "Cliente VIP" : "Cliente Normal",
        tipo: isVIP ? "VIP" : "REGULAR"
    };

    if (!loja.obterCarrinho(cliente.id)) {
        loja.criarCarrinho(cliente.id);
    }

    console.log(`
=== CLIENTE ${isVIP ? "(VIP)" : ""} ===
1 - Ver items   //done
2 - Procurar por categoria  //done
3 - Adicionar ao carrinho   //done
4 - Remover do carrinho
5 - Ver carrinho
6 - Pagar
0 - Voltar
`);

    rl.question("Escolha: ", async opcao => {
        switch (opcao) {

            case "1": catalogo.listarTodos(); break;
            case "2": await catalogo.listarPorCategoria(); break;
            case "3": await perguntarAdicionarCarrinho(carrinho, catalogo, rl); break;
            case "4": await perguntarRemoverCarrinho(carrinho, catalogo, rl); break;
            case "5": perguntarVerCarrinho(carrinho, catalogo); break;
            case "6": await clientPagar(cliente); break;
            case "0": return menu();
            default:
                console.log("Opção invalida!");
                return
        }
        menuClient(isVIP);
    });
}

menu();