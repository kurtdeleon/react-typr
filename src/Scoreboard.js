import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./Scoreboard.css";

function Scoreboard(props) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const modScores = [...props.scores];
    while (modScores.length < 10) {
      modScores.push({ wpm: -1, accuracy: -1 });
    }
    setScores(modScores);
  }, [props]);

  const getTitleText = (s) => {
    let title = `Words: ${s.correctWords}/${s.wrongWords} ⇼ `;
    title = title.concat(`Keypress: (${s.totalKp}/${s.wrongKp}`);
    title = title.concat(`/${s.corrections}) `);
    title = title.concat(`${s.totalKp - s.wrongKp + s.corrections}`);
    return title;
  };

  const getListObject = (score, rank) => {
    let content = <div className="filler-score">{`─ no score found ─`}</div>;
    if (score.wpm >= 0 && score.accuracy >= 0) {
      const date = new Date(score.date).toLocaleDateString("ko-KR");
      let stats = `« ${score.wpm} WPM / `;
      stats = stats.concat(`${score.accuracy}% ACC / `);
      stats = stats.concat(
        `${score.totalKp - score.wrongKp + score.corrections} KP »`
      );
      content = (
        <div title={getTitleText(score)} className="score">
          <span>{`#${rank}`}</span>
          <span>{stats}</span>
          <span>{`${date}`}</span>
        </div>
      );
    }
    return <li key={uuidv4()}>{content}</li>;
  };

  return (
    <div id="scoreboard-container">
      <div id="credits">
        <h1>typr</h1>
        <h5>
          a react app for <br />
          typing practice
        </h5>
        <div>
          <span onClick={props.clearScores}>clear highscores</span>
        </div>
      </div>
      <div id="scoreboard">
        <div>
          <ul>{scores.slice(0, 5).map((s, i) => getListObject(s, i + 1))}</ul>
        </div>
        <div>
          <ul>{scores.slice(5, 10).map((s, i) => getListObject(s, i + 6))}</ul>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
