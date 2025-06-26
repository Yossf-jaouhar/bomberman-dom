const { E } = require("../frameWork/DOM.js")

function renderMap(container, mapInstance) {
    for (let y = 0; y < mapInstance.height; y++) {
        for (let x = 0; x < mapInstance.width; x++) {
            const type = mapInstance.tiles[y][x];
            let color = ""

            if (type === 0) color = "gray"
            if (type === 1) color = "green"
            if (type === 2) color = "blue"

            const tile = E("div", {
                class: "tile",
                style: `
                  width: ${mapInstance.size}px;
                  height: ${mapInstance.size}px;
                  background: ${color};
                  position: absolute;
                  left: ${x * mapInstance.size}px;
                  top: ${y * mapInstance.size}px;
                `})
            container.appendChild(tile)
        }
    }
}