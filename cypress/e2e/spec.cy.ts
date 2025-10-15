describe("focus-shift spec", () => {
  function keyevent(opts) {
    return {
      key: opts.key,
      ctrlKey: opts.ctrlKey || false,
      metaKey: opts.metaKey || false,
      altKey: opts.altKey || false,
      getModifierState: function (name) {
        return opts.modifierState === name
      },
      repeat: opts.repeat || false
    }
  }

  function testFor(testPage, opts, sequence) {
    return function () {
      cy.visit(testPage)

      cy.get("body").then(($body) => {
        $body[0].className = opts.className || ""
        $body[0].focus()
      })

      for (let pair of sequence) {
        switch (pair.eventType) {
          case "click":
            cy.get(pair.selector).click()
            break
          case "focus":
            cy.get(pair.selector).then(($elem) => {
              $elem[0].focus()
            })
            break
          default:
            cy.get("body")
              .trigger(pair.eventType, pair.options)
              .then(($body) => {
                cy.wait(50)

                cy.document().then((doc) => {
                  if (pair.selector) {
                    expect(doc.querySelector(pair.selector)).to.equal(doc.activeElement)
                  } else {
                    expect(doc.activeElement).to.equal(doc.body)
                  }
                })
              })
        }
      }
    }
  }

  it(
    "first-type group top-down",
    testFor("./cypress/fixtures/group-first.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) }
    ])
  )

  it(
    "first-type group left-right",
    testFor("./cypress/fixtures/group-first.html", { className: "columns" }, [
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) }
    ])
  )

  it(
    "last-type group top-down",
    testFor("./cypress/fixtures/group-last.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "last-type group left-right",
    testFor("./cypress/fixtures/group-last.html", { className: "columns" }, [
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "active-type group TD",
    testFor("./cypress/fixtures/group-active.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "active-type group LR",
    testFor("./cypress/fixtures/group-active.html", { className: "columns" }, [
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "linear-type group TD",
    testFor("./cypress/fixtures/group-linear.html", { className: "rows" }, [
      { eventType: "focus", selector: "#before" },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#after", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#before", options: keyevent({ key: "ArrowUp" }) }
    ])
  )

  it(
    "linear-type group DT",
    testFor("./cypress/fixtures/group-linear.html", { className: "rows" }, [
      { eventType: "focus", selector: "#after" },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#before", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#after", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "linear-type group LR",
    testFor("./cypress/fixtures/group-linear.html", { className: "columns" }, [
      { eventType: "focus", selector: "#before" },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#after", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#before", options: keyevent({ key: "ArrowLeft" }) }
    ])
  )

  it(
    "linear-type group RL",
    testFor("./cypress/fixtures/group-linear.html", { className: "columns" }, [
      { eventType: "focus", selector: "#after" },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#before", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#after", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "linear-type group with stretched item LR",
    testFor("./cypress/fixtures/group-linear-stretch.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-big", options: keyevent({ key: "ArrowLeft" }) },
      { eventType: "keydown", selector: "#button-small", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "linear-type group with stretched item RL",
    testFor("./cypress/fixtures/group-linear-stretch.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-big", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#button-small", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "linear-type group with stretched item TD",
    testFor("./cypress/fixtures/group-linear-stretch.html", { className: "columns" }, [
      { eventType: "keydown", selector: "#button-big", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-small", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "linear-type group with stretched item DT",
    testFor("./cypress/fixtures/group-linear-stretch.html", { className: "columns" }, [
      { eventType: "keydown", selector: "#button-big", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "keydown", selector: "#button-small", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "memorize-type group TD",
    testFor("./cypress/fixtures/group-memorize.html", { className: "rows" }, [
      { eventType: "focus", selector: "#before" },
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "focus", selector: "#before" },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "ignores contents of closed details element",
    testFor("./cypress/fixtures/details.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#summary-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#summary-1", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "click", selector: "#summary-1" },
      { eventType: "focus", selector: "#summary-1" },
      { eventType: "keydown", selector: "#group-button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#group-button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#summary-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#summary-2", options: keyevent({ key: "ArrowUp" }) },
      { eventType: "click", selector: "#summary-2" },
      { eventType: "focus", selector: "#summary-2" },
      { eventType: "keydown", selector: "#subgroup-button-1", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#subgroup-button-2", options: keyevent({ key: "ArrowDown" }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown" }) }
    ])
  )

  it(
    "allows treating input elements as opaque",
    testFor("./cypress/fixtures/interaction-behavior.html", { className: "" }, [
      // Cypress does not seem to model cursors fully, which makes testing specifics of "normal"
      // interaction behavior, i.e. moving the cursor within input text, brittle and difficult.
      // We only verify a minimal expected difference between the modes: Whereas in normal mode
      // arrow presses leave focus on the input in some cases, equivalent actions immediately
      // shift focus in opaque mode.

      // Input
      { eventType: "focus", selector: "#normal-inputs [type=text]" },
      { eventType: "keydown", selector: "#normal-inputs [type=text]", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#normal-inputs [type=text]", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "focus", selector: "#opaque-inputs [type=text]" },
      { eventType: "keydown", selector: "#opaque-inputs [type=number]", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#opaque-inputs [type=email]", options: keyevent({ key: "ArrowRight" }) },
      // Textarea
      { eventType: "focus", selector: "#normal-inputs textarea" },
      { eventType: "keydown", selector: "#normal-inputs textarea", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "keydown", selector: "#normal-inputs textarea", options: keyevent({ key: "ArrowRight" }) },
      { eventType: "focus", selector: "#opaque-inputs textarea" },
      { eventType: "keydown", selector: "#opaque-inputs button", options: keyevent({ key: "ArrowRight" }) }
    ])
  )

  it(
    "allows canceling event handling",
    testFor("./cypress/fixtures/events.html", { className: "rows" }, [
      { eventType: "keydown", selector: "#button-1", options: keyevent({ key: "ArrowDown", repeat: false }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown", repeat: false }) },
      { eventType: "keydown", selector: "#button-2", options: keyevent({ key: "ArrowDown", repeat: true }) },
      { eventType: "keydown", selector: "#button-3", options: keyevent({ key: "ArrowDown", repeat: false }) }
    ])
  )

  it("allows preventing scroll", function () {
    cy.visit("./cypress/fixtures/scroll.html")
    const getScrollLeft = () => cy.document().then((doc) => doc.scrollingElement.scrollLeft)
    function testScroll(id, assert) {
      getScrollLeft().then((scrollLeftBefore) => {
        const firstButton = cy.get(id)
        firstButton.focus()
        firstButton.trigger("keydown", keyevent({ key: "ArrowRight" }))
        cy.wait(50)
        getScrollLeft().then((scrollLeftAfter) => assert(scrollLeftBefore, scrollLeftAfter))
      })
    }
    testScroll("#prevent", function (before, after) {
      expect(before).to.equal(after)
    })
    testScroll("#no-prevent", function (before, after) {
      expect(before).to.not.equal(after)
    })
  })
})
