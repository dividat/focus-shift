document.addEventListener("keydown", function (event) {
  // Clear previous overlay
  const existingDisplay = document.getElementById("key-display")
  if (existingDisplay) {
    document.body.removeChild(existingDisplay)
  }

  // Create a new overlay
  const displayDiv = document.createElement("div")
  displayDiv.id = "key-display"
  displayDiv.style.position = "absolute"
  displayDiv.style.bottom = "20px"
  displayDiv.style.right = "20px"
  displayDiv.style.padding = "10px"
  displayDiv.style.backgroundColor = "#ddd"
  displayDiv.style.border = "1px solid black"
  displayDiv.textContent = `Key Pressed: ${event.key}`

  document.body.appendChild(displayDiv)

  // Remove overlay
  setTimeout(() => {
    if (displayDiv.parentNode) displayDiv.parentNode.removeChild(displayDiv)
  }, 750)
})
