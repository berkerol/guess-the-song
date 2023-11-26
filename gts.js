/* global songs createTextRow createNumberRow createCheckboxCol createButtonGroupRow createDropdownCol createDatalist deleteOptionFromDatalist createRow createModalButton createModal createAlert keyDownHandler keyUpHandler */
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

let currentSongs = [];
let artistsAll = [];

const form = document.getElementById('form');
const rowClass = 'row justify-content-center';
const colClass = 'col-5 col-md-4 col-lg-3 mb-3';
const buttonClass = 'col-6 col-md-4 col-lg-3 mb-3 my-auto';
const firstRow = [['Start Time', 'startTime', '0', '600'], ['Duration', 'duration', '0', '30']];
const secondRow = [[['primary dropdown-toggle', '', 'm', 'pen', '<span id="mode-text">Change <u>m</u>ode</span>'], 'mode', [['0', 'Artist & Title'], ['1', 'Only Artist'], ['2', 'Only Title']]], ['<u>D</u>elete song after round', 'del', 'd']];
const thirdRow = [['Guess Artist', 'guessArtist'], ['Guess Title', 'guessTitle']];
const fourthRow = [['success', 'if(!locked)window.guess()', 'g', 'search', '<u>G</u>uess'], ['danger', 'if(!locked)giveUp()', 'u', 'times', 'Give <u>U</u>p'], ['info', 'restart()', 'e', 'sync', 'R<u>e</u>start'], ['info', '', 's', 'cog', '<u>S</u>ettings']];
form.appendChild(createNumberRow(rowClass, colClass, firstRow));
form.appendChild(createRow(rowClass, [createDropdownCol(colClass, ...secondRow[0]), createCheckboxCol(colClass + ' my-auto', ...secondRow[1])]));
form.appendChild(createTextRow(rowClass, colClass, thirdRow));
form.appendChild(createRow(rowClass, [createButtonGroupRow(buttonClass, 'btn-group', fourthRow)]));
createModalButton(form.children[3].children[0].children[0], 3);
let minYear = +songs[0][3];
let maxYear = +songs[0][3];
const genres = [];
for (const song of songs) {
  genres.push(...song[4]);
  if (+song[3] < minYear) {
    minYear = +song[3];
  }
  if (+song[3] > maxYear) {
    maxYear = +song[3];
  }
}
const uniqueGenres = Array.from(new Set(genres));
uniqueGenres.unshift('All');
const modalElements = [[['Min year', 'minYear', 1, 99999, 'number'], ['Max year', 'maxYear', 1, 99999, 'number']], [[['primary dropdown-toggle', undefined, 'e', 'music', 'G<u>e</u>nres'], 'genres-dropdown', uniqueGenres, 'dropdown-check']]];
createModal(modalElements);
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
const checkboxGenreAll = document.querySelectorAll('#All.form-check-input')[0];
const checkboxGenreOthers = document.querySelectorAll(':not(#All).form-check-input');
checkboxGenreAll.addEventListener('click', function () {
  if (this.checked) {
    checkboxGenreOthers.forEach(e => {
      e.checked = false;
    });
  }
});
checkboxGenreOthers.forEach(e => {
  e.addEventListener('click', function () {
    if (this.checked) {
      checkboxGenreAll.checked = false;
    }
  });
});
resetInputs();
save();
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
  document.getElementById('minYear').value = minYear;
  document.getElementById('maxYear').value = maxYear;
  checkboxGenreAll.checked = true;
}

function save () {
  const currentMinYear = +document.getElementById('minYear').value;
  const currentMaxYear = +document.getElementById('maxYear').value;
  const currentGenres = [];
  if (checkboxGenreAll.checked) {
    currentGenres.push(...uniqueGenres);
  } else {
    checkboxGenreOthers.forEach(e => {
      if (e.checked) {
        currentGenres.push(e.id);
      }
    });
  }
  currentSongs = [];
  for (const song of songs) {
    if (song[3] >= currentMinYear && song[3] <= currentMaxYear && song[4].some(genre => currentGenres.includes(genre))) {
      currentSongs.push(song);
    }
  }
  artistsAll = [];
  const titles = [];
  for (const song of currentSongs) {
    artistsAll.push(song[0]);
    titles.push(song[1]);
  }
  form.appendChild(createDatalist('guessArtist', 'guessArtistDatalist', Array.from(new Set(artistsAll))));
  form.appendChild(createDatalist('guessTitle', 'guessTitleDatalist', titles));
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
  songIndex = Math.floor(Math.random() * currentSongs.length);
  song = currentSongs[songIndex];
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
    currentSongs.splice(songIndex, 1);
    artistsAll.splice(artistsAll.indexOf(song[0]), 1);
    if (artistsAll.indexOf(song[0]) === -1) {
      deleteOptionFromDatalist('guessArtistDatalist', song[0]);
    }
    deleteOptionFromDatalist('guessTitleDatalist', song[1]);
  }
  window.locked = true;
  createAlert('info', 'Restart the game!');
}
