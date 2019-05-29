const INITIAL_NUMBER_CARDS = 6;

// 
export class Dominoes {
    constructor() {
        this.openDeck = [];
        this.foldDeck = [];
        this.playersAmount = 1;
        this.players = [new Player("human")];
        this.gameStatus = "initialization";
        this.amountCardsToTake;
        this.userTurn;
        this.whoWon;
        this.stats;
        this.gameHistory;
        this.gameHistoryCurrState;
        this.renderFunc;
        this.currCard;
        this.matchCards = [];
    }

    initializeGame() {
        this.stats = new Stats();
        this.amountCardsToTake = 0;
        this.whoWon = false;
        this.gameHistory = [];

        this.createFoldDeck();
        this.shuffleFoldDeck();
        this.handOutCardsToPlayers();
        this.updateScore();
        this.chooseWhoStartTheGame();
        this.updateGameHistory();

        this.gameStatus = "started";
    }

    initializeDecks() {
        this.foldDeck = [];
        this.openDeck = [];
        this.players[0].cards = [];
        this.renderFunc();
    }

    createFoldDeck() {
        let top= [0,1,2,3,4,5,6];
        let buttom = [0,1,2,3,4,5,6];
        let counter = 0;
        let type = "regular"
        let left =false;
        let right = false;

        for (let i = 0; i < top.length; i++) {
            for (let j = 0; j < buttom.length; j++) {
                if(i<=j){
                    if(i===j){type = "duble"; left=true; right=true;}
                    this.foldDeck.push(new Card(top[i], buttom[j], type, counter++, true, true, left, right));
                    type = "regular";
                    left=false;
                    right= false;
                }        
            }
        }
    }

    shuffleFoldDeck() {
        let j, x, i;
        for (i = this.foldDeck.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = this.foldDeck[i];
            this.foldDeck[i] = this.foldDeck[j];
            this.foldDeck[j] = x;
        }
        return this.foldDeck;
    }

    handOutCardsToPlayers() {
        for (let i = 0; i < INITIAL_NUMBER_CARDS; i++) {
            for (let j = 0; j < this.players.length; j++) {
                this.takeCard(this.players[j]);
            }
        }
    }

    chooseWhoStartTheGame() {
        this.userTurn = true;
    }


    updateGameHistory() {
        let currState = new GameHistoryState(this);
        this.gameHistory.push(currState);
    }

    navigate(step) {
        this.gameHistoryCurrStateIndex += step;
        this.userTurn = this.gameHistory[this.gameHistoryCurrStateIndex].userTurn;
        this.foldDeck = this.gameHistory[this.gameHistoryCurrStateIndex].foldDeck;
        this.openDeck = this.gameHistory[this.gameHistoryCurrStateIndex].openDeck;
        this.players[0].cards = this.gameHistory[this.gameHistoryCurrStateIndex].player1Cards;
        this.stats = this.gameHistory[this.gameHistoryCurrStateIndex].stats;

        this.renderFunc();
    }

    playAgain() {
        this.initializeDecks();
        setTimeout((() => {
            this.initializeGame();
            this.renderFunc();
            if (!this.userTurn)
                this.gameManager();
        }).bind(this), 0);
    }

    endGame(winner) {
        clearInterval(this.stats.intervalGameTime);
        this.whoWon = winner;
        this.gameStatus = "ended";
        this.renderFunc();
    }

    surrender() {
        this.endGame(false);
    }

    foldDeckShowPopup() {
        var popup = document.getElementById("myPopupFoldDeck");
        popup.classList.add("show");
    }

    foldDeckHidePopup() {
        var popup = document.getElementById("myPopupFoldDeck");
        popup.classList.remove("show");
    }

    ////////////////////////
    // Game logic methods //
    ////////////////////////

    gameManager(chosenCardID) {
        if (this.userTurn === true) {
            if(chosenCardID){this.userTurns(chosenCardID);}
            this.renderFunc();
        }
    }

    userTurns(chosenCardID) {
        let chosenCard = this.getUserCardByElementID(chosenCardID);
        if (this.isValidStep(chosenCard)||this.openDeck.length == 0) {
            this.currCard = chosenCard;
            this.findMatch(this.currCard);
            this.renderFunc();
            if(this.openDeck.length ==0){
                this.useCard(this.players[0].cards, this.currCard, "UserCard", null);
                this.executeUserStep();
            }
        }
        else {
            this.warnIllegalUserStep(chosenCardID);
        }
    }

    executeUserStep() {
        
        this.increaseUserTurnsAmount();
        this.updateScore();
        this.modifyTurnIndicate(false);
        this.currCard = null;
        this.matchCards = [];

        if (this.players[0].cards.length == 0)
            this.endGame(true);
        else
            this.gameManager();
    
    }

    useCard(cards, chosenCard, owner, cardOnBoard) {
        let cardIndex = this.getArrayIndexOfCard(cards, chosenCard);
        if(this.openDeck.length !=0){
            this.matchUpdate(chosenCard, cardOnBoard);
        }
        this.openDeck.push(chosenCard);
        this.checkBoardSize();
        cards.splice(cardIndex, 1);
        this.updateGameHistory();
    }

    takeCard(player) {
        let cardToTake = this.foldDeck[this.foldDeck.length - 1];

        player.cards.push(cardToTake);
        this.removeCardFromFoldDeck(cardToTake);

        if (this.isfoldDeckEmpty()){
            this.endGame(false);
        }

        if (player.type === "human") {
            // end of human player turn
            this.increaseUserTurnsAmount();
            this.updatePulls();
            this.updateScore();
            this.modifyTurnIndicate(false);
            this.gameManager();
        }      
    }

    onMoveToNavigateMode() {
        this.gameStatus = "navigate";
        this.gameHistoryCurrStateIndex = this.gameHistory.length - 1;
        this.renderFunc();
    }

    modifyTurnIndicate(newTurnValue) {
        if (newTurnValue) // user turn
            this.stats.userLastTurnStartTime = new Date().getTime();
        else if (this.stats.userTurnsAmount > 0) {
            let currentTime = new Date().getTime();
            let timeSinceUserStartedStep = new Date(currentTime - this.stats.userLastTurnStartTime);
            this.stats.userTurnsTimeSum += timeSinceUserStartedStep.getTime();
        }
        this.userTurn = true;
    }

    removeCardFromFoldDeck(card) {
        this.foldDeck.pop();
    }
 
    getArrayIndexOfCard(cards, chosenCard) {
        return cards.indexOf(chosenCard);
    }

    isValidStep(card) {
        for (let i = 0; i < this.openDeck.length; i++) {
            if((card.top === this.openDeck[i].top && this.openDeck[i].isTopValid) || (card.buttom === this.openDeck[i].top && this.openDeck[i].isTopValid) 
            || (card.top === this.openDeck[i].buttom && this.openDeck[i].isButtomValid) || (card.buttom === this.openDeck[i].buttom && this.openDeck[i].isButtomValid)){
                return true;
            }
            
            if(this.openDeck[i].Type === "duble"){
                if((card.top === this.openDeck[i].top || card.buttom === this.openDeck[i].top)&& (this.openDeck[i].isMidLeftValid || this.openDeck[i].isMidRigthValid)){
                    return true;
                }
            }
        }     
        return false;
    }

    matchUpdate(card, cardOnBoard) {
        if(this.openDeck.length == 0){return true;}
        else{
            if(card.Type == "duble"){
                card.isUp = !cardOnBoard.isUp;
                if(cardOnBoard.isUp){
                    if(card.top==cardOnBoard.top){
                        card.row=cardOnBoard.row-1;
                        cardOnBoard.isTopValid=false;
                        card.isMidRigthValid=false;
                    }
                    else{
                        card.row=cardOnBoard.row+1;
                        cardOnBoard.isButtomValid=false;
                        card.isMidLeftValid=false;
                    }
                    card.col=cardOnBoard.col;
                }
                else{
                    if(card.top==cardOnBoard.top){
                        card.col=cardOnBoard.col+1;
                        cardOnBoard.isTopValid=false;
                        card.isMidLeftValid=false;
                    }
                    else{
                        card.col=cardOnBoard.col-1;
                        cardOnBoard.isButtomValid=false;
                        card.isMidRigthValid=false;
                    }
                    card.row=cardOnBoard.row;
                }
            }
            else{
                if(cardOnBoard.Type=="duble")
                {
                    if(cardOnBoard.isUp)//דאבל עומד
                    {
                        if(cardOnBoard.isTopValid){
                            card.isUp=cardOnBoard.isUp;
                            card.isButtomValid=false; cardOnBoard.isTopValid=false;   
                            card.row = cardOnBoard.row - 1; card.col = cardOnBoard.col;
                            if(card.top===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }    
                        }
                        else if(cardOnBoard.isButtomValid){
                            card.isUp=cardOnBoard.isUp;
                            card.isTopValid=false; cardOnBoard.isButtomValid=false;   
                            card.row = cardOnBoard.row + 1; card.col = cardOnBoard.col;
                            if(card.buttom===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }    
                        }
                        else if(cardOnBoard.isMidLeftValid){
                            card.isUp=!cardOnBoard.isUp;
                            card.isTopValid=false; cardOnBoard.isMidLeftValid=false;   
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col-1;
                            if(card.buttom===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }
                        }
                        else{
                            card.isUp=!cardOnBoard.isUp;
                            card.isButtomValid=false; cardOnBoard.isMidRigthValid=false;   
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col+1;
                            if(card.top===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }
                        }
                    }
                    else{//דאבל שוכב
                        if(cardOnBoard.isTopValid){
                            card.isUp=cardOnBoard.isUp;
                            card.isButtomValid=false; cardOnBoard.isTopValid=false;   
                            card.row = cardOnBoard.row ; card.col = cardOnBoard.col+1;
                            if(card.top===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }    
                        }
                        else if(cardOnBoard.isButtomValid){
                            card.isUp=cardOnBoard.isUp;
                            card.isTopValid=false; cardOnBoard.isButtomValid=false;   
                            card.row = cardOnBoard.row ; card.col = cardOnBoard.col-1;
                            if(card.buttom===cardOnBoard.buttom){
                                card.deg = 180;
                                this.flipCard(card);    
                            }    
                        }
                        else if(cardOnBoard.isMidLeftValid){
                            card.isUp=!cardOnBoard.isUp;
                            card.isButtomValid=false; cardOnBoard.isMidLeftValid=false;   
                            card.row = cardOnBoard.row-1; card.col = cardOnBoard.col1;
                            if(card.top===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }
                        }
                        else{
                            card.isUp=!cardOnBoard.isUp;
                            card.isTopValid=false; cardOnBoard.isMidRigthValid=false;   
                            card.row = cardOnBoard.row+1; card.col = cardOnBoard.col;
                            if(card.buttom===cardOnBoard.top){
                                card.deg = 180;
                                this.flipCard(card);    
                            }
                        }
                    }
                }
                else{
                    card.isUp=cardOnBoard.isUp;
                    if(cardOnBoard.isUp){//רגיל עומד
                        if(card.buttom === cardOnBoard.top && cardOnBoard.isTopValid){// b->t
                            card.isButtomValid=false; cardOnBoard.isTopValid=false; 
                            card.row = cardOnBoard.row - 1; card.col = cardOnBoard.col;
                        } 
                        else if(card.top === cardOnBoard.buttom && cardOnBoard.isButtomValid){ //t->b
                            card.isTopValid=false; cardOnBoard.isButtomValid=false; 
                            card.row = cardOnBoard.row +1; card.col = cardOnBoard.col;
                        }
                        else if(card.top === cardOnBoard.top && cardOnBoard.isTopValid){// t->t
                            card.isButtomValid=false; cardOnBoard.isTopValid=false;   
                            card.row = cardOnBoard.row - 1; card.col = cardOnBoard.col; card.deg = 180;
                            this.flipCard(card);
                        }
                        else if(card.buttom === cardOnBoard.buttom && cardOnBoard.isButtomValid){ //b->b
                            card.isTopValid=false; cardOnBoard.isButtomValid=false; 
                            card.row = cardOnBoard.row +1; card.col = cardOnBoard.col; card.deg = 180;
                            this.flipCard(card);
                        }    
                    }
                    else{//רגיל שוכב
                        if(card.buttom === cardOnBoard.top && cardOnBoard.isTopValid){// b->t
                            card.isButtomValid=false; cardOnBoard.isTopValid=false; 
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col+1;
                        } 
                        else if(card.top === cardOnBoard.buttom && cardOnBoard.isButtomValid){ //t->b
                            card.isTopValid=false; cardOnBoard.isButtomValid=false; 
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col-1;
                        }
                        else if(card.top === cardOnBoard.top && cardOnBoard.isTopValid){// t->t
                            card.isButtomValid=false; cardOnBoard.isTopValid=false;   
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col+1; card.deg = 180;
                            this.flipCard(card);
                        }
                        else if(card.buttom === cardOnBoard.buttom && cardOnBoard.isButtomValid){ //b->b
                            card.isTopValid=false; cardOnBoard.isButtomValid=false; 
                            card.row = cardOnBoard.row; card.col = cardOnBoard.col-1; card.deg = 180;
                            this.flipCard(card);
                        }
                    }
                }
            }
        }
        if(!card.isUp){
            card.deg+=90;
        }
    }

    checkBoardSize(){
        for (let i = 0; i < this.openDeck.length; i++) {
            if(this.openDeck[i].row<=0){
                this.EnlargeBoardRow();
            }
            else if(this.openDeck[i].col<=0){
                this.EnlargeBoardCol();
            }
        }
    }

    EnlargeBoardCol(){
        for (let i = 0; i < this.openDeck.length; i++) {
            this.openDeck[i].col++;
        }
    }
    EnlargeBoardRow(){
        for (let i = 0; i < this.openDeck.length; i++) {
            this.openDeck[i].row++;
        }
    }


    findMatch(card){
        for (let i = 0; i < this.openDeck.length; i++) {
            this.openDeck[i].border =false;
            if(this.openDeck[i].Type === "duble"){
                if((card.top === this.openDeck[i].top || card.buttom === this.openDeck[i].top)&& (this.openDeck[i].isMidLeftValid || this.openDeck[i].isMidRigthValid)){
                    this.openDeck[i].border = true;
                    this.matchCards.push(this.openDeck[i]);
                }
                else if((card.top === this.openDeck[i].top && this.openDeck[i].isTopValid) || (card.buttom === this.openDeck[i].top && this.openDeck[i].isTopValid) 
                || (card.top === this.openDeck[i].buttom && this.openDeck[i].isButtomValid) || (card.buttom === this.openDeck[i].buttom && this.openDeck[i].isButtomValid)){
                    this.openDeck[i].border = true;
                    this.matchCards.push(this.openDeck[i]);
                 }
            }      
            else{
                if((card.top === this.openDeck[i].top && this.openDeck[i].isTopValid) || (card.buttom === this.openDeck[i].top && this.openDeck[i].isTopValid) 
                || (card.top === this.openDeck[i].buttom && this.openDeck[i].isButtomValid) || (card.buttom === this.openDeck[i].buttom && this.openDeck[i].isButtomValid)){
                    this.openDeck[i].border = true;
                    this.matchCards.push(this.openDeck[i]);
                }
            }
        } 
        return this.matchCards;
    }

    flipCard(card){
        let temp = card.top;
        card.top = card.buttom;
        card.buttom = temp;
    }

    isfoldDeckEmpty() {
        return this.foldDeck.length === 0;
    }

    getUserCardByElementID(cardElementID) {
        var splittedID = cardElementID.split("_");
        for (var i = 0; i < this.players[0].cards.length; i++) {
            if (this.players[0].cards[i].top == splittedID[1] && this.players[0].cards[i].buttom == splittedID[2] && this.players[0].cards[i].ID == splittedID[3])
                return this.players[0].cards[i];
        }
        return null;
    }

    getOpenDeckdByElementID(cardElementID) {
        var splittedID = cardElementID.split("_");
        for (var i = 0; i < this.openDeck.length; i++) {
            if (this.openDeck[i].ID == splittedID[3]){
                return this.openDeck[i];
            }
        }
        return null;
    }

    warnIllegalUserStep(chosenCardID) {
        var chosenCardElement = this.getElementByCard(chosenCardID);
        chosenCardElement.className = "img card animated shake";
    }

    getElementByCard(chosenCardID) {
        return document.getElementById(chosenCardID);
    }

    ////////////////////////
    ///// User methods /////
    ////////////////////////



    isUserHaveCardToSet() {
        let res = false;
        for (let i = 0; i < this.players[0].cards.length; i++) {
            if (this.isValidStep(this.players[0].cards[i]))
                res = true;
        }
        return res;
    }
    
    updateScore(){
        let score = 0;
        for (let i = 0; i < this.players[0].cards.length; i++) {
           score += this.players[0].cards[i].top + this.players[0].cards[i].buttom;
        }
        this.stats.userScore = score;
    }

    increaseUserTurnsAmount() {
        this.stats.userTurnsAmount++;
    }

    updatePulls(){
        this.stats.userPull++;
    }

    onClickOpenDeck(chosenCardID){
        let chosenCard = this.getOpenDeckdByElementID(chosenCardID);
        let matchCards = this.findMatch(this.currCard);
        this.renderFunc();
        if(this.blabla(matchCards,chosenCard)){ 
          this.useCard(this.players[0].cards, this.currCard, "UserCard", chosenCard);
            this.executeUserStep();
        }
        else{
              this.currCard = null;
            this.matchCards = [];
        }
        this.clearBorder();
        this.renderFunc();
    }
    clearBorder(){
        for (let i = 0; i < this.openDeck.length; i++) {
            this.openDeck[i].border =false;}
    }

    blabla(matchCards,chosenCard ){
        for (let i = 0; i < this.matchCards.length; i++) {
            if(matchCards[i].ID === chosenCard.ID){
                return true;
            }
        }
        return false;
    }


    onClickFoldDeck() {
        if (this.userTurn === true && this.gameStatus == "started" && this.openDeck.length>0) {
            if (!this.isUserHaveCardToSet()) {
                this.amountCardsToTake = 1;
                this.takeCard(this.players[0]);
                this.amountCardsToTake--;

                this.updateGameHistory();
                this.renderFunc();
            }
            else
                this.foldDeckShowPopup();
        }
    }
}

// Player class
class Player {
    constructor(type) {
        this.cards = [];
        this.type = type;
    }
}

// Card class
class Card {
    constructor(top, buttom, Type, ID, isTopValid, isButtomValid, isMidLeftValid, isMidRigthValid) {
        this.top = top;
        this.buttom = buttom;
        this.Type = Type;
        this.ID = ID;
        this.isTopValid = isTopValid;
        this.isButtomValid = isButtomValid;
        ///change
        this.row = 1;
        this.col = 2;
        this.deg = 0;
        this.isUp = true;
        this.isMidLeftValid = isMidLeftValid;
        this.isMidRigthValid = isMidRigthValid;
        this.border = false;
    }
}

// Stats class
export class Stats {
    constructor() {
        this.userTurnsAmount = -6;
        this.startGameTime = new Date().getTime();
        this.userLastTurnStartTime = new Date().getTime();
        this.userTurnsTimeSum = 0;
        this.userScore = 0;
        this.userPull = -6;

    }
}

export class GameHistoryState {
    constructor(game) {
        this.userTurn = game.userTurn;
        this.openDeck = game.openDeck.slice();
        this.foldDeck = game.foldDeck.slice();
        this.stats = Object.assign(Object.create(Object.getPrototypeOf(game.stats)), game.stats);
        this.player1Cards = game.players[0].cards.slice();
    }
}