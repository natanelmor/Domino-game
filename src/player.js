import React from 'react';
import ReactDOM from 'react-dom';
import { game } from './board';

export class PlayerUI extends React.Component {
    constructor(args) {
        super(args);
    }

    onClickUserCard(event)
    {
        if (game.userTurn === true && game.gameStatus == "started")
            game.gameManager(event.target.id);
    }

    handleMouseOverCard(event) {
        event.target.className = "img card";
    }

    srcImg(card){
        if(card.top < card.buttom){ return `../src/images/cards/${card.top}_${card.buttom}.png` }
        else {return `../src/images/cards/${card.buttom}_${card.top}.png`}
    }


    renderPlayerCards() {
        let res;
        if (this.props.type === "human") {
            res =
                this.props.cards.map((card) => (
                    <img src = {this.srcImg(card)}
                        className="img animated bounceInUp"
                        onClick={((e) => { this.onClickUserCard(e) })}
                        onMouseOver={((e) => { this.handleMouseOverCard(e) })}
                        id = {`UserCard_${card.top}_${card.buttom}_${card.ID}`}
                        key = {`UserCard_${card.top}_${card.buttom}_${card.ID}`} />
                ));
        }
        return res;
    }

    render() {
        return (
            <div id={`player_${this.props.id}`} className="player" >
                {this.renderPlayerCards()}
            </div>
        );
    }
}