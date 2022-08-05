// Elementos do jogo ======================================

// Paginas e botões
const btnStart = document.querySelector('#btnStart');
const btnRanking = document.querySelectorAll('#btnRanking');
const btnReiniciar = document.querySelectorAll('#btnReiniciar');
const modal = document.querySelector('#modal');
const modalStart = document.querySelector('#modalStart');
const modalGameOver = document.querySelector('#modalGameOver');
const modalRanking = document.querySelector('#modalRanking');
const cenario = document.querySelector('#cenario');

// Elementos que movimentam
const imgMario = document.querySelector('#imgMario');
const imgPipe = document.querySelector('#imgPipe');
const imgBullet = document.querySelector('#imgBullet')
const imgMoedas = document.querySelectorAll('#imgMoeda');
const imgEstrelas = document.querySelectorAll('#imgEstrela');

// Estrutura HTML
const divSleep = document.querySelector('#divSleep');
const txtSleep = document.querySelector('#txtSleep');
const tabelaHTML = document.querySelector('#tabelaRanking');

// Elementos de texto na tela =============================
const inputJogador = document.querySelector('#inputJogador');
const txtJogador = document.querySelector('#txtJogador');
const txtMoedas = document.querySelector('#txtMoedas');
const txtEstrelas = document.querySelector('#txtEstrelas');
const txtTempo = document.querySelector('#txtTempo');

// Variáveis globais
let nomeJogador;
let moedasJogador = 0;
let estrelasJogador = 0;
let tempoJogador = 0;
let pontuacaoJogador = 0;

// Função que cria um banco temporário que recebe o banco do LocalStorage, ele recebe os dados do jogador como parametro depois passa esses dados em um array para o banco na rede.
const bancoTemp = (nome, moedas, estrelas, tempo, pontuacao) => {
    let banco = getBanco();

    dados = { nomeJogador: nome, moedasJogador: moedas, estrelasJogador: estrelas, tempoJogador: tempo, pontuacaoJogador: pontuacao };

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
    txtJogador.innerHTML = nomeJogador;

    divSleep.classList.add('active');
    setInterval(() => {
        let cont = +txtSleep.innerHTML;
        if (cont >= 0) {
            setTimeout(() => {
                cont--;
                txtSleep.innerHTML = cont;
            }, 500);
        }
    }, 1000);


    limpaTexto();

    stopSom('somAbertura');
    playSom('somPrincipal');

    // Eventos
    document.addEventListener('keydown', pulo);
    document.addEventListener('keydown', abaixar);
    document.addEventListener('keyup', levantar);

    // Função que retarta o inicio do jogo em 3s.
    setInterval(() => {
        divSleep.classList.remove('active');
        cenario.classList.add('start');
        // Inicia a contagem do tempo.
        time();
        moverElementos(imgPipe);
        moverElementos(imgBullet, 1);
    }, 5000);

};

// Função que valida se o jogador preencheu o nome com pelo menos 3 caracteres;
const validaJogador = ({ target }) => {

    if (target.value.length > 2) {
        btnStart.removeAttribute('disabled')

        // Acesso pelo click do mouse
        btnStart.addEventListener('click', start);

        // Acesso pelo enter do teclado
        window.addEventListener('keypress', ({ key }) => {
            if (key === 'Enter') {
                start();
            }
        })

        // Pega o nome do jogador
        nomeJogador = target.value.trim().toUpperCase();

    } else {
        btnStart.setAttribute('disabled', '');
    }
};
inputJogador.addEventListener('input', validaJogador);

// Função que limpa a caixa de texto;
const limpaTexto = () => {
    inputJogador.value = '';
};

// Função que faz o Mario pular;
const pulo = (event) => {
    if (event.key === 'ArrowUp') {
        imgMario.classList.add('pulo');
        playSom('somPulo');

        setTimeout(() => {
            imgMario.classList.remove('pulo');
        }, 500);
    }
};

// Função que faz o Mario voar;
const voar = (event) => {
    if (event.key === ' ') {
        imgMario.classList.add('voar');
        imgMario.src = 'images/mario-voando.png'
        playSom('somVoar');

        setTimeout(() => {
            imgMario.classList.remove('voar');
            imgMario.src = 'images/mario.gif';
        }, 1500);
    }
};
document.addEventListener('keydown', voar);

// Função que faz o Mario abaixar;
const abaixar = (event) => {
    if (event.key === 'ArrowDown') {
        imgMario.src = 'images/mario-agachado.png';
        imgMario.classList.add('mario-agachado');
        playSom('somAgachado');
    }
}

// Função que faz o Mario levantar;
const levantar = (event) => {
    if (event.key === 'ArrowDown') {
        imgMario.src = 'images/mario.gif';
        imgMario.classList.remove('mario-agachado');
    }
}

// Loop que verifica se o jogador perdeu
const loop = setInterval(() => {

    const pipePosition = imgPipe.offsetLeft;
    const bulletPosition = imgBullet.offsetLeft;
    const marioPosition = +window.getComputedStyle(imgMario).bottom.replace('px', '');
    const marioAltura = imgMario.offsetHeight;

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 120 || bulletPosition <= 120 && bulletPosition > 0 && marioAltura > 70 && marioPosition < 120) {
        stopSom('somPrincipal');
        // Pipe 1
        imgPipe.style.animation = 'none';
        imgPipe.style.left = `${pipePosition}px`;

        // Bullet
        imgBullet.style.animation = 'none';
        imgBullet.style.left = `${bulletPosition}px`;

        // Mario
        imgMario.style.animation = 'none';
        imgMario.style.bottom = `${marioPosition}px`

        // Muda a imagem e estilo;
        imgMario.src = 'images/game-over.png'
        imgMario.classList.add('game-over');
        playSom('somPerdeu');

        // Encerra o loop, pontuação e tempo do jogo;
        clearInterval(loop);
        clearInterval(pegaMoedas);
        clearInterval(this.loopTime);
        clearInterval(this.loopElementos);

        // Função que vai calcular os pontos do jogador;
        calculoPontuacao();

        // Salvando no BD
        bancoTemp(nomeJogador, moedasJogador, estrelasJogador, tempoJogador, pontuacaoJogador);

        // Mostra a tela de game over;
        modal.classList.remove('desabilitar');
        modalGameOver.classList.add('active');
    }
}, 10);

// Função que reinicia a partida;
const reiniciar = () => {
    playSom('somAbertura');
    location.reload();
};
btnReiniciar.forEach((btn) => {
    btn.addEventListener('click', reiniciar);
});

// Função que mostra o Ranking
const ranking = () => {
    modalGameOver.classList.remove('active');
    modalRanking.classList.add('active');
    playSom('somRanking');

    tabelaRanking();
};
btnRanking.forEach((btn) => {
    btn.addEventListener('click', ranking);
});

// Função que conta o tempo do jogo;
const time = () => {
    this.loopTime = setInterval(() => {
        const tempoAtual = +txtTempo.innerHTML;
        setTimeout(() => {
            tempoJogador = tempoAtual + 1; // Pega o tempo do jogador
            txtTempo.innerHTML = tempoJogador;
        }, 500);
    }, 1000);

}

// Função que conta os pontos do jogador
const pegaMoedas = setInterval(() => {
    const marioPosition = +window.getComputedStyle(imgMario).bottom.replace('px', '');
    const marioPositionTop = +window.getComputedStyle(imgMario).top.replace('px', '');
    const marioPositionleft = +window.getComputedStyle(imgMario).left.replace('px', '');

    imgMoedas.forEach((moeda, index) => {
        const moedaPosition = moeda.offsetLeft;

        if (moedaPosition <= 150 && marioPosition >= 150) {
            moedasJogador++; // Pega as moedas do jogador;
            txtMoedas.innerHTML = moedasJogador;

            playSom('somMoeda');

            moeda.style.display = 'none'; // apaga a moeda

            setInterval(() => {
                moeda.style.display = 'block'; // mostra a moeda novamente depois de 50ms
            }, 50);
        }
    });

    imgEstrelas.forEach((estrela, index) => {
        const estrelaPositionTop = +window.getComputedStyle(imgEstrelas[index]).top.replace('px', '');
        const estrelaPositionLeft = +window.getComputedStyle(imgEstrelas[index]).left.replace('px', '');

        if (marioPositionTop <= estrelaPositionTop && estrelaPositionLeft <= 250 && estrelaPositionLeft >= 200) {
            estrelasJogador ++;
            txtEstrelas.innerHTML = estrelasJogador;

            playSom('somEstrela');

            estrela.style.display = 'none'; // apaga a estrela

            setInterval(() => {
                estrela.style.display = 'block'; // mostra a estrela novamente depois de 50ms
            }, 1050);
        }
    });

}, 250);

// Função que calcula a pontuação do jogador;
const calculoPontuacao = () => {
    pontuacaoJogador = (moedasJogador * 2) + (estrelasJogador * 5) + tempoJogador;
}

// Função que monta a tabela
const criarTabela = (posicao, nome, moedas, estrelas, tempo, pontuacao) => {
    const itemHTML = document.createElement('tr');
    itemHTML.classList.add('dados');

    itemHTML.innerHTML = `
        <td>${posicao}</td>
        <td>${nome}</td>
        <td>${moedas}</td>
        <td>${estrelas}</td>
        <td>${tempo}</td>
        <td>${pontuacao}</td>
    `
    tabelaHTML.appendChild(itemHTML);
};


const tabelaRanking = () => {
    // Variavel que recebe o banco depois de ser reorganizado na ordem crescente;
    const sorted = getBanco().sort(colocacao).reverse();

    sorted.forEach((item, index) => {
        let posicao = index + 1;
        let nome = item.nomeJogador;
        let moedas = item.moedasJogador;
        let estrela = item.estrelasJogador;
        let tempo = item.tempoJogador;
        let pontuacao = item.pontuacaoJogador;

        criarTabela(posicao, nome, moedas, estrela, tempo, pontuacao);

    });
}

// Função que organiza a colocação dos jogadores
const colocacao = (a, b) => {
    return a.pontuacaoJogador < b.pontuacaoJogador
        ? -1
        : a.pontuacaoJogador > b.pontuacaoJogador
            ? 1
            : 0;
}

// Função que toca o som do jogo
const playSom = (elemento) => {
    const audioContext = new AudioContext().resume();
    const element = document.querySelector(`#${elemento}`);
    // const source = audioContext.createMediaElementSource(element);
    // source.connect(audioContext.destination);
    element.play();
}

const stopSom = (elemento) => {
    const audioContext = new AudioContext();
    const element = document.querySelector(`#${elemento}`);
    // const source = audioContext.createMediaElementSource(element);
    // source.connect(audioContext.destination);
    element.pause();
}
playSom('somAbertura');

const moverElementos = (elemento, retardo = 0) => {
    this.loopElementos = setInterval(() => {
        const positionElemento = elemento.offsetLeft;
        if (tempoJogador <= 10) {
            elemento.style.animation = `move-animation 2.5s infinite linear ${retardo}s`;

        } else if (tempoJogador <= 20 && positionElemento <= 0) {
            elemento.style.rigth = '-90px';
            elemento.style.animation = `move-animation 2.0s infinite linear ${retardo}s`;
        } else if (tempoJogador > 20 && positionElemento <= 0) {
            elemento.style.rigth = '-90px';
            elemento.style.animation = `move-animation 1.5s infinite linear ${retardo}s`;
        }
    }, 100);


}