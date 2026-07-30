// ============================
// FIREBASE
// ============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



const firebaseConfig = {
    apiKey: "AIzaSyDPNidkCwPhMDPqxgLTvky_Dkm4tuhN-Tc",
    authDomain: "erp-de-casa.firebaseapp.com",
    databaseURL: "https://erp-de-casa-default-rtdb.firebaseio.com",
    projectId: "erp-de-casa",
    storageBucket: "erp-de-casa.firebasestorage.app",
    messagingSenderId: "118368372425",
    appId: "1:118368372425:web:4bba64ec90b5ef4a872f18"
};



const firebaseApp = initializeApp(firebaseConfig);


const db = getDatabase(firebaseApp);






// ============================
// DADOS
// ============================


let dados = {

    casa: [],

    comprar: []

};








// ============================
// LOGIN
// ============================


const senhaHash =
    "4d234c0f30182799521533321a16faa5b9a1135d9c2be79e5c15cf87e12bedac";





function gerarHash(texto) {
    return sha256(texto);
}






async function entrar() {

    try {

        const senha = document.getElementById("senha").value.trim();

        const hash = gerarHash(senha);

        if (hash !== senhaHash) {

            document.getElementById("erro").innerText = "Senha inválida";
            return;

        }

        document.getElementById("erro").innerText = "";

        document.getElementById("senha").value = "";

        document.getElementById("login").hidden = true;

        document.getElementById("app").hidden = false;

        await carregar();

    } catch (e) {

        console.error(e);

        document.getElementById("erro").innerText =
            "Erro ao conectar ao banco.";

    }

}









// ============================
// ABAS
// ============================


function abrir(aba) {


    document
        .querySelectorAll("section")
        .forEach(sec => {

            sec.hidden = true;

        });



    document
        .getElementById(aba)
        .hidden = false;


}









// ============================
// ADICIONAR
// ============================


async function addItem(tipo) {


    let quantidadeInput;

    let itemInput;




    if (tipo === "casa") {


        quantidadeInput =
            document.getElementById("quantidadeCasa");


        itemInput =
            document.getElementById("itemCasa");



    } else {



        quantidadeInput =
            document.getElementById("quantidadeComprar");


        itemInput =
            document.getElementById("itemComprar");


    }






    const quantidade =
        quantidadeInput.value.trim();



    const nome =
        itemInput.value.trim();






    if (!quantidade || !nome) {


        alert("Informe quantidade e item");

        return;

    }






    const categoria = tipo === "casa"
        ? document.getElementById("categoriaCasa").value
        : document.getElementById("categoriaComprar").value;

    dados[tipo].push({

        categoria,

        quantidade,

        nome,

        feito: false

    });






    quantidadeInput.value = "";

    itemInput.value = "";




    await salvar();


    render();


}









// ============================
// RENDER
// ============================


function render() {

    const listaCasa = document.getElementById("listaCasa");
    const listaComprar = document.getElementById("listaComprar");

    // ==========================
    // CASA
    // ==========================

    const categoriasCasa = {};

    dados.casa.forEach(item => {

        const categoria = item.categoria || "Sem categoria";

        if (!categoriasCasa[categoria]) {
            categoriasCasa[categoria] = [];
        }

        categoriasCasa[categoria].push(item);

    });

    let htmlCasa = "";

    Object.keys(categoriasCasa).sort().forEach(categoria => {

        htmlCasa += `
<details class="categoria">

    <summary>

    <div class="titulo-categoria">
        📂 ${categoria}
    </div>

    <span>
        ${categoriasCasa[categoria].length}
    </span>

</summary>

    <ul class="lista-categoria">
`;

        categoriasCasa[categoria].forEach(item => {

            const index = dados.casa.indexOf(item);

            htmlCasa += `

<li>

    <div class="linha-item">

        <span class="quantidade">
            ${item.quantidade}
        </span>

        <span class="nome-item">
            ${item.nome}
        </span>

        <button
            class="btn-remover"
            onclick="remover('casa', ${index})">

            🗑

        </button>

    </div>

</li>

`;

        });

        htmlCasa += `
    </ul>

</details>
`;

    });

    listaCasa.innerHTML = htmlCasa;

    // ==========================
    // COMPRAR
    // ==========================

    const categoriasComprar = {};

    dados.comprar.forEach(item => {

        const categoria = item.categoria || "Sem categoria";

        if (!categoriasComprar[categoria]) {
            categoriasComprar[categoria] = [];
        }

        categoriasComprar[categoria].push(item);

    });

    let htmlComprar = "";

    Object.keys(categoriasComprar).sort().forEach(categoria => {

        htmlComprar += `
<details class="categoria">

    <summary>

        🛒 ${categoria}

        <span>${categoriasComprar[categoria].length}</span>

    </summary>

    <ul class="lista-categoria">
`;

        categoriasComprar[categoria].forEach(item => {

            const index = dados.comprar.indexOf(item);

            htmlComprar += `

<li>

    <div class="linha-item">

        <span class="quantidade">
            ${item.quantidade}
        </span>

        <span class="nome-item ${item.feito ? "comprado" : ""}">
            ${item.nome}
        </span>

        <input
            class="check"
            type="checkbox"
            ${item.feito ? "checked" : ""}
            onchange="marcarCompra(${index})">

        <button
            class="btn-remover"
            onclick="remover('comprar', ${index})">

            🗑

        </button>

    </div>

</li>

`;

        });

        htmlComprar += `
    </ul>

</details>
`;

    });

    listaComprar.innerHTML = htmlComprar;

}









// ============================
// CHECK
// ============================


async function marcarCompra(index) {



    dados.comprar[index].feito =
        !dados.comprar[index].feito;




    await salvar();


    render();


}









// ============================
// REMOVER
// ============================


async function remover(tipo, index) {


    dados[tipo].splice(index, 1);



    await salvar();


    render();


}









// ============================
// FIREBASE SALVAR
// ============================


async function salvar() {


    await set(

        ref(
            db,
            "minhaCasa"
        ),

        dados

    );


}









// ============================
// FIREBASE CARREGAR
// ============================


async function carregar() {



    const snapshot =
        await get(

            ref(
                db,
                "minhaCasa"
            )

        );





    if (snapshot.exists()) {


        dados =
            snapshot.val();


    }






    if (!dados.casa)

        dados.casa = [];




    if (!dados.comprar)

        dados.comprar = [];


    dados.casa.forEach(item => {

        if (!item.categoria) {

            item.categoria = "Sem categoria";

        }

    });

    dados.comprar.forEach(item => {

        if (!item.categoria) {

            item.categoria = "Sem categoria";

        }

    });


    render();


}




function imprimir() {

    let html = `

    <html>

    <head>

        <title>Minha Casa</title>

        <style>

            body{

                font-family:Arial,sans-serif;

                margin:40px;

                color:#333;

            }

            h1{

                text-align:center;

                margin-bottom:30px;

            }

            h2{

                margin-top:35px;

                border-bottom:2px solid #555;

                padding-bottom:8px;

            }

            table{

                width:100%;

                border-collapse:collapse;

                margin-top:10px;

            }

            th{

                background:#667eea;

                color:white;

                padding:10px;

                text-align:left;

            }

            td{

                padding:10px;

                border-bottom:1px solid #ddd;

            }

            .check{

                width:20px;

                text-align:center;

            }

        </style>

    </head>

    <body>

        <h1>🏠 Minha Casa</h1>

        <h2>Tenho em casa</h2>

        <table>

            <tr>

                <th width="90">Qtd</th>

                <th>Item</th>

            </tr>

    `;

    dados.casa.forEach(item => {

        html += `

            <tr>

                <td>${item.quantidade}</td>

                <td>${item.nome}</td>

            </tr>

        `;

    });

    html += `

        </table>

        <h2>Preciso comprar</h2>

        <table>

            <tr>

                <th width="90">Qtd</th>

                <th>Item</th>

                <th width="70">✔</th>

            </tr>

    `;

    dados.comprar.forEach(item => {

        html += `

            <tr>

                <td>${item.quantidade}</td>

                <td>${item.nome}</td>

                <td class="check">${item.feito ? "☑" : "☐"}</td>

            </tr>

        `;

    });

    html += `

        </table>

    </body>

    </html>

    `;

    const janela = window.open("", "_blank");

    janela.document.write(html);

    janela.document.close();

    janela.focus();

    janela.print();

}


// ============================
// EXPOR PARA HTML
// ============================

window.entrar = entrar;
window.abrir = abrir;
window.addItem = addItem;
window.remover = remover;
window.marcarCompra = marcarCompra;


// botão de login (caso exista)
const btnEntrar = document.getElementById("btnEntrar");

if (btnEntrar) {

    btnEntrar.addEventListener(
        "click",
        entrar
    );

}

document.addEventListener("DOMContentLoaded", () => {


    document
        .getElementById("btnEntrar")
        ?.addEventListener(
            "click",
            entrar
        );



    document
        .getElementById("btnCasa")
        ?.addEventListener(
            "click",
            () => abrir("casa")
        );



    document
        .getElementById("btnComprar")
        ?.addEventListener(
            "click",
            () => abrir("comprar")
        );



    document
        .getElementById("btnAddCasa")
        ?.addEventListener(
            "click",
            () => addItem("casa")
        );



    document
        .getElementById("btnAddComprar")
        ?.addEventListener(
            "click",
            () => addItem("comprar")
        );

    document
        .getElementById("btnImprimir")
        ?.addEventListener(
            "click",
            imprimir
        );
});

