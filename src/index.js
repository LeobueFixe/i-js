//requisitos para usar o readline
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//VERIFICAÇÕES

function validNumber(valor, repetir) {
  const n = Number(valor);
  if (isNaN(n)) {
    console.log("Valor inválido.");
    return repetir();
  }
  return n;
}

//-----------------------------------------------------------------------------------------------//

//MENU

function menu() {
  console.log("\n MENU");
  console.log("1 - Par e Ímpar");
  console.log("2 - Ternários");
  console.log("3 - Múltiplos de 5");
  console.log("4 - Número random");
  console.log("0 - Sair");
}

function escolherOpcao() {
  rl.question("Escolha uma opção: ", option => {
    switch(option) {
      case "1":
        parImpar();
        break;
      case "2":
        ternarios();
        break;
      case "3":
        multiplos();
        break;
      case "4":
        randomsMultiplos();
        break;
      case "0":
        console.log("A sair...");
        rl.close();
        break;
      default:
        console.log("Opção inválida.");
        menu();
        escolherOpcao();
    }
  });
}

//-----------------------------------------------------------------------------------------------//

//ESCOLHAS

function parImpar() {
  rl.question("Insira um número: ", value => {
    value = validNumber(value, parImpar);
    if (value === undefined) return;

    let frase = "";

    if (value !== 15){
      frase += "Não é 15, ";
    } else {
      frase += "É 15, ";
    }

    frase += value >= 10 && value <= 20 ? "esta entre 10 e 20 " : "não esta entre 10 e 20 ";
    frase += value % 2 === 0 ? "e é par." : "e é ímpar.";

    console.log(frase);

    menu();
    escolherOpcao();
  });
}

function ternarios() {
  rl.question("O Bruno é um careca bacano? ", resp => {
    const resultado = resp.toLowerCase() === "sim" ? "Acertaste" : "Erraste";
    console.log(resultado);

    menu();
    escolherOpcao();
  });
}

function multiplos() {
  rl.question("Insira um número: ", value => {
    value = validNumber(value, multiplos);
    if (value === undefined) return;

    if (value === 5 || value === 10 || value === 15){
      console.log(value);
      console.log("Fechando programa.");
      rl.close();
      process.exit();
    }

    if (value % 5 === 0) {
      console.log("É múltiplo de 5.");
    } else {
      console.log("Não é múltiplo de 5.");
    }

    menu();
    escolherOpcao();
  });
}

function randomsMultiplos() {
  rl.question("Insira a quantidade de números que vão ser criados: ", max => {
    max = validNumber(max, randomsMultiplos);
    if (max === undefined) return;

    rl.question("Insira o número que vai ser o divisor: ", divisor => {
      divisor = validNumber(divisor, randomsMultiplos);
      if (divisor === undefined) return;

      const lista = [];

      function create_Integers(divisor) {
        return Math.floor(Math.random() * 100) * divisor;
      }

      for (let i = 0; i < max; i++) {
        lista.push(create_Integers(divisor));
      }

      console.log(lista);

      menu();
      escolherOpcao();
    });
  });
}

menu();
escolherOpcao();
