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
        this.manufactur = manufacturer;
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

class itemCarrinho {
    constructor(id, quantidade, priceUnidade) {
        this.id = id;
        this.quantidade = quantidade;
        this.priceUnidade = priceUnidade;
    }

    getTotal() {
        return this.quantidade * this.priceUnidade;
    }
}

class Carrinho {
    constructor() {
        this.id = generateSKU("cart");
        this.items = [];
    }

    adicionarProduto(id, quantidade, priceUnidade) {
        const item = new itemCarrinho(id, quantidade, priceUnidade);
        this.items.push(item);
    }

    removerProduto(id) {
        this.items = this.items.filter(item => item.id !== id);
    }

    getTotal() {
        return this.items.reduce((soma, item) => soma + item.getTotal(), 0);
    }

    adicionarPorNome(nome, quantidade, catalogo) {
        const produto = [...catalogo.produtos.values()]
            .find(p => p.name.toLowerCase() === nome.toLowerCase());

        if (!produto) {
            console.log("Produto não encontrado no catálogo.");
            return;
        }

        this.adicionarProduto(produto.id, quantidade, produto.finalPrice);
        console.log(`Produto '${produto.name}' adicionado ao carrinho.`);
    }

    verCarrinho(catalogo) {
        if (this.items.length === 0) {
            console.log("O carrinho está vazio.");
            return;
        }

        console.log("\n--- Carrinho ---");

        this.items.forEach(item => {
            const produto = catalogo.getProduto(item.id);

            console.log(
                `${produto.name} | ${item.quantidade} unidades | ` +
                `${item.priceUnidade}€ cada | Total: ${item.getTotal()}€`
            );
        });

        console.log("----------------");
        console.log(`Total do carrinho: ${this.getTotal()}€\n`);
    }

    removerPorNome(nome, quantidade, catalogo) {
        const produto = [...catalogo.produtos.values()]
            .find(p => p.name.toLowerCase() === nome.toLowerCase());

        if (!produto) {
            console.log("Produto não encontrado no catálogo.");
            return;
        }

        const item = this.items.find(i => i.id === produto.id);

        if (!item) {
            console.log("Esse produto não está no carrinho.");
            return;
        }

        if (quantidade >= item.quantidade) {
            this.removerProduto(produto.id);
            console.log(`Produto '${produto.name}' removido do carrinho.`);
        } else {
            item.quantidade -= quantidade;
            console.log(
                `Foram removidas ${quantidade} unidades de '${produto.name}'.`
            );
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
            return;
        }

        this.produtos.set(produto.id, produto);
    }

    getProduto(sku) {
        return this.produtos.get(sku) || null;
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

    atualizarPreco(sku, novoPreco) {
        const produto = this.getProduto(sku);

        if (!produto) {
            throw new Error("Produto não encontrado.");
        }

        produto.price = novoPreco;
        produto.finalPrice = novoPreco * (1 + CATEGORIAS[produto.category].iva);
    }

    listarTodos() {
        return [...this.produtos.values()];
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

//menus
function addName(catalogo, stock) {
    rl.question("Insira o nome do Produto: ", name => {
        name = validText(name, () => addName(catalogo, stock));
        addPrice(name, catalogo, stock);
    });
}

function addPrice(name, catalogo, stock) {
    rl.question("Insira o preço: ", price => {
        price = validNumber(price, () => addPrice(name, catalogo, stock));
        addMaxParcelas(name, price, catalogo, stock);
    });
}

function addMaxParcelas(name, price, catalogo, stock) {
    rl.question("Insira o máximo de parcelas: ", mParcelas => {
        mParcelas = validNumber(mParcelas, () => addMaxParcelas(name, price, catalogo, stock));
        addManufactur(name, price, mParcelas, catalogo, stock);
    });
}

function addManufactur(name, price, mParcelas, catalogo, stock) {
    rl.question("Insira a categoria: ", categoria => {

        if (!CATEGORIAS[categoria]) {
            console.log("Categoria inválida.");
            return addManufactur(name, price, mParcelas, catalogo, stock);
        }

        rl.question("Insira o fabricante: ", manufactur => {

            const lista = CATEGORIAS[categoria].fabricantes;

            if (!lista.includes(manufactur)) {
                console.log("Fabricante não pertence a esta categoria.");
                console.log("Fabricantes válidos:", lista.join(", "));
                return addManufactur(name, price, mParcelas, catalogo, stock);
            }

            rl.question("Insira a quantidade em stock: ", quantidadeStr => {

                const quantidade = Number(quantidadeStr);

                if (isNaN(quantidade) || quantidade <= 0) {
                    console.log("Quantidade inválida. Deve ser um número maior que 0.");
                    return addManufactur(name, price, mParcelas, catalogo, stock);
                }

                console.log("Fabricante, categoria e quantidade válidos!");
                const id = generateSKU(CATEGORIAS[categoria]);
                const produto = new Product(
                    id,
                    name,
                    price,
                    mParcelas,
                    manufactur,
                    categoria
                );

                catalogo.adicionarProduto(produto);
                stock.adicionarProduto(produto.id, quantidade);

                console.log("Produto criado:");
                console.log(produto);
            });
        });
    });
}


function perguntarAdicionarCarrinho(carrinho, catalogo, rl) {
    rl.question("Nome do produto a adicionar: ", nome => {
        rl.question("Quantidade: ", quantidadeStr => {
            const quantidade = Number(quantidadeStr);

            if (isNaN(quantidade) || quantidade <= 0) {
                console.log("Quantidade inválida.");
                return perguntarAdicionarCarrinho(carrinho, catalogo, rl);
            }

            carrinho.adicionarPorNome(nome, quantidade, catalogo);
        });
    });
}

function perguntarRemoverCarrinho(carrinho, catalogo, rl) {
    rl.question("Nome do produto a remover: ", nome => {
        rl.question("Quantidade a remover: ", quantidadeStr => {
            const quantidade = Number(quantidadeStr);

            if (isNaN(quantidade) || quantidade <= 0) {
                console.log("Quantidade inválida.");
                return perguntarRemoverCarrinho(carrinho, catalogo, rl);
            }

            carrinho.removerPorNome(nome, quantidade, catalogo);
        });
    });
}

function perguntarVerCarrinho(carrinho, catalogo) {
    carrinho.verCarrinho(catalogo);
}


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