"use strict";

const slotMachine = {
  reelElements: document.querySelectorAll(".reel"),
  scrollPositions: [0, 0, 0],
  baseTimeout: 2000,
  stopIntervals: 333,
  reelSets: [],
  spinButton: document.querySelector(".spin"),
  playAgainButton: document.querySelector(".play-again"),
  winContainer: document.querySelector(".win-container"),
  animationIds: [],
  currentCenterIndexes: [],
  reels: [
    ["A", "K", "Q", "A", "J", "J", "T", "A", "Q", "T", "A", "J"],
    ["J", "T", "Q", "K", "A", "J", "T", "T", "A", "K", "Q", "Q"],
    ["A", "T", "K", "J", "Q", "Q", "T", "A", "K", "J", "A", "T"],
  ],
  setup() {
    // Loop through all 3 reels
    for (const [index, reel] of this.reelElements.entries()) {
      // Collect all Items for each of the 3 reels
      const itemCollection = [];

      // Loop through the reels and populate all reels in the DOM with images of items defined on the slotmachine reels array
      for (const reelItem of this.reels[index]) {
        const item = document.createElement("img");
        item.src = `./assets/${reelItem}.png`;
        item.classList.add("reelItem");
        reel.appendChild(item);
        itemCollection.push(item);
      }

      //   collect individual reel tiles in set of 3
      this.reelSets.push([...itemCollection]);
    }

    for (const [reelIndex, reel] of this.reelSets.entries()) {
      // collect first 3 reel items as clones and add them to the dom on each reel to help with the illusion of an infinitely revolving reel
      for (let index = 0; index < 3; index++) {
        let clone = reel[index].cloneNode(true);
        clone.classList.add("clone");
        this.reelElements[reelIndex].appendChild(clone);
      }
    }

    // bind 'this' as the callback function's this refers to the button that is clicked on
    this.spinButton.addEventListener("click", this.spinClickHandler.bind(this));
  },
  spinClickHandler() {
    // disable button to avoid multiple clicks on spin button
    this.spinButton.disabled = true;

    // reset reel indexes
    this.currentCenterIndexes = [];

    // spin each of the 3 reels
    for (const [index, reel] of this.reelElements.entries()) {
      this.spin(index, reel);
    }

    // stop functionality
    this.stop();
  },
  spin(index, reel) {
    // check if scrollposition of reel has exceeded the maximum length of the reel. Will reset if true to create infinite looping reel illusion
    if (this.scrollPositions[index] < -1200) {
      this.scrollPositions[index] = 0;
    }
    this.scrollPositions[index] -= 50;
    reel.style.top = `${this.scrollPositions[index]}px`;

    // store the animation ID's for each of the reels to stop it later, and rebind this as it is s recursive function
    this.animationIds[index] = requestAnimationFrame(
      this.spin.bind(this, index, reel)
    );
  },

  stop() {
    //   minimum time till machine stops
    let stopTime = this.baseTimeout;

    for (const [index, reelElement] of this.reelElements.entries()) {
      // increase time for next reel to stop by the interval which will result in the machine stopping between 2 and 3 seconds
      stopTime += Math.floor(Math.random() * this.stopIntervals);

      setTimeout(() => {
        //   check if any of the items are cut off when reel stops and adjusts those reels so that it ligns up perfectly
        if (Math.abs(this.scrollPositions[index]) % 100 !== 0) {
          this.scrollPositions[index] += 50;
          reelElement.style.top = `${this.scrollPositions[index]}px`;
        }

        // stop current reel
        cancelAnimationFrame(this.animationIds[index]);

        // get center item in reel, -1 to get center as the calculation gets the index of the top element in reel
        let currentCenterIndex = Math.abs(
          this.scrollPositions[index] / 100 - 1
        );

        // account for clones
        if (currentCenterIndex >= 12) {
          currentCenterIndex -= 12;
        }

        this.currentCenterIndexes.push(currentCenterIndex);

        if (this.currentCenterIndexes.length === 3) {
          this.finish();
        }
      }, stopTime);
    }
  },
  finish() {
    // enable button to spin again
    this.spinButton.disabled = false;

    const currentCenterItems = [];

    // extract the values of reel items that is currently in the center
    for (const [index, value] of this.currentCenterIndexes.entries()) {
      currentCenterItems.push(this.reels[index][value]);
    }

    // Win condition
    const win = currentCenterItems.every((val, index, arr) => val === arr[0]);

    win ? this.win() : console.log("try again");
  },
  win() {
    //   Show win container
    this.playAgainButton.addEventListener("click", () => location.reload());
    this.winContainer.style.display = "flex";
  },
};

slotMachine.setup();
