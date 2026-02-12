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

    info() {
        return `${this.name} | ${this.manufacturer} | ${this.category} | ${this.stock} unidades | ${this.maxParcelas}x | ${this.finalPrice}€`;
    }

}

class SistemaLoja {
    constructor(estoque, carrinho) {
        this.estoque = estoque;
        this.carrinho = carrinho;
    }

    adicionarProduto(userType, sku, quantidade = 1) {
        if (userType === "admin") {
            this.estoque.adicionar(sku, quantidade);
        } else {
            this.carrinho.adicionarProduto(sku);
        }
    }

    removerProduto(userType, sku, quantidade = 1) {
        if (userType === "admin") {
            this.estoque.remover(sku, quantidade);
        } else {
            this.carrinho.removerProduto(sku);
        }
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

        if (total > 500) {
            total *= 0.9; // 10% desconto
        }

        // Construir lista de produtos
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


//menu
function menu() {
    console.log(`

Menu

1. Adicionar produto
2. Listar produtos
3. Pesquisar por preço (min/max)
4. Pesquisar por categoria
5. Pesquisar por fabricante
6. Pagar em parcelas
7. Pagar total
0. Sair
`);

    rl.question("Escolha uma opção: ", opcao => {
        switch (opcao) {
            case "1": adicionarProduto(); break;
            case "2": listarProdutos(); break;
            case "3": pesquisarPreco(); break;
            case "4": pesquisarCategoria(); break;
            case "5": pesquisarFabricante(); break;
            case "6": dividirParcelas(); break;
            case "7": pagar(); break;
            case "0": rl.close(); break;
            default:
                console.log("Opção inválida");
                menu();
        }
    });
}


//add produtos, as seguintes funções são responsaveis por pedir o valor de cada campo, tal como verificar se é valido
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
        .forEach(f => console.log("- " + f));

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

menu();
