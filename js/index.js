// Elementos do jogo ======================================
const btnStart = document.querySelector('#btnStart');
const btnRanking = document.querySelectorAll('#btnRanking');
const btnReiniciar = document.querySelectorAll('#btnReiniciar');
const modal = document.querySelector('#modal');
const modalStart = document.querySelector('#modalStart');
const modalGameOver = document.querySelector('#modalGameOver');
const modalRanking = document.querySelector('#modalRanking');
const cenario = document.querySelector('#cenario');
const mario = document.querySelector('#mario');
const pipe = document.querySelector('#pipe');
const pipe2 = document.querySelector('#pipe2');
const moedas = document.querySelectorAll('#moeda');
const tabelaHTML = document.querySelector('#tabelaRanking');

// Elementos de texto na tela =============================
const inputJogador = document.querySelector('#inputJogador');
const txtJogador = document.querySelector('#txtJogador');
const txtPontos = document.querySelector('#txtPontos');
const txtTempo = document.querySelector('#txtTempo');

// Variáveis globais
let nomeJogador;
let pontuacaoJogador = 0;
let tempoJogador = 0;

// Função que cria um banco temporário que recebe o banco do LocalStorage, ele recebe os dados do jogador como parametro depois passa esses dados em um array para o banco na rede.
const bancoTemp = (nome, pontuacao, tempo) => {
    let banco = getBanco();
    
    dados = { nomeJogador: nome, pontuacaoJogador: pontuacao, tempoJogador: tempo };

    banco.unshift(dados);

    setBanco(JSON.stringify(banco));
}

// BD LocalStore
const setBanco = (banco) => {
    localStorage.setItem('bd-mario', banco);
}

const getBanco = () => {
    return JSON.parse(localStorage.getItem('bd-mario')) ?? [];
}

// Funções ================================================

// Função que inicia o jogo;
const start = () => {
    modal.classList.add('desabilitar');
    modalStart.classList.remove('active');
    cenario.classList.add('start');
    txtJogador.innerHTML = nomeJogador;

    // Inicia a contagem do tempo.
    time();

    limpaTexto();

    // Eventos
    document.addEventListener('keydown', pulo);
};

// Função que valida se o jogador preencheu o nome com pelo menos 3 caracteres;
const validaJogador = ({ target }) => {

    if (target.value.length > 2) {
        btnStart.removeAttribute('disabled')

        // Acesso pelo click do mouse
        btnStart.addEventListener('click', start);
        
        // Acesso pelo enter do teclado
        window.addEventListener('keypress', ( {key} ) => {
            if(key === 'Enter') {
                start();
            }
        })

        nomeJogador =  target.value.trim().toUpperCase();
        
    } else {
        btnStart.setAttribute('disabled', '');
    }
};

inputJogador.addEventListener('input', validaJogador);

const limpaTexto = () => {
    inputJogador.value = '';
};

// Função que faz o Mario pular;
const pulo = (event) => {
    if (event.key === ' ' || event.key === 'ArrowUp') {
        mario.classList.add('pulo');

        setTimeout(() => {
            mario.classList.remove('pulo');
        }, 500);
    }
};

// Loop que verifica se o jogador perdeu
const loop = setInterval(() => {

    const pipePosition = pipe.offsetLeft;
    const pipePosition2 = pipe2.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 120 || pipePosition2 <= 120 && pipePosition2 > 0 && marioPosition < 120) {
        // Pipe 1
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        // Pipe 2
        pipe2.style.animation = 'none';
        pipe2.style.left = `${pipePosition2}px`;

        // Mario
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`

        // Muda a imagem e estilo;
        mario.src = 'images/game-over.png'
        mario.classList.add('game-over');

        // Encerra o loop, pontuação e tempo do jogo;
        clearInterval(loop);
        clearInterval(pontuacao);
        clearInterval(this.loopTime);

        // Salvando no BD
        bancoTemp(nomeJogador, pontuacaoJogador, tempoJogador);

        // Mostra a tela de game over;
        modal.classList.remove('desabilitar');
        modalGameOver.classList.add('active');
    }
}, 10);

// Função que reinicia a partida;
const reiniciar = () => {
    // modalStart.classList.add('active');
    // modalGameOver.classList.remove('active');
    location. reload();
};
btnReiniciar.forEach((btn) => {
    btn.addEventListener('click', reiniciar);
});

// Função que mostra o Ranking
const ranking = () => {
    modalGameOver.classList.remove('active');
    modalRanking.classList.add('active');
    
    tabelaRanking();
};
btnRanking.forEach((btn) => {
    btn.addEventListener('click', ranking);
});

// Função que conta o tempo do jogo;
const time = () => {
    this.loopTime = setInterval(() => {
        const tempoAtual = +txtTempo.innerHTML;
        tempoJogador = tempoAtual + 1;
        txtTempo.innerHTML = tempoJogador;
    }, 1000);

}

// Função que conta os pontos do jogador
const pontuacao = setInterval(() => {
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    moedas.forEach((moeda, index) => {
        const moedaPosition = moeda.offsetLeft;

        if (moedaPosition <= 150 && marioPosition >= 150) {
            console.log(`pegou a moeda no index ${index}`);
            pontuacaoJogador++;
            txtPontos.innerHTML = pontuacaoJogador;

            moeda.style.display = 'none'; // apaga a moeda

            setInterval(() => {
                moeda.style.display = 'block'; // mostra a moeda novamente depois de 50ms
            }, 50);
        }
    });

}, 250);


// Função que monta a tabela
const criarTabela = (posicao, nome, moedas, tempo, pontuacao) => {
    const itemHTML = document.createElement('tr');
    itemHTML.classList.add('dados');

    itemHTML.innerHTML = `
        <td>${posicao}</td>
        <td>${nome}</td>
        <td>${moedas}</td>
        <td>${tempo}</td>
        <td>${pontuacao}</td>
    `

    
    tabelaHTML.appendChild(itemHTML);
};


// const dados2 = getBanco();

const tabelaRanking = () => {
    getBanco().forEach((item, index) => {
        let posicao = index +1;
        let nome = item.nomeJogador;
        let moedas = item.pontuacaoJogador;
        let tempo = item.tempoJogador;
        let pontuacao = (item.pontuacaoJogador *2) + item.tempoJogador;

        criarTabela(posicao, nome, moedas, tempo, pontuacao);
        
    });
}
