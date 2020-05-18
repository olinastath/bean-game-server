/**
 * @constant BEAN_HARVESTING_NUMBERS_MAP
 * @memberof harvest
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
 * @memberof harvest
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
 * @memberof harvest
 * @description Constant to store flags to signify whether harvesting and discarding.
 * @type {{HARVEST_FLAG: string}, {DISCARD_FLAG: string}}
 * @property {string} HARVEST_FLAG The harvesting flag value
 * @property {string} DISCARD_FLAG The discarding flag value
*/
const FLAGS = {
    HARVEST_FLAG: 'harvest',
    DISCARD_FLAG: 'discard'
};

export default class Harvest {
    constructor(scene) {
        let self = this;

        this.harvestField = function(field) {
            console.log(field);
            // figure out if we are harvesting or discarding and update dom text
            let harvestNumbers = BEAN_HARVESTING_NUMBERS_MAP[field.fieldType];
            if (harvestNumbers) {
                self.createDOMElements();
                if (harvestNumbers[field.cardCount]) {
                    console.log('coins to get: ' + harvestNumbers[field.cardCount]);
                    self.updatePopupText(FLAGS.HARVEST_FLAG, field, harvestNumbers[field.cardCount]);
                    self.emptyField(field, harvestNumbers[field.cardCount]);
                } else {
                    console.log('not a perfect number');
                    if (field.cardCount < Object.keys(harvestNumbers)[0]) {
                        console.log('can only discard, no coins');
                        self.updatePopupText(FLAGS.DISCARD_FLAG, field);
                        self.emptyField(field, 0);
                    } else {
                        let maxHarvest = -1;
                        for (let num in harvestNumbers) {
                            console.log("field cards: " + field.cardCount);
                            console.log("harvest num: " + num);
                            console.log("harvest num, int: " + parseInt(num, 10));
                            console.log("is field cards less than num? " + field.cardCount < num);
                            console.log("is field cards less than num, int? " + field.cardCount < parseInt(num, 10));
                            if (field.cardCount < parseInt(num, 10)) {
                                maxHarvest = parseInt(num, 10);
                                break;
                            }
                        }

                        // coins to receive is harvestNumbers[maxHarvest] 
                        // and then we have field.cardCount % maxHarvest cards left in the field
                        console.log("maxHarvest: " + maxHarvest);
                        console.log("harvestNumbers @ maxHarvest: " + harvestNumbers[maxHarvest]);
                        console.log("modulo field cards % maxHarvest: " + field.cardCount % maxHarvest);
                    }

                    // get modulo
                    // get list of keys from harvestNumbers and find which one is the first to go over
                }
            } else {
                console.log('field is empty');
            }
        }

        /**
         * @function createDOMElements
         * @description Creates DOM element for harvest popup and adds standard event listener for closing it.
         * @memberof harvest
         */
        this.createDOMElements = function() {
            scene.harvestPopup = scene.add.dom(window.innerWidth / 2, window.innerHeight / 2).setOrigin(0.5).createFromCache('harvestPopup');
            scene.harvestPopup.getChildByID('noButton').addEventListener('click', function() {
                console.log('no harvest/discard');
                scene.harvestPopup.destroy();
            });            
        }

        /**
         * @function setYesButtonEventListener
         * @description Updates 'click' event listener for button in harvest popup.
         * @memberof harvest
         * @param {function} callback
         */
        this.setYesButtonEventListener = function(callback) {
            scene.harvestPopup.getChildByID('yesButton').addEventListener('click', function() {
                console.log('yes harvest/discard');
                callback();
                scene.harvestPopup.destroy();
            });
        }

        /**
         * @function emptyField
         * @description Discards cards in field and adds coins to coin counter if applicable.
         * @memberof harvest
         * @param {Object} field Field to be emptied
         * @param {number} coins Coins received after discarding cards in field
         */
        this.emptyField = function(field, coins) {
            // empty field
            // add cards to discard pile
            // if coins, add coins to coincounter
            field.cardCount = 0;
            field.counterText.setText('0');
            field.fieldType = 'empty';
            field.cards.forEach(function(card) {
                // card.destroy();
                scene.turn.discardCard(card);
            });
        }

        /**
         * @function updatePopupText
         * @description Updates inner text for harvest popup DOM element.
         * @memberof harvest
         * @param {string} discardHarvestFlag flag to determine which text is to be shown and updated
         * @param {Object} field field considering discarding
         * @param {number} coins number of coins to be received after discarding field
         */
        this.updatePopupText = function(discardHarvestFlag, field, coins = 0) {
            let harvestText = scene.harvestPopup.getChildByID('harvestText');
            let discardText = scene.harvestPopup.getChildByID('discardText')
            if (discardHarvestFlag === FLAGS.HARVEST_FLAG) {
                discardText.style.display = 'none';
                harvestText.innerText = harvestText.innerText.replace('NUM_BEANS', field.cardCount).replace('BEAN_TYPE', self.getBeanName(field)).replace('NUM_COINS', coins);
            } else if (discardHarvestFlag == FLAGS.DISCARD_FLAG) {
                harvestText.style.display = 'none';
                discardText.innerText = discardText.innerText.replace('NUM_BEANS', field.cardCount).replace('BEAN_TYPE', self.getBeanName(field));
            }
            
        }

        /**
         * @function getBeanName
         * @description Helper function to return parsed bean name by beanType
         * @memberof harvest
         * @param {Object} field Field whose bean type we need to parse
         */
        this.getBeanName = function(field) {
            if (field.cardCount > 1) return BEAN_NAME_MAP[field.fieldType] + 's';
            else return BEAN_NAME_MAP[field.fieldType];
        }
    }
}