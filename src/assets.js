const dependencies = require('./dependencies')
const $ = dependencies.jquery

const AssetsController = {
        addAssetFromURL(url) {
            const id = Math.random().toString(36).substring(5)
            const asset = $(`<a-asset-item id="${id}" src="${url}"></a-asset-item>`)
            $('a-assets').append(asset)
            return id
        },

        removeAssetWithID(id) {
            $(`a-asset-item#${id}`).remove()
        }
}

module.exports = AssetsController