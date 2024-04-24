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

let playing = false,
  currentPlay = 0,
  shuffling = false,
  repeating = false,
  favorites = [],
  audio = new Audio(),
  songsContainer = [];

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
  .catch((err) => {
    console.log("Lỗi: " + err);
  });

const playlistContainer = document.querySelector("#playlist"),
  infoWrapper = document.querySelector(".song-info"),
  coverImage = document.querySelector(".bg-img"),
  discImage = document.querySelector(".disc-img"),
  idSong = document.querySelector(".num"),
  songWrapper = document.querySelector(".song");

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

// audio.src = ;

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

const playPauseBtn = document.querySelector("#playpause"),
  nextBtn = document.querySelector("#forward"),
  prevBtn = document.querySelector("#backward"),
  shuffleBtn = document.querySelector("#shuffle"),
  repeatBtn = document.querySelector("#repeat");

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
    audio.play();
    return;
  }
  if (currentPlay < songsContainer.length - 1) {
    currentPlay++;
  } else {
    currentPlay = 0;
  }
  loadSong(currentPlay);

  if (playing) {
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
    audio.play();
    return;
  }

  if (currentPlay > 0) {
    currentPlay--;
  } else {
    currentPlay = songsContainer.length - 1;
  }
  loadSong(currentPlay);

  if (playing) {
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

const shuffleSong = () => {
  if (shuffling) {
    currentPlay = Math.floor(Math.random() * songsContainer.length);
  }
};

repeatBtn.addEventListener("click", () => {
  repeating = !repeating;
  repeatBtn.classList.toggle("active");

  shuffling = false;
  shuffleBtn.classList.remove("active");
});

audio.addEventListener("ended", () => {
  if (repeating) {
    loadSong(currentPlay);
    audio.play();
  } else {
    if (currentPlay === songsContainer.length - 1) {
      audio.pause();
      playPauseBtn.classList.replace("fa-circle-pause", "fa-circle-play");
      currentPlay = false;
    } else {
      nextSong();
      audio.play();
    }
  }
});

const highlightSong = () => {};
