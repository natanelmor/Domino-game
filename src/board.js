import React from 'react';
import ReactDOM from 'react-dom';
import { Dominoes} from './Dominoes';
import { PlayerUI } from './player';
import { Stock } from './stock';
import { EndGamePopup } from './endGamePopup';

export let game;

export class Board extends React.Component {
    constructor(args) {
        super(args);
        game = new Dominoes();
        game.renderFunc = this.renderAll.bind(this);
        game.initializeGame();
     

        this.state = {
            foldDeckCards: game.foldDeck,
            openDeckCards: game.openDeck,
            userCards: game.players[0].cards
        }
    }

    componentDidMount() {
        if (!game.userTurn)
            game.gameManager();
    }

    renderAll() {
        this.setState({
            foldDeckCards: game.foldDeck,
            openDeckCards: game.openDeck,
            userCards: game.players[0].cards
        })
    }

    render() {
        return (
            <div id="Game">
                 <h1 style={{fontSize:`30px`, color: `white`,  textShadow: `2px 2px 4px #000000`}}>Dominoes React</h1>
                <Stock foldDeckCards={this.state.foldDeckCards} openDeckCards={this.state.openDeckCards} />
                 <PlayerUI id="1" type="human" cards={this.state.userCards} />
                 <EndGamePopup />
            </div>
        );
    }
}