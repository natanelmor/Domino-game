import React from 'react';
import ReactDOM from 'react-dom';
import { game } from './board';

export class EndGamePopup extends React.Component {
    constructor(args) {
        super(args);
    }
    
    playAgain()
    {
        game.playAgain();
    }
    
    navigate()
    {
        game.onMoveToNavigateMode();
    }

    render() {
        let currentTime = new Date().getTime();
        let timeSinceGameStarted = new Date(currentTime - game.stats.startGameTime);
        let average = (game.stats.userTurnsTimeSum / game.stats.userTurnsAmount) / 1000;

        if (!(average > 0))
            average = 0;
            
        return (
            <div id="endGamePopup" className={game.gameStatus == "ended" ? 'endGamePopup show' : 'endGamePopup hidden'}>
                <div className="endGamePopup-content">
                    <div className="endGamePopup-header">
                        <h1 id="popUpTitle">You {(game.whoWon) ? "won!" : "lost!"}</h1>
                    </div>
                    <div className="endGamePopup-body">
                        <p id="UserTurnsPopUp">User turns amount: {game.stats.userTurnsAmount}</p>
                        <p id="GameTimePopUp">Game length: {timeSinceGameStarted.getMinutes()} mins and {timeSinceGameStarted.getSeconds()} secs</p>
                        <p id="AveragePopUp">Average user step time: {average.toFixed(3)}</p>
                        <p id="UserPullAmountPopUp">Number of times the user pull card from cash: {game.stats.userPull}</p>
                        <p id="UserScorePopUp">User Score: {game.stats.userScore}</p>
                        <div id="popupButtons">
                            <div className="endGamePopupButton" onClick={this.playAgain.bind(this)}>Play again</div>
                            <div className="endGamePopupButton" onClick={this.navigate.bind(this)}>Navigate</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}