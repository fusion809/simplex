/**
 * Returns how long it took to run func() the first time, the total time 
 * taken after N runs and the average of those N runs. 
 * 
 * @param func     Function whose execution is to be timed.
 * @param N        Number of times it is to be run.
 * @return         first time execution time, total execution time over N runs 
 * and average of those times in an array.
 */
function meanTime(func, N) {
    // Initialize globals
    var sum = 0;
    var diff;
    var diffFirst;

    // Repeat running timeEx for N times
    for (let i = 0 ; i < N; i++) {
        diff = timeEx(func);
        if (i == 0) {
            diffFirst = diff;
        }
        sum += diff;
    }

    // Determine avg
    var avg = sum / N;

    return [diffFirst, sum, avg];
}

/**
 * Time the execution of the non-argument function specified.
 * 
 * @param func     A function that takes no arguments and whose execution is to
 * be timed.
 * @return         Take taken to execute func.
 */
function timeEx(func) {
    // Start time
    var start = new Date();
    start = start.getMilliseconds();

    func();

    // End time
    var end = new Date();
    end = end.getMilliseconds();

    // Difference
    var diff = end-start;

    return diff;
}