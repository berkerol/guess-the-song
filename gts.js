/* global songs createTextRow createNumberRow createCheckboxCol createButtonGroupRow createDropdownCol createRow createAlert keyDownHandler keyUpHandler */
const defaultStartTime = 0;
const defaultDuration = 30;
const defaultDel = true;
let startTime;
let duration;
let mode = 0;
let del;

let songIndex;
let song;
let iframe;
let timeout;

window.locked = true;

const form = document.getElementById('form');
const rowClass = 'row justify-content-center';
const colClass = 'col-5 col-md-4 col-lg-3 mb-3';
const buttonClass = 'col-6 col-md-4 col-lg-3 mb-3 my-auto';
const firstRow = [['Start Time', 'startTime', '0', '600'], ['Duration', 'duration', '0', '30']];
const secondRow = [[['primary dropdown-toggle', '', 'm', 'pen', '<span id="mode-text">Change <u>m</u>ode</span>'], 'mode', [['0', 'Artist & Title'], ['1', 'Only Artist'], ['2', 'Only Title']]], ['<u>D</u>elete song after round', 'del', 'd']];
const thirdRow = [['Guess Artist', 'guessArtist'], ['Guess Title', 'guessTitle']];
const fourthRow = [['success', 'if(!locked)window.guess()', 'g', 'search', '<u>G</u>uess'], ['danger', 'if(!locked)giveUp()', 'u', 'times', 'Give <u>U</u>p'], ['info', 'restart()', 'e', 'sync', 'R<u>e</u>start']];
form.appendChild(createNumberRow(rowClass, colClass, firstRow));
form.appendChild(createRow(rowClass, [createDropdownCol(colClass, ...secondRow[0]), createCheckboxCol(colClass + ' my-auto', ...secondRow[1])]));
form.appendChild(createTextRow(rowClass, colClass, thirdRow));
form.appendChild(createRow(rowClass, [createButtonGroupRow(buttonClass, 'btn-group', fourthRow)]));
document.querySelectorAll('.dropdown-item').forEach(e => {
  e.addEventListener('click', function () {
    document.getElementById('mode-text').innerText = this.innerText;
    mode = +this.dataset.bsValue;
    if (mode === 0) {
      document.getElementById('guessArtist').disabled = false;
      document.getElementById('guessTitle').disabled = false;
    } else if (mode === 1) {
      document.getElementById('guessArtist').disabled = false;
      document.getElementById('guessTitle').disabled = true;
    } else if (mode === 2) {
      document.getElementById('guessArtist').disabled = true;
      document.getElementById('guessTitle').disabled = false;
    }
  });
});
resetInputs();
restart();
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function resetInputs () {
  startTime = defaultStartTime;
  duration = defaultDuration;
  del = defaultDel;
  document.getElementById('startTime').value = startTime;
  document.getElementById('duration').value = duration;
  document.getElementById('del').checked = del;
}

window.guess = function () {
  if (mode === 0) {
    const resultArtist = check('guessArtist', song[0]);
    const resultTitle = check('guessTitle', song[1]);
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
    if (check('guessArtist', song[0])) {
      end('success', 'Congratulations, your guess is correct.');
    } else {
      end('danger', `No, artist was ${song[0]}`);
    }
  } else if (mode === 2) {
    if (check('guessTitle', song[1])) {
      end('success', 'Congratulations, your guess is correct.');
    } else {
      end('danger', `No, title was ${song[1]}`);
    }
  }
};

window.giveUp = function () {
  end('danger', `It was ${song[0]} - ${song[1]}`);
};

function restart () {
  startTime = +document.getElementById('startTime').value;
  duration = +document.getElementById('duration').value;
  del = document.getElementById('del').checked;
  songIndex = Math.floor(Math.random() * songs.length);
  song = songs[songIndex];
  window.clearTimeout(timeout);
  if (iframe) {
    iframe.remove();
  }
  iframe = document.createElement('iframe');
  iframe.width = 1;
  iframe.height = 1;
  iframe.src = `https://www.youtube.com/embed/${song[2]}?controls=0&start=${startTime}&autoplay=1`;
  iframe.allow = 'autoplay';
  timeout = window.setTimeout(function () {
    iframe.remove();
  }, duration * 1000);
  document.getElementsByClassName('container')[0].appendChild(iframe);
  document.getElementById('text').innerHTML = '';
  window.locked = false;
}

function check (id, guess) {
  const input = document.getElementById(id);
  const inputLowercase = input.value.toLowerCase();
  input.value = '';
  return inputLowercase === guess.toLowerCase();
}

function end (className, text) {
  createAlert(className, text);
  if (del) {
    songs.splice(songIndex, 1);
  }
  window.locked = true;
  createAlert('info', 'Restart the game!');
}
