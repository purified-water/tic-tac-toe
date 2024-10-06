import { useState } from 'react';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button className={`square ${highlight ? 'highlight' : ''} ${value === "O" ? "O" : " "}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares).winner === "X" || calculateWinner(squares).winner === "O" || calculateWinner(squares).winner === "ended" || squares[i]) {
      return;
    }
    // Copy the squares array
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    // Add the i index to the handlePlay function
    onPlay(nextSquares, i);
  }

  const winnerInfo = calculateWinner(squares);
  // Game condition
  const winner = winnerInfo.winner;
  // Winning line
  const winningLine = winnerInfo.line;

  let status;
  if (winner === "X" || winner === "O") {
    status = 'Winner: ' + winner;
  } else if (winner === "continue") {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  } else {
    status = 'Draw';
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const boardSquares = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const highlight = winningLine && winningLine.includes(index); // Highlight if part of the winning line
      boardSquares.push(
        <Square key={index} value={squares[index]} onSquareClick={() => handleClick(index)} highlight={highlight} />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {boardSquares}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  // Get the current squares
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, index) {
    // Get the location of the square from index
    const row = Math.floor(index / 3);
    const col = index % 3;
    // Update the history
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location: { row, col } }];
    setHistory(nextHistory);
    // Set the current move so that can update the history onwards
    setCurrentMove(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setXIsNext(nextMove % 2 === 0);
  }

  const moves = history.map((step, move) => {
    const { row, col } = step.location || {};
    let description;
    if (move > 0) {
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }

    if (move === currentMove) {
      return (
        <li key={move}>
          <div className='current-move'>
            <text>You are at move #{move}</text>

          </div>
        </li>
      );
    } else {
      return (
        <li key={move}>
          <button className="history" onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    }
  });

  // Sort the moves in either ascending or descending order
  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button className="sort-button" onClick={() => setIsAscending(!isAscending)}>
          Sort {isAscending ? 'Descending' : 'Ascending'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      return { winner: "continue", line: null };
    }
  }
  return { winner: "draw", line: null };
}
