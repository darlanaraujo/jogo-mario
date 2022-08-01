const mario = document.querySelector('#mario');
const pipe = document.querySelector('#pipe');
const pipe2 = document.querySelector('#pipe2');

const pulo = (event) => {
    if(event.key === ' ' || event.key === 'ArrowUp') {
        mario.classList.add('pulo');

        setTimeout(() => {
            mario.classList.remove('pulo');
        }, 500);
    }
};

document.addEventListener('keydown', pulo);

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
    }
}, 10);