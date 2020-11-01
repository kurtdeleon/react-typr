import React, { useState, useEffect } from "react";
import { getNetWpm, getAccuracy } from "./Helpers";
import Game from "./Game";
import Scoreboard from "./Scoreboard";
import "./App.css";

const scoreMaxLength = 10; // max number of scores to be stored

function App() {
  const [scores, setScores] = useState([]);

  /* Called on mounting */
  useEffect(() => {
    if (localStorage.getItem("scores") !== null) {
      setScores(sortScores(JSON.parse(localStorage.getItem("scores"))));
    }
  }, []);

  /* State stored in localStorage every time it changes */
  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  /* Sorts by WPM first, then Accuracy */
  const sortScores = (scoreArray) => {
    const newScores = scoreArray.sort((a, b) => {
      let x = b.wpm - a.wpm;
      return x === 0 ? b.accuracy - a.accuracy : x;
    });
    return newScores;
  };

  /* Submits score to score array. If new score if better 
    than the current worst score, the latter gets removed
    and the former gets added. The array is then sorted. */
  const submitScore = (nu) => {
    const newS = Object.assign(nu, {
      wpm: getNetWpm(nu.totalKp, nu.wrongKp - nu.corrections),
      accuracy: getAccuracy(nu.totalKp, nu.wrongKp + nu.corrections)
    });

    if (scores.length >= scoreMaxLength) {
      const worst = scores[scores.length - 1];
      if (
        newS.wpm > worst.wpm ||
        (newS.wpm === worst.wpm && newS.accuracy > worst.accuracy)
      ) {
        setScores(sortScores(scores.slice(0, 9).concat(newS)));
      }
    } else {
      setScores(sortScores(scores.concat(newS)));
    }
  };

  return (
    <div className="App">
      <Game addScore={submitScore} />
      <Scoreboard scores={scores} clearScores={() => setScores([])} />
    </div>
  );
}

export default App;
