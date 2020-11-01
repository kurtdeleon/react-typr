import WpmData from "./WpmPercentile";

/* Pure helper functions */
export const isLetterPress = (input) => {
  return /^[a-zA-Z]+$/.test(input) && input.length === 1;
};

export const getNetWpm = (totalKp, wrongKp, seconds = 60) => {
  const wordsTyped = totalKp / 5;
  const timeInMin = seconds / 60;
  const grossWpm = wordsTyped / timeInMin;
  const grossEpm = wrongKp / timeInMin;
  const netWpm = grossWpm - grossEpm;
  return netWpm > 0 ? Math.round(netWpm) : 0;
};

export const getAccuracy = (totalKp, wrongKp) => {
  const accuracy = (totalKp / (totalKp + wrongKp)) * 100;
  return accuracy.toLocaleString("en", {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const getWpmPercentile = (wpm) => {
  if (wpm > 140) return "99.99%";
  const wpmString = Math.round(wpm).toString();
  return `${WpmData[wpmString]}%`;
};
