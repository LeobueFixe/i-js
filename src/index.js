const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Insira um número: ", (value) => {
  value = Number(value);

  if (value !== 15 && value > 10 && value < 20) {
    if (value % 2 === 0) {
      console.log("Está dentro dos parâmetros e é par.");
    } else {
      console.log("Está dentro dos parâmetros e é ímpar.");
    }
  } else if (value === 15) {
    console.log("O número é 15 e é ímpar.");
  } else if (value < 10 || value > 20) {
    console.log("O número está fora dos parâmetros.");
  }

  rl.close();
});
