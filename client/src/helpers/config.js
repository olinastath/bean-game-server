/**
 * @constant BEAN_HARVESTING_NUMBERS_MAP
 * @memberof config
 * @description Constant to store the mappings of harvesting values for each bean type.
*/
const BEAN_HARVESTING_NUMBERS_MAP = {
    'cocoaBean': {2: 2, 3: 3, 4:4},
    'gardenBean': {2: 2, 3: 3},
    'redBean': {2: 1, 3: 2, 4: 3, 5: 4},
    'blackEyedBean': {2: 1, 4: 2, 5: 3, 6: 4},
    'soyBean': {2: 1, 4: 2, 6: 3, 7: 4},
    'greenBean': {3: 1, 5: 2, 6: 3, 7: 4},
    'stinkBean': {3: 1, 5: 2, 7: 3, 8: 3},
    'chiliBean': {3: 1, 6: 2, 8: 3, 9: 4},
    'blueBean': {4: 1, 6: 2, 8: 3, 10: 4},
    'waxBean': {4: 1, 7: 2, 9: 3, 11: 4},
    'coffeeBean': {4: 1, 7: 2, 10: 3, 12: 4}
};

/**
 * @constant BEAN_NAME_MAP
 * @memberof config
 * @description Constant to store the mappings of bean types to names.
*/
const BEAN_NAME_MAP = {
    'cocoaBean': 'cocoa bean',
    'gardenBean': 'garden bean',
    'redBean': 'red bean',
    'blackEyedBean': 'black eyed bean',
    'soyBean': 'soy bean',
    'greenBean': 'green bean',
    'stinkBean': 'stink bean',
    'chiliBean': 'chili bean',
    'blueBean': 'blue bean',
    'waxBean': 'wax bean',
    'coffeeBean': 'coffee bean'
};

/**
 * @constant FLAGS
 * @memberof config
 * @description Constant to store flags to signify whether harvesting and discarding.
 * @type {{HARVEST_FLAG: string}, {DISCARD_FLAG: string}}
 * @property {string} HARVEST_FLAG The harvesting flag value
 * @property {string} DISCARD_FLAG The discarding flag value
*/
const FLAGS = {
    HARVEST_FLAG: 'harvest',
    DISCARD_FLAG: 'discard'
};

/**
 * @constant ENTRY_POINTS
 * @memberof config
 * @description Constant to store flags to signify whether harvesting and discarding.
 * @type {{OPEN_CARDS: string}, {FIELD: string}}
 * @property {string} OPEN_CARDS The open cards entry point value
 * @property {string} FIELD The field entry point value
*/
const ENTRY_POINTS = {
    OPEN_CARDS: 'OPEN_CARDS',
    FIELD: 'FIELD'
}

/**
 * @constant FIELD_INDEX
 * @memberof config
 * @description Constant to store flags to signify whether harvesting and discarding.
 * @type {{LEFT_FIELD: Number}, {RIGHT_FIELD: Number}}
 * @property {Number} LEFT_FIELD The open cards entry point value
 * @property {Number} RIGHT_FIELD The field entry point value
*/
const FIELD_INDEX = {
    LEFT_FIELD: 0,
    RIGHT_FIELD: 1
}

/**
 * @constant ALERT_MESSAGES
 * @memberof config
 * @description Constant to store alert messages.
 * @type {{RESHUFFLE_WARNING: string}, {RESHUFFLE_SUCCESS: Number}, {GAME_ENDING_WARNING: string}, {GAME_ENDED: string}}
 * @property {string} RESHUFFLE_WARNING Alert message for deck running low
 * @property {string} RESHUFFLE_SUCCESS Alert message for successful reshuffling
 * @property {string} GAME_ENDING_WARNING Alert message for game ending warning
 * @property {string} GAME_ENDED Alert message for final moves as game has ended
*/
const ALERT_MESSAGES = {
    RESHUFFLE_WARNING: 'Deck is running low, will reshuffle from discard pile before next player\'s turn.',
    RESHUFFLE_SUCCESS: 'Discard pile has been reshuffled, REPLACE_TEXT.',
    GAME_ENDING_WARNING: 'Deck is running low, each player has one(-ish) turn left (probably, the math could be off).',
    GAME_ENDED: 'Deck has run out. Finish this round, harvest your fields, and press "end game" to broadcast your results.'
}

/**
 * @constant EMPTY_FIELD
 * @memberof config
 * @description Constant to store empty field type
 * @type {string}
 */
const EMPTY_FIELD = 'empty'

/**
 * @constant CONSTANTS
 * @memberof config
 * @description Collection of constants values for usage in component.
 * @type {{
    *     BEAN_HARVESTING_NUMBERS_MAP: Object,
    *     BEAN_NAME_MAP: Object,
    *     FLAGS: Object,
    *     ENTRY_POINTS: Object,
    *     FIELD_INDEX: Object,
    *     ALERT_MESSAGES: Object,
    *     EMPTY_FIELD: string
    * }}
* @property {Object} BEAN_HARVESTING_NUMBERS_MAP
* @property {Object} BEAN_NAME_MAP
* @property {Object} FLAGS
* @property {Object} ENTRY_POINTS
* @property {Object} FIELD_INDEX
* @property {Object} ALERT_MESSAGES
* @property {string} EMPTY_FIELD
*/
const CONSTANTS = {
    BEAN_HARVESTING_NUMBERS_MAP,
    BEAN_NAME_MAP,
    FLAGS,
    ENTRY_POINTS,
    FIELD_INDEX,
    ALERT_MESSAGES,
    EMPTY_FIELD
};
   
/**
* @module config
* @description Collection of constants to export as part of configuration.
*/
export default {
    CONSTANTS
};
