export default class Harvest {
    constructor(scene) {
        this.harvestField = (field) => {
            scene.harvestPopup = scene.add.dom(window.innerWidth / 2, window.innerHeight / 2).setOrigin(0.5).createFromCache('harvestPopup');
            console.log(field);
            let harvestNumbers = harvestNumbersByBeanType[field.fieldType];
            if (harvestNumbers) {
                console.log(harvestNumbers);
                if (harvestNumbers[field.cards]) {
                    console.log('coins to get: ' + harvestNumbers[field.cards]);
                } else {
                    console.log('not a perfect number');
                    let harvestKeys = Object.keys(harvestNumbers);
                    console.log(harvestKeys);
                    if (field.cards < harvestKeys[0]) {
                        console.log('can only discard, no coins');
                    } else {
                        let maxHarvest = -1;
                        for (let num in harvestKeys) {
                            console.log(num);
                            console.log(parseInt(num, 10));
                            if (field.cards < parseInt(num, 10)) {
                                maxHarvest = parseInt(num, 10);
                                break;
                            }
                        }

                        // coins to receive is harvestNumbers[maxHarvest] 
                        // and then we have field.cards % maxHarvest cards left in the field
                        console.log(maxHarvest);
                        console.log(harvestNumbers[maxHarvest]);
                        console.log(field.cards % maxHarvest);
                    }

                    // get modulo
                    // get list of keys from harvestNumbers and find which one is the first to go over
                }
            } else {
                console.log('field is empty');
            }

            scene.harvestPopup.destroy();

            // need to update general coin counter, counterText for field, if discarding fully then destroy images
            // also need to delete game object? are the game objects pushed somewhere?l
            // cards: 3
            // counterText: Text {_events: Events, _eventsCount: 0, scene: Game, type: "Text", state: 0, …}
            // fieldType: "chiliBean"
            // x: 50
            // y: 349
        }
    }
}

const harvestNumbersByBeanType = {
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