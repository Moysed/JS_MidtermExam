window.onload = function() {
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  const gridSize = 50;
  const gridCols = 8;
  const gridRows = 8;

  let candySprites = []; // Array to hold candy sprite objects
  let selectedCandy = null; // Track the selected candy
  let isDragging = false;

  function CandySprite(x, y, image) {
      this.x = x;
      this.y = y;
      this.image = image;
      this.isLoaded = false; // Track if the image is loaded
  }

  CandySprite.prototype.draw = function() {
      if (this.isLoaded) {
          ctx.drawImage(this.image, this.x, this.y, gridSize, gridSize);
      }
  };

  // Initialize candy sprites (replace with your candy images)
  let imagesToLoad = gridCols * gridRows;
  for (let i = 0; i < gridCols; i++) {
      candySprites.push([]);
      for (let j = 0; j < gridRows; j++) {
          const candyImage = new Image();
          candyImage.src = `./part${Math.floor(Math.random() * 12) + 1}.png`;

          // Create a new CandySprite and store it in the grid
          const candySprite = new CandySprite(i * gridSize, j * gridSize, candyImage);
          candySprites[i].push(candySprite);

          // Set the image load event
          candyImage.onload = function() {
              candySprite.isLoaded = true; // Mark as loaded
              imagesToLoad--;
              if (imagesToLoad === 0) {
                  drawCandy(); // Draw the grid and candies once all images are loaded
              }
          };
      }
  

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2; // Increase line width for bolder grid lines
    
    for (let i = 0; i <= gridCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, gridRows * gridSize);
        ctx.stroke();
    }
    for (let i = 0; i <= gridRows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(gridCols * gridSize, i * gridSize);
        ctx.stroke();
    }
}

  function drawCandies() {
    for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
            const candy = candySprites[i][j];
            candy.draw();
            
            // Highlight the selected candy
            if (selectedCandy === candy) {
                ctx.strokeStyle = '#FF0000'; // Red highlight
                ctx.lineWidth = 3;
                ctx.strokeRect(candy.x, candy.y, gridSize, gridSize);
            }
        }
    }
}
  }

  function drawCandy() {
      drawGrid();
      drawCandies();
  }

  function findCandyAt(x, y) {
      const col = Math.floor(x / gridSize);
      const row = Math.floor(y / gridSize);
      if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
          return candySprites[col][row];
      }
      return null;
  }

  function canSwapCandies(col1, row1, col2, row2) {
    const dx = Math.abs(col1 - col2);
    const dy = Math.abs(row1 - row2);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

  function checkForMatches() {
    let matches = [];

    // Check horizontal matches
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols - 2; col++) {
            if (isSameCandy(col, row, col + 1, row) && isSameCandy(col, row, col + 2, row)) {
                matches.push({col, row}, {col: col + 1, row}, {col: col + 2, row});
                // Check for more than 3 in a row
                let nextCol = col + 3;
                while (nextCol < gridCols && isSameCandy(col, row, nextCol, row)) {
                    matches.push({col: nextCol, row});
                    nextCol++;
                }
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < gridCols; col++) {
        for (let row = 0; row < gridRows - 2; row++) {
            if (isSameCandy(col, row, col, row + 1) && isSameCandy(col, row, col, row + 2)) {
                matches.push({col, row}, {col, row: row + 1}, {col, row: row + 2});
                // Check for more than 3 in a column
                let nextRow = row + 3;
                while (nextRow < gridRows && isSameCandy(col, row, col, nextRow)) {
                    matches.push({col, row: nextRow});
                    nextRow++;
                }
            }
        }
    }

    return matches;
}

function isSameCandy(col1, row1, col2, row2) {
    return candySprites[col1][row1].image.src === candySprites[col2][row2].image.src;
}


    // Touch events
    canvas.addEventListener('touchstart', (event) => {
      event.preventDefault();
      console.log('Touch start detected');
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
  
      selectedCandy = findCandyAt(x, y);
      if (selectedCandy) {
        isDragging = true;
        console.log('Candy selected at', x, y);
      }
    });
  
    canvas.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if (isDragging && selectedCandy) {
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
  
        console.log('Touch move detected at', x, y);
        
        // Clear previous highlights
        drawCandy();
        ctx.strokeStyle = '#FF0000'; // Red highlight
        ctx.lineWidth = 3;
        ctx.strokeRect(selectedCandy.x, selectedCandy.y, gridSize, gridSize);
      }
    });
  
    canvas.addEventListener('touchend', (event) => {
      event.preventDefault();
      if (isDragging && selectedCandy) {
        const touch = event.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const endX = touch.clientX - rect.left;
        const endY = touch.clientY - rect.top;
  
        const startCol = Math.floor(selectedCandy.x / gridSize);
        const startRow = Math.floor(selectedCandy.y / gridSize);
        const endCol = Math.floor(endX / gridSize);
        const endRow = Math.floor(endY / gridSize);
  
        console.log('Touch end detected at', endX, endY);
  
        if (canSwapCandies(startCol, startRow, endCol, endRow)) {
          swapCandies(startCol, startRow, endCol, endRow);
        } else {
          // If not a valid swap, return the selected candy to its original position
          selectedCandy.x = startCol * gridSize;
          selectedCandy.y = startRow * gridSize;
        }
      }
  
      isDragging = false;
      selectedCandy = null;
      drawCandy();
    });
  }  
 
  // Mouse events
  canvas.addEventListener('mousedown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      selectedCandy = findCandyAt(x, y);
      if (selectedCandy) {
          isDragging = true;
      }
  });

  canvas.addEventListener('mousemove', (event) => {
      if (isDragging && selectedCandy) {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          // Highlight the candy being dragged
          drawCandy();
          ctx.strokeStyle = '#FF0000'; // Red highlight
          ctx.lineWidth = 3;
          ctx.strokeRect(selectedCandy.x, selectedCandy.y, gridSize, gridSize);
      }
  });

  canvas.addEventListener('mouseup', (event) => {
    if (isDragging && selectedCandy) {
        const rect = canvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;

        const startCol = Math.floor(selectedCandy.x / gridSize);
        const startRow = Math.floor(selectedCandy.y / gridSize);
        const endCol = Math.floor(endX / gridSize);
        const endRow = Math.floor(endY / gridSize);

        if (canSwapCandies(startCol, startRow, endCol, endRow)) {
            swapCandies(startCol, startRow, endCol, endRow);
        } else {
            // If not a valid swap, return the selected candy to its original position
            selectedCandy.x = startCol * gridSize;
            selectedCandy.y = startRow * gridSize;
        }
    }

    isDragging = false;
    selectedCandy = null;
    drawCandy();
});


function swapCandies(col1, row1, col2, row2) {
  const candy1 = candySprites[col1][row1];
  const candy2 = candySprites[col2][row2];

  const startX1 = candy1.x;
  const startY1 = candy1.y;
  const startX2 = candy2.x;
  const startY2 = candy2.y;

  const deltaX1 = (startX2 - startX1) / 10; // Divide by number of frames
  const deltaY1 = (startY2 - startY1) / 10;
  const deltaX2 = (startX1 - startX2) / 10;
  const deltaY2 = (startY1 - startY2) / 10;

  let frame = 0;
  const frames = 10; // Number of frames in the animation

  function animateSwap() {
      if (frame < frames) {
          candy1.x += deltaX1;
          candy1.y += deltaY1;
          candy2.x += deltaX2;
          candy2.y += deltaY2;
          drawCandy();
          frame++;
          requestAnimationFrame(animateSwap);
      } else {
          // Final swap in the array after animation
          candy1.x = startX2;
          candy1.y = startY2;
          candy2.x = startX1;
          candy2.y = startY1;
          [candySprites[col1][row1], candySprites[col2][row2]] = [candySprites[col2][row2], candySprites[col1][row1]];

          // Check for matches after swapping
          const matches = checkForMatches();
          if (matches.length > 0) {
              handleMatches(matches);
          } else {
              // If no matches, swap back with animation
              animateSwapBack(col1, row1, col2, row2);
          }
      }
  }

  animateSwap();
}

function animateSwapBack(col1, row1, col2, row2) {
  const candy1 = candySprites[col1][row1];
  const candy2 = candySprites[col2][row2];

  const startX1 = candy1.x;
  const startY1 = candy1.y;
  const startX2 = candy2.x;
  const startY2 = candy2.y;

  const deltaX1 = (startX2 - startX1) / 10;
  const deltaY1 = (startY2 - startY1) / 10;
  const deltaX2 = (startX1 - startX2) / 10;
  const deltaY2 = (startY1 - startY2) / 10;

  let frame = 0;
  const frames = 10;

  function animateSwapBackStep() {
      if (frame < frames) {
          candy1.x -= deltaX1;
          candy1.y -= deltaY1;
          candy2.x -= deltaX2;
          candy2.y -= deltaY2;
          drawCandy();
          frame++;
          requestAnimationFrame(animateSwapBackStep);
      } else {
          // Final swap back in the array after failed animation
          candy1.x = startX2;
          candy1.y = startY2;
          candy2.x = startX1;
          candy2.y = startY1;
          [candySprites[col1][row1], candySprites[col2][row2]] = [candySprites[col2][row2], candySprites[col1][row1]];
          drawCandy();
      }
  }

  animateSwapBackStep();
}

  function handleMatches(matches) {
    // Remove matched candies and update the grid
    matches.forEach(({col, row}) => {
        // Replace with a new random candy
        const newCandyImage = new Image();
        newCandyImage.src = `./_match01/part${Math.floor(Math.random() * 12) + 1}.png`;
        candySprites[col][row].image = newCandyImage;
        candySprites[col][row].isLoaded = false;
        newCandyImage.onload = function() {
            candySprites[col][row].isLoaded = true;
            drawCandy();
        };
    });

    // Redraw the grid
    drawCandy();

 
}

