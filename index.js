let countries = [];
let currentRound = 0;
let score = 0;
let timer;
let currentPlayer = '';
let leaderboard = {};

const gameArea = document.getElementById('game-area');
const gameOver = document.getElementById('game-over');
const countryName = document.getElementById('country-name');
const flagImg = document.getElementById('flag');
const options = document.getElementById('options');
const timeSpan = document.getElementById('time');
const currentScoreSpan = document.getElementById('current-score');
const currentRoundSpan = document.getElementById('current-round');
const finalScoreP = document.getElementById('final-score');
const messageP = document.getElementById('message');
const bestScoreP = document.getElementById('best-score');
const overallBestP = document.getElementById('overall-best');
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const playAgainButton = document.getElementById('play-again');
const showLeaderboardButton = document.getElementById('show-leaderboard');
const closeLeaderboardButton = document.getElementById('close-leaderboard');
const leaderboardDiv = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');
const progressBar = document.getElementById('progress-bar');

startGameButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);
showLeaderboardButton.addEventListener('click', showLeaderboard);
closeLeaderboardButton.addEventListener('click', () => {
    leaderboardDiv.style.display = 'none';
    showLeaderboardButton.style.display = 'block';
});

async function fetchCountries() {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        countries = response.data;
    } catch (error) {
        console.error('Error fetching country data:', error);
        alert('Failed to load data. Please check your internet connection.');
    }
}

function getRandomCountry() {
    return countries[Math.floor(Math.random() * countries.length)];
}

function getRandomCapitals(correctCapital) {
    const capitals = new Set([correctCapital]);
    while (capitals.size < 4) {
        const randomCountry = getRandomCountry();
        if (randomCountry.capital && randomCountry.capital[0]) {
            capitals.add(randomCountry.capital[0]);
        }
    }
    return Array.from(capitals);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startRound() {
    currentRound++;
    currentRoundSpan.textContent = currentRound;
    
    const country = getRandomCountry();
    countryName.textContent = country.name.common;
    flagImg.src = country.flags.png;
    
    const correctCapital = country.capital[0];
    const capitalOptions = getRandomCapitals(correctCapital);
    shuffleArray(capitalOptions);
    
    options.innerHTML = '';
    capitalOptions.forEach(capital => {
        const button = document.createElement('button');
        button.textContent = capital;
        button.addEventListener('click', () => checkAnswer(button, capital === correctCapital));
        options.appendChild(button);
    });
    
    startTimer();
}

function startTimer() {
    let timeLeft = 15;
    timeSpan.textContent = timeLeft;
    progressBar.style.width = '100%';
    
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timeSpan.textContent = timeLeft;
        progressBar.style.width = `${(timeLeft / 15) * 100}%`;
        
        if (timeLeft === 0) {
            clearInterval(timer);
            endRound(false);
        }
    }, 1000);
}

function checkAnswer(button, isCorrect) {
    clearInterval(timer);
    
    const buttons = options.getElementsByTagName('button');
    const correctButton = Array.from(buttons).find(btn => btn.textContent === getCorrectAnswer());
    
    for (let btn of buttons) {
        btn.disabled = true;
        if (btn === button) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (btn === correctButton) {
            btn.classList.add('correct');
        }
    }
    
    if (isCorrect) {
        score++;
        currentScoreSpan.textContent = score;
    }
    
    setTimeout(() => endRound(isCorrect), 2000);
}

function getCorrectAnswer() {
    const country = countries.find(c => c.name.common === countryName.textContent);
    return country.capital[0];
}

function endRound(isCorrect) {
    if (currentRound < 10) {
        startRound();
    } else {
        endGame();
    }
}
function endGame() {
    gameArea.style.display = 'none';
    gameOver.style.display = 'block';
    
    finalScoreP.textContent = `Your final score: ${score} out of 10`;
    
    if (score === 10) {
        messageP.textContent = "You're a geography genius!";
    } else if (score >= 7) {
        messageP.textContent = "Great job! You know your capitals well!";
    } else if (score >= 5) {
        messageP.textContent = "Good effort! Keep learning and you'll improve!";
    } else {
        messageP.textContent = "Don't give up! Every game is a chance to learn more!";
    }
    
    updateLeaderboard();
    displayBestScores();
}

function updateLeaderboard() {
    if (currentPlayer in leaderboard) {
        leaderboard[currentPlayer] = Math.max(leaderboard[currentPlayer], score);
    } else {
        leaderboard[currentPlayer] = score;
    }
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function displayBestScores() {
    const playerBestScore = leaderboard[currentPlayer];
    bestScoreP.textContent = `Your best score: ${playerBestScore}`;

    const overallBest = Object.entries(leaderboard).reduce((a, b) => a[1] > b[1] ? a : b);
    overallBestP.textContent = `Overall best: ${overallBest[0]} (${overallBest[1]} points)`;
}

function showLeaderboard() {
    leaderboardList.innerHTML = '';
    const sortedLeaderboard = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
    
    sortedLeaderboard.forEach(([name, score], index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td>${score}</td>
        `;
        leaderboardList.appendChild(row);
    });
    
    leaderboardDiv.style.display = 'block';
    showLeaderboardButton.style.display = 'none';
}

async function startGame() {
    currentPlayer = playerNameInput.value.trim();
    if (!currentPlayer) {
        alert('Please enter your name before starting the game.');
        return;
    }
    
    if (!countries.length) {
        await fetchCountries();
    }
    
    currentRound = 0;
    score = 0;
    currentScoreSpan.textContent = score;
    
    gameArea.style.display = 'block';
    gameOver.style.display = 'none';
    
    startRound();
}

const savedLeaderboard = localStorage.getItem('leaderboard');
if (savedLeaderboard) {
    leaderboard = JSON.parse(savedLeaderboard);
}
