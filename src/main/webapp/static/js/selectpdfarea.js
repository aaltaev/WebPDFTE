var currPage = 1;
var numPages = 0;
var pdfDoc = null;
var canvases = [];
var backgrounds = [];
var x1 = 0;
var x2 = 0;
var y1 = 0;
var y2 = 0;
var isMouseDown = false;
var inputs = [];
var rectangles = [];

function drop() {
    var keys = Object.keys(canvases);
    var exampleCanvases = [];
    var exampleBackgrounds = [];
    var exampleRectangles = [];
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.includes("ex")) {
            exampleCanvases[key] = canvases[key];
            exampleBackgrounds[key] = backgrounds[key];
            exampleRectangles[key] = rectangles[key];
        }
    }

    currPage = 1;
    numPages = 0;
    pdfDoc = null;
    canvases = exampleCanvases;
    backgrounds = exampleBackgrounds;
    x1 = 0;
    x2 = 0;
    y1 = 0;
    y2 = 0;
    isMouseDown = false;
    inputs = [];
    rectangles = exampleRectangles;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////PDF FILE HANDLING////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/**
 * Displays selected PDF file information and starts its rendering
 */
function fileHandler() {
    reset();
    var pdfInput = document.getElementById("inpdf");

    if ('files' in pdfInput && pdfInput.files.length > 0) {
        document.getElementById("pdfLabel").innerHTML = pdfInput.value.split(/(\\|\/)/g).pop();
        var description = document.createElement('p');
        description.classList.add("lead");
        description.classList.add("text-justify");
        description.innerHTML = "Please select area using the mouse on each page. If you want to skip page, make no selection";
        var pdfDiv = document.getElementById('pdf');
        pdfDiv.appendChild(description);

        var tabHead = document.createElement('ul');
        tabHead.classList.add("nav");
        tabHead.classList.add("nav-tabs");
        tabHead.id = "pdfTabs";
        pdfDiv.appendChild(tabHead);

        var tabContent = document.createElement("div");
        tabContent.classList.add("tab-content");
        tabContent.id = "tab-content";
        pdfDiv.appendChild(tabContent);

        [].forEach.call(pdfInput.files, function (f, i) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var pdfFile = new Uint8Array(this.result);
                handlePdf(pdfFile);
            };
            reader.readAsArrayBuffer(f);
        });
    } else {
        document.getElementById('submitBtn').disabled = true;
    }
}

/**
 * Starts the rendering of PDF
 */
function handlePdf(pdfFile) {
    PDFJS.getDocument(pdfFile).then(function (pdf) {
        pdfDoc = pdf;
        numPages = pdf.numPages;
        pdf.getPage(1).then(handlePages);
    });
}

/**
 * Recursive. Creates canvases, adds mouse event listeners and creates
 * hidden inputs to store selection coordinates for each PDF page
 */
function handlePages(page) {
    var canvas = renderPage(page);
    canvas.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('mouseup', mouseUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);

    var tab = document.createElement("a");
    tab.href = "#" + currPage;
    tab.innerHTML = currPage;
    var li = document.createElement("li");
    li.appendChild(tab);

    var tabContent = document.createElement("div");
    tabContent.classList.add("tab-pane");
    tabContent.id = currPage;
    if (currPage == 1) {
        tabContent.classList.add("active");
        li.classList.add("active");
    }
    tabContent.appendChild(canvas);
    tabContent.appendChild(document.createElement('br'));
    tabContent.appendChild(createDropButton(currPage));
    tabContent.appendChild(document.createElement('br'));
    tabContent.appendChild(document.createElement('br'));

    document.getElementById("pdfTabs").appendChild(li);
    document.getElementById("tab-content").appendChild(tabContent);

    var form = document.getElementById('pdfformhidden');
    var xStartInput = createInput('startX', currPage);
    var yStartInput = createInput('startY', currPage);
    var xEndInput = createInput('endX', currPage);
    var yEndInput = createInput('endY', currPage);
    form.appendChild(xStartInput);
    form.appendChild(yStartInput);
    form.appendChild(xEndInput);
    form.appendChild(yEndInput);
    inputs.push(xStartInput, yStartInput, xEndInput, yEndInput);

    currPage++;
    if (pdfDoc != null && currPage <= numPages) {
        //handling next page
        pdfDoc.getPage(currPage).then(handlePages);
    } else {
        // if no more pages, then add listeners to tab buttons
        $("#pdfTabs").find("a").click(function (e) {
            e.preventDefault();
            $(this).tab('show')
        });
    }
}

/**
 * Returns canvas with rendered PDF page
 */
function renderPage(page) {
    var viewport = page.getViewport(1);
    var scale = window.innerHeight / viewport.height;
    viewport = page.getViewport(scale);
    var canvas = document.createElement('canvas');
    canvases[currPage] = canvas;
    canvas.id = "pdfcanvas" + currPage;
    canvas.style.border = '1px solid black';
    var ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({canvasContext: ctx, viewport: viewport});
    return canvas;
}

/**
 * Loads example PDF with given id, renders it on canvas
 * and adds mouse event listeners to that canvas
 * @param id
 */
function loadExample(id) {
    PDFJS.getDocument("http://cells.icc.ru/pdfte/static/examples/" + id + ".pdf").then(function (pdf) {
        pdf.getPage(1).then(function (page) {
            var canvas = document.getElementById("pdfcanvasex" + id);
            canvases["ex" + id] = canvas;
            var ctx = canvas.getContext("2d");
            var viewport = page.getViewport(1);
            var scale = (document.getElementById("pdf").clientWidth - 100) / viewport.width;
            viewport = page.getViewport(scale);
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page.render({canvasContext: ctx, viewport: viewport}).promise.then(function () {
                backgrounds["ex" + id]
                    = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
                var rectangle = new Rectangle();
                var coords = getExampleCoordinates(id);
                rectangle.x1 = coords.x1 * canvas.width;
                rectangle.x2 = coords.x2 * canvas.width;
                rectangle.y1 = canvas.height - coords.y2 * canvas.height;
                rectangle.y2 = canvas.height - coords.y1 * canvas.height;
                rectangles["ex" + id] = rectangle;
                rectangle.draw(canvas, backgrounds["ex" + id]);
                writeParametersForExample(id);
            });
            canvas.addEventListener('mousedown', mouseDownHandler, false);
            canvas.addEventListener('mousemove', mouseMoveHandler, false);
            canvas.addEventListener("mouseup", function (event) {
                mouseUpHandler(event);
                if (event.button == 0) {
                    writeParametersForExample(id);
                }
            }, false);
        });
    });
}

function writeParametersForExample(id) {
    var canvas = document.getElementById("pdfcanvasex" + id);
    var rect = rectangles["ex" + id];
    var x1 = rect.x1, x2 = rect.x2, y1 = rect.y1, y2 = rect.y2;
    y1 = canvas.height - y1;
    y2 = canvas.height - y2;
    var temp;
    if (x1 > x2) {
        temp = x1;
        x1 = x2;
        x2 = temp;
    }
    if (y1 > y2) {
        temp = y1;
        y1 = y2;
        y2 = temp;
    }
    //передаем относительные координаты в параметры запроса кнопки
    document.getElementById("link" + id).href = "/pdfte/example?id=" + id;
    document.getElementById("link" + id).href += "&x1=" + x1 / canvas.width;
    document.getElementById("link" + id).href += "&y1=" + y1 / canvas.height;
    document.getElementById("link" + id).href += "&x2=" + x2 / canvas.width;
    document.getElementById("link" + id).href += "&y2=" + y2 / canvas.height;
}
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////RECTANGLE////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/**
 *  Rectangle is an area selected by user on canvas that contains PDF page.
 *  Rectangle is resizable.
 */
function Rectangle() {
    /**
     * Left
     */
    this.x1 = 0;
    /**
     * Top
     */
    this.y1 = 0;
    /**
     * Right
     */
    this.x2 = 0;
    /**
     * Bottom
     */
    this.y2 = 0;

    this.clicked = false;
    var DRAG_THRESHOLD = 5;

    var standardDirections = {
        NONE: 0,
        NORTH: 1,
        EAST: 2,
        SOUTH: 4,
        WEST: 8
    };

    this.dragDirections = {
        NONE: standardDirections.NONE,
        NORTH: standardDirections.NORTH,
        EAST: standardDirections.EAST,
        SOUTH: standardDirections.SOUTH,
        WEST: standardDirections.WEST,
        NORTH_EAST: standardDirections.NORTH | standardDirections.EAST,
        NORTH_WEST: standardDirections.NORTH | standardDirections.WEST,
        SOUTH_EAST: standardDirections.SOUTH | standardDirections.EAST,
        SOUTH_WEST: standardDirections.SOUTH | standardDirections.WEST
    };

    this.lastDragDirection = this.dragDirections.NONE;

    function drawCircle(x, y, r, color, context) {
        context.closePath();
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        context.stroke();
        context.closePath();
    }

    this.draw = function (canvas, background) {
        var context = canvas.getContext("2d");
        context.globalAlpha = 0.3;
        var width = this.x2 - this.x1;
        var height = this.y2 - this.y1;
        context.beginPath();
        context.fillStyle = "#FF0000";
        context.putImageData(background, 0, 0);
        context.fillRect(this.x1, this.y1, width, height);
        context.globalAlpha = 1.0;
        context.rect(this.x1, this.y1, width, height);
        context.stroke();
        context.closePath();

        drawCircle(this.x1 + width / 2, this.y1, 4, "#0FA3B1", context);
        drawCircle(this.x1 + width / 2, this.y2, 4, "#0FA3B1", context);
        drawCircle(this.x1, this.y1 + height / 2, 4, "#0FA3B1", context);
        drawCircle(this.x2, this.y1 + height / 2, 4, "#0FA3B1", context);
    };

    /**
     * Returns direction depending on mouse cursor position
     */
    this.getDragDirection = function (mouseX, mouseY) {
        var direction;
        if (this.clicked) {
            return this.lastDragDirection;
        } else if (this.isInside(mouseX, mouseY)) {
            if (Math.abs(mouseY - this.y1) < DRAG_THRESHOLD && Math.abs(mouseX - this.x1) < DRAG_THRESHOLD) {
                direction = this.dragDirections.NORTH_WEST;
            } else if (Math.abs(mouseY - this.y1) < DRAG_THRESHOLD && Math.abs(mouseX - this.x2) < DRAG_THRESHOLD) {
                direction = this.dragDirections.NORTH_EAST;
            } else if (Math.abs(mouseY - this.y2) < DRAG_THRESHOLD && Math.abs(mouseX - this.x1) < DRAG_THRESHOLD) {
                direction = this.dragDirections.SOUTH_WEST;
            } else if (Math.abs(mouseY - this.y2) < DRAG_THRESHOLD && Math.abs(mouseX - this.x2) < DRAG_THRESHOLD) {
                direction = this.dragDirections.SOUTH_EAST;
            } else if (Math.abs(mouseX - this.x1) < DRAG_THRESHOLD) {
                direction = this.dragDirections.EAST;
            } else if (Math.abs(mouseX - this.x2) < DRAG_THRESHOLD) {
                direction = this.dragDirections.WEST;
            } else if (Math.abs(mouseY - this.y1) < DRAG_THRESHOLD) {
                direction = this.dragDirections.NORTH;
            } else if (Math.abs(mouseY - this.y2) < DRAG_THRESHOLD) {
                direction = this.dragDirections.SOUTH;
            } else {
                direction = this.dragDirections.NONE;
            }
        }
        this.lastDragDirection = direction;
        return direction;
    };

    /**
     * Returns whether the mouse cursor is inside of this rectangle
     */
    this.isInside = function (mouseX, mouseY) {
        return mouseX > this.x1 - DRAG_THRESHOLD
            && mouseX < this.x2 + DRAG_THRESHOLD
            && mouseY > this.y1 - DRAG_THRESHOLD
            && mouseY < this.y2 + DRAG_THRESHOLD;
    };

    /**
     * Resizes this rectangle depending on drag direction
     */
    this.resize = function (mouseX, mouseY) {
        switch (this.getDragDirection(mouseX, mouseY)) {
            case this.dragDirections.NORTH_WEST:
                this.resizeNorth(mouseY);
                this.resizeEast(mouseX);
                break;
            case this.dragDirections.NORTH_EAST:
                this.resizeNorth(mouseY);
                this.resizeWest(mouseX);
                break;
            case this.dragDirections.SOUTH_WEST:
                this.resizeSouth(mouseY);
                this.resizeEast(mouseX);
                break;
            case this.dragDirections.SOUTH_EAST:
                this.resizeSouth(mouseY);
                this.resizeWest(mouseX);
                break;
            case this.dragDirections.NORTH:
                this.resizeNorth(mouseY);
                break;
            case this.dragDirections.SOUTH:
                this.resizeSouth(mouseY);
                break;
            case this.dragDirections.WEST:
                this.resizeWest(mouseX);
                break;
            case this.dragDirections.EAST:
                this.resizeEast(mouseX);
                break;
        }
    };

    this.resizeNorth = function (mouseY) {
        var newHeight = this.y2 - mouseY;
        if (newHeight > 50) {
            this.y1 = mouseY;
        }
    };

    this.resizeSouth = function (mouseY) {
        var newHeight = mouseY - this.y1;
        if (newHeight > 50) {
            this.y2 = mouseY;
        }
    };

    this.resizeWest = function (mouseX) {
        var newWidth = mouseX - this.x1;
        if (newWidth > 50) {
            this.x2 = mouseX;
        }
    };

    this.resizeEast = function (mouseX) {
        var newWidth = this.x2 - mouseX;
        if (newWidth > 50) {
            this.x1 = mouseX;
        }
    };
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////MOUSE LISTENERS/////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

/**
 * Saves the mouse coordinates and canvas background image
 */
function mouseDownHandler(event) {
    if (event.button == 0) {
        var id = event.target.id.replace('pdfcanvas', '');
        var canvas = canvases[id];
        if (backgrounds[id] == null) {
            backgrounds[id] = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        }
        if (rectangles[id] == null) {
            x1 = event.pageX - getCoords(canvas).left;
            y1 = event.pageY - getCoords(canvas).top;
        }
        isMouseDown = true;
    }
}

/**
 * Resizes the selected rectangle, and changes the cursor style depending on its position
 */
function mouseMoveHandler(event) {
    var id = event.target.id.replace('pdfcanvas', '');
    var canvas = canvases[id];
    var mouseX = event.pageX - getCoords(canvas).left;
    var mouseY = event.pageY - getCoords(canvas).top;
    if (isMouseDown) {
        if (rectangles[id] == null) {
            x2 = event.pageX - getCoords(canvas).left;
            y2 = event.pageY - getCoords(canvas).top;
            var newRectangle = new Rectangle();
            newRectangle.x1 = x1 < x2 ? x1 : x2;
            newRectangle.y1 = y1 < y2 ? y1 : y2;
            newRectangle.x2 = x1 > x2 ? x1 : x2;
            newRectangle.y2 = y1 > y2 ? y1 : y2;
            newRectangle.draw(canvas, backgrounds[id]);
        } else {
            var resizableRectangle = rectangles[id];
            resizableRectangle.clicked = true;
            if (resizableRectangle.getDragDirection(mouseX, mouseY) != resizableRectangle.dragDirections.NONE) {
                resizableRectangle.resize(mouseX, mouseY);
                resizableRectangle.draw(canvas, backgrounds[id]);
            }
        }
    } else {
        if (rectangles[id] != null) {
            var rectangle = rectangles[id];
            switch (rectangle.getDragDirection(mouseX, mouseY)) {
                case rectangle.dragDirections.NORTH:
                    canvas.style.cursor = "n-resize";
                    break;
                case rectangle.dragDirections.SOUTH:
                    canvas.style.cursor = "s-resize";
                    break;
                case rectangle.dragDirections.WEST:
                    canvas.style.cursor = "w-resize";
                    break;
                case rectangle.dragDirections.EAST:
                    canvas.style.cursor = "e-resize";
                    break;
                case rectangle.dragDirections.SOUTH_EAST:
                    canvas.style.cursor = "se-resize";
                    break;
                case rectangle.dragDirections.SOUTH_WEST:
                    canvas.style.cursor = "sw-resize";
                    break;
                case rectangle.dragDirections.NORTH_EAST:
                    canvas.style.cursor = "ne-resize";
                    break;
                case rectangle.dragDirections.NORTH_WEST:
                    canvas.style.cursor = "nw-resize";
                    break;
                default:
                    canvas.style.cursor = "crosshair";
                    break;
            }
        }
    }
}

/**
 * Saves the rectangle and writes its coordinates to appropriate inputs
 */
function mouseUpHandler(event) {
    if (event.button == 0) {
        document.getElementById("submitBtn").disabled = true;
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i] != '') {
                document.getElementById("submitBtn").disabled = false;
                break;
            }
        }

        var id = event.target.id.replace('pdfcanvas', '');
        var canvas = canvases[id];
        var rect;
        if (rectangles[id] == null) {
            rect = new Rectangle();
            rect.x1 = x1 < x2 ? x1 : x2;
            rect.y1 = y1 < y2 ? y1 : y2;
            rect.x2 = x1 > x2 ? x1 : x2;
            rect.y2 = y1 > y2 ? y1 : y2;
            rect.clicked = false;
            rect.draw(canvas, backgrounds[id]);
            rectangles[id] = rect;
        }
        rect = rectangles[id];
        rect.clicked = false;

        x1 = rect.x1;
        x2 = rect.x2;
        y1 = canvas.height - rect.y1;
        y2 = canvas.height - rect.y2;
        var temp;
        if (x1 > x2) {
            temp = x1;
            x1 = x2;
            x2 = temp;
        }
        if (y1 > y2) {
            temp = y1;
            y1 = y2;
            y2 = temp;
        }
        try {
            document.getElementById('startX' + id).value = x1 / canvas.width;
            document.getElementById('startY' + id).value = y1 / canvas.height;
            document.getElementById('endX' + id).value = x2 / canvas.width;
            document.getElementById('endY' + id).value = y2 / canvas.height;
        } catch (e) {
        }
    }
    isMouseDown = false;
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////UTILS//////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a hidden input for parameter specified with its id and its number
 */
function createInput(id, number) {
    var input = document.createElement("input");
    input.type = 'hidden';
    input.id = (id + number);
    input.name = input.id;
    return input;
}

/**
 * Returns the coordinates of element on page
 */
function getCoords(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {top: Math.round(top), left: Math.round(left)};
}

/**
 * Creates a button that will drop selection on page with specified id
 */
function createDropButton(pageId) {
    var dropBtn = document.createElement('button');
    dropBtn.id = 'drop' + pageId;
    dropBtn.innerHTML = "Drop selection";
    dropBtn.onclick = function () { //dropping the selection
        var id = this.id.replace('drop', '');
        rectangles[id] = null;
        canvases[id].getContext('2d').putImageData(backgrounds[id], 0, 0);
        document.getElementById('startX' + id).value = '';
        document.getElementById('startY' + id).value = '';
        document.getElementById('endX' + id).value = '';
        document.getElementById('endY' + id).value = '';
        document.getElementById("submitBtn").disabled = true;
        for (var i = 0; i < rectangles.length; i++) {
            if (rectangles[i] != null) {
                document.getElementById("submitBtn").disabled = false;
                break;
            }
        }
    };
    return dropBtn;
}

/**
 * Skips all global variables and clears all forms
 */
function reset() {
    drop();
    document.getElementById("pdf").innerHTML = '';
    document.getElementById("pdfformhidden").innerHTML = '';
    document.getElementById("pdfLabel").innerHTML = 'No file selected';
}

/**
 * Returns coordinates of tables from PDF examples
 */
function getExampleCoordinates(id) {
    var coordinates;
    switch (id) {
        case "1":
            coordinates = {
                x1: 0.2219298245614035,
                y1: 0.3434593924364538,
                x2: 0.7885964912280702,
                y2: 0.629262244265344
            };
            break;
        case "2":
            coordinates = {
                x1: 0.11754385964912281,
                y1: 0.4662120272783633,
                x2: 0.8894736842105263,
                y2: 0.62678239305641664
            };
            break;
        case "3":
            coordinates = {
                x1: 0.11491228070175438,
                y1: 0.2610043397396156,
                x2: 0.8824561403508772,
                y2: 0.4265344079355239
            };
            break;
        case "4":
            coordinates = {
                x1: 0.11228070175438597,
                y1: 0.19094854308741477,
                x2: 0.8929824561403509,
                y2: 0.39801611903285805
            };
            break;
        case "5":
            coordinates = {
                x1: 0.12456140350877193,
                y1: 0.6856788592684439,
                x2: 0.8833333333333333,
                y2: 0.8791072535647861
            };
            break;
        case "6":
            coordinates = {
                x1: 0.11491228070175438,
                y1: 0.4549152542372881,
                x2: 0.862280701754386,
                y2: 0.711864406779661
            };
            break;
        case "7":
            coordinates = {
                x1: 0.24298245614035088,
                y1: 0.6271186440677966,
                x2: 0.7578947368421053,
                y2: 0.8223728813559322
            };
            break;
        case "8":
            coordinates = {
                x1: 0.14473684210526316,
                y1: 0.21898305084745762,
                x2: 0.8526315789473684,
                y2: 0.43186440677966104
            };
            break;
        case "9":
            coordinates = {
                x1: 0.10701754385964912,
                y1: 0.5233898305084745,
                x2: 0.9228070175438596,
                y2: 0.8583050847457627
            };
            break;
        case "10":
            coordinates = {
                x1: 0.05789473684210526,
                y1: 0.6542372881355932,
                x2: 0.9429824561403509,
                y2: 0.8752542372881356
            };
            break;
        default:
            coordinates = {
                x1: 0.2,
                y1: 0.4,
                x2: 0.8,
                y2: 0.6
            };
            break;
    }
    return coordinates;
}
