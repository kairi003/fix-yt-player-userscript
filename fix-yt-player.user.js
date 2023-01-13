// ==UserScript==
// @name         FixYTPlayer
// @namespace    https://github.com/kairi003/
// @version      1.1.2
// @description  Fix an YouTube player on window.
// @author       kairi003
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/kairi003/fix-ytplayer-userscript/raw/master/fix-yt-player.user.js
// @downloadURL  https://github.com/kairi003/fix-ytplayer-userscript/raw/master/fix-yt-player.user.js
// @run-at       document-end
// ==/UserScript==

{
  // Define constants
  const SUFFIX = "_FixYTPlayer";
  const PIN_ID = "pin" + SUFFIX;
  const FIXED_CLS = "fixed" + SUFFIX;
  const ROOT = document.documentElement;

  const chrome = {
    local: {
      storage: {
        get: async function (keys, callback) {
          const values = keys.map(localStorage.getItem);
          callback(values);
        },
        set: function (items, callback) {
          Object.entries(items).forEach((it) => localStorage.setItem(...it));
          callback();
        },
      },
    },
  };

  // Insert the static style tag
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
    #pin_FixYTPlayer {
      display: block;
      margin: 10px;
      position: absolute;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      z-index: 1200;
    
      opacity: 1;
      transition: all 0.3s;
    
      fill: #999;
      fill-opacity: .85;
      stroke: #fff;
      stroke-opacity: .85;
      stroke-width: 4px;
    
      cursor: pointer;
    }
    
    .ytp-autohide #pin_FixYTPlayer {
      opacity: 0;
    }
    
    body.fixed_FixYTPlayer #pin_FixYTPlayer {
      fill: #fff;
      stroke: #777;
    }
    
    #pin_FixYTPlayer:hover {
      filter: brightness(1.2);
    }
    
    body.fixed_FixYTPlayer #player-theater-container {
      position: fixed !important;
      z-index: 10000;
    }
    
    body.fixed_FixYTPlayer #player {
      position: fixed !important;
      height: var(--fytp-player-height);
      width: var(--fytp-primary-colomn-width);
      z-index: 10000;
    }
    
    body.fixed_FixYTPlayer #below {
      padding-top: var(--fytp-player-height);
    }
    
    body.fixed_FixYTPlayer ytd-watch-flexy[theater] #below {
      padding-top: inherit;
    }
    
    body.fixed_FixYTPlayer ytd-watch-flexy[theater] #columns {
      padding-top: clamp(480px, 56.25vw, calc(100vh - 169px));
    }
    </style>`
  );

  // Set fixed status from localStorage
  chrome.storage.local.get(["fixed"], ({ fixed }) =>
    ROOT.classList.toggle(FIXED_CLS, fixed)
  );

  // Create the pin element
  const pin = document.createElement("div");
  pin.id = PIN_ID;
  pin.innerHTML = `<svg height="100%" width="100%" viewBox="0 0 100 100" version="1.1"><path d="M69.498 0 57.471 12.027l4.0449 4.0469-13.943 13.943c-11.309-2.1215-23.726 1.3709-32.141 9.2508-6.2204 4.3128 3.4082 8.0412 5.8102 11.946 2.8462 3.3845 7.7486 6.663 9.3061 10.151-10.183 12.878-20.365 25.756-30.548 38.634 13.032-10.31 26.075-20.606 39.1-30.924 6.2845 6.2852 12.569 12.57 18.854 18.855 9.1584-9.087 14.625-22.6 12.029-35.504l13.943-13.943 4.0469 4.0449 12.027-12.027c-10.079-10.254-20.24-20.438-30.502-30.502z"></path></svg>`;
  pin.addEventListener("click", (event) => {
    const status = ROOT.classList.toggle(FIXED_CLS);
    chrome.storage.local.set({ fixed: status });
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  });

  // Define video.style.height Observer
  /** @type {MutationCallback} */
  const mutationCallback = ([mutation]) => {
    const height = mutation.target?.style?.height;
    ROOT.style.setProperty("--fytp-player-height", height);
  };
  const heightObserver = new MutationObserver(mutationCallback);

  // Define primary-inner.width Observer
  /** @type {ResizeObserverCallback} */
  const resizeCallback = ([entry]) => {
    const width = entry?.contentBoxSize[0]?.inlineSize ?? 0;
    ROOT.style.setProperty("--fytp-primary-colomn-width", width + "px");
  };
  const widthObserver = new ResizeObserver(resizeCallback);

  // Wait until the video exists
  const intervalID = setInterval(() => {
    const video = document.querySelector(
      "#player-container #ytd-player video.html5-main-video"
    );
    const primary = document.getElementById("primary-inner");
    if (video && primary) {
      clearInterval(intervalID);
      heightObserver.observe(video, {
        attributes: true,
        attributeFilter: ["style"],
      });
      mutationCallback([{ target: video }]);
      widthObserver.observe(primary);
      video.parentElement.insertBefore(pin, video);
    }
  }, 100);
}
