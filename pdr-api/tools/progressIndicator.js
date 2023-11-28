function formatTime(time) {
  let sec = parseInt(time / 1000, 10);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds;
}

/**
 * This function updates the console with the progress of the operation. Get a time stamp (`intervalStartTime = new Date()`)
 * before the for loop or nested for loop you want to track, then within the loop, place `updateConsoleProgress` where you want to update
 * the console with the current progress.
 * 
 * It will also update the console with the estimated time remaining if the `total` argument is passed.
 * 
 * The function continually overwrites the same console line, so be aware when using other instances of `console.log()` within your loop.
 * To cleanly finish the console updates and move to the next line, call `finishConsoleUpdates()` or `errorConsoleUpdates()`.
 * 
 * @param {Date} intervalStartTime - The timestamp before you want to start tracking console progress
 * @param {string} text - Text blurb to display in the console
 * @param {number} modulo - The number of loops to wait between updating the console with the current progress. With quick loops with many iterations, updating the 
 * console frequently can significantly slow down the operation. For example, setting `modulo` to 25 will only update the console every 25 loops.
 * @param {number} complete - the current number of completed steps (typically loops). For example, if you have a `for (let i = 0; i < n; i++)` loop, then 
 * you would pass in `i`.
 * @param {number} total (optional) - if you know the total number of steps you will have, you can pass them it to get a time estimate of how long your loop will
 * take to complete. For example, if you have a `for (let i = 0; i < n; i++)` loop, you would pass in `n`. If you have an indeterminate number of steps in your 
 * loop (i.e. `while()`), leave this argument blank.
 * 
 * @example
 * const intervalStartTime = new Date();
 * for (let i = 0; i < n; i++) {
 *   updateConsoleProgress(intervalStartTime, 'Processing data', 1, i, n);
 * }
 * finishConsoleUpdates();
 */
function updateConsoleProgress(intervalStartTime, text, modulo = 1, complete = 0, total) {
  if (complete % modulo === 0 || complete === total || complete <= 1) {
    const currentTime = new Date().getTime();
    let currentElapsed = currentTime - intervalStartTime;
    let remainingTime = NaN;
    if (total) {
      if (complete !== 0) {
        let totalTime = (total / complete) * currentElapsed;
        remainingTime = totalTime - currentElapsed;
      }
      const percent = (complete / total) * 100;
      process.stdout.write(` > ${text}: \x1b[33m${complete}/${total}\x1b[0m (\x1b[35m${percent.toFixed(1)}%\x1b[0m) completed in \x1b[36m${formatTime(currentElapsed)}\x1b[0m (\x1b[36m~${formatTime(remainingTime)}\x1b[0m remaining)\r`);
    } else {
      process.stdout.write(` > ${text}: \x1b[33m${complete}\x1b[0m completed in \x1b[36m${formatTime(currentElapsed)}\x1b[0m.\r`);
    }
  }
}

/**
 * Cleanly finish successful console updates and move to the next line.
 * 
 * @param {*} msg - Custom completion message. Defaults to 'Complete.'
 */
function finishConsoleUpdates(msg = 'Complete.') {
  process.stdout.write('\n');
  console.log(` > \x1b[32m${msg}\x1b[0m`);
}

/**
 * Cleanly finish console updates with errors and move to the next line.
 * 
 * @param {*} error - Custom error message. Defaults to 'Error.'
 */
function errorConsoleUpdates(error = 'Error.') {
  process.stdout.write('\n');
  console.log(` > \x1b[31m${error}\x1b[0m`);
}

module.exports = {
  updateConsoleProgress,
  finishConsoleUpdates,
  errorConsoleUpdates
}