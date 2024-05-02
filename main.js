/**
 * Chức năng cần thực hiện:
 * 1. Play/ Pause.
 * 2. Xoay đĩa khi play & Dừng đĩa khi pause.
 * 3. Next / Previous / Autoplay function.
 * 4. Random/Repeat/Normal sẽ dùng chung một nút để chuyển đổi.
 * 5. Highlight bài đáng phát trong playlist.
 * 6. Tua nhạc trên thanh progress và hiển thị thời gian phát nhạc.
 * 7. Volume tăng giảm hoặc tắt âm lượng.
 * 8. Thêm bài nhạc vào dsach yêu thích bằng nút tim, lưu trạng thái yêu thích khi tải lại trang.
 * 9. Thêm 1 banner quảng cáo dưới mỗi 3 bài nhạc trong playlist.
 */
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

const playlistContainer = document.querySelector("#playlist"),
  infoWrapper = document.querySelector(".song-info"),
  coverImage = document.querySelector(".bg-img"),
  discImage = document.querySelector(".disc-img"),
  idSong = document.querySelector(".num"),
  songWrapper = document.querySelector(".song");

const playPauseBtn = document.querySelector("#playpause"),
  nextBtn = document.querySelector("#forward"),
  prevBtn = document.querySelector("#backward"),
  shuffleBtn = document.querySelector("#shuffle"),
  repeatBtn = document.querySelector("#repeat");

const progressBar = document.querySelector(".progress-bar"),
  progressBarArea = document.querySelector(".bar-wrapper"),
  currentTimeElement = document.querySelector(".current-time"),
  durationElement = document.querySelector(".duration"),
  volumeSlider = document.querySelector(".volume-slider"),
  volumeIcon = document.querySelector(".volume");

let playing = false,
  currentPlay = 0,
  shuffling = false,
  repeating = false,
  favorites = [],
  audio = new Audio(),
  unplayedSongs = [],
  songsContainer = [],
  isMuted = false;

fetch("http://localhost:3000/songs")
  .then((response) => response.json())
  .then((data) => {
    data.map((song) => {
      songsContainer.push(song);
    });
  })
  .then(() => {
    fetchPlaylist(songsContainer);
    loadSong(currentPlay);
  })
  .then(() => {
    const playlistRows = document.querySelectorAll(".song-table tr");

    playlistRows.forEach((row, index) => {
      row.addEventListener("click", () => {
        playSong(index);
      });
    });
  })
  .catch((err) => {
    console.log("Lỗi: " + err);
  });

function fetchPlaylist(songsContainer) {
  playlistContainer.innerHTML = "";
  songsContainer.forEach((song) => {
    const { id, name, path } = song;
    const tr = document.createElement("tr");

    tr.classList.add(`song${id}`);
    tr.innerHTML = `
        <td class="num fs-5 fw-medium">${id}</td>
        <td class="song-title fs-5 fw-medium">${name}</td>
        <td class="like justify-content-center">
        <i class="fa-regular fa-heart"></i>
        </td>
        <td class="length fs-5"></td>
    `;
    playlistContainer.appendChild(tr);

    const audioForDuration = new Audio(`${path}`);
    audioForDuration.addEventListener("loadedmetadata", () => {
      const duration = audioForDuration.duration;
      let songDuration = formatTime(duration);
      tr.querySelector(".length").innerText = songDuration;
    });
  });
}

const formatTime = (time) => {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${seconds}`;
};

const loadSong = (index) => {
  let songName = songsContainer[index].name;
  let artistName = songsContainer[index].artist.join(", ");

  infoWrapper.innerHTML = `
  <div class="current-song fs-1 mb-2  fw-bolder">${songName}</div>
  <div class="song-details d-flex align-items-center mb-4">
    <div class=" fs-5 fw-medium">${artistName}</div>
  </div>`;

  coverImage.src = songsContainer[index].img;
  discImage.src = songsContainer[index].img;
  audio.src = songsContainer[index].path;
};

playPauseBtn.addEventListener("click", () => {
  if (playing) {
    playPauseBtn.classList.replace("fa-circle-pause", "fa-circle-play");
    playing = false;
    audio.pause();
    discImage.classList.add("stop");
  } else {
    playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
    playing = true;
    audio.play();
    highlightSong(currentPlay);
    discImage.classList.remove("stop");
  }
});

const nextSong = () => {
  if (!playing) {
    playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
    discImage.classList.remove("stop");
    playing = true;
  }
  if (shuffling) {
    shuffleSong();
    loadSong(currentPlay);
    highlightSong(currentPlay);
    audio.play();
    return;
  }
  if (currentPlay < songsContainer.length - 1) {
    currentPlay++;
  } else {
    currentPlay = 0;
  }
  loadSong(currentPlay);
  highlightSong(currentPlay);
  if (playing) {
    highlightSong(currentPlay);
    audio.play();
  }
};

const prevSong = () => {
  if (!playing) {
    playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
    discImage.classList.remove("stop");
    playing = true;
  }
  if (shuffling) {
    shuffleSong();
    loadSong(currentPlay);
    highlightSong(currentPlay);
    audio.play();
    return;
  }

  if (currentPlay > 0) {
    currentPlay--;
  } else {
    currentPlay = songsContainer.length - 1;
  }
  loadSong(currentPlay);
  highlightSong(currentPlay);

  if (playing) {
    highlightSong(currentPlay);
    audio.play();
  }
};

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

const shuffleButton = () => {
  shuffling = !shuffling;
  shuffleBtn.classList.toggle("active");

  repeating = false;
  repeatBtn.classList.remove("active");
};

shuffleBtn.addEventListener("click", shuffleButton);

// SHUFFLE FUNCTION
const shuffleSong = () => {
  if (unplayedSongs.length === 0) {
    unplayedSongs = [...Array(songsContainer.length).keys()];
  }
  let randomIndex = Math.floor(Math.random() * unplayedSongs.length);

  currentPlay = unplayedSongs[randomIndex];
  unplayedSongs.splice(randomIndex, 1);
};

repeatBtn.addEventListener("click", () => {
  repeating = !repeating;
  repeatBtn.classList.toggle("active");

  shuffling = false;
  shuffleBtn.classList.remove("active");
});

// Behavior when the song end
audio.addEventListener("ended", () => {
  if (repeating) {
    loadSong(currentPlay);
    audio.play();
  } else {
    if (currentPlay === songsContainer.length - 1) {
      audio.pause();
      playPauseBtn.classList.replace("fa-circle-pause", "fa-circle-play");
      shuffleBtn.classList.remove("active");
      discImage.classList.add("stop");
      currentPlay = false;
      shuffling = false;
    } else {
      nextSong();
      audio.play();
    }
  }
});

// Highlight song is playing in playlist
const highlightSong = (index) => {
  const rowsHighlight = document.querySelectorAll(".song-table tr");
  const inverseHighlight = document.querySelectorAll(".song-table tr td");

  rowsHighlight.forEach((row, idx) => {
    if (idx === index) {
      row.classList.add("highlight");
    } else {
      row.classList.remove("highlight");
    }
  });
  inverseHighlight.forEach((row, idx) => {
    if (idx === index) {
      row.classList.add("inverse-highlight");
    } else {
      row.classList.remove("inverse-highlight");
    }
  });
};

// highlight the first song play
const playSong = (index) => {
  currentPlay = index;
  loadSong(currentPlay);
  audio.play();
  playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
  discImage.classList.remove("stop");
  highlightSong(currentPlay);
};

// Make a progress for each song
const progress = () => {
  let { currentTime, duration } = audio;

  isNaN(duration) ? (duration = 0) : duration;
  isNaN(currentTime) ? (currentTime = 0) : currentTime;

  currentTimeElement.innerHTML = formatTime(currentTime);
  durationElement.innerHTML = formatTime(duration);

  let progressPercentage = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercentage}%`;
};

audio.addEventListener("timeupdate", progress);

const setProgress = (e) => {
  let width = progressBarArea.clientWidth;
  let clickX = e.offsetX;
  let duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
};

progressBarArea.addEventListener("click", setProgress);
