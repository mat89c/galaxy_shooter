/*global
    BABYLON
*/
function Explosions(helpers, scene) {
    "use strict";
    let _helpers = helpers;
    let _scene = scene;

    Explosions.prototype.create = function (pos, color) {
        let particleSystem = new BABYLON.ParticleSystem("explosion", 2000, _scene);
        particleSystem.particleTexture = new BABYLON.Texture(_helpers.baseUrl() + '/assets/flare.png', _scene);
        particleSystem.emitter = new BABYLON.Vector3(pos.x, pos.y, pos.z);
        particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        particleSystem.color2 = new BABYLON.Color4(color.r, color.g, color.b, 1.0);
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.8;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitRate = 12000;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.direction1 = new BABYLON.Vector3(50, 50, 50);
        particleSystem.direction2 = new BABYLON.Vector3(-50, -50, -50);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.5;
        particleSystem.updateSpeed = 0.01;
        particleSystem.start();
        particleSystem.targetStopDuration = 0.10;
    };
}

export default Explosions;