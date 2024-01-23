/**
 * Initializes spatial navigation on the page.
 */
function initSpatialNavigation() {
  document.addEventListener("keydown", handleKeyDown);
}

/**
 * Handles keydown events for spatial navigation.
 * @param {KeyboardEvent} event - The KeyboardEvent object.
 */
function handleKeyDown(event) {
  if (
    !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    return;
  }

  handleMove(event.key, document.activeElement);
}

/**
 * Handles navigation within a group.
 * @param {string} direction - The direction of movement.
 * @param {Element} group - The navigation group element.
 */
function handleGroupNavigation(direction, group) {
  const strategy = group.getAttribute("data-focus-group") || "linear";
  console.debug("Handling group", strategy, direction, group);
  switch (strategy) {
    case "first":
      focusFirstElement(direction, group);
      break;
    case "last":
      focusLastElement(direction, group);
      break;
    case "active":
      focusActiveElement(direction, group);
      break;
    case "linear":
      focusLinear(direction, group);
      break;
  }
}

/**
 * Handles navigation for individual focusable elements.
 * @param {string} direction - The direction to move in.
 * @param {Element} focusedElement - The currently focused element.
 */
function handleMove(direction, focusedElement) {
  let nextParent = focusedElement || document.body;
  let candidateElements = [];

  const focusedRect = focusedElement.getBoundingClientRect();

  do {
    nextParent =
      nextParent.parentElement.closest("[data-focus-group]") || document.body;
    const focusableElements = getFocusableElements(nextParent);

    // https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement#value
    if (focusedElement == null || focusedElement === document.body) {
      focusLinear(direction, document.body);
      return;
    }

    // Annotate elements with bounding boxes
    const annotatedElements = focusableElements.map((element) => {
      return {
        element: element,
        rect: element.getBoundingClientRect(),
      };
    });

    // DEBUG
    annotatedElements.forEach((elem) => (elem.element.style.background = null));

    // Filter elements based on direction
    candidateElements = annotatedElements.filter(({ rect }) => {
      switch (direction) {
        case "ArrowLeft":
          return Math.floor(rect.right) <= focusedRect.left;
        case "ArrowUp":
          return Math.floor(rect.bottom) <= focusedRect.top;
        case "ArrowRight":
          return Math.ceil(rect.left) >= focusedRect.right;
        case "ArrowDown":
          return Math.ceil(rect.top) >= focusedRect.bottom;
        default:
          return false;
      }
    });
  } while (candidateElements.length === 0 && nextParent !== document.body);

  const sortedElements = candidateElements.sort((a, b) => {
    const distanceA = calculateTargetedDistance(direction, focusedRect, a.rect);
    const distanceB = calculateTargetedDistance(direction, focusedRect, b.rect);
    return distanceA - distanceB;
  });

  // DEBUG
  sortedElements.forEach(
    (elem, index) =>
      (elem.element.style.background = `rgba(255, 0, 0, ${1 / (index + 1)})`)
  );

  function calculateTargetedDistance(direction, originElem, targetElem) {
    switch (direction) {
      case "ArrowLeft":
        return euclidean(
          { x: originElem.left, y: (originElem.top + originElem.bottom) / 2 },
          {
            x: targetElem.right,
            y: closestTo(
              (originElem.top + originElem.bottom) / 2,
              targetElem.top,
              targetElem.bottom
            ),
          }
        );
      case "ArrowUp":
        return euclidean(
          { x: (originElem.left + originElem.right) / 2, y: originElem.top },
          {
            x: closestTo(
              (originElem.left + originElem.right) / 2,
              targetElem.left,
              targetElem.right
            ),
            y: targetElem.bottom,
          }
        );
      case "ArrowRight":
        return euclidean(
          { x: originElem.right, y: (originElem.top + originElem.bottom) / 2 },
          {
            x: targetElem.left,
            y: closestTo(
              (originElem.top + originElem.bottom) / 2,
              targetElem.top,
              targetElem.bottom
            ),
          }
        );
      case "ArrowDown":
        return euclidean(
          { x: (originElem.left + originElem.right) / 2, y: originElem.bottom },
          {
            x: closestTo(
              (originElem.left + originElem.right) / 2,
              targetElem.left,
              targetElem.right
            ),
            y: targetElem.top,
          }
        );
      default:
        return false;
    }
  }

  // Focus the closest element if available
  if (sortedElements.length > 0) {
    applyMove(direction, sortedElements[0].element);
  }
}

/**
 * Find the value closest to a given value that lies within the interval.
 *
 * @param {number} val - The value of interest.
 * @param {number} intervalLower - The lower boundary of the interval.
 * @param {number} intervalUpper - The upper boundary of the interval.
 * @returns {number} - The value within the interval that is closest to the value of interest.
 */
function closestTo(val, intervalLower, intervalUpper) {
  if (val >= intervalLower && val <= intervalUpper) {
    return val;
  } else if (intervalUpper > val) {
    return intervalUpper;
  } else {
    return intervalLower;
  }
}

/**
 * Computes the Euclidean distance between two points.
 *
 * @param {{ x: number, y: number }} a - The first point.
 * @param {{ x: number, y: number }} b - The second point.
 * @returns {number} - The Euclidean distance.
 */
function euclidean(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function applyMove(direction, target) {
  console.debug("Applying move", direction, target);
  if (target.hasAttribute("data-focus-group")) {
    handleGroupNavigation(direction, target);
  } else {
    target.focus();
  }
}

/**
 * Finds the governing focusable elements within a container element.
 *
 * That it finds the "governing" elements means it finds only the top-most
 * focusable elements, without their descendants.
 *
 * @param {Element} containerElem - The element within which to look.
 * @returns {Array<Element>} - The governing focusable elements.
 */
function getFocusableElements(containerElem) {
  containerElem = containerElem || document.body;
  const selector =
    '[data-focus-group], [tabindex], a[href], button:not([disabled]), input[type=button]:not([disabled]), [contenteditable="true"], summary';

  // Find the focusable elements within the container
  const focusableElements = Array.from(containerElem.querySelectorAll(selector))
    .filter(
      (el) =>
        !el.hasAttribute("tabindex") || el.getAttribute("tabindex") !== "-1"
    )
    .filter(
      (el) =>
        !el.hasAttribute("data-focus-skip") &&
        el.closest("[data-focus-skip]") == null
    );

  // Reduce to the focusable elements highest up the tree
  const topMost = focusableElements.filter((elem) => {
    return (
      elem.parentElement.closest(selector) === containerElem ||
      containerElem === document.body
    );
  });

  return topMost;
}

/**
 * Focuses the first element in the given navigation group.
 * @param {string} direction - The name of the movement direction.
 * @param {Element} group - The navigation group element.
 */
function focusFirstElement(direction, group) {
  const firstElement = getFocusableElements(group).find((_) => true);
  if (firstElement) {
    applyMove(direction, firstElement);
  }
}

/**
 * Focuses the last element in the given navigation group.
 * @param {string} direction - The name of the movement direction.
 * @param {Element} group - The navigation group element.
 */
function focusLastElement(direction, group) {
  const lastElement = getFocusableElements(group).findLast((_) => true);
  if (lastElement) {
    applyMove(direction, lastElement);
  }
}

/**
 * Focuses the active element in the given navigation group.
 * @param {string} direction - The name of the movement direction.
 * @param {Element} group - The navigation group element.
 */
function focusActiveElement(direction, group) {
  const activeElement = getFocusableElements(group).find((elem) =>
    elem.hasAttribute("data-focus-active")
  );
  if (activeElement) {
    applyMove(direction, activeElement);
  }
}

/**
 * Moves focus linearly in the direction of "travel".
 * @param {string} direction - The name of the movement direction.
 * @param {Element} group - The navigation group element.
 */
function focusLinear(direction, group) {
  direction === "ArrowUp"
    ? focusLastElement(direction, group)
    : focusFirstElement(direction, group);
}

// Initialize at load
initSpatialNavigation();
