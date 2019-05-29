import React from 'react';
import ReactDOM from 'react-dom';
import { game } from './board';
import { Board } from './board';


export class Stock extends React.Component {
    constructor(args) {
        super(args);
    }

    render() {
        return (
            <div id="Stock">
                <div> 
                    <GameButtons />
                    <GameStats />
                </div>
                    <OpenDeck cards={this.props.openDeckCards} />
                <div>
                    <FoldDeck cards={this.props.foldDeckCards} />
                </div>
            </div>
        );
    }
}

class GameButtons extends React.Component {
    constructor(args) {
        super(args);
    }

    surrenderPlayAgain() {
        if (game.gameStatus == "navigate")
            game.playAgain();
        else
            game.surrender();
    }

    back() {
        game.navigate(-1);
    }

    forward() {
        game.navigate(+1);
    }

    render() {
        return (
            <div id="gameButtons">
                <button id="Surrender" type="button" onClick={this.surrenderPlayAgain.bind(this)}>{game.gameStatus == "navigate" ? "Play again" : "Surrender"}</button>
                <button id="Back" className={(game.gameStatus == "navigate" && game.gameHistoryCurrStateIndex > 0) ? 'show' : 'hidden'} type="button" onClick={this.back.bind(this)}>Back</button>
                <button id="Forward" className={(game.gameStatus == "navigate"&& game.gameHistoryCurrStateIndex < game.gameHistory.length - 1) ? 'show' : 'hidden'} type="button" onClick={this.forward.bind(this)}>Forward</button>
            </div>
        );
    }
}

class OpenDeck extends React.Component {
    constructor(args) {
        super(args);
    }

    handleClick(event) {
        game.onClickOpenDeck(event.target.id);
    }

    openDeckCardStyle(card) {
        let box_border;
        let bord;
        if(card.border){
            box_border= `green`;
            bord = `5px solid transparent`;
        }
        else{
            box_border=`clear`;
            bord = `1px solid transparent`;
        }
        let openDeckCardStyle = {
            transform: `rotate(${card.deg}deg)`,
            gridColumn: `${card.col}`,
            gridRow: `${card.row}`,
            border: bord,
            borderColor: box_border
        };
        return openDeckCardStyle;
    }

    srcImg(card){
        if(card.top < card.buttom){ return `../src/images/cards/${card.top}_${card.buttom}.png` }
        else {return `../src/images/cards/${card.buttom}_${card.top}.png`}
    }

    idMake(card){
        if(card.top <= card.buttom){ return `lastOpenCard_${card.top}_${card.button}_${card.ID}` }
        else {return `lastOpenCard_${card.buttom}_${card.top}_${card.ID}`}
    }

    render() {
        if (this.props.cards.length > 0) {
            let cards =  this.props.cards.map((card) => (
                    <img 
                    style = {this.openDeckCardStyle(card)}
                    src = {this.srcImg(card)}
                    id = {this.idMake(card)}
                    className="img"
                    key = {`lastOpenCard_${card.top}_${card.button}_${card.ID}`}
                    onClick={((e) => { this.handleClick(e) })}/>
                    
        ))
            return (
            <div id="OpenDeck">
                <div style= {{display: `grid`, gridAutoColumns: `203px`}} >
                    {cards}
               </div>
            </div>
            )
        }
        else
           return (<div id="OpenDeck"/>);
    }
}

class FoldDeck extends React.Component {
    constructor(args) {
        super(args);
    }

    foldDeckCardStyle(i) {
        let foldDeckCardStyle = {
            position: `absolute`,
            top: `20px`,
           buttom: `20px`,
            height: `100px`,
            width: `300px`
        };
        return foldDeckCardStyle;
    }

    handleClick() {
        game.onClickFoldDeck();
    }

    handleMouseLeave() {
        game.foldDeckHidePopup("myPopupFoldDeck")
    }

    renderTheFoldDeck() {
        return (
            game.foldDeck.map((card, i) => (
                <img src = {'../src/images/Other/CASH.jpeg'}
                    id = {`foldDeckCard_${card.top}_${card.button}`}
                    className="img"
                    style={this.foldDeckCardStyle(i)}
                    key = {`foldDeckCard_${card.top}_${card.button}_${card.ID}`}
                    onClick= {this.handleClick.bind(this)}
                    onMouseLeave={this.handleMouseLeave}
                />
            ))
        );
    }

    render() {
        return (
            <div id="FoldDeck" className="popup" >
                <span className="popuptext" id="myPopupFoldDeck">You have card to set</span>
                <div id="FoldDeckCards">
                    {this.renderTheFoldDeck()}
                </div>
            </div>
        );
    }
}

class GameStats extends React.Component {
    constructor(args) {
        super(args);
    }

    render() {
        return (
            <div>
                <div id="GameStatistics">
                    <div id="ComputerTurnsAmount">User's Score: {game.stats.userScore}</div>
                    <div id="UserTurnsAmount">User turns amount: {game.stats.userTurnsAmount}</div>
                    <div id="FoldDeckAmount">User Pull amount: {game.stats.userPull}</div>
                </div>
            </div>
        );
    }
}
