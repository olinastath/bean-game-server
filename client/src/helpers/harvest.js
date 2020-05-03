export default class Harvest {
    constructor(scene) {
        this.harvestField = (field) => {
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