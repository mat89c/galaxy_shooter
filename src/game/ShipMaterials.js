/*global
    BABYLON
*/

/**
*Create ship materials and textures
*/
function ShipMaterials(scene) {
    "use strict";
    if (typeof ShipMaterials.instance === "object") {
        return ShipMaterials.instance;
    }
    ShipMaterials.instance = this;

    let _scene = scene;
    /**
    *Ship engine material
    */
    let glowEngineMaterial = new BABYLON.StandardMaterial("glowEngineMaterial", _scene);
    /**
    *Glowing engine layer
    */
    let glowEngineLayer = new BABYLON.GlowLayer("glowEngineLayer", _scene);
    /**
    *Ship body material
    */
    let shipMaterial = new BABYLON.StandardMaterial("shipMaterial", _scene);

    glowEngineMaterial.freeze();
    glowEngineMaterial.emissiveColor = new BABYLON.Color3.Gray();
    glowEngineMaterial.diffuseColor = new BABYLON.Color3.Gray();
    glowEngineMaterial.ambientColor = new BABYLON.Color3.Gray();

    shipMaterial.freeze();

    ShipMaterials.prototype.getGlowEngineMaterial = function () {
        return glowEngineMaterial;
    };

    ShipMaterials.prototype.getGlowEngineLayer = function () {
        return glowEngineLayer;
    };

    ShipMaterials.prototype.getShipMaterial = function () {
        return shipMaterial;
    };
}

export default ShipMaterials;