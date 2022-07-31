const mario = document.querySelector('#mario');
const pipe = document.querySelector('#pipe');

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
    const marioPosition = window.getComputedStyle(mario).bottom;

    if()

    if(pipePosition <= 128) {
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
    }
}, 10);