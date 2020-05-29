import config from './config';

export default class Zone {
    constructor(scene) {
        this.renderZone = function(x, y, width, height, name) {
            let dropZone = scene.add.zone(x, y, width, height).setRectangleDropZone(width, height).setName(name);
            dropZone.setData({fieldType: config.CONSTANTS.EMPTY_FIELD, cards: 0});
            return dropZone;
        }

        this.renderOutline = function(dropZone) {
            let dropZoneOutline = scene.add.graphics();
            dropZoneOutline.lineStyle(4, 0xff69b4);
            dropZoneOutline.strokeRect(dropZone.x - dropZone.input.hitArea.width / 2, dropZone.y - dropZone.input.hitArea.height / 2, dropZone.input.hitArea.width, dropZone.input.hitArea.height)
        }
    }
}
