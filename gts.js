/* global songs createTextRow createNumberCol createNumberRow createCheckboxCol createButtonGroupRow createAlert keyDownHandler keyUpHandler */
const defaultStartTime = 0;
const defaultPeriodLength = 30;
const defaultMode = 0; // 0 - artist and title, 1 - artist, 2 - title
const defaultDel = true;
let startTime;
let periodLength;
let mode;
let del;

let songIndex;
let song;
let iframe;

window.locked = true;

const form = document.getElementById('form');
const rowClass = 'row justify-content-center';
const colClass = 'col-5 col-md-4 col-lg-3 mb-3';
const buttonClass = 'col-6 col-md-4 col-lg-3 mb-3 my-auto';
const firstRow = [['Start Time', 'startTime', '0', '600'], ['Period Length', 'periodLength', '0', '30']];
const secondRow = [['Mode', 'mode', '0', '2'], ['<u>D</u>elete song after round', 'del', 'd']];
const thirdRow = [['Guess Artist', 'guessArtist'], ['Guess Title', 'guessTitle']];
const fourthRow = [['success', 'if(!locked)window.guess()', 'g', 'search', '<u>G</u>uess'], ['danger', 'if(!locked)giveUp()', 'u', 'times', 'Give <u>U</u>p'], ['info', 'restart()', 'e', 'sync', 'R<u>e</u>start']];
form.appendChild(createNumberRow(rowClass, colClass, firstRow));
const row = document.createElement('div');
row.className = rowClass;
row.appendChild(createNumberCol(colClass, ...secondRow[0]));
row.appendChild(createCheckboxCol(colClass + ' my-auto', ...secondRow[1]));
form.appendChild(row);
form.appendChild(createTextRow(rowClass, colClass, thirdRow));
const row2 = document.createElement('div');
row2.className = rowClass;
row2.appendChild(createButtonGroupRow(buttonClass, 'btn-group', fourthRow));
form.appendChild(row2);
resetInputs();
restart();
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function resetInputs () {
  startTime = defaultStartTime;
  periodLength = defaultPeriodLength;
  mode = defaultMode;
  del = defaultDel;
  document.getElementById('startTime').value = startTime;
  document.getElementById('periodLength').value = periodLength;
  document.getElementById('mode').value = mode;
  document.getElementById('del').checked = del;
}

window.guess = function () {
  let resultArtist, resultTitle;
  if (mode === 0 || mode === 1) {
    const inputArtist = document.getElementById('guessArtist');
    const guessArtist = inputArtist.value.toLowerCase();
    inputArtist.value = '';
    resultArtist = guessArtist === song[0].toLowerCase();
  }
  if (mode === 0 || mode === 2) {
    const inputTitle = document.getElementById('guessTitle');
    const guessTitle = inputTitle.value.toLowerCase();
    inputTitle.value = '';
    resultTitle = guessTitle === song[1].toLowerCase();
  }
  check(resultArtist, resultTitle);
};

window.giveUp = function () {
  end('danger', `It was ${song[0]} - ${song[1]}`);
};

function restart () {
  startTime = +document.getElementById('startTime').value;
  periodLength = +document.getElementById('periodLength').value;
  mode = +document.getElementById('mode').value;
  del = document.getElementById('del').checked;
  songIndex = Math.floor(Math.random() * songs.length);
  song = songs[songIndex];
  const container = document.getElementsByClassName('container')[0];
  if (iframe) {
    iframe.remove();
  }
  iframe = document.createElement('iframe');
  iframe.width = 1;
  iframe.height = 1;
  iframe.src = `https://www.youtube.com/embed/${song[2]}?controls=0&start=${startTime}&autoplay=1`;
  iframe.frameBorder = 0;
  iframe.allow = 'autoplay';
  // iframe.style = 'display: none;';
  container.appendChild(iframe);
  document.getElementById('text').innerHTML = '';
  window.locked = false;
}

function check (resultArtist, resultTitle) {
  if (mode === 0) {
    if (resultArtist && resultTitle) {
      end('success', 'Congratulations, your guess is correct.');
    } else if (resultArtist) {
      end('danger', `No, title was ${song[1]}`);
    } else if (resultTitle) {
      end('danger', `No, artist was ${song[0]}`);
    } else {
      end('danger', `No, it was ${song[0]} - ${song[1]}`);
    }
  } else if (mode === 1) {
    if (resultArtist) {
      end('success', 'Congratulations, your guess is correct.');
    } else {
      end('danger', `No, artist was ${song[0]}`);
    }
  } else if (mode === 2) {
    if (resultTitle) {
      end('success', 'Congratulations, your guess is correct.');
    } else {
      end('danger', `No, title was ${song[1]}`);
    }
  }
}

function end (className, text) {
  createAlert(className, text);
  if (del) {
    songs.splice(songIndex, 1);
  }
  window.locked = true;
  createAlert('info', 'Restart the game!');
}
