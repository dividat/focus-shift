# focus-shift

## Introduction
focus-shift is a lightweight JavaScript library designed for keyboard-based navigation in web applications. It allows users to move focus between elements using the arrow keys. The behaviour of focus shifting can be guided by annotations in the HTML markup.

The library is kept simple and assumes use in kiosk-like interfaces.

## Features
- Move focus with arrow keys
- Declare groups with custom focus strategies
- Mark subtrees of the DOM as muted

## Usage
Include the library in your HTML file:
```html
<script src="focus-shift.js"></script>
```

### Basic Example
Here's a simple example of how to use the library:

```html
<div data-focus-group data-focus-group-select="active">
  <button>Home</button>
  <button data-focus-group-active>About</button>
  <button>Contact</button>
</div>
```

## Options

The following attributes may be added in the markup to guide the moving of focus"

- `data-focus-group`: Defines a navigation group.
- `data-focus-group-select`: Determines the initial focus when focus moves to a group.
  - `first`: The first element in the DOM order receives focus.
  - `last`: The last element in the DOM order is focused initially.
  - `active`: Focuses on the element within the group marked as active.
  - `linear`: Focus is determined by the spatial direction of user navigation.
- `data-focus-group-active`: Marks an element as the currently active element within a group.
- `data-focus-mute`: Skips the element and its descendants in navigation.
- `data-focus-solo`: Focuses within this element only, ignoring others in the same group.

## Limitations and simplifying assumptions
- **Arrow key navigation only**: The library listens only to arrow key events for navigation.
- **No iframe or ShadowDOM support**: Does not handle navigation within iframes or shadow DOM elements.
- **Viewport-filling applications without scrollbars**: Optimized for applications that fill the viewport without scrolling.
- **Exclusion of conflicting elements**: Avoids navigation to inputs like radio buttons to simplify navigation logic.

These limitations are intentional to keep the library simple and focused.

## Mechanism

```mermaid
flowchart TB
    Idle(((Idle))) == keypress ==> D_KP{Is arrow key?}
    %% Terminology from https://github.com/whatwg/html/issues/897
    D_KP -- Yes --> A_BC[Get top blocking element]
    D_KP -- No --> Idle
    A_BC --> D_AE{Contains activeElement?}
    D_AE -- No --> A_SI[Select initial focus]
    A_SI --> Idle
    D_AE -- Yes --> Find

    subgraph Find
        direction TB
        A_FC[Find candidates within next parent group]
        A_FC --> D_CF{Candidates found?}
        D_CF -- Yes --> A_SN[Stop with candidates]
        D_CF -- No --> D_PB[Is parent the top blocking element?]
        D_PB -- Yes --> A_NC[Stop with no candidates]
        D_PB -- No --> A_FC
    end

    Find --> D_HC[One or more candidates?]
    D_HC -- Yes --> Activate
    D_HC -- No --> Idle

    subgraph Activate
        direction TB
        D_DP[Direct projection along movement axis non-empty?] -- Yes --> A_FD[Reduce to only those candidates]
        D_DP -- No --> A_CA[Continue with all candidates]
        A_CA --> A_SC[Select candidate with lowest Euclidean distance]
        A_FD --> A_SC
        A_SC --> D_CG[Is selected candidate a group?]
        D_CG -- Yes --> A_DG[Select new candidate based on group's strategy]
        A_DG --> D_CG
        D_CG -- No --> A_FS[Focus selected candidate]
    end

    Activate --> Idle
```

## Contributing
Contributions are welcome. Please fork the repository and submit a pull request with your proposed changes.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.
