import React, { useMemo } from "react";
import { getWpmPercentile, getNetWpm, getAccuracy } from "./Helpers";
import "./Results.css";

function Results(props) {
  const wpm = useMemo(() => {
    return getNetWpm(props.totalKp, props.wrongKp - props.corrections);
  }, [props]);

  const accuracy = useMemo(() => {
    return getAccuracy(props.totalKp, props.wrongKp + props.corrections);
  }, [props]);

  return (
    <div id="results" className={props.visible ? "show" : "hide"}>
      <div id="wpm">
        <span>{`${wpm} WPM`}</span>
        <span>
          You are better than <br /> {getWpmPercentile(wpm)} of all players!
        </span>
      </div>
      <div id="stats">
        <div className="addtl">
          <span>Keystrokes</span>
          <span id="keystrokes-data">
            {`( `}
            <span>{props.totalKp}</span>
            {` | `}
            <span>{props.wrongKp}</span>
            {` | `}
            <span>{props.corrections}</span>
            {` ) `}
            <span>
              {props.correctWords + props.wrongWords + props.corrections}
            </span>
          </span>
        </div>

        <div className="addtl">
          <span>Accuracy</span>
          <span>{`${accuracy}%`}</span>
        </div>
        <div className="addtl">
          <span>Correct words</span>
          <span>{props.correctWords}</span>
        </div>
        <div className="addtl">
          <span>Wrong words</span>
          <span>{props.wrongWords}</span>
        </div>
      </div>
      <div id="info">
        <span>
          {`This project was created by `}
          <a
            href="https://github.com/kurtdeleon"
            title="GitHub - Kurt de Leon"
            target="_blank"
            rel="noopener noreferrer"
          >
            @kurtdeleon
          </a>
          {` and directly inspired by `}
          <a
            href="https://10fastfingers.com/"
            title="10FastFingers.com - Typing Test, Competitions, Practice & Typing Games"
            target="_blank"
            rel="noopener noreferrer"
          >
            10FastFingers
          </a>
          {`.`}
        </span>
        <span>
          {`Typing equations based on `}
          <a
            href="https://www.speedtypingonline.com/typing-equations"
            title="Typing Equations - Speed Typing Online"
            target="_blank"
            rel="noopener noreferrer"
          >
            Speed Typing Online
          </a>
          {`. Statistics taken from the histogram of `}
          <a
            href="https://typing-speed-test.aoeu.eu/"
            title="Typing Test @ AOEU - Your typing speed in CPM and WPM"
            target="_blank"
            rel="noopener noreferrer"
          >
            Typing Test @ AOEU
          </a>
          {". Icons made by "}
          <a
            href="https://www.flaticon.com/authors/smashicons"
            title="FlatIcon - Free vector icons"
            target="_blank"
            rel="noopener noreferrer"
          >
            SmashIcons
          </a>
          {" on "}
          <a
            href="https://www.flaticon.com/"
            title="FlatIcon - Free vector icons"
            target="_blank"
            rel="noopener noreferrer"
          >
            FlatIcon
          </a>
          {"."}
        </span>
      </div>
    </div>
  );
}

export default Results;
