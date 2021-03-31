/*
    Returns a new function that will delay execution
    of the original function for the specified number
    of milliseconds when called. Execution will be further
    delayed for the same number of milliseconds upon each
    subsequent call before execution occurs.

    The best way to explain this is to show its most obvious
    use-case: keyboard events in the browser.
*/
const cumulativeDelayed = function cumulativeDelayed(
    // eslint-disable-next-line @typescript-eslint/ban-types
    fn: Function,
    ms: number,
    ctx: Record<string, unknown>,
    ...args: unknown[]
    // eslint-disable-next-line @typescript-eslint/ban-types
): Function {
    var timeout: NodeJS.Timeout | null = null;
    return function cumulativeDelayeder() {
        var tempArgs = [...args],
            delayed = function delayed() {
                return fn.apply(ctx || null, args.concat(tempArgs));
            };
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(delayed, ms);
        return timeout;
    };
};

export default cumulativeDelayed;
