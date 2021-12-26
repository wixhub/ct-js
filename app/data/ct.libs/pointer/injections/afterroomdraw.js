for (const pointer of ct.pointer.down) {
    pointer.xprev = pointer.x;
    pointer.yprev = pointer.y;
    pointer.xuiprev = pointer.x;
    pointer.yuiprev = pointer.y;
}
for (const pointer of ct.pointer.hover) {
    pointer.xprev = pointer.x;
    pointer.yprev = pointer.y;
    pointer.xuiprev = pointer.x;
    pointer.yuiprev = pointer.y;
}
ct.pointer.clearReleased();
