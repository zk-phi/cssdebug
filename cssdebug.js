/* ---- sytles */

var COMMON_STYLE = `
.cssdebug > * {
    pointer-events: none;
    box-sizing: border-box;
    position: absolute;
    z-index: 99999;
}
`;

var BOX_STYLE = `
.cssdebug > .mg, .cssdebug > .bd, .cssdebug > .pd, .cssdebug > .bx {
    border-width: 1px;
    border-style: dashed;
}
.cssdebug > .mg { border-color: #f39800; }
.cssdebug:not(.selected) > .mg { background-color: rgba(243, 152, 0, 0.15); }
.cssdebug > .bd { border-color: #ffd400; }
.cssdebug:not(.selected) > .bd { background-color: rgba(255, 212, 0.15); }
.cssdebug > .pd { border-color: #00bb20; }
.cssdebug:not(.selected) > .pd { background-color: rgba(0, 140, 64, 0.15); }
.cssdebug > .bx { border-color: #0000e6; }
.cssdebug:not(.selected) > .bx { background-color: rgba(0, 100, 255, 0.15); }
`;

var TOOLTIP_STYLE = `
.cssdebug > .i {
    background-color: black;
    color: white;
    font-size: 12px;
    line-height: 16px;
    padding: 0 4px;
    border-radius: 2px;
    z-index: 999999;
}
.cssdebug > .i > .id { color: #008c40; }
.cssdebug > .i > .class { color: #0064ff; }
.cssdebug.selected > .i { display: none }
`;

var DISTANCE_STYLE = `
.cssdebug > .d {
    display: table;
    text-align: center;
    color: red;
    background-color: rgba(255, 0, 0, 0.3);
    font-size: 10px;
    overflow: hidden;
    border: 1px red dashed;
}
.cssdebug > .d > span { display: table-cell; vertical-align: middle; }
`;

/* ---- utils */

function createStyleTag (body) {
    var head  = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(body));
    head.appendChild(style);
}

function createDIVWithClass (className) {
    var elem = document.createElement('div');
    elem.className = className;
    return elem;
}

/* ---- render / hide guides */

var currentDistanceGuide = undefined;
var currentGuide         = undefined;
var currentTarget        = undefined;
var selectedGuide        = undefined;
var selectedTarget       = undefined;

function toggleSelected (elem) {
    var unselect = elem == selectedTarget;

    if (selectedGuide) {
        selectedGuide.parentNode.removeChild(selectedGuide);
        selectedGuide = selectedTarget = null;
    }

    if (currentGuide && !unselect) {
        hideDistance();
        selectedGuide = currentGuide;
        selectedTarget = currentTarget;
        currentGuide = currentTarget = null;
        selectedGuide.className = "cssdebug selected";
    }
}

/* box guides */

function hideGuide () {
    if (currentGuide) currentGuide.parentNode.removeChild(currentGuide);
    currentGuide = currentTarget = null;
}

function renderGuide (elem) {
    hideGuide();

    var boundingRect = elem.getBoundingClientRect();
    var styles       = window.getComputedStyle(elem);

    var margin = {
        top: parseFloat(styles['margin-top']),
        right: parseFloat(styles['margin-right']),
        bottom: parseFloat(styles['margin-bottom']),
        left: parseFloat(styles['margin-left'])
    };
    var border = {
        top: parseFloat(styles['border-top-width']),
        right: parseFloat(styles['border-right-width']),
        bottom: parseFloat(styles['border-bottom-width']),
        left: parseFloat(styles['border-left-width'])
    };
    var padding = {
        top: parseFloat(styles['padding-top']),
        right: parseFloat(styles['padding-right']),
        bottom: parseFloat(styles['padding-bottom']),
        left: parseFloat(styles['padding-left'])
    };

    var offsetX = window.scrollX;
    var offsetY = window.scrollY;

    var body      = document.getElementsByTagName('body')[0];
    var container = createDIVWithClass('cssdebug');

    /* margin */
    var marginGuide = createDIVWithClass('mg');
    marginGuide.style.top    = boundingRect.top - margin.top + offsetY + 'px';
    marginGuide.style.left   = boundingRect.left - margin.left + offsetX + 'px';
    marginGuide.style.height = boundingRect.height + margin.top + margin.bottom + 'px';
    marginGuide.style.width  = boundingRect.width + margin.left + margin.right + 'px';
    container.appendChild(marginGuide);

    /* border */
    var borderGuide = createDIVWithClass('bd');
    borderGuide.style.top    = boundingRect.top + offsetY + 'px';
    borderGuide.style.left   = boundingRect.left + offsetX + 'px';
    borderGuide.style.height = boundingRect.height + 'px';
    borderGuide.style.width  = boundingRect.width + 'px';
    container.appendChild(borderGuide);

    /* padding */
    var paddingGuide = createDIVWithClass('pd');
    paddingGuide.style.top    = boundingRect.top + border.top + offsetY + 'px';
    paddingGuide.style.left   = boundingRect.left + border.left + offsetX + 'px';
    paddingGuide.style.height = boundingRect.height - border.top - border.bottom + 'px';
    paddingGuide.style.width  = boundingRect.width - border.left - border.right + 'px';
    container.appendChild(paddingGuide);

    /* content */
    var contentGuide = createDIVWithClass('bx');
    contentGuide.style.top    = boundingRect.top + border.top + padding.top + offsetY + 'px';
    contentGuide.style.left   = boundingRect.left + border.left + padding.left + offsetX + 'px';
    contentGuide.style.height = boundingRect.height - border.top - border.bottom - padding.top - padding.bottom + 'px';
    contentGuide.style.width  = boundingRect.width - border.left - border.right - padding.left - padding.right + 'px';
    container.appendChild(contentGuide);

    /* tooltip */
    var tooltip = createDIVWithClass('i');
    tooltip.innerHTML = `
        ${ elem.tagName.toLowerCase() }
        <span class="id">${ elem.id }</span>
        <span class="class">${ elem.className }</span>
        (${ boundingRect.height } x ${ boundingRect.width })
    `;
    tooltip.style.top = boundingRect.top - 16 + offsetY + 'px';
    tooltip.style.left = boundingRect.left + offsetX + 'px';
    container.appendChild(tooltip);

    body.appendChild(container);
    currentTarget = elem;
    return currentGuide = container;
}

/* distance guides */

function hideDistance () {
    if (currentDistanceGuide) currentDistanceGuide.parentNode.removeChild(currentDistanceGuide);
    currentDistanceGuide = null;
}

function renderDistance (baseElem, targetElem) {
    hideDistance();

    var body      = document.getElementsByTagName('body')[0];
    var container = createDIVWithClass('cssdebug');

    var offsetX = window.scrollX;
    var offsetY = window.scrollY;

    var baseBoundingRect   = baseElem.getBoundingClientRect();
    var targetBoundingRect = targetElem.getBoundingClientRect();

    var baseRect = {
        top: baseBoundingRect.top,
        left: baseBoundingRect.left,
        bottom: baseBoundingRect.top + baseBoundingRect.height,
        right: baseBoundingRect.left + baseBoundingRect.width
    };

    var targetRect = {
        top: targetBoundingRect.top,
        left: targetBoundingRect.left,
        bottom: targetBoundingRect.top + targetBoundingRect.height,
        right: targetBoundingRect.left + targetBoundingRect.width
    };

    /* left */
    if (targetRect.left < baseRect.right) {
        var leftDistance  = (targetRect.right <= baseRect.left ? targetRect.right : targetRect.left) - baseRect.left;
        if (leftDistance) {
            var left          = createDIVWithClass('d');
            left.style.top    = baseBoundingRect.top + offsetY + 'px';
            left.style.height = baseBoundingRect.height + 'px';
            left.style.left   = Math.min(baseRect.left + leftDistance, baseRect.left) + offsetX + 'px';
            left.style.width  = Math.abs((baseRect.left + leftDistance) - baseRect.left) + 'px';
            left.innerHTML    = `<span>${ Math.abs(leftDistance) }</span>`;
            container.appendChild(left);
        }
    }

    /* right */
    if (baseRect.left < targetRect.right) {
        var rightDistance  = (baseRect.right <= targetRect.left ? targetRect.left : targetRect.right) - baseRect.right;
        if (rightDistance) {
            var right          = createDIVWithClass('d');
            right.style.top    = baseBoundingRect.top + offsetY + 'px';
            right.style.height = baseBoundingRect.height + 'px';
            right.style.left   = Math.min(baseRect.right + rightDistance, baseRect.right) + offsetX + 'px';
            right.style.width  = Math.abs((baseRect.right + rightDistance) - baseRect.right) + 'px';
            right.innerHTML    = `<span>${ Math.abs(rightDistance) }</span>`;
            container.appendChild(right);
        }
    }

    /* top */
    if (targetRect.top < baseRect.bottom) {
        var topDistance  = (targetRect.bottom <= baseRect.top ? targetRect.bottom : targetRect.top) - baseRect.top;
        if (topDistance) {
            var top          = createDIVWithClass('d');
            top.style.left   = baseBoundingRect.left + offsetX + 'px';
            top.style.width  = baseBoundingRect.width + 'px';
            top.style.top    = Math.min(baseRect.top + topDistance, baseRect.top) + offsetY + 'px';
            top.style.height = Math.abs((baseRect.top + topDistance) - baseRect.top) + 'px';
            top.innerHTML    = `<span>${ Math.abs(topDistance) }</span>`;
            container.appendChild(top);
        }
    }

    /* bottom */
    if (baseRect.top < targetRect.bottom) {
        var bottomDistance  = (baseRect.bottom <= targetRect.top ? targetRect.top : targetRect.bottom) - baseRect.bottom;
        if (bottomDistance) {
            var bottom          = createDIVWithClass('d');
            bottom.style.left   = baseBoundingRect.left + offsetX + 'px';
            bottom.style.width  = baseBoundingRect.width + 'px';
            bottom.style.top    = Math.min(baseRect.bottom + bottomDistance, baseRect.bottom) + offsetY + 'px';
            bottom.style.height = Math.abs((baseRect.bottom + bottomDistance) - baseRect.bottom) + 'px';
            bottom.innerHTML    = `<span>${ Math.abs(bottomDistance) }</span>`;
            container.appendChild(bottom);
        }
    }

    return currentDistanceGuide = body.appendChild(container);
}

/* ---- entrypoint */

if (typeof cssdebug_enabled == "boolean" && cssdebug_enabled) {
    cssdebug_enabled = false;

    mouseoutHandler();

    document.body.removeEventListener('mouseover', mouseoverHandler);
    document.body.removeEventListener('mouseout', mouseoutHandler);
    document.body.removeEventListener('click', clickHandler);
} else {
    cssdebug_enabled = true;

    createStyleTag(COMMON_STYLE);
    createStyleTag(BOX_STYLE);
    createStyleTag(TOOLTIP_STYLE);
    createStyleTag(DISTANCE_STYLE);

    document.body.addEventListener('mouseover', mouseoverHandler = function (e) {
        renderGuide(e.target);
        if (selectedTarget) renderDistance(selectedTarget, e.target);
    });
    document.body.addEventListener('mouseout', mouseoutHandler = function () {
        hideGuide();
        hideDistance();
    });
    document.body.addEventListener('click', clickHandler = function (e) {
        toggleSelected(e.target);
    });
}
