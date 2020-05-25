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
 * @constant CONSTANTS
 * @memberof config
 * @description Collection of constants values for usage in component.
 * @type {{
    *     BEAN_HARVESTING_NUMBERS_MAP: Object,
    *     BEAN_NAME_MAP: Object,
    *     FLAGS: Object
    *     ENTRY_POINTS: Object
    *     FIELD_INDEX: Object
    * }}
* @property {Object} BEAN_HARVESTING_NUMBERS_MAP
* @property {Object} BEAN_NAME_MAP
* @property {Object} FLAGS
* @property {Object} ENTRY_POINTS
* @property {Object} FIELD_INDEX
*/
const CONSTANTS = {
    BEAN_HARVESTING_NUMBERS_MAP,
    BEAN_NAME_MAP,
    FLAGS,
    ENTRY_POINTS,
    FIELD_INDEX
};
   
/**
* @module config
* @description Collection of constants to export as part of configuration.
*/
export default {
    CONSTANTS
};
