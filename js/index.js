// Elementos do jogo ======================================
const btnStart = document.querySelector('#btnStart');
const modal = document.querySelector('#modal');
const cenario = document.querySelector('#cenario');
const mario = document.querySelector('#mario');
const pipe = document.querySelector('#pipe');
const pipe2 = document.querySelector('#pipe2');
const moedas = document.querySelectorAll('#moeda');

// Elementos de texto na tela =============================
const inputJogador = document.querySelector('#inputJogador');
const txtJogador = document.querySelector('#txtJogador');
const txtPontos = document.querySelector('#txtPontos');
const txtTempo = document.querySelector('#txtTempo');

// Variáveis globais
let nomeJogador;
let pontuacaoJogador = 0;
let tempoJogador;
let teste = 'darlan';

const bancoTemp = (nome, pontuacao, tempo) => {
    dados = {nomeJogador: nome, pontuacaoJogador: pontuacao, tempoJogador: tempo};
    return JSON.stringify(dados);
}

// BD LocalStore
const setBanco = (banco) => {
    localStorage.setItem('bd-mario', banco);
}

// Funções ================================================

const start = () => {
    modal.classList.add('desabilitar');
    cenario.classList.add('start');
    
    nomeJogador = inputJogador.value.toUpperCase(); // Pego o nome do jogador;

    time(true);

    // Eventos
    document.addEventListener('keydown', pulo);
};

btnStart.addEventListener('click', start);

// Função que faz o Mario pular;
const pulo = (event) => {
    if(event.key === ' ' || event.key === 'ArrowUp') {
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

    if(pipePosition <= 120 && pipePosition > 0 && marioPosition <120 || pipePosition2 <= 120 && pipePosition2 > 0 && marioPosition <120) {
        // Pipe 1
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        // Pipe 2
        pipe2.style.animation = 'none';
        pipe2.style.left = `${pipePosition2}px`;

        // Mario
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`

        mario.src = 'images/game-over.png'
        mario.classList.add('game-over');

        // Encerra o loop;
        clearInterval(loop);
        clearInterval(pontuacao);

        time(false);
    }


}, 10);

// Função que conta o tempo do jogo;
const time = (status) => {
    setInterval(() => {
        const tempoAtual = +txtTempo.innerHTML;
        if(status) {
            txtTempo.innerHTML = tempoAtual +1;
        } else {
            tempoJogador = tempoAtual;
        }
    }, 1000);
}


const pontuacao = setInterval(() => {
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    
    moedas.forEach((moeda, index) => {
        const moedaPosition = moeda.offsetLeft;
        
        if (moedaPosition <= 150 && marioPosition >= 150) {
            console.log(`pegou a moeda no index ${index}`);
            pontuacaoJogador ++;
            txtPontos.innerHTML = pontuacaoJogador;
            
            moeda.style.display = 'none'; // apaga a moeda

            setInterval(() =>{
                moeda.style.display = 'block'; // mostra a moeda novamente depois de 50ms
            }, 50);

            
        }
    });

}, 250);
