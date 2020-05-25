/**
 * @method toggleDisplay
 * @description Toggles the display of a DOM element
 * @param element {HTML Element} element whose display we're toggling 
 */
function toggleDisplay(element) {
    element.style.display !== 'none' ? element.style.display = 'none' : element.style.display = 'block';
}

/**
 * @module utils
 * @description Module for util functions
 */
export default {
    toggleDisplay
};