//requisitos para usar o readline
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//VERIFICAÇÕES

//so números

function validNumber(valor, repetir) {
  const numero = Number(valor);
  if (isNaN(numero)) {
    console.log("Valor inválido.");
    return repetir();
  }
  return Math.round(numero);
}

//so texto

function validString(valor, repetir) {
  const texto = String(valor).trim();

  if (texto.length === 0) {
    return "";
  }

  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(texto)) {
    console.log("Apenas letras e espaços são permitidos."); 
    return repetir(); 
  }

  return texto;
}


//cargos

function validCargo(valor, repetir) {
  const texto = String(valor).trim().toLowerCase();

  const validos = ["alunos", "diretores", "professores", "funcionarios"];

  if (texto.length === 0) {
    console.log("Cargo inválido.");
    return repetir();
  }

  if (!validos.includes(texto)) {
    console.log("Cargo inválido. Os cargos permitidos são: alunos, diretores, professores, funcionarios.");
    return repetir();
  }

  return texto.toLowerCase();
}



//-----------------------------------------------------------------------------------------------//

//MENU

function menu() {
  console.log("\n MENU");
  console.log("1 - Par e Ímpar");
  console.log("2 - Ternários");
  console.log("3 - Múltiplos de 5");
  console.log("4 - Número random");
  console.log("5 - Escola");
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
      case "5":
        escola();
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

function escola(){

  const funcionarios = [
    { name: "Alberto", surname: "Agustim" },
    { name: "Joaquim", surname: "Pedro" },
    { name: "Carla", surname: "Mendes" },
    { name: "Rui", surname: "Figueira" },
    { name: "Helena", surname: "Costa" }
  ];

  const diretores = [
    { name: "Rosa", surname: "Peres" },
    { name: "Manuel", surname: "Gomes" }
  ];

  const professores = [
    { name: "Bruno", surname: "Alfredo", disciplina: "Português" },
    { name: "Sofia", surname: "Lopes", disciplina: "Matemática" },
    { name: "Tiago", surname: "Ferreira", disciplina: "Ciências" },
    { name: "Ana", surname: "Ribeiro", disciplina: "Física e Química" }
  ];

  const alunos = [
    {
      name: "Miguel",
      surname: "",
      disciplinas: ["Português", "Matemática", "Ciências", "Física e Química"],
      notas: [12, 15, 14, 10]
    },
    {
      name: "Érica",
      disciplinas: ["Português", "Matemática", "Ciências", "Física e Química"],
      notas: [20, 18, 19, 19] 
    },
    {
      name: "Carolina",
      surname: "Martins",
      disciplinas: ["Português", "Matemática", "Ciências", "Física e Química"],
      notas: [4, 12 ,9, 18] 
    },
    {
      name: "Diego",
      surname: "Silva",
      disciplinas: ["Português", "Matemática", "Ciências", "Física e Química"],
      notas: [14, 16, 18, 17]
    },
    {
      name: "Constança",
      surname: "Pires",
      disciplinas: ["Português", "Matemática", "Ciências", "Física e Química"],
      notas: [10, 10, 10, 10]
    }
  ];

  function calcularMedia(notas) {
    if (!notas || notas.length === 0) return 0;
    const soma = notas.reduce((a, b) => a + b, 0);
    return soma / notas.length;
  }

  alunos.forEach(aluno => {
    aluno.media = calcularMedia(aluno.notas);
  });

  
  function menuEscola() {
    console.log("\n MENU");
    console.log("1 - Adicionar");
    console.log("2 - Listar");
    console.log("3 - Editar");
    console.log("0 - Voltar");
  }

  function opcaoEscola() {
    rl.question("Escolha uma opção: ", option => {
      switch(option) {
        case "1":
          criar();
          break;
        case "2":
          listar();
          break;
        case "3":
          editar();
          break;
        case "0":
          menu();
          escolherOpcao();
          break;
        default:
          console.log("Opção inválida.");
          menuEscola();
          opcaoEscola();
      }
    });
  }

  //---------------------------------------------------------------------------------------------------------------//
  //CRIAR ALUNO 

  function pNome() {
    rl.question("Insira o Nome: ", name => {
      name = validString(name, pNome);
      pSobrenome(name);
    });
  }

  function pSobrenome(name) {
    rl.question("Insira o Sobrenome: ", surname => {
      surname = validString(surname, () => pSobrenome(name));
      pCargo(name, surname);
    });
  }

  function pCargo(name, surname) {
    rl.question("Insira o Cargo: ", cargo => {
      cargo = validCargo(cargo, () => pCargo(name, surname));
      comCargo(name, surname, cargo);
    });
  }

  function comCargo(name, surname, cargo) {
    switch (cargo) {

      case "alunos":
        cAluno(name, surname);
        break;

      case "professores":
      case "diretores":
      case "funcionarios":
        console.log("Registado.");
        menuEscola();
        opcaoEscola();
        break;
    }
  }

  function cAluno(name, surname) {
    const disciplinas = ["Português", "Matemática", "Ciências", "Física e Química"];
    const notas = [];
    let contador = 0;

    function calcularMedia(notas) {
      const soma = notas.reduce((a, b) => a + b, 0);
      return soma / notas.length;
    }

    function addNotas() {
      if (contador >= disciplinas.length) {

        const aluno = {
          name,
          surname,
          disciplinas,
          notas,
          media: calcularMedia(notas)
        };

        alunos.push(aluno);
        console.log("Média:", aluno.media.toFixed(2));

        console.log("Aluno registado com sucesso!");

        menuEscola();
        opcaoEscola();
        return;
      }

      rl.question(`Insira a nota de ${disciplinas[contador]}: `, valor => {
        const nota = validNumber(valor, addNotas);
        if (nota === undefined) return;

        notas.push(nota);
        contador++;
        addNotas();
      });
    }

    addNotas();
  }

  function criar() {
    pNome()
  }

  //---------------------------------------------------------------------------------------------------------------//
  //LISTAR 

  function listar() {
    rl.question("Que cargo deseja listar (alunos, professores, diretores, funcionarios): ", valor => {
      const cargo = validCargo(valor, listar);

      console.log("\n====================================");

      switch (cargo) {

        case "alunos":
          console.log("           LISTA DE ALUNOS");
          console.log("====================================");

          alunos.forEach((aluno, i) => {
            const nome = aluno.name || "(sem nome)";
            const sobrenome = aluno.surname || "";
            const media = aluno.media?.toFixed(2) || "N/A";

            console.log(`\n${i + 1}. Nome: ${nome}`);
            console.log(`   Sobrenome: ${sobrenome}`);
            console.log(`   Cargo: Aluno`);
            console.log("   Disciplinas e Notas:");

            aluno.disciplinas.forEach((disc, idx) => {
              const nota = aluno.notas[idx] ?? "—";
              console.log(`     • ${disc.padEnd(18)} → ${nota}`);
            });

            console.log(`   Média: ${media}`);
            console.log("------------------------------------");
          });
          break;

        case "professores":
          console.log("        LISTA DE PROFESSORES");
          console.log("====================================");

          professores.forEach((p, i) => {
            console.log(`\n${i + 1}. Nome: ${p.name}`);
            console.log(`   Sobrenome: ${p.surname}`);
            console.log(`   Cargo: Professor`);
            console.log(`   Disciplina: ${p.disciplina}`);
            console.log("------------------------------------");
          });
          break;

        case "diretores":
          console.log("         LISTA DE DIRETORES");
          console.log("====================================");

          diretores.forEach((d, i) => {
            console.log(`\n${i + 1}. Nome: ${d.name}`);
            console.log(`   Sobrenome: ${d.surname}`);
            console.log(`   Cargo: Diretor`);
            console.log("------------------------------------");
          });
          break;

        case "funcionarios":
          console.log("       LISTA DE FUNCIONÁRIOS");
          console.log("====================================");

          funcionarios.forEach((f, i) => {
            console.log(`\n${i + 1}. Nome: ${f.name}`);
            console.log(`   Sobrenome: ${f.surname}`);
            console.log(`   Cargo: Funcionário`);
            console.log("------------------------------------");
          });
          break;
      }

      console.log("====================================\n");

      menuEscola();
      opcaoEscola();
    });
  }

  function listarTodos() {
    console.log("\n====================================");
    console.log("        LISTA COMPLETA DA ESCOLA");
    console.log("====================================\n");

    // ALUNOS
    console.log("-------------- ALUNOS --------------");

    alunos.forEach((aluno, i) => {
      const nome = aluno.name || "(sem nome)";
      const sobrenome = aluno.surname || "";

      console.log(`\n${i + 1}. Nome: ${nome}`);
      console.log(`   Sobrenome: ${sobrenome}`);
      console.log(`   Cargo: Aluno`);
    });

    // PROF
    console.log("\n----------- PROFESSORES ------------");

    professores.forEach((p, i) => {
      console.log(`\n${i + 1}. Nome: ${p.name}`);
      console.log(`   Sobrenome: ${p.surname}`);
      console.log(`   Cargo: Professor`);
      console.log("------------------------------------");
    });

    // DIRETORES
    console.log("\n------------ DIRETORES -------------");

    diretores.forEach((d, i) => {
      console.log(`\n${i + 1}. Nome: ${d.name}`);
      console.log(`   Sobrenome: ${d.surname}`);
      console.log(`   Cargo: Diretor`);
      console.log("------------------------------------");
    });

    // FUNCIONARIOS
    console.log("\n----------- FUNCIONÁRIOS -----------");

    funcionarios.forEach((f, i) => {
      console.log(`\n${i + 1}. Nome: ${f.name}`);
      console.log(`   Sobrenome: ${f.surname}`);
      console.log(`   Cargo: Funcionário`);
      console.log("------------------------------------");
    });

    console.log("\n====================================\n");
  }



  //---------------------------------------------------------------------------------------------------------------//
  //EDITAR
  function editar() {
    listarTodos();
    rl.question("Insira o nome: ", name => {
      name = validString(name, editar);

      rl.question("Insira o sobrenome: ", surname => {
        surname = validString(surname, () => editar());

        procurar(name, surname);
      })
    })
  }

  //PROCURAR, so precisa do nome e sobrenome
  function procurar(name, surname) {
    const cargos = [
      { tipo: "aluno", lista: alunos },
      { tipo: "professor", lista: professores },
      { tipo: "diretor", lista: diretores },
      { tipo: "funcionario", lista: funcionarios }
    ];

    for (const cargo of cargos) {
      const index = cargo.lista.findIndex(p =>
        p.name.toLowerCase() === name.toLowerCase() &&
        (p.surname || "").toLowerCase() === surname.toLowerCase()
      );

      if (index !== -1) {
        return ePessoa(cargo.tipo, cargo.lista, index);
      }
    }

    console.log("Pessoa não encontrada.");
    menuEscola();
    opcaoEscola();
  }

  //EDITAR, edita name, surname
  function ePessoa(tipo, lista, index) {
    const pessoa = lista[index];

    console.log("\n===== Dados atuais =====");
    console.log(`Nome: ${pessoa.name}`);
    console.log(`Sobrenome: ${pessoa.surname || ""}`);
    console.log(`Cargo: ${tipo}`);

    if (tipo === "aluno") {
      console.log("Disciplinas:");
      pessoa.disciplinas.forEach((d, i) => console.log(`  ${i + 1}. ${d}`));
      console.log("Notas:");
      pessoa.notas.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
      console.log(`Média: ${pessoa.media.toFixed(2)}`);
    }

    console.log("========================\n");

    eCampos(tipo, lista, index);
  }

  function eCampos(tipo, lista, index) {
    const pessoa = lista[index];

    rl.question(`Novo nome (${pessoa.name}): `, novoNome => {
      if (novoNome.trim() !== "") pessoa.name = novoNome;

      rl.question(`Novo surname (${pessoa.surname || ""}): `, novoSurname => {
        if (novoSurname.trim() !== "") pessoa.surname = novoSurname;

        if (tipo === "aluno") {
          eNotas(pessoa);
        } else {
          console.log("Alterações guardadas.");
          menuEscola();
          opcaoEscola();
        }
      });
    });
  }

  function eNotas(aluno) {
    let i = 0;

    function editarNota() {
      if (i >= aluno.disciplinas.length) {
        aluno.media = calcularMedia(aluno.notas);
        console.log("Notas atualizadas.");
        menuEscola();
        opcaoEscola();
        return;
      }

      const disc = aluno.disciplinas[i];
      const notaAtual = aluno.notas[i];

      rl.question(`Nova nota de ${disc} (${notaAtual}): `, valor => {
        if (valor.trim() !== "") {
          const nota = validNumber(valor, editarNota);
          if (nota !== undefined) aluno.notas[i] = nota;
        }

        i++;
        editarNota();
      });
    }

    editarNota();
  }

  menuEscola();
  opcaoEscola();

}

menu();
escolherOpcao();