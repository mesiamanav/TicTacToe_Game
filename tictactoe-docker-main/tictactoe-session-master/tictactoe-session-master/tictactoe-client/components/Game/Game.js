import React, { Component } from 'react';
import axios from 'axios';

// frontend logic of game application
// TODO add configs for host, dev env, timeouts, etc.

function ComponentSquare(props) {
  return (
    <button className="gamesquare" onClick={props.onClick}>{props.value}</button>
  );
}

class Game extends Component {
  state = {
    board: [],
    gameActive: null,
    turnSymbol: null,
    winner: null,
    connected: false
  }

  constructor(props) {
    super(props);
    const {symbol} = this.props;
    this.state.symbol = symbol
    this.eventSource = new EventSource("http://" + window.location.hostname + ":8000/events");
    this.resetGame = this.resetGame.bind(this)
    this.loadBoard = this.loadBoard.bind(this)
  }

  componentDidMount() {
    this.loadBoard();
    this.eventSource.onmessage = d =>
      this.updateGameState(d);
    this.eventSource.onerror = e =>
    this.setState({
      connected: false});
  }

  // TODO handle errors
  loadBoard() {
    axios
      .get('/engine')
      .then(response => {
        this.setState({
          board: response.data.board,
          gameActive: response.data.gameActive,
          turnSymbol: response.data.turnSymbol,
          winner: response.data.winner})
      })
      .catch(console.log)
  }

  updateGameState(d) {
    if(d.data === '1') {
      this.setState({
        connected: true});
      return;
    }

    var jsonState = JSON.parse(d.data);
    this.setState({
      board: jsonState.board,
      gameActive: jsonState.gameActive,
      turnSymbol: jsonState.turnSymbol,
      winner: jsonState.winner})
  }

  // TODO check response of get, handle errors
  resetGame() {
      axios
        .get('/engine/resetGame')
  }

  renderSquare(i) {
  return <ComponentSquare value={this.state.board[i]}
    onClick={() => this.handleClick(i)}/>;
  }

  handleClick(i) {

    // return without calling
    if(this.state.board[i] !== null || !this.state.gameActive || !this.state.connected || this.state.symbol !== this.state.turnSymbol) {
      return;
    }

    var move = i;

    // TODO check response of post, handle errors
    axios
      .post('/engine/sendMove', {
        params: { i }
      })
  }

  render() {
    var status;
    if (this.state.winner === 'tie') {
      status = 'Tie Game';
    } else if(this.state.winner)
      status = 'Game over, ' + this.state.winner + ' wins the game!';
    else if(this.state.symbol !== this.state.turnSymbol) {
      status = 'Waiting for ' + this.state.turnSymbol + ' to move ...';
    } else {
      status = 'It\'s your turn to move, ' + this.state.turnSymbol;
    }
    return (
      <div className="centered">
        <div className="status">{status}</div>
        <div className="game-board">
          <div className="box">{this.renderSquare(0)}</div>
          <div className="box">{this.renderSquare(1)}</div>
          <div className="box">{this.renderSquare(2)}</div>
          <div className="box">{this.renderSquare(3)}</div>
          <div className="box">{this.renderSquare(4)}</div>
          <div className="box">{this.renderSquare(5)}</div>
          <div className="box">{this.renderSquare(6)}</div>
          <div className="box">{this.renderSquare(7)}</div>
          <div className="box">{this.renderSquare(8)}</div>
      </div>
        <br />
        <div className="status">
          <button onClick={this.resetGame}>Reset Game</button>
        </div>
      </div>
    );

  }
}

export default Game;
