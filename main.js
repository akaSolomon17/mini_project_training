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
    updateFavorite();
    loadSong(currentPlay);
  })
  .then(() => {
    const playlistRows = document.querySelectorAll(".song-table tr");

    playlistRows.forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        playSong(id - 1);
      });
    });
  })
  .catch((err) => {
    console.log("Lỗi: " + err);
  });

const fetchPlaylist = (songsContainer) => {
  playlistContainer.innerHTML = "";
  let songCount = 0;
  songsContainer.forEach((song) => {
    const { id, name, path, ads_img } = song;

    const isFavorites = favorites.includes(id);
    const tr = document.createElement("tr");

    tr.classList.add(`song${id}`);
    tr.setAttribute("data-id", id);
    tr.innerHTML = `
        <td class="num fs-5 fw-medium">${id}</td>
        <td class="song-title fs-5 fw-medium">${name}</td>
        <td class="like justify-content-center">
          <i class="${isFavorites ? "fa-solid" : "fa-regular"} fa-heart ${
      isFavorites ? "active" : ""
    }"></i>
        </td>
        <td class="length fs-5"></td>
    `;
    playlistContainer.appendChild(tr);

    songCount++;

    if (songCount % 3 === 0) {
      const adTr = document.createElement("tr");
      adTr.innerHTML = `
        <td colspan="4" class="ads-td">
          <img src="${ads_img}" alt="Ads image" class="ads-img">  
        </td>
      `;
      playlistContainer.appendChild(adTr);
    }

    tr.querySelector(".like").addEventListener("click", (e) => {
      if (e.target.classList.contains("fa-heart")) {
        addToFavorite(id, e);
        e.target.classList.toggle("active");
        e.target.classList.toggle("fa-solid");
        return;
      }
    });
    tr.addEventListener("click", () => {
      console.log(favorites);
    });
    const audioForDuration = new Audio(`${path}`);
    audioForDuration.addEventListener("loadedmetadata", () => {
      const duration = audioForDuration.duration;
      let songDuration = formatTime(duration);
      tr.querySelector(".length").innerText = songDuration;
    });
  });
};

const formatTime = (time) => {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${seconds}`;
};

const loadSong = (index) => {
  try {
    let songName = songsContainer[index].name;
    let artistName = songsContainer[index].artist.join(", ");
    coverImage.src = songsContainer[index].img;
    discImage.src = songsContainer[index].img;
    audio.src = songsContainer[index].path;

    infoWrapper.innerHTML = `
  <div class="current-song fs-1 mb-2  fw-bolder">${songName}</div>
  <div class="song-details d-flex align-items-center mb-4">
    <div class=" fs-5 fw-medium">${artistName}</div>
  </div>`;
  } catch (error) {
    return;
  }
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

const shuffleSong = () => {
  if (unplayedSongs.length === 0) {
    unplayedSongs = [...Array(songsContainer.length).keys()];
  }
  let randomIndex = Math.floor(Math.random() * unplayedSongs.length);

  currentPlay = unplayedSongs[randomIndex];
  unplayedSongs.splice(randomIndex, 1);

  console.log(currentPlay);
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

const highlightSong = (index) => {
  const rowsHighlight = document.querySelectorAll(".song-table tr");
  const inverseHighlight = document.querySelectorAll(".song-table tr td");

  rowsHighlight.forEach((row) => {
    const id = row.getAttribute("data-id");
    if (id - 1 === index) {
      row.classList.add("highlight");
    } else {
      row.classList.remove("highlight");
    }
  });
  inverseHighlight.forEach((row) => {
    const id = row.getAttribute("data-id");
    if (id - 1 === index) {
      row.classList.add("inverse-highlight");
    } else {
      row.classList.remove("inverse-highlight");
    }
  });
};
const playSong = (index) => {
  currentPlay = index;
  loadSong(currentPlay);
  audio.play();
  playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
  discImage.classList.remove("stop");
  highlightSong(currentPlay);
};

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

  console.log(clickX, width, progressBarArea);
};

progressBarArea.addEventListener("click", setProgress);

volumeSlider.addEventListener("input", () => {
  const volumeValue = volumeSlider.value;
  audio.volume = volumeValue / 100;
});

volumeIcon.addEventListener("click", () => {
  isMuted = !isMuted;

  if (isMuted) {
    volumeIcon.classList.replace("fa-volume-high", "fa-volume-mute");
    audio.volume = 0;
    volumeSlider.value = 0;
  } else {
    volumeIcon.classList.replace("fa-volume-mute", "fa-volume-high");
    volumeSlider.value = 100;
    const volumeValue = volumeSlider.value / 100;
    audio.volume = volumeValue;
  }
});

const addToFavorite = (index, e) => {
  e.stopPropagation();
  if (favorites.includes(index)) {
    favorites = favorites.filter((item) => item !== index);
  } else {
    favorites.push(index);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
};

const updateFavorite = () => {
  window.addEventListener("load", () => {
    const favoritesData = localStorage.getItem("favorites");
    if (favoritesData) {
      favorites = JSON.parse(favoritesData);
    }

    updateFavoriteIcons();
  });
};

const updateFavoriteIcons = () => {
  const likeIcons = document.querySelectorAll(".like i");
  likeIcons.forEach((icon, index) => {
    const isFavorites = favorites.includes(index + 1);
    if (isFavorites) {
      icon.classList.add("fa-solid", "active");
    } else {
      icon.classList.remove("fa-solid", "active");
    }
  });
};
