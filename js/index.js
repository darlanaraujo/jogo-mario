// Elementos do jogo ======================================

// Paginas e botões
const btnStart = document.querySelector('#btnStart');
const btnRanking = document.querySelector('#btnRanking');
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

// ==================== FUNÇÕES QUE CONTROLAM O JOGO ====================
// ======================================================================

/** Função que valida o jogador
 * Essa função verifica se o jogador colocou pelo menos 3 caracteres na caixa de texto.
 * O botão que inicia o jogo, só é habilitado com essa condição.
 * Com a condição valida, ele pode acessar usando a tecla Enter ou o click do mouse.
 * A variável nomeJogador recebe o nome digitado na caixa de texto.
 * @param {*} param0 O parametro recebe o target que vem da caixa de texto e mostra o que foi digitado.
 */
const validaJogador = ({ target }) => {

    if (target.value.length > 2) {
        // Habilita o botão
        btnStart.removeAttribute('disabled')

        // Acesso pelo click do mouse. Chama a função que inicia o jogo.
        btnStart.addEventListener('click', start);

        // Acesso pelo enter do teclado
        window.addEventListener('keypress', ({ key }) => {
            if (key === 'Enter') {
                // Chama a função que inicia o jogo.
                start();
            }
        })

        // Pega o nome do jogador
        nomeJogador = target.value.trim().toUpperCase();

    } else {
        // Desabilita o botão
        btnStart.setAttribute('disabled', '');
    }
}; // Chamada da função;
inputJogador.addEventListener('input', validaJogador);

// Função que limpa a caixa de texto;
const limpaTexto = () => {
    inputJogador.value = '';
};


/** Função que inicia o movimento do jogo;
 * Essa função desabilita a tela de modal e oculta todos os seus elementos e remove a classe active da tela de inicio, para que ela não seja carregada quando as outras telas forem chamadas (ranking e game-over).
 * Depois da contagem de 5 segundos ela habilita os movimentos dos elementos na tela, inicia a contagem do tempo e habilita as ações do teclado para controle do Mario.
 */
const start = () => {
    // Oculta o modal e a tela escura;
    modal.classList.add('desabilitar');
    // Oculta a tela de inicio;
    modalStart.classList.remove('active');
    // Adiciona o nome do jogador na tela do jogo;
    txtJogador.innerHTML = nomeJogador;
    
    // Adiciona a contagem regressiva na tela com um loop de 1s para cada numero;
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

    // Chama a função que limpa o texto do input para a proxima partida;
    limpaTexto();

    // Para o som da abertura e habilita o som principal do jogo;
    stopSom('somAbertura');
    playSom('somPrincipal');

    // Função que retarta o inicio do jogo em 5s.
    setInterval(() => {
        divSleep.classList.remove('active'); // Oculta o contador regressivo;
        cenario.classList.add('start'); // Habilita os movimentos das nuvens, moedas e estrelas;
        
        time(); // Inicia a contagem do tempo.

        // Função que movimenta os elementos que vão ter niveis de velocidade diferentes a cada tempo determinado;
        moverElementos(imgPipe); // Movimenta o tupo;
        moverElementos(imgBullet, 1); // Movimenta a bala;
    }, 5000);

};

/** Loop que verifica se o jogador perdeu;
 * Essa função é o controle de toda ação do jogo. Ela é um loop que ocorre a cada 10ms verificando a condição e habilitando as funções e variáveis dentro dela.
 * Ela controla se algum elemento encostou no Mario fazendo com que o jogo acabe, chamando a tela de game-over;
 */
const loopDoJogo = setInterval(() => {

    // Variaveis que pegam a posição do elemento na tela
    const pipePosition = imgPipe.offsetLeft; // Pega a distancia da margin esquerda;
    const bulletPosition = imgBullet.offsetLeft; // Pega a distancia da margin esquerda;
    const marioAltura = imgMario.offsetHeight; // Pega a distancia da altura
    
    // Essa variável pega o movimento do Mario em relação ao bottom, depois retira o caractere px e converte o texto para numero;
    const marioPosition = +window.getComputedStyle(imgMario).bottom.replace('px', ''); // Posição em relação ao bottom da tela;


    /** Essa condição faz a verificação se o Mario está encostando nos elementos (tubo ou bala);
     * Se o left do tubo estiver entre 0 e 120 do canto esquerdo da tela e a altura do bottom do Mario for menor que 120 (altura do tubo) = Mario encostou no tubo.
     * Ou - Se o left da bala estiver entre 0 e 120 do canto esquerdo da tela e a altura do bottom do Mario for menor que 120 ou se a altura do Mario for maior que 70 (altura do tubo) = Mario encostou na bala.
     */
    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 120 || bulletPosition <= 120 && bulletPosition > 0 && marioAltura > 70 && marioPosition < 120) {
        stopSom('somPrincipal');
        // Pipe 1
        imgPipe.style.animation = 'none'; // Para a animação do tubo;
        imgPipe.style.left = `${pipePosition}px`; // Para o tupo na posição que bateu no Mario;

        // Bullet
        imgBullet.style.animation = 'none'; // Para a animação da bala;
        imgBullet.style.left = `${bulletPosition}px`; // Para o bala na posição que bateu no Mario;

        // Mario
        imgMario.style.animation = 'none'; // Para a animação do pulo, voo ou abaixar;
        imgMario.style.bottom = `${marioPosition}px` // Para o Mario na posição que bateu no elemento;

        // Muda a imagem e estilo;
        imgMario.src = 'images/game-over.png' // Imagem de quando o Mario bate em algo;
        imgMario.classList.add('game-over'); // Classe que diminui o tamanho da img;

        // Habilita o som
        playSom('somPerdeu');

        // Encerra o loop, pontuação e tempo do jogo;
        clearInterval(loopDoJogo); // Essa propria função;
        clearInterval(pegaElementos); // Loop que faz a contagem das moedas e estrelas
        clearInterval(this.loopTime); // Loop do tempo do jogo;
        clearInterval(this.loopElementos); // Loop que controla a velocidade do jogo;

        // Função que vai calcular os pontos do jogador;
        calculoPontuacao();

        // Salvando no BD
        bancoTemp(nomeJogador, moedasJogador, estrelasJogador, tempoJogador, pontuacaoJogador);

        // Mostra a tela de game over;
        modal.classList.remove('desabilitar'); // Habilita o modal e o fundo preto;
        modalGameOver.classList.add('active'); // Habilita a tela de game-over no modal;
    }
}, 10);

/** Função que reinicia a partida
 * Ela habilita o som da abertura e usa um metodo nativo para dar um reload no navegador.
 * Como são dois botões de baixo dela o evento de click é feito com um forEach.
 */
const reiniciar = () => {
    playSom('somAbertura');
    location.reload();
};
btnReiniciar.forEach((btn) => {
    btn.addEventListener('click', reiniciar);
});

/** Função que mostra o Ranking
 * Ela remove a tela de game-over do modal e chama a tela do ranking para o lugar.
 * Habilita o som dessa tela, e chama a função que constroe as tabelas com os dados armazenados no BD.
 */
const ranking = () => {
    modalGameOver.classList.remove('active'); // Remove a tela game-over;
    modalRanking.classList.add('active'); // Habilita a tela de ranking;
    
    playSom('somRanking'); // Habilita o som;

    tabelaRanking(); // Chama a função que monta a tabela na tela;
};
btnRanking.addEventListener('click', ranking);


// ==================== FUNÇÕES QUE CONTROLAM O MARIO ====================
// =======================================================================

/** Função que faz o Mario pular;
 * Essa função verifica a tecla usada pelo jogador, e compara se ela é a mesma que faz o Mario pular.
 * @param {*} event Parametro que vem do teclado mostrando a tecla pressionada;
 */
const pulo = (event) => {
    if (event.key === 'ArrowUp') {
        // Adiciona a classe que contem a animação que faz o Mario pular;
        imgMario.classList.add('pulo');

        // Habilita o som do pulo
        playSom('somPulo');

        // Metodo de tempo que após 500ms remove a classe com a animação do pulo;
        setTimeout(() => {
            imgMario.classList.remove('pulo');
        }, 500);
    }
};
document.addEventListener('keydown', pulo);

/** Função que faz o Mario voar;
 * Essa função verifica a tecla usada pelo jogador, e compara se ela é a mesma que faz o Mario voar.
 * @param {*} event Parametro que vem do teclado mostrando a tecla pressionada;
 */
const voar = (event) => {
    if (event.key === ' ') {
        imgMario.classList.add('voar'); // Adiciona a classe que contem a animação que faz o Mario pular;
        imgMario.src = 'images/mario-voando.png' // Muda a imagem do Mario

        // Habilita o som do voo;
        playSom('somVoar');

        // Metodo de tempo que após 1500ms remove a classe com a animação do voo e volta a imagem principal do Mario;
        setTimeout(() => {
            imgMario.classList.remove('voar');
            imgMario.src = 'images/mario.gif';
        }, 1500);
    }
};
document.addEventListener('keydown', voar);

/** Função que faz o Mario abaixar;
 * Essa função verifica a tecla usada pelo jogador, e compara se ela é a mesma que faz o Mario abaixar.
 * Essa função diferente das outras não retorna a imagem do Mario nem remove a classe da animação depois de alguns segundos. Ela só é invalidada quando o jogador deixa de pressionara a tecla Arrow Down que nesse momento habilita outra função (levantar).
 * @param {*} event Parametro que vem do teclado mostrando a tecla pressionada;
 */
const abaixar = (event) => {
    if (event.key === 'ArrowDown') {
        imgMario.classList.add('mario-agachado'); // Adiciona a classe que contem a animação que faz o Mario abaixar;
        imgMario.src = 'images/mario-agachado.png'; // Muda a imagem do Mario

        // Habilita o som
        playSom('somAgachado');
    }
}
document.addEventListener('keydown', abaixar);

/** Função que faz o Mario levantar;
 * Essa função complementa a função abaixar, pois ao soltar a tecla Arrow Down ela devolve a imagem principal do Mario e remove a classe que contem a animação que abaixa.
 * Isso foi necessário para que o jogador pudesse ficar o tempo necessário abaixado para desviar das balas que se movem em uma velocidade que muda com o tempo. 
 * @param {*} event Parametro que vem do teclado mostrando a tecla que deixou de ser pressionada;
 */
const levantar = (event) => {
    if (event.key === 'ArrowDown') {
        imgMario.src = 'images/mario.gif';
        imgMario.classList.remove('mario-agachado');
    }
}
document.addEventListener('keyup', levantar);


// ============= FUNÇÕES QUE CONTROLAM OS ELEMENTOS DA TELA =============
// ======================================================================

/** Função que conta o tempo do jogo;
 * Essa função contem um setInterval dentro dela que permite fazer um loop a cada 1000ms e a cada volta ele adiciona +1 na variavel do tempo do jogador e depois mostra esse tempo na tela;
 * Ela teve que ser feita assim para que pudesse chamar essa função apenas quando a função start for iniciada, caso contrário o tempo começaria a conta ao carregar a tela no navegador.
 * Foi preciso criar o elemento this.loopTime para que pudesse ser interrompido com o método clearInterval dentro da função de loop
 */
const time = () => {
    this.loopTime = setInterval(() => {
        // Variavel local que recebe o valor que está na tela;
        const tempoAtual = +txtTempo.innerHTML;

        // Para uma melhor consistencia do loop coloquei um setTimeout de 500ms pois sem ele algumas vezes o valor na tela pulava de 2 em 2.
        setTimeout(() => {
            tempoJogador = tempoAtual + 1; // Pega o tempo do jogador
            txtTempo.innerHTML = tempoJogador; // Mostra esse tempo na tela;
        }, 500);
    }, 1000);

}

/** Função que pega os elementos da tela (moedas e estrelas)
 * Essa função usa o setInterval para criar o loop a cada 250ms que fica verificando se o Mario encostou em algum elemento que conta pontos no jogo (moedas e estrelas).
 * Dentro da função é feito dois forEach, sendo uma para as moedas que tem 3 no jogo, e um forEach para as estrelas que tem 2 no jogo. Foi feito dessa forma para que pudessem passar em posições e/ou velocidades diferentes.
 */
const pegaElementos = setInterval(() => {
    // Essa variável pega o movimento do Mario em relação ao bottom, top, left e depois retira o caractere px e converte o texto para numero;
    const marioPosition = +window.getComputedStyle(imgMario).bottom.replace('px', ''); // Posição em relação ao bottom da tela;
    const marioPositionTop = +window.getComputedStyle(imgMario).top.replace('px', ''); // Posição em relação ao top da tela;

    // Condição que pega as moedas;
    imgMoedas.forEach((moeda, index) => {
        // Posição que a moeda está na tela;
        const moedaPosition = moeda.offsetLeft;

        // Se o left da moeda for menor ou igual a 150 (posição em que o Mario fica) e se o Mario estiver a uma altura maior ou igual a de 150 (altura em relação ao bottom da tela) = Ele pegoua moeda.
        if (moedaPosition <= 150 && marioPosition >= 150) {
            moedasJogador++; // adiciona +1 a variavel global;
            txtMoedas.innerHTML = moedasJogador; // Mostra a soma da variável na tela;

            // Habilita o som
            playSom('somMoeda');

            moeda.style.display = 'none'; // Remove a moeda da tela;

            // Depois de 50ms a imagem da moeda volta para a tela;
            setInterval(() => {
                moeda.style.display = 'block'; // mostra a moeda novamente depois de 50ms
            }, 50);
        }
    });

    // O mesmo proncipio da moeda vale para a estrela;
    imgEstrelas.forEach((estrela, index) => {
        const estrelaPositionTop = +window.getComputedStyle(imgEstrelas[index]).top.replace('px', ''); // Posição em relação ao top da tela;
        const estrelaPositionLeft = +window.getComputedStyle(imgEstrelas[index]).left.replace('px', ''); // Posição em relação ao left da tela;


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