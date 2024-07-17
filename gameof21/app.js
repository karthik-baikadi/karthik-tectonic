document.addEventListener('DOMContentLoaded', () => {
    const deckID = document.getElementById('Deck-ID');
    const displayZone = document.getElementById('Display-Zone');
    const playerForm = document.getElementById('playerForm');
    let noOfPlayers;
    const startButton = document.getElementById('Start-Button');
    
    let playerContainer = document.getElementById('Player-Container');
    const holdButton = document.getElementById('hold-button');
    const skipButton = document.getElementById('skip-button');
    startButton.hidden = true;
    holdButton.hidden = true;
    skipButton.hidden = true;
    let rollButtons = [];
    let currentPlayerIndex;
    let players = [];
    let allPlayers = [];
    
    //Listens to the form submit, hides the form, unhides the start button, and starts the game when its pressed
    playerForm.addEventListener('submit', function(event) {
        console.log('Enters event');
        event.preventDefault();
        noOfPlayers = document.getElementById('NumberofPlayers').value;
        playerForm.hidden = true;
        startButton.hidden = false;
        startButton.addEventListener('click', startGame);
     })

     //Creates required number of players, initiates them with two cards each, picks a random index to begin the gamePlay()
    async function startGame() {
        allPlayers = Array.from({ length: noOfPlayers }, (_, i) => i + 1);
        players = allPlayers.map(index => ({ id: index, score: 0, active: true }));
        playerContainer.innerHTML = '';
        for (let i=0; i<noOfPlayers; i++) {
            const player = document.createElement('div');
            player.classList.add('Player');
            player.id = `Player${i+1}`;

            player.innerHTML = `
                <div class="ScoreandRollContainer">
                    <div class="ScoreDisplay">
                        <p class="playerScore" id="P${i + 1}">0</p>
                    </div>
                    <div class="RollButton">
                        <button id="Player${i + 1}Roller"></button>
                    </div>
                </div>
                <div class="stackOfDrawnCards" id="P${i + 1}1"></div>
            `;
            playerContainer.appendChild(player);
            rollButtons.push(document.getElementById(`Player${i + 1}Roller`));
        } 

        deckID.textContent = await addNewDeck();
        deckID.hidden = true;

        rollButtons.forEach(button => button.hidden = true);
        rollButtons.forEach((button, index) => {
            button.addEventListener('click', () => displayCard(index));
        });

        for (let i = 0; i < noOfPlayers; i++) {
            for (let j = 0; j < 2; j++) {
                const card = await drawCard(deckID.textContent, 1);
                addCardToDeck(i + 1, card[0].image);
                updatePlayerScore(i + 1, card[0].value);
            }
        }

        currentPlayerIndex = Math.floor(Math.random()*noOfPlayers);
        gamePlay();
    }

    //Checks if chosen playerIndex is eligible to play, and if so, unhideCardRoll(currentPlayerIndex) unhides said players button to roll for a card
    function gamePlay() {
        while(!players[currentPlayerIndex].active) {
            currentPlayerIndex = (currentPlayerIndex + 1)%players.length;
        }
        unhideCardRoll(currentPlayerIndex);
    }

    function unhideCardRoll(currentPlayerIndex) {
        rollButtons[currentPlayerIndex].hidden = false;
    }

    let holdCardHandler = () => {};
    let skipCardHandler = () => {};

    //displays card, lets the player choose either to hold or skip it
    async function displayCard(currentPlayerIndex) {
        const card = await drawCard(deckID.textContent, 1);
        let cardIMG = document.createElement('img');
        cardIMG.src = card[0].image;
        cardIMG.setAttribute('id', 'Card-IMG');
        displayZone.appendChild(cardIMG);
        holdButton.hidden = false;
        skipButton.hidden = false;
        holdButton.removeEventListener('click', holdCardHandler);
        skipButton.removeEventListener('click', skipCardHandler);

        holdCardHandler = () => holdCard(currentPlayerIndex, card);
        skipCardHandler = () => skipCard(currentPlayerIndex);
        holdButton.addEventListener('click', holdCardHandler);
        skipButton.addEventListener('click', skipCardHandler);
    }

    /*if player chooses to hold the card, the card is added to players personal deck, and the players score is updated, checks for eliminations with 
    checkElimination() function, and returns to gamePlay() with an updated currentPlayerIndex if the game is not finished*/
    function holdCard(index, card) {
        rollButtons[index].hidden = true;
        addCardToDeck(index+1, card[0].image);
        updatePlayerScore(index+1, card[0].value);
        
        currentPlayerIndex = (currentPlayerIndex+1)%players.length;
        const cardImage1 = document.getElementById('Card-IMG');
        if (cardImage1) {cardImage1.remove();}
        checkEliminations();
        gamePlay();
    }

    /*if card is skipped by player, their 'active' property is set false rendering them unable to roll again, checks for eliminations, returns to
    gamePlay() if game is not finished*/
    function skipCard(index) {
        rollButtons[index].hidden = true;
        players[index].active = false;
        let skipText = document.createElement('p');
        skipText.textContent = "Skipped Out";
        let playerCont = document.getElementById(`Player${index+1}`);
        playerCont.appendChild(skipText);
        currentPlayerIndex = (currentPlayerIndex+1)%players.length;
        const cardImage1 = document.getElementById('Card-IMG');
        if (cardImage1) {cardImage1.remove();}
        checkEliminations();
        gamePlay();
    }

    //checks eliminations, announces victory.
    function checkEliminations() {
        let scoreArray = [];
        let noOfElimPlayers = 0;
        for (let i = 0; i < noOfPlayers; i++) {
            const playerScore = parseInt(document.getElementById(`P${i + 1}`).textContent, 10);
            if (playerScore > 21) {
                players[i].active = false;
                noOfElimPlayers++;
            } else if (playerScore === 21) {
                alert(`Player ${i + 1} wins!`);
                endGame();
                return;
            } else {
                scoreArray.push({ score: playerScore, index: i });
            }
        }
    
        for (let i = 0; i < players.length; i++) {
            if (!players[i].active) {
                for (let j = 0; j < scoreArray.length; j++) {
                    if (players[scoreArray[j].index].active && players[i].score < players[scoreArray[j].index].score) {
                        noOfElimPlayers++;
                    }
                }
            }
        }
    
        const activePlayers = players.filter(player => player.active);
        if (activePlayers.length === 1) {
            alert(`Player ${activePlayers[0].id} wins!`);
        }
    }

    //Ends game
    function endGame() {
        holdButton.hidden = true;
        skipButton.hidden = true;
        rollButtons.forEach(button => button.hidden = true);
        
        playerContainer.innerHTML += '<p>Game Over</p>';
    }

    function addCardToDeck(playerId, cardImage) {
        const playerDeck = document.getElementById(`P${playerId}1`);
        const imageToAdd = document.createElement('img');
        imageToAdd.src = cardImage;
        playerDeck.appendChild(imageToAdd);
    }

    function updatePlayerScore(playerId, cardValue) {
        const playerScore = document.getElementById(`P${playerId}`);
        let value = cardValue;
        if (["KING", "QUEEN", "JACK"].includes(value)) {
            value = 10;
        } 
        else if (value === "ACE") {
            value = 11;
        }
        else {
            value = +value;
        }

        let initialScore = +(playerScore.textContent);
        initialScore += value;
        playerScore.textContent = initialScore;

        players[playerId - 1].score = initialScore;

        if (initialScore > 21) {
            players[playerId - 1].active = false;
        }   
    }

    async function addNewDeck() {   
        const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const myDeck = await response.json();
        return myDeck.deck_id;
    }

    async function drawCard(deckId, numberOfCards) {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numberOfCards}`);
        const drawnCard = await response.json();
        return drawnCard.cards;
    }    
})