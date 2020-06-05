import config from "./config";

/**
 * @method toggleDisplay
 * @description Toggles the display of a DOM element
 * @param element {HTML Element} element whose display we're toggling 
 */
function toggleDisplay(element) {
    element.style.display !== 'none' ? element.style.display = 'none' : element.style.display = 'block';
}

/**
 * @method resetHarvestFieldButtonDisplay
 * @description Toggles the display of all harvest field buttons
 * @param scene {Phaser.Scene} 
 */
function resetHarvestFieldButtonDisplay(scene) {
    toggleDisplay(scene.dashboard.getChildByID('harvestFieldButton'));
    toggleDisplay(scene.dashboard.getChildByID('leftFieldButton'));
    toggleDisplay(scene.dashboard.getChildByID('rightFieldButton'));
}

/**
 * @method getPlayersExcept
 * @description Returns players object excluding specified player
 * @param playersObject {Object} all the players
 * @param playerToExclude {string} player ID to exclude
 * @returns {Object} of players excluding specified player
 */
function getPlayersExcept(playersObject, playerToExclude) {
    let players = {};
    for (let player in playersObject) {
        if (player !== playerToExclude) {
            players[player] = playersObject[player];
        }
    }
    return players;
}

/**
 * @method isFieldEmpty
 * @description Checks if field passed in is empty
 * @param field {Object}
 * @returns {boolean} 
 */
function isFieldEmpty(field) {
    return field.fieldType === config.CONSTANTS.EMPTY_FIELD;
}

/**
 * @method getAvailableField
 * @description Checks if there is a field where cardPlanted can be planted
 * @param fields {Array} player's fields to check
 * @param cardPlanted {string} card type to check field type against
 * @returns {Object} field that is available 
 */
function getAvailableField(fields, cardPlanted) {
    let emptyFields = fields.filter((field) => isFieldEmpty(field));
    let matchingFields = fields.filter((field) => field.fieldType === cardPlanted);
    return matchingFields.concat(emptyFields)[0];
}

/**
 * @module utils
 * @description Module for util functions
 */
export default {
    toggleDisplay,
    resetHarvestFieldButtonDisplay,
    getPlayersExcept,
    isFieldEmpty,
    getAvailableField
};
