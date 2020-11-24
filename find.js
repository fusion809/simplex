/**
 * Search for target in arr.
 * 
 * @param arr      1d array to search.
 * @param target   Target to find in arr.
 * @return         A Boolean that indicates whether target was found in arr.
 */
function find(arr, target) {
    // Loop over array elements checking for whether they match target
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return true;
        }
    }

    return false;
}