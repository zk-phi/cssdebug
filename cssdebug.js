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
.cssdebug.selected > .mg,
.cssdebug.selected > .bd,
.cssdebug.selected > .pd,
.cssdebug.selected > .bx {
    background: none;
    border-style: solid;
}
.cssdebug > .mg { background-color: rgba(243, 152, 0, 0.15); border: 1px #f39800 dashed; }
.cssdebug > .bd { background-color: rgba(255, 212, 0, 0.15); border: 1px #ffd400 dashed; }
.cssdebug > .pd { background-color: rgba(0, 140, 64, 0.15); border: 1px #00bb20 dashed; }
.cssdebug > .bx { background-color: rgba(0, 100, 255, 0.15); border: 1px #0000e6 dashed; }
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
.cssdebug > .i > .id { color: #ffb384; }
.cssdebug > .i > .class { color: #84b3ff; }
.cssdebug.selected > .i { display: none }
`;

var VDISTANCE_STYLE = `
.cssdebug > .dv {
    padding-left: 5px;
    font-size: 10px;
    font-weight: bold;
    color: red;
    border-left: 1px red solid;
}
.cssdebug > .dv:before {
    content: ' ';
    display: block;
    position: absolute;
    top: 0px;
    left: -5px;
    width: 10px;
    height: 100%;
    border-top: 1px red solid;
    border-bottom: 1px red solid;
    font-weight: bold;
}
`;

var HDISTANCE_STYLE = `
.cssdebug > .dh {
    text-align: center;
    padding-top: 5px;
    font-size: 10px;
    font-weight: bold;
    color: red;
    border-top: 1px red solid;
}
.cssdebug > .dh:before {
    content: ' ';
    display: block;
    position: absolute;
    top: -5px;
    left: 0px;
    width: 100%;
    height: 10px;
    border-left: 1px red solid;
    border-right: 1px red solid;
    font-weight: bold;
}
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

function unselectCurrentSelection () {
    if (selectedGuide) {
        selectedGuide.parentNode.removeChild(selectedGuide);
        selectedGuide = selectedTarget = null;
    }
}

function selectCurrentElem () {
    unselectCurrentSelection();

    if (currentGuide) {
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
        <span class="id">${ elem.id ? "#" + elem.id : "" }</span>
        <span class="class">${ elem.className ? "." + elem.className.replace(/\s/g, ".") : "" }</span>
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

    var baseStyles = window.getComputedStyle(baseElem);
    var baseBorder = {
        top: parseFloat(baseStyles['border-top-width']),
        right: parseFloat(baseStyles['border-right-width']),
        bottom: parseFloat(baseStyles['border-bottom-width']),
        left: parseFloat(baseStyles['border-left-width'])
    };

    var targetStyles = window.getComputedStyle(targetElem);
    var targetBorder = {
        top: parseFloat(targetStyles['border-top-width']),
        right: parseFloat(targetStyles['border-right-width']),
        bottom: parseFloat(targetStyles['border-bottom-width']),
        left: parseFloat(targetStyles['border-left-width'])
    };

    /* left */
    if (targetRect.left < baseRect.right) {
        var leftDistance = (targetRect.right <= baseRect.left ? targetRect.right : targetRect.left) - baseRect.left;
        if (leftDistance) {
            var left   = createDIVWithClass('dh');
            var top    = (leftDistance < 0 ? baseBoundingRect.top : targetBoundingRect.top) + offsetY;
            var height = leftDistance < 0 ? baseBoundingRect.height : targetBoundingRect.height;
            var border = leftDistance < 0 ? targetBorder.left : baseBorder.left;
            left.style.top   = top + height / 2 + 'px';
            left.style.left  = Math.min(baseRect.left + leftDistance, baseRect.left) + offsetX + 'px';
            left.style.width = Math.abs((baseRect.left + leftDistance) - baseRect.left) + 'px';
            left.innerHTML   = `<span>${ Math.abs(leftDistance) - border + (border ? " + " + border : "") }</span>`;
            container.appendChild(left);
        }
    }

    /* right */
    if (baseRect.left < targetRect.right) {
        var rightDistance = (baseRect.right <= targetRect.left ? targetRect.left : targetRect.right) - baseRect.right;
        if (rightDistance) {
            var right  = createDIVWithClass('dh');
            var top    = (rightDistance > 0 ? baseBoundingRect.top : targetBoundingRect.top) + offsetY;
            var height = rightDistance > 0 ? baseBoundingRect.height : targetBoundingRect.height;
            var border = rightDistance > 0 ? targetBorder.right : baseBorder.right;
            right.style.top   = top + height / 2 + 'px';
            right.style.left  = Math.min(baseRect.right + rightDistance, baseRect.right) + offsetX + 'px';
            right.style.width = Math.abs((baseRect.right + rightDistance) - baseRect.right) + 'px';
            right.innerHTML   = `<span>${ Math.abs(rightDistance) - border + (border ? " + " + border : "") }</span>`;
            container.appendChild(right);
        }
    }

    /* top */
    if (targetRect.top < baseRect.bottom) {
        var topDistance = (targetRect.bottom <= baseRect.top ? targetRect.bottom : targetRect.top) - baseRect.top;
        if (topDistance) {
            var top    = createDIVWithClass('dv');
            var left   = (topDistance < 0 ? baseBoundingRect.left : targetBoundingRect.left) + offsetX;
            var width  = topDistance < 0 ? baseBoundingRect.width : targetBoundingRect.width;
            var border = topDistance < 0 ? targetBorder.top : baseBorder.top;
            top.style.left       = left + width / 2 + 'px';
            top.style.top        = Math.min(baseRect.top + topDistance, baseRect.top) + offsetY + 'px';
            top.style.lineHeight = Math.abs((baseRect.top + topDistance) - baseRect.top) + 'px';
            top.innerHTML        = `<span>${ Math.abs(topDistance) - border + (border ? " + " + border : "") }</span>`;
            container.appendChild(top);
        }
    }

    /* bottom */
    if (baseRect.top < targetRect.bottom) {
        var bottomDistance = (baseRect.bottom <= targetRect.top ? targetRect.top : targetRect.bottom) - baseRect.bottom;
        if (bottomDistance) {
            var bottom = createDIVWithClass('dv');
            var left   = (bottomDistance > 0 ? baseBoundingRect.left : targetBoundingRect.left) + offsetX;
            var width  = bottomDistance > 0 ? baseBoundingRect.width : targetBoundingRect.width;
            var border = bottomDistance > 0 ? targetBorder.bottom : baseBorder.bottom;
            bottom.style.left       = left + width / 2 + 'px';
            bottom.style.top        = Math.min(baseRect.bottom + bottomDistance, baseRect.bottom) + offsetY + 'px';
            bottom.style.lineHeight = Math.abs((baseRect.bottom + bottomDistance) - baseRect.bottom) + 'px';
            bottom.innerHTML        = `<span>${ Math.abs(bottomDistance) - border + (border ? " + " + border : "") }</span>`;
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
    createStyleTag(VDISTANCE_STYLE);
    createStyleTag(HDISTANCE_STYLE);

    document.body.addEventListener('mouseover', mouseoverHandler = function (e) {
        renderGuide(e.target);
        if (selectedTarget) renderDistance(selectedTarget, e.target);
    });
    document.body.addEventListener('mouseout', mouseoutHandler = function () {
        hideGuide();
        hideDistance();
    });
    document.body.addEventListener('click', clickHandler = function (e) {
        e.preventDefault();
        if (selectedGuide) {
            unselectCurrentSelection();
        } else {
            selectCurrentElem();
        }
    });
}
