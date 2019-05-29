import React from 'react';
import ReactDOM from 'react-dom';
import { Board } from './board';

export class App extends React.Component {
    constructor(args) {
        super(args);
        this.state = {
            visible: true
        }
    }

    hide() {
        this.setState({ visible: false });
        this.renderApp();
    }

    renderApp() {
        ReactDOM.render(
            <Board />,
            document.getElementById("root")
        );
    }

    render() {
        return (
            <div id="PlayNow" className={this.state.visible ? '' : 'hidden'}>
                <img id="play_button" src="..\src\images\other\play_button.png" onClick={this.hide.bind(this)} />
            </div>
        );
    }
}