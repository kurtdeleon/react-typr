import React, { useState, useEffect, useRef, useCallback } from "react";
import { isLetterPress, getNetWpm, getAccuracy } from "./Helpers";
import randomWords from "random-words";
import Results from "./Results";
import "./Game.css";

const wordsPerLine = 10;
const timePerRound = 60; // in seconds

/* Custom hook to keep track of the 
  previous value of a property */
const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/* Generates n line of words */
const generateWords = (n = 1) => {
  return randomWords({
    exactly: wordsPerLine * n,
    minLength: 3,
    maxLength: 8
  });
};

function Game(props) {
  const [words, setWords] = useState(generateWords(2));
  const [wordCount, setWordCount] = useState(0);
  // array of indexes of mistyped words
  const [mistakeIdx, setMistakeIdx] = useState([]);
  const [totalKp, setTotalKp] = useState(0); // kp = keypress
  const [wrongKp, setWrongKp] = useState(0);
  const [corrections, setCorrections] = useState(0);
  const [time, setTime] = useState(timePerRound + 1);
  const prevTime = usePrevious(time); // keeps a reference of previousTime
  const [errorMode, setErrorMode] = useState(false);
  const [isActive, setActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showResults, setShowResults] = useState(false);

  // index of currently active word
  const currIdx = wordCount + mistakeIdx.length;
  // reference to input component
  const inputRef = useRef("");

  /* Checks whether or not the input string is
    exactly the same as the answer. If not, the index 
    of the currently selected word is stored for visual
    representation as well as for data. */
  const submitWord = (currWord, answer) => {
    if (currWord === answer) {
      setWordCount((wordCount) => wordCount + 1);
    } else {
      setMistakeIdx((mistakeIdx) => [...mistakeIdx, currIdx]);
    }
    if (errorMode) {
      setErrorMode(false);
    }
  };

  /* Clears the input when space is 
    detected at the end of the input. */
  const handleOnChange = (event) => {
    if (event.target.value.slice(-1) === " ") {
      inputRef.current.value = "";
    }
  };

  /* Restarts game state */
  const restartGame = useCallback(() => {
    setWords(generateWords(2));
    setWordCount(0);
    setMistakeIdx([]);
    setTotalKp(0);
    setWrongKp(0);
    setCorrections(0);
    setShowResults(false);
  }, []);

  /* Starts game state by decrementing time by 1, 
    which activates another effect hook that requires
    the time state to be less than previous time. */
  const startGame = useCallback(() => {
    setActive(true);
    setTime(time - 1);
  }, [time]);

  /* Removes one keypress count from the total
    if Backspace is pressed even when user has
    typed correctly so far. This is done so accuracy 
    cannot be increased by spamming a letter and correcting it. */
  const handleKeyDown = (event) => {
    const { key } = event;
    const word = words[currIdx];
    const origInput = event.target.value; //previous state
    const input = origInput.concat(key); //current state

    const shouldStart = !isActive && isLetterPress(key);
    if (shouldStart) {
      startGame();
    }

    if (isActive || shouldStart) {
      if (key === "Backspace" && origInput.length > 0) {
        if (errorMode) {
          if (word.startsWith(origInput.slice(0, -1))) {
            setErrorMode(false);
          }
          setCorrections((corrections) => corrections + 1);
        } else {
          setTotalKp((totalKp) => totalKp - 1);
        }
      } else if (key === " " || key === "Spacebar") {
        submitWord(word, origInput);
      } else if (isLetterPress(key)) {
        setTotalKp(totalKp + 1);
        if (word.startsWith(input)) {
          if (errorMode) {
            setErrorMode(false);
          }
        } else {
          setWrongKp((wrongKp) => wrongKp + 1);
          if (!errorMode) {
            setErrorMode(true);
          }
        }
      }
    }
  };

  /* Adds another line of random words 
    if conditions are met */
  useEffect(() => {
    const totalCount = wordCount + mistakeIdx.length;
    if (
      totalCount >= words.length - wordsPerLine &&
      totalCount % wordsPerLine === 0
    ) {
      setWords([...words, ...generateWords()]);
    }
  }, [words, wordCount, mistakeIdx]);

  /* Submits score to parent component. */
  const submitScore = useCallback(() => {
    props.addScore({
      totalKp,
      wrongKp,
      corrections,
      correctWords: wordCount,
      wrongWords: mistakeIdx.length,
      date: new Date()
    });
  }, [props, totalKp, wrongKp, corrections, wordCount, mistakeIdx]);

  /* End game function. Resets any game state 
    that aren't used in the Results screen. 
    submitScore() also called. */
  useEffect(() => {
    if (isActive && time <= 0) {
      setActive(false);
      setShowResults(true);
      setErrorMode(false);
      setTime(timePerRound + 1);
      inputRef.current.value = "";
      submitScore();
    }
  }, [isActive, time, submitScore]);

  /* Updates time, accuracy, and WPM per interval.
    Limited only to every second as WPM and accuracy
    changing looks too distracting if changed on time. */
  useEffect(() => {
    if (isActive && time > 0 && time !== prevTime) {
      setTimeout(() => {
        setTime(time - 1);
        setWpm(getNetWpm(totalKp, wrongKp - corrections, 60 - time));
        setAccuracy(getAccuracy(totalKp, wrongKp + corrections));
      }, 1000);
    }
  }, [isActive, time, prevTime, totalKp, wrongKp, corrections]);

  /* Allows for visual feedback of past and current
    correct/wrong answers. */
  const getClassName = (index, isPrimary) => {
    let className = "";
    if (isPrimary) {
      const slicedIdx = currIdx % wordsPerLine;
      if (slicedIdx === index) {
        className = "selected ";
        if (errorMode) {
          className = className.concat(" error");
        }
      } else if (index < slicedIdx) {
        if (mistakeIdx.includes(index + (words.length - wordsPerLine * 2))) {
          className = "mistake";
        } else {
          className = "correct";
        }
      }
    } else {
      if (mistakeIdx.includes(index + (words.length - wordsPerLine * 3))) {
        className = "mistake";
      } else {
        className = "correct";
      }
    }
    return className;
  };

  const formatTime = (seconds) => {
    if (seconds >= 60) {
      return "1:00";
    } else if (seconds > 9 && seconds < 60) {
      return `0:${seconds}`;
    } else {
      return `0:0${seconds}`;
    }
  };

  return (
    <div id="game-container">
      <div id="main-container">
        <Results
          visible={showResults}
          totalKp={totalKp}
          wrongKp={wrongKp}
          corrections={corrections}
          correctWords={wordCount}
          wrongWords={mistakeIdx.length}
        />
        <div id="words-container">
          <div className="words">
            {words.length > wordsPerLine * 2 ? (
              words
                .slice(
                  words.length - wordsPerLine * 3,
                  words.length - wordsPerLine * 2
                )
                .map((word, idx) => (
                  <span key={`top-${idx}`} className={getClassName(idx, false)}>
                    {word}
                  </span>
                ))
            ) : (
              /* Empty spans for visual filler */
              <span className="empty">{`Empty span`}</span>
            )}
          </div>
          <div className="words">
            {words
              .slice(
                words.length - wordsPerLine * 2,
                words.length - wordsPerLine
              )
              .map((word, idx) => (
                <span key={`mid-${idx}`} className={getClassName(idx, true)}>
                  {word}
                </span>
              ))}
          </div>
          <div className="words">
            {words.slice(words.length - wordsPerLine).map((word, idx) => (
              <span key={`bot-${idx}`}>{word}</span>
            ))}
          </div>
        </div>
      </div>
      <div id="input-container">
        <input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
          disabled={showResults}
          placeholder={
            !isActive
              ? showResults
                ? "Good job! Press the restart button to try again."
                : "Type anything to start..."
              : ""
          }
        ></input>
        {showResults && <button onClick={restartGame}>Restart</button>}
        <span className="stats">{formatTime(time)}</span>
        <span id="wpm" className="stats">{`WPM: ${wpm}`}</span>
        <span id="accuracy" className="stats">{`Accuracy: ${accuracy}%`}</span>
      </div>
    </div>
  );
}

export default Game;
