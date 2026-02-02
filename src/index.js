const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function Menu() {
  console.log("\n MENU");
  console.log("1 - Par e Ímpar");
  console.log("2 - Ternários");
  console.log("3 - Múltiplos de 5");
  console.log("4 - Número random multiplo de 3")
  console.log("0 - Sair");
}

function EscolherOpcao() {
  rl.question("Escolha uma opção: ", option => {
    switch(option) {
      case "1":
        ParImpar();
        break;
      case "2":
        Ternarios();
        break;
      case "3":
        Multiplos();
        break;
      case "4":
        Randoms_Multiplos();
        break;
      case "0":
        console.log("A sair...");
        rl.close();
        break;
      default:
        console.log("Opção inválida.");
        Menu();
        EscolherOpcao();
    }
  });
}

function ParImpar() {
  let frase = ""; 

  rl.question("Insira um número: ", value => {
    value = Number(value);

    if (value !== 15){
      frase += "Não é 15, ";
    } else {
      frase += "É 15, ";
    }

    if (value > 10 && value < 20) {
      frase += "está entre 10 e 20 ";
    } else {
      if (value < 0){
        frase += "é um número negativo ";
      } else {
        frase += "é positivo mas fora dos parâmetros ";
      }
    }

    if (value % 2 === 0) {
      frase += "e é par.";
    } else {
      frase += "e é ímpar.";
    }

    console.log(frase);

    Menu();
    EscolherOpcao();
  });
}

function Ternarios() {
  rl.question("O Bruno é um careca bacano? ", resp => {
    const resultado = resp.toLowerCase() === "sim" ? "Acertaste" : "Erraste";
    console.log(resultado);

    Menu();
    EscolherOpcao();
  });
}

function Multiplos() {
  rl.question("Insira um número: ", value => {
    value = Number(value);

    if (value === 5 || value === 10 || value === 15){
      console.log(value)
      console.log("Fechando programa.")
      rl.close();
      process.exit();
    }
    if (value % 5 === 0) {
      console.log("É múltiplo de 5.");
    } else {
      console.log("Não é múltiplo de 5.");
    }

    Menu();
    EscolherOpcao();
  });
}
function Randoms_Multiplos() {
  rl.question("Insira o maior número que pode aparecer: ", max => {
    const lista = [];

    function create_Integers(max) {
      return Math.floor(Math.random() * max) *3;  
    }
    
    for (let i = 0; i < 100; i++) {
      lista.push(create_Integers(max));
    }

    console.log(lista)

  } )
    
  Menu();
  EscolherOpcao();
}

Menu();
EscolherOpcao();
