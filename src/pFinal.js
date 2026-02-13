const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function codeCategoria(cat) {
  return cat
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/)
    .replace(/\s+/g, "")
    .substring(0, 3)
    .toUpperCase();
}

function generateSKU(category) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (category === null) {
        return random;
    }
    if(category === "cart") {
        return `cart-${random}`;
    }
    
    const code = codeCategoria(category);
    return `${code}-${timestamp}-${random}`;
}

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

//class e constructor
class Stock {
    constructor() {
        this.itens = new Map();
    }

    adicionar(id, quantidade) {
        const atual = this.itens.get(id) || 0;
        this.itens.set(id, atual + quantidade);
    }

    remover(id, quantidade) {
        const atual = this.itens.get(id) || 0;
        if (quantidade > atual) throw new Error("Stock insuficiente");
        this.itens.set(id, atual - quantidade);
    }

    getQuantidade(id) {
        return this.itens.get(id) || 0;
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
        this.finalPrice = price * (1 + CATEGORIAS[category].iva);
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

}

class Carrinho {
    constructor() {
        this.id = generateSKU("cart");
        this.itens = [];
    }

    adicionarProduto(id) {
        this.itens.push(id);
    }

    removerProduto(id) {
        const index = this.itens.indexOf(id);
        if (index !== -1) {
            this.itens.splice(index, 1);
        }
    }
}

class Caixa {
    constructor(carrinho) {
        this.carrinho = carrinho;
    }

    fecharConta() {
        let total = this.carrinho.guardarPrice.reduce((a, b) => a + b, 0);

        let lista = "";
        this.carrinho.guardarID.forEach(id => {
            const produto = products.find(p => p.id === id);
            if (produto) {
                lista += `${produto.name} | ${produto.manufacturer} | ${produto.finalPrice}€\n`;
            }
        });

        return `
____________________________________________________________
=========================== TALÃO ===========================

Produtos:
${lista}
Total: ${total.toFixed(2)}€

============================================================
`;
    }
}

class MotorDePesquisa {
    constructor(catalogo) {
        this.catalogo = catalogo; 
    }

    porNome(texto) {
        const termo = texto.toLowerCase();
        return [...this.catalogo.values()].filter(p =>
            p.name.toLowerCase().includes(termo)
        );
    }

    porCategoria(categoria) {
        return [...this.catalogo.values()].filter(p =>
            p.category === categoria
        );
    }

    porFabricante(fabricante) {
        const termo = fabricante.toLowerCase();
        return [...this.catalogo.values()].filter(p =>
            p.manufacturer.toLowerCase().includes(termo)
        );
    }

    porPreco(min = 0, max = Infinity) {
        return [...this.catalogo.values()].filter(p =>
            p.price >= min && p.price <= max
        );
    }

    pesquisar(query) {
        const termo = query.toLowerCase();
        return [...this.catalogo.values()].filter(p =>
            p.name.toLowerCase().includes(termo) ||
            p.category.toLowerCase().includes(termo) ||
            p.manufacturer.toLowerCase().includes(termo)
        );
    }
}

class MotorDePrecos {
    constructor(catalogo) {
        this.catalogo = catalogo;

        this.cupons = {
            "ETIC10": { tipo: "percentual", valor: 0.10 },
            "FRETEGRATIS": { tipo: "frete", valor: 0 },
            "SEM-VIP": { tipo: "removerVIP" }
        };
    }

    calcular({ cliente, itens, cupomCodigo = null }) {
        let subtotal = 0;
        let totalIVA = 0;
        let descontos = 0;
        let frete = 5; 

        for (const item of itens) {
            const produto = this.catalogo.get(item.id);
            if (!produto) throw new Error("Produto não encontrado");

            let quantidade = item.quantidade;

            if (produto.category === "vestuario") {
                const grupos = Math.floor(quantidade / 3);
                const gratis = grupos; 
                quantidade -= gratis;

                descontos += gratis * produto.price;
            }

            const precoBase = produto.price * quantidade;
            const iva = precoBase * CATEGORIAS[produto.category].iva;

            subtotal += precoBase;
            totalIVA += iva;
        }

        let descontoVIP = 0;
        if (cliente.tipo === "VIP") {
            descontoVIP = subtotal * 0.05;
            descontos += descontoVIP;
        }

        if (cupomCodigo && this.cupons[cupomCodigo]) {
            const cupom = this.cupons[cupomCodigo];

            if (cupom.tipo === "percentual") {
                const valor = subtotal * cupom.valor;
                descontos += valor;
            }

            if (cupom.tipo === "frete") {
                frete = 0;
            }

            if (cupom.tipo === "removerVIP") {
                descontos -= descontoVIP; 
            }
        }

        if (subtotal >= 500) {
            descontos += 30;
        }

        const total = subtotal + totalIVA + frete - descontos;

        return {
            subtotal,
            totalIVA,
            frete,
            descontos,
            total,
            cupomAplicado: cupomCodigo,
            clienteTipo: cliente.tipo
        };
    }
}


//listas
const CATEGORIAS = {
    "eletrodoméstico": {
        iva: 0.23,
        fabricantes: ["Bosch", "Samsung", "LG", "Whirlpool", "Siemens", "Miele"]
    },

    "decoração": {
        iva: 0.23,
        fabricantes: ["IKEA", "Casa", "Zara Home", "H&M Home", "Kave Home", "Maisons du Monde"]
    },

    "materiais de construção": {
        iva: 0.23,
        fabricantes: ["Leroy Merlin", "Sika", "Weber", "Knauf", "Bosch Professional", "Makita"]
    },

    "vestuário": {
        iva: 0.23,
        fabricantes: ["Nike", "Adidas", "Zara", "H&M", "Pull&Bear", "Levi's"]
    },

    "alimentos": {
        iva: 0.06,
        fabricantes: ["Nestlé", "Danone", "Compal", "Milka", "Delta", "Matutano"]
    }
};

const carrinho = new Carrinho();

function adicionarProduto() {

    function pedirID() {
        rl.question("ID: ", id => {
            if (isNaN(id)) {
                console.log("ID inválido.");
                return pedirID();
            }
            pedirNome(Number(id));
        });
    }

    function pedirNome(id) {
        rl.question("Nome: ", name => {
            if (!validText(name)) {
                console.log("Nome inválido. Não pode conter números.");
                return pedirNome(id);
            }
            pedirPreco(id, name);
        });
    }

    function pedirPreco(id, name) {
        rl.question("Preço: ", price => {
            if (isNaN(price)) {
                console.log("Preço inválido.");
                return pedirPreco(id, name);
            }
            pedirStock(id, name, Number(price));
        });
    }

    function pedirStock(id, name, price) {
        rl.question("Stock: ", stock => {
            if (isNaN(stock)) {
                console.log("Stock inválido.");
                return pedirStock(id, name, price);
            }
            pedirMaxParcelas(id, name, price, Number(stock));
        });
    }

    function pedirMaxParcelas(id, name, price, stock) {
        rl.question("Max Parcelas: ", maxParcelas => {
            if (isNaN(maxParcelas)) {
                console.log("Max Parcelas inválido.");
                return pedirMaxParcelas(id, name, price, stock);
            }
            pedirManufacturer(id, name, price, stock, Number(maxParcelas));
        });
    }

    function pedirManufacturer(id, name, price, stock, maxParcelas) {
        console.log("\nFabricantes disponíveis:");
        products.forEach(f => console.log("- " + f));

        rl.question("Fabricante: ", manufacturer => {
            if (!validText(manufacturer)) {
                console.log("Fabricante inválido.");
                return pedirManufacturer(id, name, price, stock, maxParcelas);
            }

            manufacturer = normalizarTexto(manufacturer);

            pedirCategory(id, name, price, stock, maxParcelas, manufacturer);
        });
    }

    function pedirCategory(id, name, price, stock, maxParcelas, manufacturer) {
        console.log("\nCategorias disponíveis:");
        CATEGORIAS.forEach(c => console.log("- " + c));

        rl.question("Categoria: ", category => {
            if (CATEGORIAS.includes(category)) {

                const p = new Product(
                    id,
                    name,
                    price,
                    stock,
                    maxParcelas,
                    manufacturer,
                    category
                );

                products.push(p);
                console.log("Produto adicionado com sucesso!");
                menu();
            }
            
            return pedirCategory();

        });
    }

    pedirID();
}

function listarProdutos() {
    if (products.length === 0) {
        console.log("Nenhum produto cadastrado.");
    } else {
        products.forEach(p => console.log(p.info()));
    }
    adicionarAoCarrinho();
}

function pesquisarPreco() {
    rl.question("Preço mínimo: ", min => {
        rl.question("Preço máximo: ", max => {

            const minP = Number(min);
            const maxP = Number(max);

            if (isNaN(minP) || isNaN(maxP)) {
                console.log("Valores inválidos.");
                return pesquisarPreco();
            }

            const resultados = products.filter(p => p.price >= minP && p.price <= maxP);

            if (resultados.length === 0) console.log("Nenhum produto encontrado.");
            else resultados.forEach(p => console.log(p.info()));

            adicionarAoCarrinho();
        });
    });
}

function pesquisarCategoria() {
    const categorias = [...new Set(products.map(p => p.category))];

    console.log("\nCategorias disponíveis:");
    categorias.forEach(c => console.log("- " + c));

    rl.question("\nEscolha uma categoria: ", cat => {
        cat = normalizarTexto(cat);

        const resultados = products.filter(p => p.category === cat);

        if (resultados.length === 0) console.log("Nenhum produto encontrado.");
        else resultados.forEach(p => console.log(p.info()));

        adicionarAoCarrinho();
    });
}


function pesquisarFabricante() {
    const fabricantes = [...new Set(products.map(p => p.manufacturer))];

    console.log("\nFabricantes disponíveis:");
    fabricantes.forEach(f => console.log("- " + f));

    rl.question("\nEscolha um fabricante: ", fab => {
        fab = normalizarTexto(fab);

        const resultados = products.filter(p => p.manufacturer === fab);

        if (resultados.length === 0) console.log("Nenhum produto encontrado.");
        else resultados.forEach(p => console.log(p.info()));

        adicionarAoCarrinho();
    });
}

function dividirParcelas() {
    rl.question("ID ou nome do produto: ", value => {

        const produto = products.find(p =>
            p.id == value || p.name.toLowerCase() === value.toLowerCase()
        );

        if (!produto) {
            console.log("Produto não encontrado.");
            return dividirParcelas();
        }

        rl.question("Número de parcelas: ", parcelas => {

            if (isNaN(parcelas) || parcelas < 1 || parcelas > produto.maxParcelas) {
                console.log(`Número de parcelas inválido. Máximo: ${produto.maxParcelas}`);
                return dividirParcelas(); // repete só esta parte
            }

            console.log(produto.calcParcelas(Number(parcelas)));
            menu();
        });
    });
}

function adicionarAoCarrinho() {
    rl.question("Deseja adicionar algum produto ao carrinho (sim/nao): ", resp => {

        if (resp.toLowerCase() === "sim" || resp.toLowerCase() === "s") {

            rl.question("Insira o nome do produto ou o ID: ", value => {

                const produto = products.find(p =>
                    p.id == value || p.name.toLowerCase() === value.toLowerCase()
                );

                if (!produto) {
                    console.log("Produto não encontrado.");
                    return adicionarAoCarrinho();
                }

                carrinho.adicionarProduto(produto.id, produto.price);

                console.log("Produto adicionado com sucesso!");

                return adicionarAoCarrinho();
            });

        } else {
            menu();
        }
    });
}

function pagar() {
    const conta = new Caixa(carrinho);
    console.log(conta.fecharConta());
}

//menus
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
1 - Adicionar item
2 - Remover item
3 - Alterar item
4 - Ver recibos de compras
0 - Voltar
`);

    rl.question("Escolha: ", async opcao => {
        switch (opcao) {

            case "1": await adminAdicionarItem(); break;
            case "2": await adminRemoverItem(); break;
            case "3": await adminAlterarItem(); break;
            case "4": adminVerRecibos(); break;
            case "0": return menu();

            default:
                console.log("Opção inválida");
        }
        menuAdmin();
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
1 - Ver items
2 - Procurar por categoria
3 - Adicionar ao carrinho
4 - Remover do carrinho
5 - Ver carrinho
6 - Pagar
0 - Voltar
`);

    rl.question("Escolha: ", async opcao => {
        switch (opcao) {

            case "1": clientVerItems(); break;
            case "2": await clientProcurarCategoria(); break;
            case "3": await clientAdicionarCarrinho(cliente); break;
            case "4": await clientRemoverCarrinho(cliente); break;
            case "5": clientVerCarrinho(cliente); break;
            case "6": await clientPagar(cliente); break;
            case "0": return menu();

            default:
                console.log("Opção inválida");
        }
        menuClient(isVIP);
    });
}
