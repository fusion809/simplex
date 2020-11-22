

/**
 * Time the execution of the non-argument function specified.
 * 
 * @param func     A function that takes no arguments and whose execution is to
 * be timed.
 * @return         Take taken to execute func.
 */
function timeEx(func) {
    var start = new Date();
    start = start.getMilliseconds();

    func();

    var end = new Date();
    end = end.getMilliseconds();

    var diff = end-start;
    // console.log("That took " + diff + " ms");
    return diff;
}

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
    var sum = 0;
    var diff;
    var diffFirst;
    for (let i = 0 ; i < N; i++) {
        diff = timeEx(func);
        console.log(diff);
        if (i == 0) {
            diffFirst = diff;
        }
        sum += diff;
    }
    var avg = sum / N;

    return [diffFirst, sum, avg];
}