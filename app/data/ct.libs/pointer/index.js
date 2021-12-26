(function mountCtPointer(ct) {
    const keyPrefix = 'pointer.';
    const setKey = function (key, value) {
        ct.inputs.registry[keyPrefix + key] = value;
    };
    const getKey = function (key) {
        return ct.inputs.registry[keyPrefix + key];
    };
    const buttonMappings = {
        Primary: 1,
        Middle: 4,
        Secondary: 2,
        ExtraOne: 8,
        ExtraTwo: 16,
        Eraser: 32
    };
    var lastPanNum = 0,
        lastPanX = 0,
        lastPanY = 0,
        lastScaleDistance = 0,
        lastAngle = 0;
    // updates Action system's input methods for singular, double and triple pointers
    var countPointers = () => {
        setKey('Any', ct.pointer.down.length > 0 ? 1 : 0);
        setKey('Double', ct.pointer.down.length > 1 ? 1 : 0);
        setKey('Triple', ct.pointer.down.length > 2 ? 1 : 0);
    };
    // returns a new object with the necessary information about a pointer event
    var copyPointer = e => {
        const rect = ct.pixiApp.view.getBoundingClientRect();
        const xui = (e.clientX - rect.left) / rect.width * ct.camera.width,
              yui = (e.clientY - rect.top) / rect.height * ct.camera.height;
        const positionGame = ct.u.uiToGameCoord(xui, yui);
        const pointer = {
            id: e.pointerId,
            x: positionGame.x,
            y: positionGame.y,
            xui: xui,
            yui: yui,
            xprev: positionGame.x,
            yprev: positionGame.y,
            buttons: e.buttons,
            xuiprev: xui,
            yuiprev: yui,
            pressure: e.pressure,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            twist: e.twist,
            type: e.pointerType,
            width: e.width / rect.width * ct.camera.width,
            height: e.height / rect.height * ct.camera.height
        };
        return pointer;
    };
    var updatePointer = (pointer, e) => {
        const rect = ct.pixiApp.view.getBoundingClientRect();
        const xui = (e.clientX - rect.left) / rect.width * ct.camera.width,
              yui = (e.clientY - rect.top) / rect.height * ct.camera.height;
        const positionGame = ct.u.uiToGameCoord(xui, yui);
        Object.assign(pointer, {
            x: positionGame.x,
            y: positionGame.y,
            xui: xui,
            yui: yui,
            pressure: e.pressure,
            buttons: e.buttons,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            twist: e.twist,
            width: e.width / rect.width * ct.camera.width,
            height: e.height / rect.height * ct.camera.height
        });
    };
    var writePrimary = function (pointer) {
        Object.assign(ct.pointer, {
            x: pointer.x,
            y: pointer.y,
            xui: pointer.xui,
            yui: pointer.yui,
            pressure: pointer.pressure,
            buttons: pointer.buttons,
            tiltX: pointer.tiltX,
            tiltY: pointer.tiltY,
            twist: pointer.twist
        });
        for (const button in buttonMappings) {
            // eslint-disable-next-line no-bitwise
            setKey(button, (pointer.buttons & buttonMappings[button]) === button ? 1 : 0);
        }
    };

    var handleHoverStart = function (e) {
        ct.pointer.type = e.pointerType;
        const pointer = copyPointer(e);
        ct.pointer.hover.push(pointer);
        if (e.isPrimary) {
            writePrimary(pointer);
        }
    };
    var handleHoverEnd = function (e) {
        const pointer = ct.pointer.hover.find(p => p.id === e.pointerId);
        pointer.invalid = true;
        if (pointer) {
            ct.pointer.hover.splice(ct.pointer.hover.indexOf(pointer), 1);
        }
    };
    var handleMove = function (e) {
        if (![/*%preventdefault%*/][0]) {
            e.preventDefault();
        }
        const pointerHover = ct.pointer.hover.find(p => p.id === e.pointerId);
        if (pointerHover) {
            updatePointer(pointerHover, e);
        }
        const pointerDown = ct.pointer.down.find(p => p.id === e.pointerId);
        if (pointerDown) {
            updatePointer(pointerDown, e);
            ct.pointer.updateGestures();
        }
        if (e.isPrimary) {
            writePrimary(pointerHover || pointerDown);
        }
    };
    var handleStart = function (e) {
        if (![/*%preventdefault%*/][0]) {
            e.preventDefault();
        }
        ct.pointer.type = e.pointerType;
        const pointer = copyPointer(e);
        ct.pointer.down.push(pointer);
        countPointers();
        if (e.isPrimary) {
            writePrimary(pointer);
        }
    };
    var handleRelease = function (e) {
        if (![/*%preventdefault%*/][0]) {
            e.preventDefault();
        }
        const pointer = ct.pointer.down.find(p => p.id === e.pointerId);
        if (pointer) {
            ct.pointer.released.push(pointer);
        }
        if (ct.pointer.down.indexOf(pointer) !== -1) {
            ct.pointer.down.splice(ct.pointer.down.indexOf(pointer), 1);
        }
        countPointers();
    };
    var handleWheel = function handleWheel(e) {
        setKey('Wheel', ((e.wheelDelta || -e.detail) < 0) ? -1 : 1);
        if (![/*%preventdefault%*/][0]) {
            e.preventDefault();
        }
    };

    var genericCollisionCheck = function genericCollisionCheck(
        copy,
        specificPointer,
        set,
        uiSpace
    ) {
        for (const pointer of set) {
            if (specificPointer && pointer !== specificPointer) {
                continue;
            }
            if (ct.place[uiSpace ? 'collideUi' : 'collide'](copy, {
                x: uiSpace ? pointer.xui : pointer.x,
                y: uiSpace ? pointer.yui : pointer.y,
                scale: {
                    x: 1,
                    y: 1
                },
                angle: 0,
                shape: {
                    type: 'rect',
                    top: pointer.height / 2,
                    bottom: pointer.height / 2,
                    left: pointer.width / 2,
                    right: pointer.width / 2
                }
            })) {
                return pointer;
            }
        }
        return false;
    };
    ct.pointer = {
        released: [],
        setupListeners() {
            document.addEventListener('pointerenter', handleHoverStart, false);
            document.addEventListener('pointerout', handleHoverEnd, false);
            document.addEventListener('pointerstart', handleStart, false);
            document.addEventListener('pointerend', handleRelease, false);
            document.addEventListener('pointercancel', handleRelease, false);
            document.addEventListener('pointermove', handleMove, false);
            document.addEventListener('wheel', handleWheel, false, {
                passive: false
            });
            document.addEventListener('DOMMouseScroll', handleWheel, {
                passive: false
            });
            document.addEventListener('contextmenu', e => {
                if (![/*%preventdefault%*/][0]) {
                    e.preventDefault();
                }
            });
        },
        down: [],
        hover: [],
        x: 0,
        y: 0,
        xprev: 0,
        yprev: 0,
        xui: 0,
        yui: 0,
        xuiprev: 0,
        yuiprev: 0,
        pressure: 1,
        buttons: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        width: 1,
        height: 1,
        type: null,
        clear() {
            ct.pointer.down.length = 0;
            ct.pointer.hover.length = 0;
            ct.pointer.clearReleased();
            countPointers();
        },
        clearReleased() {
            ct.pointer.released.length = 0;
        },
        collides(copy, pointer, checkReleased) {
            var set = checkReleased ? ct.pointer.released : ct.pointer.down;
            return genericCollisionCheck(copy, pointer, set, false);
        },
        collidesUi(copy, pointer, checkReleased) {
            var set = checkReleased ? ct.pointer.released : ct.pointer.down;
            return genericCollisionCheck(copy, pointer, set, true);
        },
        hovers(copy, pointer) {
            return genericCollisionCheck(copy, pointer, ct.pointer.hover, false);
        },
        hoversUi(copy, pointer) {
            return genericCollisionCheck(copy, pointer, ct.pointer.hover, true);
        },
        isButtonPressed(button, pointer) {
            if (!pointer) {
                return Boolean(getKey(button));
            }
            // eslint-disable-next-line no-bitwise
            return (pointer.buttons & buttonMappings[button]) === button ? 1 : 0;
        },
        updateGestures() {
            let x = 0,
                y = 0;
            const rect = ct.pixiApp.view.getBoundingClientRect();
            for (const event of ct.pointer.down) {
                x += (event.clientX - rect.left) / rect.width;
                y += (event.clientY - rect.top) / rect.height;
            }
            x /= ct.pointer.down.length;
            y /= ct.pointer.down.length;

            let angle = 0,
                distance = lastScaleDistance;
            if (ct.pointer.down.length > 1) {
                const events = [
                    ct.pointer.down[0],
                    ct.pointer.down[1]
                ].sort((a, b) => a.id - b.id);
                angle = ct.u.pdn(
                    events[0].x,
                    events[0].y,
                    events[1].x,
                    events[1].y
                );
                distance = ct.u.pdc(
                    events[0].x,
                    events[0].y,
                    events[1].x,
                    events[1].y
                );
            }

            if (lastPanNum === ct.pointer.down.length) {
                if (ct.pointer.down.length > 1) {
                    setKey('DeltaRotation', (ct.u.degToRad(ct.u.deltaDir(lastAngle, angle))));
                    setKey('DeltaPinch', distance / lastScaleDistance - 1);
                } else {
                    setKey('DeltaPinch', 0);
                    setKey('DeltaRotation', 0);
                }
                if (!ct.pointer.down.length) {
                    setKey('PanX', 0);
                    setKey('PanY', 0);
                } else {
                    setKey('PanX', x - lastPanX);
                    setKey('PanY', y - lastPanY);
                }
            } else {
                // skip gesture updates to avoid shaking on new presses
                lastPanNum = ct.pointer.down.length;
                setKey('DeltaPinch', 0);
                setKey('DeltaRotation', 0);
                setKey('PanX', 0);
                setKey('PanY', 0);
            }
            lastPanX = x;
            lastPanY = y;
            lastAngle = angle;
            lastScaleDistance = distance;
        }
    };
})(ct);
