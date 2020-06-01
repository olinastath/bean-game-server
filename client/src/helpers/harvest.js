import config from './config';
import utils from './utils';

export default class Harvest {
    constructor(scene) {
        let self = this;

        this.harvestField = function(fieldIndex) {
            let field = scene.player.fields[fieldIndex];
            // figure out if we are harvesting or discarding and update dom text
            let harvestNumbers = config.CONSTANTS.BEAN_HARVESTING_NUMBERS_MAP[field.fieldType];
            if (harvestNumbers) {
                self.createDOMElements();
                if (harvestNumbers[field.cardCount]) {
                    self.updatePopupText(config.CONSTANTS.FLAGS.HARVEST_FLAG, field, harvestNumbers[field.cardCount]);
                    self.setYesButtonEventListener(() => self.discardCardsFromField(field, field.cardCount, harvestNumbers[field.cardCount], fieldIndex, true));
                } else {
                    if (field.cardCount < Object.keys(harvestNumbers)[0]) {
                        self.updatePopupText(config.CONSTANTS.FLAGS.DISCARD_FLAG, field);
                        self.setYesButtonEventListener(() => self.discardCardsFromField(field, field.cardCount, 0, fieldIndex, true));
                    } else {
                        let maxHarvest = -1;
                        for (let num in harvestNumbers) {
                            if (field.cardCount < num) {
                                break;
                            }
                            maxHarvest = num;
                        }
                        self.updatePopupText(config.CONSTANTS.FLAGS.HARVEST_FLAG, field, harvestNumbers[maxHarvest]);
                        self.setYesButtonEventListener(() => self.discardCardsFromField(field, maxHarvest, harvestNumbers[maxHarvest], fieldIndex, false));
                    }
                }
            } else {
                window.alert('Field is empty.');
                utils.resetHarvestFieldButtonDisplay(scene);
            }
        }

        /**
         * @function createDOMElements
         * @description Creates DOM element for harvest popup and adds standard event listener for closing it.
         * @memberof harvest
         */
        this.createDOMElements = function() {
            if (scene.harvestPopup) scene.harvestPopup.destroy();
            scene.harvestPopup = scene.add.dom(window.innerWidth / 2, window.innerHeight / 2).setOrigin(0.5).createFromCache('harvestPopup');
            scene.harvestPopup.getChildByID('noButton').addEventListener('click', function() {
                scene.harvestPopup.destroy();
                utils.resetHarvestFieldButtonDisplay(scene);
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
                callback();
                scene.harvestPopup.destroy();
                utils.resetHarvestFieldButtonDisplay(scene);
            });
        }

        /**
         * @function discardCardsFromField
         * @description Discards cards in field and adds coins to coin counter if applicable.
         * @memberof harvest
         * @param {Object} field Field to be emptied
         * @param {number} coins Coins received after discarding cards in field
         */
        this.discardCardsFromField = function(field, cardsDiscarding, coins, fieldIndex, emptyField) {
            // use this method for both emptying field and just harvesting some of the cards
            // need param to keep track of how many cards we are harvesting and how many are going into the discard pile for later
            // something like (cardsDiscarding - coins) would be what's going in the pile
            // then update counterText = counterText - coins, cardCount = cardCount - cardsDiscarding
            // check if cardCount ends up being 0, then update the fieldType
            // only discard cardsDiscarding num of cards in field instead of all of them
            // empty field
            // add cards to discard pile
            for (let i = 0; i < cardsDiscarding; i++) {
                scene.turn.discardCard(field.cards[0], config.CONSTANTS.ENTRY_POINTS.FIELD, i < cardsDiscarding - coins, fieldIndex, emptyField);
                field.cards.splice(0, 1);
                field.cardCount--;
            }
            // field.cards.splice(0, cardsDiscarding);
            scene.coinCount.setText(parseInt(scene.coinCount['_text'], 10) + coins);
            field.counterText.setText(field.cardCount);
            if (emptyField) {
                field.fieldType = config.CONSTANTS.EMPTY_FIELD;
            }
            // if coins, add coins to coincounter
            // scene.coinCount.setText(scene.coinCount.getText() + coins);
            // last resort, add new image over field?
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
            if (discardHarvestFlag === config.CONSTANTS.FLAGS.HARVEST_FLAG) {
                discardText.style.display = 'none';
                harvestText.innerText = harvestText.innerText.replace('NUM_BEANS', field.cardCount).replace('BEAN_TYPE', self.getBeanName(field)).replace('NUM_COINS', coins);
            } else if (discardHarvestFlag == config.CONSTANTS.FLAGS.DISCARD_FLAG) {
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
            if (field.cardCount > 1) return config.CONSTANTS.BEAN_NAME_MAP[field.fieldType] + 's';
            else return config.CONSTANTS.BEAN_NAME_MAP[field.fieldType];
        }
    }
}
