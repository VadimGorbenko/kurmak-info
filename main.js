// tabs.js
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
(function () {
    var tablist = document.querySelectorAll('[role="tablist"]')[0];
    var tabs;
    var panels;

    generateArrays();

    function generateArrays() {
        tabs = document.querySelectorAll('[role="tab"]');
        panels = document.querySelectorAll('[role="tabpanel"]');
    };

    // For easy reference
    var keys = {
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        enter: 13,
        space: 32
    };

    // Add or subtract depending on key pressed
    var direction = {
        37: -1,
        38: -1,
        39: 1,
        40: 1
    };

    // Bind listeners
    for (i = 0; i < tabs.length; ++i) {
        addListeners(i);
    };

    function addListeners(index) {
        tabs[index].addEventListener('click', clickEventListener);
        tabs[index].addEventListener('keydown', keydownEventListener);
        tabs[index].addEventListener('keyup', keyupEventListener);

        // Build an array with all tabs (<button>s) in it
        tabs[index].index = index;
    };

    // When a tab is clicked, activateTab is fired to activate it
    function clickEventListener(event) {
        var tab = event.target;
        activateTab(tab, false);
    };

    // Handle keydown on tabs
    function keydownEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.end:
                event.preventDefault();
                // Activate last tab
                focusLastTab();
                break;
            case keys.home:
                event.preventDefault();
                // Activate first tab
                focusFirstTab();
                break;

                // Up and down are in keydown
                // because we need to prevent page scroll >:)
            case keys.up:
            case keys.down:
                determineOrientation(event);
                break;
        };
    };

    // Handle keyup on tabs
    function keyupEventListener(event) {
        var key = event.keyCode;

        switch (key) {
            case keys.left:
            case keys.right:
                determineOrientation(event);
                break;
            case keys.enter:
            case keys.space:
                activateTab(event.target);
                break;
        };
    };

    // When a tablist has aria-orientation is set to vertical,
    // only up and down arrow should function.
    // In all other cases only left and right arrow function.
    function determineOrientation(event) {
        var key = event.keyCode;
        var vertical = tablist.getAttribute('aria-orientation') == 'vertical';
        var proceed = false;

        if (vertical) {
            if (key === keys.up || key === keys.down) {
                event.preventDefault();
                proceed = true;
            };
        } else {
            if (key === keys.left || key === keys.right) {
                proceed = true;
            };
        };

        if (proceed) {
            switchTabOnArrowPress(event);
        };
    };

    // Either focus the next, previous, first, or last tab
    // depending on key pressed
    function switchTabOnArrowPress(event) {
        var pressed = event.keyCode;

        if (direction[pressed]) {
            var target = event.target;
            if (target.index !== undefined) {
                if (tabs[target.index + direction[pressed]]) {
                    tabs[target.index + direction[pressed]].focus();
                } else if (pressed === keys.left || pressed === keys.up) {
                    focusLastTab();
                } else if (pressed === keys.right || pressed == keys.down) {
                    focusFirstTab();
                };
            };
        };
    };

    // Activates any given tab panel
    function activateTab(tab, setFocus) {
        setFocus = setFocus || true;
        // Deactivate all other tabs
        deactivateTabs();

        // Remove tabindex attribute
        tab.removeAttribute('tabindex');

        // Set the tab as selected
        tab.setAttribute('aria-selected', 'true');

        // Get the value of aria-controls (which is an ID)
        var controls = tab.getAttribute('aria-controls');

        // Remove hidden attribute from tab panel to make it visible
        document.getElementById(controls).removeAttribute('hidden');

        // Set focus when required
        if (setFocus) {
            tab.focus();
        };
    };

    // Deactivate all tabs and tab panels
    function deactivateTabs() {
        for (t = 0; t < tabs.length; t++) {
            tabs[t].setAttribute('tabindex', '-1');
            tabs[t].setAttribute('aria-selected', 'false');
        };

        for (p = 0; p < panels.length; p++) {
            panels[p].setAttribute('hidden', 'hidden');
        };
    };

    // Make a guess
    function focusFirstTab() {
        tabs[0].focus();
    };

    // Make a guess
    function focusLastTab() {
        tabs[tabs.length - 1].focus();
    };
}());
// /tabs.js

// carousel.js
/*
 *   File:   Carousel.js
 *
 *   Desc:   Carousel widget that implements ARIA Authoring Practices
 *
 */

/*
 *   @constructor CarouselTablist
 *
 *
 */
var Carousel = function (domNode) {
    this.domNode = domNode;

    this.items = [];

    this.firstItem = null;
    this.lastItem = null;
    this.currentDomNode = null;
    this.liveRegionNode = null;
    this.currentItem = null;

    this.rotate = true;
    this.hasFocus = false;
    this.hasHover = false;
    this.isStopped = true;
};

Carousel.prototype.init = function () {

    var elems, elem, button, items, item, imageLinks, i;

    this.liveRegionNode = this.domNode.querySelector('.carousel-items');

    items = this.domNode.querySelectorAll('.carousel-item');

    for (i = 0; i < items.length; i++) {
        item = new CarouselItem(items[i], this);

        item.init();
        this.items.push(item);

        if (!this.firstItem) {
            this.firstItem = item;
            this.currentDomNode = item.domNode;
        }
        this.lastItem = item;

        imageLinks = items[i].querySelectorAll('.carousel-image a');

        if (imageLinks && imageLinks[0]) {
            imageLinks[0].addEventListener('focus', this.handleImageLinkFocus.bind(this));
            imageLinks[0].addEventListener('blur', this.handleImageLinkBlur.bind(this));
        }

    }

    // Pause, Next Slide and Previous Slide Buttons

    elems = document.querySelectorAll('.carousel .controls button');

    for (i = 0; i < elems.length; i++) {
        elem = elems[i];
        button = new CarouselButton(elem, this);
        button.init();
    }

    this.currentItem = this.firstItem;

    this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));

};

Carousel.prototype.setSelected = function (newItem, moveFocus) {
    if (typeof moveFocus != 'boolean') {
        moveFocus = false;
    }

    for (var i = 0; i < this.items.length; i++) {
        this.items[i].hide();
    }

    this.currentItem = newItem;
    this.currentItem.show();

    if (moveFocus) {
        this.currentItem.domNode.focus();
    }
};

Carousel.prototype.setSelectedToPreviousItem = function (currentItem, moveFocus) {
    if (typeof moveFocus != 'boolean') {
        moveFocus = false;
    }

    var index;

    if (typeof currentItem !== 'object') {
        currentItem = this.currentItem;
    }

    if (currentItem === this.firstItem) {
        this.setSelected(this.lastItem, moveFocus);
    } else {
        index = this.items.indexOf(currentItem);
        this.setSelected(this.items[index - 1], moveFocus);
    }
};

Carousel.prototype.setSelectedToNextItem = function (currentItem, moveFocus) {
    if (typeof moveFocus != 'boolean') {
        moveFocus = false;
    }

    var index;

    if (typeof currentItem !== 'object') {
        currentItem = this.currentItem;
    }

    if (currentItem === this.lastItem) {
        this.setSelected(this.firstItem, moveFocus);
    } else {
        index = this.items.indexOf(currentItem);
        this.setSelected(this.items[index + 1], moveFocus);
    }
};

Carousel.prototype.rotateSlides = function () {
    if (this.rotate) {
        this.setSelectedToNextItem();
    }
};

Carousel.prototype.updateRotation = function () {

    if (!this.hasHover && !this.hasFocus && !this.isStopped) {
        this.rotate = true;
        this.liveRegionNode.setAttribute('aria-live', 'off');
    } else {
        this.rotate = false;
        this.liveRegionNode.setAttribute('aria-live', 'polite');
    }

};

Carousel.prototype.toggleRotation = function () {
    if (this.isStopped) {
        if (!this.hasHover && !this.hasFocus) {
            this.isStopped = false;
        }
    } else {
        this.isStopped = true;
    }

    this.updateRotation();

};

Carousel.prototype.handleImageLinkFocus = function () {
    this.liveRegionNode.classList.add('focus');
};

Carousel.prototype.handleImageLinkBlur = function () {
    this.liveRegionNode.classList.remove('focus');
};

Carousel.prototype.handleMouseOver = function (event) {
    this.updateRotation();
};

Carousel.prototype.handleMouseOut = function () {
    this.hasHover = false;
    this.updateRotation();
};

/* Initialize Carousel Tablists */

window.addEventListener('load', function () {
    var carousels = document.querySelectorAll('.carousel');

    for (var i = 0; i < carousels.length; i++) {
        var carousel = new Carousel(carousels[i]);
        carousel.init();
    }
}, false);
// /carousel.js

// carousel-item.js
/*
 *   File:   CarouselItem.js
 *   Desc:   Carousel Tab widget that implements ARIA Authoring Practices
 */

/*
 *   @constructor CarouselItem
 */
var CarouselItem = function (domNode, carouselObj) {
    this.domNode = domNode;
    this.carousel = carouselObj;
};

CarouselItem.prototype.init = function () {
    this.domNode.addEventListener('focusin', this.handleFocusIn.bind(this));
    this.domNode.addEventListener('focusout', this.handleFocusOut.bind(this));
};

CarouselItem.prototype.hide = function () {
    this.domNode.classList.remove('active');
};

CarouselItem.prototype.show = function () {
    this.domNode.classList.add('active');
};

/* EVENT HANDLERS */

CarouselItem.prototype.handleFocusIn = function (event) {
    this.domNode.classList.add('focus');
    this.carousel.hasFocus = true;
    this.carousel.updateRotation();
};

CarouselItem.prototype.handleFocusOut = function (event) {
    this.domNode.classList.remove('focus');
    this.carousel.hasFocus = false;
    this.carousel.updateRotation();
};
// /carousel-item.js

// carousel-buttons
/*
 *   File:   carouselButton.js
 *
 *   Desc:   Carousel Button widget that implements ARIA Authoring Practices
 */

/*
 *   @constructor CarouselButton
 *
 *
 */
var CarouselButton = function (domNode, carouselObj) {
    this.domNode = domNode;

    this.carousel = carouselObj;

    this.direction = 'previous';

    if (this.domNode.classList.contains('next')) {
        this.direction = 'next';
    }

    this.keyCode = Object.freeze({
        'RETURN': 13,
        'SPACE': 32,
        'END': 35,
        'HOME': 36,
        'LEFT': 37,
        'UP': 38,
        'RIGHT': 39,
        'DOWN': 40
    });
};

CarouselButton.prototype.init = function () {
    this.domNode.addEventListener('click', this.handleClick.bind(this));
    this.domNode.addEventListener('focus', this.handleFocus.bind(this));
    this.domNode.addEventListener('blur', this.handleBlur.bind(this));
};

CarouselButton.prototype.changeItem = function () {
    if (this.direction === 'previous') {
        this.carousel.setSelectedToPreviousItem();
    } else {
        this.carousel.setSelectedToNextItem();
    }
};


/* EVENT HANDLERS */


CarouselButton.prototype.handleClick = function (event) {
    this.changeItem();
};

CarouselButton.prototype.handleFocus = function (event) {
    this.carousel.hasFocus = true;
    this.domNode.classList.add('focus');
    this.carousel.updateRotation();
};

CarouselButton.prototype.handleBlur = function (event) {
    this.carousel.hasFocus = false;
    this.domNode.classList.remove('focus');
    this.carousel.updateRotation();
};
// /carousel-buttons