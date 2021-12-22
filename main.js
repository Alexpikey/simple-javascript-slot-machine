"use strict";
import "./style.css";
import * as PIXI from "pixi.js";

// Create PIXI App
const app = new PIXI.Application({
  width: 450,
  height: 450,
});

// Add PIXI App to DOM container
document.querySelector("#slots").appendChild(app.view);

// Variables
const validReelItems = ["A", "K", "Q", "J", "T"];
const reelAssets = {};
const REELWIDTH = 150;
const SYMBODSIZE = 150;
const reels = [];
const baseTimeout = 2000;
const stopIntervals = 333;

// Load All assets
app.loader
  .add("A", `./assets/A.png`)
  .add("K", `./assets/K.png`)
  .add("Q", `./assets/Q.png`)
  .add("J", `./assets/J.png`)
  .add("T", `./assets/T.png`)
  .load((loader, resources) => {
    // Create Textures from loaded assets
    for (const reelItem of validReelItems) {
      reelAssets[reelItem] = new PIXI.Texture(resources[reelItem].texture);
    }

    // preset reels order
    const reelsData = [
      ["A", "K", "Q", "A", "J", "J", "T", "A", "Q", "T", "A", "J"],
      ["J", "T", "Q", "K", "A", "J", "T", "T", "A", "K", "Q", "Q"],
      ["A", "T", "K", "J", "Q", "Q", "T", "A", "K", "J", "A", "T"],
    ];

    // Container for 3 reels
    const reelsContainer = new PIXI.Container();

    // Populate 3 reels with preset reel order data
    for (const [index, reel] of reelsData.entries()) {
      // Individual reel container
      const reelContainer = new PIXI.Container();

      // Position reels next to each other
      reelContainer.x = index * REELWIDTH;

      // Add individual reel to reels container
      reelsContainer.addChild(reelContainer);

      // Go through preset reel order and populate the reel container with sprite positioning them beneath each other
      for (const [index, item] of reel.entries()) {
        const reelItem = new PIXI.Sprite(reelAssets[item]);
        reelItem.y = index * SYMBODSIZE;

        // Value added to individual reel items to be used later in getting results
        reelItem.itemValue = item;
        reelContainer.addChild(reelItem);
      }

      // Add 3 Clones to reel for the illusion of an infinitely spinning reel
      for (let i = 0; i < 3; i++) {
        const reelItem = new PIXI.Sprite(reelAssets[reel[i]]);
        reelItem.y = SYMBODSIZE * reel.length + i * SYMBODSIZE;
        reelContainer.addChild(reelItem);
      }

      // add reels to blobal variable for use later in animation
      reels.push(reelContainer);
    }

    // Add reels to Global stage
    app.stage.addChild(reelsContainer);

    document.querySelector(".spin").addEventListener("click", (e) => {
      // prevent multiple clicks
      e.target.disabled = true;

      spin();
      stop(e);
    });
  });

app.ticker.add((delta) => {
  // Check which of the reels have the spinning attribute set and spin those reels
  for (const [index, reel] of reels.entries()) {
    if (reel.spinning) {
      // reset position to create infinite spinning illusion
      if (reel.y <= -1800) {
        reel.y = 0;
      }

      // Move reel
      reel.y -= 75;
    }
  }
});

function spin(reel) {
  // set spin status of all reels to true
  for (const reel of reels) {
    reel.spinning = true;
  }
}

function stop(e) {
  // Timeout for different reel items to stop
  let stopTime = baseTimeout;

  // when reels stop results will be stored here
  const results = [];

  for (const reel of reels) {
    // increase time for next reel to stop by the interval which will result in the machine stopping between 2 and 3 seconds
    stopTime += Math.floor(Math.random() * stopIntervals);

    setTimeout(() => {
      //   check if any of the items are cut off when reel stops and adjusts those reels so that it ligns up perfectly
      if (Math.abs(reel.y % 150 !== 0)) {
        reel.y += 75;
      }

      // Stop the reel
      reel.spinning = false;

      // get center item in reel, -1 to get center as the calculation gets the index of the top element in reel
      let currentCenterIndex = Math.abs(reel.y / 150 - 1);

      // account for clones
      if (currentCenterIndex >= 12) {
        console.log("clone");
        currentCenterIndex -= 12;
      }

      // Collect results
      results.push(reel.children[currentCenterIndex].itemValue);

      // Finish Condition
      if (results.length === 3) {
        // Re-enabele button to be able to spin again
        e.target.disabled = false;
        console.log(results);

        // Win condition
        const win = results.every((val, index, arr) => val === arr[0]);

        win ? alert("Winner") : console.log("try again");
      }
    }, stopTime);
  }
}
