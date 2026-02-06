const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


//valida o texto
function normalizarTexto(txt) {
    return txt
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

//so texto
function validarTexto(txt) {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(txt);
}

//class e constructor
class Product {
    constructor(id, name, price, stock = 0, maxParcelas = 1, manufacturer, category) {
        this.id = id;
        this.name = normalizarTexto(name);
        this.price = price;
        this.stock = stock;
        this.maxParcelas = maxParcelas;
        this.manufacturer = normalizarTexto(manufacturer);
        this.category = normalizarTexto(category);
    }
    calcParcelas(parcelas) {
        if (isNaN(parcelas) || parcelas < 1) {
            return "Número de parcelas inválido.";
        }

        if (parcelas > this.maxParcelas) {
            return `Máximo permitido: ${this.maxParcelas} parcelas.`;
        }

        const valorParcela = this.price / parcelas;

        return `
    Produto: ${this.name}
    Preço total: ${this.price}€
    Parcelas: ${parcelas}x sem juros
    Valor de cada parcela: ${valorParcela.toFixed(2)}€
        `;
    }


    info() {
        return `
ID: ${this.id}
Nome: ${this.name}
Preço: ${this.price}€
Stock: ${this.stock}
Fabricante: ${this.manufacturer}
Categoria: ${this.category}
        `;
    }
}

//listas
const categoriasBase = [
    "Eletrónicos", "Roupas", "Livros", "Jogos", "Móveis",
    "Ferramentas", "Cozinha", "Brinquedos", "Desporto", "Beleza"
].map(normalizarTexto);

const fabricantesBase = [
    "Sony", "Samsung", "Apple", "Microsoft", "Lenovo",
    "Asus", "Nike", "Adidas", "Philips", "LG"
].map(normalizarTexto);

//items
const products = [
    new Product(1, "Televisão 4K", 799, 12, 12, "Samsung", "Eletrónicos"),
    new Product(2, "Portátil Gaming", 1299, 8, 10, "Asus", "Eletrónicos"),
    new Product(3, "Camisola Desportiva", 29, 50, 3, "Nike", "Roupas"),
    new Product(4, "Smartphone Pro", 999, 15, 12, "Apple", "Eletrónicos"),
    new Product(5, "Martelo Profissional", 19, 40, 2, "Philips", "Ferramentas"),
    new Product(6, "Livro Fantasia", 14, 100, 1, "LG", "Livros"),
    new Product(7, "Cadeira Escritório", 89, 20, 5, "Lenovo", "Móveis"),
    new Product(8, "Jogo Aventura", 59, 30, 4, "Microsoft", "Jogos"),
    new Product(9, "Frigideira Antiaderente", 24, 60, 3, "Philips", "Cozinha"),
    new Product(10, "Boneco Articulado", 15, 80, 2, "Sony", "Brinquedos")
];


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
            if (!validarTexto(name)) {
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
        fabricantesBase.forEach(f => console.log("- " + f));

        rl.question("Fabricante: ", manufacturer => {
            if (!validarTexto(manufacturer)) {
                console.log("Fabricante inválido.");
                return pedirManufacturer(id, name, price, stock, maxParcelas);
            }

            manufacturer = normalizarTexto(manufacturer);

            pedirCategory(id, name, price, stock, maxParcelas, manufacturer);
        });
    }

    function pedirCategory(id, name, price, stock, maxParcelas, manufacturer) {
        console.log("\nCategorias disponíveis:");
        categoriasBase.forEach(c => console.log("- " + c));

        rl.question("Categoria: ", category => {
            if (!validarTexto(category)) {
                console.log("Categoria inválida.");
                return pedirCategory(id, name, price, stock, maxParcelas, manufacturer);
            }

            category = normalizarTexto(category);

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
    menu();
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

            menu();
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

        menu();
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

        menu();
    });
}

function dividirParcelas() {
    rl.question("ID do produto: ", id => {
        const produto = products.find(p => p.id == id);

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



menu();
