const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "WIND_PLAYER";
const URLS = ["http://localhost:3000/songs", "http://localhost:3000/ads"];

const playlistContainer = $("#playlist"),
  adsContainerDOM = $("#ads"),
  audio = $("#audio"),
  infoWrapper = $(".song-info"),
  coverImage = $(".bg-img"),
  discImage = $(".disc-img"),
  idSong = $(".num"),
  songWrapper = $(".song"),
  playPauseBtn = $("#playpause"),
  nextBtn = $("#forward"),
  prevBtn = $("#backward"),
  shuffleBtn = $("#shuffle"),
  repeatBtn = $("#repeat"),
  progressBar = $(".progress-bar"),
  progressBarArea = $(".bar-wrapper"),
  currentTimeElement = $(".current-time"),
  durationElement = $(".duration"),
  volumeSlider = $(".volume-slider"),
  volumeIcon = $(".volume");

const app = {
  isPlaying: false,
  currentPlay: 0,
  isShuffle: false,
  isRepeat: false,
  favorites: [],
  unplayedSongs: [],
  songsContainer: [],
  adsContainer: [],
  isMuted: false,
  songListened: 0,
  isPopup: false,

  // FUNCTION FETCH(URL)
  fetchUrl: async function (url) {
    console.log("fetch is running");
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Lỗi khi fetch: " + response.status);
      } else {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Lỗi Fetching Data " + error);
      return null;
    }
  },

  // FETCHING DATA
  fetchData: async function () {
    console.log("fetchData is running");
    try {
      const promises = URLS.map((url) => app.fetchUrl(url));

      const result = await Promise.all(promises); // Fetch both ads and songs
      result.forEach((data, index) => {
        if (index === 0) {
          app.songsContainer.push(data);
        } else {
          app.adsContainer.push(data);
        }
      });

      app.loadSong(app.currentPlay); // Load song title, artist name
      app.renderPlaylist(app.songsContainer); // Render playlist
      app.renderAds(app.adsContainer); // Render ads

      const playlistRows = $$(".song-table tr");
      const adsClose = $(".cls_ov.ads");
      console.log(adsClose);
      app.handleEvent(playlistRows);
    } catch (err) {
      console.log("Lỗi: " + err);
    }
  },

  // Render Playlist (Playlist & Song playing)
  renderPlaylist: function (songsContainer) {
    console.log("render is running");

    playlistContainer.innerHTML = ""; // Empty inner html of #playlist
    songsContainer[0].forEach((song) => {
      const { id, path, name } = song;
      //   const isFavorites = this.favorites.includes(id);
      const tr = document.createElement("tr");
      tr.classList.add(`song${id}`);
      tr.setAttribute("data-id", id);
      tr.innerHTML = `
                <td class="num fs-5 fw-medium">${id}</td>
                <td class="song-title fs-5 fw-medium">${name}</td>
                <td class="like justify-content-center">
                <i class="${false ? "fa-solid" : "fa-regular"} fa-heart ${
        false ? "active" : ""
      }"></i>
                </td>
                <td class="length fs-5"></td>
            `;
      playlistContainer.appendChild(tr);

      tr.querySelector(".like").onclick = function (e) {
        if (e.target.classList.contains("fa-heart")) {
          app.addToFavorite(id, e);
          e.target.classList.toggle("active");
          e.target.classList.toggle("fa-solid");
        }
      };

      // Get duration of each song
      const audioForDuration = new Audio(`${path}`);
      audioForDuration.addEventListener("loadedmetadata", () => {
        const duration = audioForDuration.duration;
        let songDuration = app.formatTime(duration);
        tr.querySelector(".length").innerText = songDuration;
      });
    });
  },
  // Render Ads(Popup)
  renderAds: function (adsContainer) {
    console.log("renderAds is running");
    adsContainerDOM.innerHTML = "";

    const ads = adsContainer[0];
    const randomIndex = Math.floor(Math.random() * ads.length);
    const ad = ads[randomIndex]; // Get a random ads element in array

    const { img, link } = ad;
    const div = document.createElement("div");
    div.classList.add("ads-popup");
    div.innerHTML = `
        <a href="#" class="cls_ov ads">Đóng quảng cáo [×]</a>
        <a href="${link}" target="_blank" class="ad-link">
          <img src="${img}" alt="ad" class="ad-img" />
        </a>
    `;
    adsContainerDOM.appendChild(div);

    const adsClose = $(".cls_ov");
    if (adsClose) {
      adsClose.onclick = function () {
        app.closeAds();
      };
    }
  },
  // Count songListened and check if songListened === 3 then popup Ads
  checkAndShowAd: function () {
    app.songListened++;
    console.log(app.songListened);
    if (app.songListened === 3) {
      app.songListened = 0;

      app.renderAds(app.adsContainer);

      adsContainerDOM.style.display = "block";
      app.isPopup = true; // This
      audio.pause();
    }
  },
  closeAds: function () {
    app.isPopup = false;
    adsContainerDOM.style.display = "none";
    audio.play();
  },
  // Format time into 00:00
  formatTime: function (time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${seconds}`;
  },
  // Load Song title and Artist
  loadSong: function (index) {
    playlist = app.songsContainer[0];
    let songName = playlist[index].name;
    let artistName = playlist[index].artist.join(", ");
    coverImage.src = playlist[index].img;
    discImage.src = playlist[index].img;
    audio.src = playlist[index].path;
    infoWrapper.innerHTML = `
                <div class="current-song fs-1 mb-2  fw-bolder">${songName}</div>
                <div class="song-details d-flex align-items-center mb-4">
                    <div class=" fs-5 fw-medium">${artistName}</div>
                </div>
                `;
  },

  // Handle event grouping
  handleEvent: function (playlistRows) {
    const __this = this;

    const cdThumbAnimate = discImage.animate(
      [{ transform: "rotate(360deg)" }],
      {
        duration: 9000,
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();

    playPauseBtn.onclick = function () {
      if (__this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
        __this.highlightSong(__this.currentPlay);
      }
    };
    // Get rows and handle click on playlist
    playlistRows.forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.id;
        if (id) __this.playSongById(id - 1);
        __this.scrollToActiveSong(id - 1);
      });
    });

    // When audio on play...
    audio.onplay = function () {
      __this.isPlaying = true;
      playPauseBtn.classList.replace("fa-circle-play", "fa-circle-pause");
      cdThumbAnimate.play();
    };

    // When audio on pause...
    audio.onpause = function () {
      __this.isPlaying = false;
      playPauseBtn.classList.replace("fa-circle-pause", "fa-circle-play");
      cdThumbAnimate.pause();
    };

    nextBtn.onclick = function () {
      __this.handleNextOrPrev(true, cdThumbAnimate);
    };

    prevBtn.onclick = function () {
      __this.handleNextOrPrev(false, cdThumbAnimate);
    };

    shuffleBtn.onclick = function () {
      __this.isShuffle = !__this.isShuffle;
      shuffleBtn.classList.toggle("active", __this.isShuffle);
      __this.isRepeat = false;
      repeatBtn.classList.remove("active");
    };

    repeatBtn.onclick = function () {
      __this.isRepeat = !__this.isRepeat;
      repeatBtn.classList.toggle("active", __this.isRepeat);
      __this.isShuffle = false;
      shuffleBtn.classList.remove("active");
    };

    audio.onended = function () {
      if (__this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    progressBarArea.onclick = function (e) {
      let width = progressBarArea.clientWidth;
      let clickX = e.offsetX;
      let duration = audio.duration;
      audio.currentTime = (clickX / width) * duration;
      audio.play();
    };

    audio.ontimeupdate = function () {
      let { currentTime, duration } = audio;

      isNaN(duration) ? (duration = 0) : duration;
      isNaN(currentTime) ? (currentTime = 0) : currentTime;

      currentTimeElement.innerHTML = __this.formatTime(currentTime);
      durationElement.innerHTML = __this.formatTime(duration);

      let progressPercentage = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercentage}%`;
    };

    volumeSlider.oninput = function () {
      const volumeValue = volumeSlider.value;
      audio.volume = volumeValue / 100;
    };

    volumeIcon.onclick = function () {
      __this.isMuted = !__this.isMuted;

      if (__this.isMuted) {
        volumeIcon.classList.replace("fa-volume-high", "fa-volume-mute");
        audio.volume = 0;
        volumeSlider.value = 0;
      } else {
        volumeIcon.classList.replace("fa-volume-mute", "fa-volume-high");
        volumeSlider.value = 100;
        const volumeValue = volumeSlider.value / 100;
        audio.volume = volumeValue;
      }
    };
    window.onload = function () {
      const favoritesData = localStorage.getItem("favorites");
      if (favoritesData) {
        __this.favorites = JSON.parse(favoritesData);
      }
      __this.updateFavoriteIcons();
    };
  },

  // OTHER FUNCTIONS
  // Scroll into active song in playlist
  scrollToActiveSong: function (activeSong) {
    const songId = activeSong + 1;
    setTimeout(() => {
      const activeRow = document.querySelector(`.song${songId}`);
      if (activeRow) {
        activeRow.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 100);
  },
  // Handle Next event or Prev event will happen
  handleNextOrPrev: function (isNext, thumbAnimate) {
    app.checkAndShowAd();
    if (app.isShuffle) {
      app.playShuffle();
    } else {
      isNext ? app.nextSong() : app.prevSong();
    }
    if (!app.isPopup) {
      app.playSongById(app.currentPlay);
    } else {
      app.isPlaying = false;
      playPauseBtn.classList.replace("fa-circle-pause", "fa-circle-play");
      thumbAnimate.pause();
    }
    app.highlightSong(app.currentPlay);
    app.scrollToActiveSong(app.currentPlay);
  },

  nextSong: function () {
    app.currentPlay++;
    if (app.currentPlay >= app.songsContainer[0].length) {
      app.currentPlay = 0;
    }
    app.loadSong(app.currentPlay);
  },

  prevSong: function () {
    app.currentPlay--;
    if (app.currentPlay < 0) {
      app.currentPlay = app.songsContainer[0].length - 1;
    }
    app.loadSong(app.currentPlay);
  },

  playShuffle: function () {
    if (app.unplayedSongs.length === 0) {
      app.unplayedSongs = [...Array(app.songsContainer[0].length).keys()];
    }
    let randomIndex = Math.floor(Math.random() * app.unplayedSongs.length);

    app.currentPlay = app.unplayedSongs[randomIndex];
    app.unplayedSongs.splice(randomIndex, 1);

    // console.log(app.currentPlay, app.unplayedSongs);
  },

  // Function Play audio bởi một ID của bài hát
  playSongById: function (index) {
    app.currentPlay = index;
    app.loadSong(app.currentPlay);
    audio.play();
    app.scrollToActiveSong(app.currentPlay);
    app.highlightSong(app.currentPlay);
  },

  highlightSong: function (index) {
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
  },

  addToFavorite: function (index, e) {
    e.stopPropagation();
    if (app.favorites.includes(index)) {
      app.favorites = app.favorites.filter((item) => item !== index);
    } else {
      app.favorites.push(index);
    }

    localStorage.setItem("favorites", JSON.stringify(app.favorites));
  },

  updateFavoriteIcons: function () {
    const favoriteIcons = document.querySelectorAll(".like i");
    favoriteIcons.forEach((icon, index) => {
      const isFavorites = app.favorites.includes(index + 1);
      if (isFavorites) {
        icon.classList.add("fa-solid", "active");
      } else {
        icon.classList.remove("fa-solid", "active");
      }
    });
  },

  start: function () {
    this.fetchData();
  },
};

app.start();
