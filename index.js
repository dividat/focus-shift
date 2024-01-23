/**
 * Initializes spatial navigation on the page.
 */
function initSpatialNavigation() {
    document.addEventListener('keydown', handleKeyDown);
}

/**
 * Handles keydown events for spatial navigation.
 * @param {KeyboardEvent} event - The KeyboardEvent object.
 */
function handleKeyDown(event) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
    }

    handleMove(event.key, document.activeElement);
}

/**
 * Handles navigation within a group.
 * @param {string} string - The direction of movement.
 * @param {HTMLElement} group - The navigation group element.
 */
function handleGroupNavigation(direction, group) {
    const strategy = group.getAttribute('data-focus-group-strategy') || 'linear'
    console.debug('Handling group', strategy, direction, group)
    switch (strategy) {
        case 'first':
            focusFirstElement(direction, group);
            break;
        case 'last':
            focusLastElement(direction, group);
            break;
        case 'active':
            focusActiveElement(direction, group);
            break;
        case 'linear':
            // TODO Proper implementation for all directions
            direction === 'ArrowUp' ? focusLastElement(direction, group) : focusFirstElement(direction, group);
            break;
    }
}

/**
 * Handles navigation for individual focusable elements.
 * @param {string} direction - The direction to move in.
 * @param {HTMLElement} focusedElement - The currently focused element.
 */
function handleMove(direction, focusedElement) {
    let nextParent = focusedElement || document.body
    let candidateElements = []

    const focusedRect = focusedElement.getBoundingClientRect()

    do {
        nextParent = (nextParent.parentElement.closest('[data-focus-group]')) || document.body
        focusableElements = getFocusableElements(nextParent)

        // https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement#value
        if (focusedElement == null || focusedElement === document.body) {
	    // TODO Direction -- treat `body` as linear group?
            if (focusableElements[0]) applyMove(direction, focusableElements[0]);
            return;
        }
    
        // Annotate elements with bounding boxes
        const annotatedElements = focusableElements.map(element => {
            return {
                element: element,
                rect: element.getBoundingClientRect()
            }
        })
    
        annotatedElements.forEach(elem => elem.element.style.background = null)
    
        // Filter elements based on direction
        candidateElements = annotatedElements.filter(({ rect }) => {
            switch (direction) {
                case 'ArrowLeft':
                    return Math.floor(rect.right) <= focusedRect.left
                case 'ArrowUp':
                    return Math.floor(rect.bottom) <= focusedRect.top
                case 'ArrowRight':
                    return Math.ceil(rect.left) >= focusedRect.right
                case 'ArrowDown':
                    return Math.ceil(rect.top) >= focusedRect.bottom
                default:
                    return false
            }
        })
    } while (candidateElements.length === 0 && nextParent !== document.body)

    const sortedElements = candidateElements.sort((a, b) => {
        const distanceA = calculateTargetedDistance(focusedRect, a.rect)
        const distanceB = calculateTargetedDistance(focusedRect, b.rect)
        return distanceA - distanceB
    })

    sortedElements.forEach((elem, index) => elem.element.style.background = `rgba(255, 0, 0, ${1 / (index + 1)})`)

    function calculateTargetedDistance(originElem, targetElem) {
	    // TODO Rounding errors for really close neighboring elements
        switch (direction) {
            case 'ArrowLeft':
                return euclidean({ x: originElem.left, y: (originElem.top + originElem.bottom) / 2 }, { x: targetElem.right, y: closestTo((originElem.top + originElem.bottom) / 2, targetElem.top, targetElem.bottom) })
            case 'ArrowUp':
                return euclidean({ x: (originElem.left + originElem.right) / 2, y: originElem.top }, { x: closestTo((originElem.left + originElem.right) / 2, targetElem.left, targetElem.right) , y: targetElem.bottom })
            case 'ArrowRight':
                return euclidean({ x: originElem.right, y: (originElem.top + originElem.bottom) / 2 }, { x: targetElem.left, y: closestTo((originElem.top + originElem.bottom) / 2, targetElem.top, targetElem.bottom) })
            case 'ArrowDown':
                return euclidean({ x: (originElem.left + originElem.right) / 2, y: originElem.bottom }, { x: closestTo((originElem.left + originElem.right) / 2, targetElem.left, targetElem.right) , y: targetElem.top })
            default:
                return false
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
 * @param {val} float - The value of interest.
 * @param {intervalLower} - The lower boundary of the interval.
 * @param {intervalUpper} - The upper boundary of the interval.
 */
function closestTo(val, intervalLower, intervalUpper) {
	if (val >= intervalLower && val <= intervalUpper) {
		return val
	} else if (intervalUpper > val) {
		return intervalUpper
	} else {
		return intervalLower
	}
}

function euclidean(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function applyMove(direction, target) {
	console.debug('Applying move', direction, target)
	if (target.hasAttribute('data-focus-group')) {
            handleGroupNavigation(direction, target);
	} else {
            target.focus();
	}
}

function getFocusableElements(containerElem) {
    containerElem = containerElem || document.body
    const selector = '[data-focus-group], [tabindex], a[href], button:not([disabled]), input[type=button]:not([disabled]), [contenteditable="true"], summary'

    // Find the focusable elements within the container
    const focusableElements = Array.from(
        containerElem.querySelectorAll(selector)
    ).filter(
        el =>
            !el.hasAttribute('tabindex') || el.getAttribute('tabindex') !== '-1'
    ).filter(
        el =>
            !el.hasAttribute('data-focus-mute') && el.closest('[data-focus-mute]') == null
    )

    // Reduce to the focusable elements highest up the tree
    const topMost = focusableElements.filter(elem => {
	    return elem.parentElement.closest(selector) === containerElem || containerElem === document.body
    })

    return topMost
}

/**
 * Focuses the first element in the given navigation group.
 * @param {HTMLElement} group - The navigation group element.
 */
function focusFirstElement(direction, group) {
    const firstElement = getFocusableElements(group).find(_ => true)
    if (firstElement) {
        applyMove(direction, firstElement);
    }
}

/**
 * Focuses the last element in the given navigation group.
 * @param {HTMLElement} group - The navigation group element.
 */
function focusLastElement(direction, group) {
    const lastElement = getFocusableElements(group).findLast(_ => true)
    if (lastElement) {
        applyMove(direction, lastElement);
    }
}

/**
 * Focuses the active element in the given navigation group.
 * @param {HTMLElement} group - The navigation group element.
 */
function focusActiveElement(direction, group) {
    const activeElement = getFocusableElements(group).find(elem => elem.hasAttribute('data-focus-active'));
    if (activeElement) {
        applyMove(direction, activeElement);
    }
}

// Initialize the spatial navigation.
initSpatialNavigation();

