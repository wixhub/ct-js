This module abstracts the Web Pointer API, allowing you to track any type of pointers: mouses, touch events, tablet pens, or anything else that is supported by one's system.

The module replaces `ct.mouse` and `ct.touch` from previous versions, uniting their API and adding new features, like pressure and pen position reading.

## Reading Pointer Events

`ct.pointer` tracks all the current pointers on-screen, but selects one as a **primary pointer**. For touch-only devices, it will be the first touch in a multi-touch session. For devices with mouse, it will probably be the mouse.

The properties of a primary pointer can be read with these properties (in form of `ct.pointer.x`, `ct.pointer.y` and so on):

* `x`, `y` — the current position of the pointer in gameplay coordinates;
* `xprev`, `yprev` — the position of the pointer in gameplay coordinates during the passed frame;
* `xui`, `yui` — the current position of the pointer in UI coordinates;
* `xuiprev`, `yuiprev` — the position of the pointer in UI coordinates during the passed frame;
* `pressure` — a float between 0 and 1 representing the pressure dealt on the pointer (think of a tablet pen where values close to 0 represent light strokes, and values close to 1 — ones made with strong pressure);
* `buttons` — a bit mask showing which buttons are pressed on the pointer's device. Use `ct.pointer.isButtonPressed` to get whether a particular button is pressed. See more info about the `buttons` property on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#determining_button_states).
* `tiltX`, `tiltY` — floats between -90 and 90 indicating a pen's tilt.
* `twist` — a value between 0 and 360 indicating the rotation of the pointer's device, clockwise.
* `width`, `height` — the size of the pointer in gameplay coordinates.
* `type` — usually is `'mouse'`, `'pen'`, or `'touch'`. Tells which device is used as a primary pointer.
