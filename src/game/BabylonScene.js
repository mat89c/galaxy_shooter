/*global
    BABYLON, window
*/

/**
*Init Babylon.js Scene
*@constructor
*@singleton
*/
function BabylonScene() {
    "use strict";

    if (typeof BabylonScene.instance === "object") {
        return BabylonScene.instance;
    }

    BabylonScene.instance = this;

    let canvas = document.getElementById("canvas");
    let engine = new BABYLON.Engine(canvas, false, {stencil: true}, false);
    let scene = new BABYLON.Scene(engine);
    let earth = null;

    let fps = document.getElementById("fps");

    engine.enableOfflineSupport = false;
    engine.doNotHandleContextLost = true;

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    scene.autoClear = false;
    scene.autoClearDepthAndStencil = false;
    scene.blockMaterialDirtyMechanism = true;
    scene.useGeometryIdsMap = true;
    scene.useMaterialMeshMap = true;
    scene.useClonedMeshMap = true;

    scene.executeWhenReady(function () {
        engine.runRenderLoop(function () {
            earth.rotation.y -= 0.0003;
            fps.innerHTML = engine.getFps().toFixed();
            scene.render();
        });
    });

    BabylonScene.prototype.createLights = function () {
        let light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1000, 0), scene);
        let light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, 1000, 0), scene);
        let light3 = new BABYLON.PointLight("light3", new BABYLON.Vector3(0, 0, 0), scene);

        light1.intensity = 0.6;
        light2.intensity = 0.6;
        light3.intensity = 0.6;
    };

    BabylonScene.prototype.createSkyboxAndEarth = function (helpers) {
        let skybox = BABYLON.Mesh.CreateBox("skyBox", 10000, scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        let xhr = new XMLHttpRequest();
        let _helpers = helpers;
        earth = BABYLON.MeshBuilder.CreateSphere("earth", {segments: 40, diameter: 1200}, scene);
        earth.convertToUnIndexedMesh();
        earth.visibility = false;
        earth.rotate(BABYLON.Axis.Y, -0.9, BABYLON.Space.LOCAL);
        earth.rotate(BABYLON.Axis.Z, +0.4, BABYLON.Space.WORLD);

        xhr.overrideMimeType("application/json");
        if (window.matchMedia('screen and (min-width:1024px)').matches) {
            xhr.open('GET', _helpers.baseUrl() + "/assets/json/SkyboxAndEarthTextures2048.json", true);
        } else {
            xhr.open('GET', _helpers.baseUrl() + "/assets/json/SkyboxAndEarthTextures1024.json", true);
        }
        xhr.send();
        xhr.onload = function () {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                let texturesSkybox = [
                    response.right,
                    response.top,
                    response.front,
                    response.left,
                    response.bottom,
                    response.back
                ];
                let textureEarth = response.earth;
                let earthTexture = new BABYLON.StandardMaterial('planteTexture', scene);
                skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(texturesSkybox, scene);
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.disableLighting = true;
                skybox.material = skyboxMaterial;

                earthTexture = new BABYLON.StandardMaterial('planteTexture', scene);
                earthTexture.freeze();
                earthTexture.diffuseTexture = new BABYLON.Texture(textureEarth, scene);
                earthTexture.specularTexture = new BABYLON.Texture(textureEarth, scene);
                earthTexture.diffuseTexture.wAng = 3.1415926536;
                earthTexture.specularTexture.wAng = 3.1415926536;
                earth.material = earthTexture;
                earth.visibility = true;

                skybox.convertToUnIndexedMesh();
                skyboxMaterial.freeze();
                skyboxMaterial.backFaceCulling = false;
                skybox.infiniteDistance = true;
                skybox.renderingGroupId = 0;
            }
        };
    };

    BabylonScene.prototype.createCamera = function () {
        let camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        //camera.detachControl(canvas, true);
        camera.attachControl(canvas, true);
        camera.position = new BABYLON.Vector3(-2000, 1500, -2500);
        camera.setTarget(new BABYLON.Vector3(-2000, 500, 0));
    };

    BabylonScene.prototype.onResizeEvent = function () {
        window.addEventListener('resize', function () {
            engine.resize();
        });
    };

    /**
    *@return {Object} Babylon scene
    */
    BabylonScene.prototype.getScene = function () {
        return scene;
    };

    return this;
}

export default BabylonScene;