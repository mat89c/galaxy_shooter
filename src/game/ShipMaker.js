/*global
    BABYLON
*/
import ShipMaterials from './ShipMaterials';


/*
*Array of all ships
*/
let allShips = [];

/**
*Create ship
*@factory
*/
function ShipMaker() {
    "use strict";

    /**
    *The ship`s model meshes - ship body, ship engine and ship glass
    */
    let _shipMesh = {};
    /**
    *Array of enemy ships
    */
    let allEnemyShips = [];
    /**
    * Your ship
    */
    let playerShip = {};
    /**
    *Enemy ship
    */
    let enemyShip = {};

    let createdShipId = null;

    let botNames = ['Admiral', 'Billy', 'Blain', 'Boogie Man', 'Commando', 'Dangerous Dave', 'Danko', 'Dutch', 'John', 'Kruger', 'Poncho', 'Roach', 'Stevie', 'Bob'];


    /**
    * Create all ships here
    */
    ShipMaker.prototype.createShip = function (scene, helpers) {
        let _scene = scene;
        let _helpers = helpers;
        /**
        *Type bot or player
        */
        let _type = this.type;

        /**
        *
        */
        let initShipMaterialsAndTextures = function (body, engine) {
            let shipMaterials = new ShipMaterials();
            let glowEngineMaterial = shipMaterials.getGlowEngineMaterial();

            /**
            *Random ship color
            */
            let shipMaterial = new BABYLON.StandardMaterial("shipMaterial", _scene);
            let r = Math.floor(Math.random() * 255) + 1;
            let g = Math.floor(Math.random() * 255) + 1;
            let b = Math.floor(Math.random() * 255) + 1;
            let shipColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
            /**
            *Get engine glow layer
            */
            let glowEngineLayer = shipMaterials.getGlowEngineLayer();
            /**
            *Set engine material
            */
            engine.material = glowEngineMaterial;

            /**
            *Set engine glow layer
            */
            glowEngineLayer.addIncludedOnlyMesh(engine);
            glowEngineLayer.intensity = 2.75;

            /**
            *Set ship body color
            */
            shipMaterial.diffuseColor = shipColor;
            body.material = shipMaterial;
        };

        /**
        *Import ship mesh from .babylon file
        */
        let importShipMesh = function () {
            BABYLON.SceneLoader.ImportMesh("", _helpers.baseUrl() + "/assets/", "ship.babylon", _scene, function (meshes) {
                let i = 0;
                let tmp = meshes.length;

                /**
                * The ship`s model consists of three parts
                */
                let shipEngineMesh, shipGlassMesh, shipBodyMesh;
                for (i = 0; i < tmp; i += 1) {
                    if (meshes[i].id === 'ship') {
                        shipBodyMesh = meshes[i];
                    } else if (meshes[i].id === 'engine') {
                        shipEngineMesh = meshes[i];
                    } else if (meshes[i].id === 'glass') {
                        shipGlassMesh = meshes[i];
                    }
                }

                return initShipMesh({
                    bodyMesh: shipBodyMesh,
                    engineMesh: shipEngineMesh,
                    glassMesh: shipGlassMesh
                });
            });
        };

        let initShipMesh = function (obj) {
            _shipMesh = obj;
        };

        /**
        * Import the ship model only once, other ships will be cloned.
        */
        if (_helpers.isEmptyObject(_shipMesh)) {
            importShipMesh();
        }
        /**
        * All ships
        */
        let addShipToArray = function (body, engine, glass, isBot) {
            allShips.push({
                id: null,
                name: null,
                body: body,
                engine: engine,
                glass: glass,
                isBot: isBot,
                kill: 0,
                death: 0
            });

            let id = allShips.length - 1;
            allShips[id].id = id;
            createdShipId = id;
            if (isBot) {
                /**
                *Rand bot name index
                */
                let index = Math.floor(Math.random() * botNames.length);
                let suffix = Math.floor(Math.random() * 100) + 10;

                allShips[id].name = botNames[index] + suffix;
            } else {
                allShips[id].name = 'You';
            }
        };

        /**
        * Wait for import ship mesh
        */
        _scene.executeWhenReady(function () {
            /**
            *Create cloned ship
            */
            let randomId = Math.random().toString(36).substring(7);
            let shipBodyClone = _shipMesh.bodyMesh.clone('body' + randomId);
            let shipEngineClone = _shipMesh.engineMesh.clone('engine' + randomId);
            let shipGlassClone = _shipMesh.glassMesh.clone('glass' + randomId);

            /**
            *Set initial ship position
            */
            let posX = -1 * Math.floor(Math.random() * (1900 - 1850 + 1) + 1850);
            let posY = Math.floor(Math.random() * (1400 - 1300 + 1) + 1300);
            let posZ = -1 * Math.floor(Math.random() * (2400 - 2300 + 1) + 2300);
            shipBodyClone.position = new BABYLON.Vector3(posX, posY, posZ);
            shipEngineClone.position = new BABYLON.Vector3(posX, posY, posZ);
            shipGlassClone.position = new BABYLON.Vector3(posX, posY, posZ);

            /**
            *Add ship materials and textures
            */
            initShipMaterialsAndTextures(shipBodyClone, shipEngineClone);

            switch (_type) {
            case 'Bot':
                enemyShip = {
                    body: shipBodyClone,
                    engine: shipEngineClone,
                    glass: shipGlassClone
                };
                allEnemyShips.push({
                    body: shipBodyClone,
                    engine: shipEngineClone,
                    glass: shipGlassClone
                });
                /**
                *@param {Object} shipBodyClone Ship body mesh
                *@param {Object} shipEngineClone Ship engine mesh
                *@param {Object} shipGlassClone Ship glass mesh
                *@param {Boolean} Is bot
                */
                addShipToArray(shipBodyClone, shipEngineClone, shipGlassClone, true);
                break;
            case 'Player':
                playerShip = {
                    body: shipBodyClone,
                    engine: shipEngineClone,
                    glass: shipGlassClone
                };
                /**
                *@param {Object} shipBodyClone Ship body mesh
                *@param {Object} shipEngineClone Ship engine mesh
                *@param {Object} shipGlassClone Ship glass mesh
                *@param {Boolean} Is bot
                */
                addShipToArray(shipBodyClone, shipEngineClone, shipGlassClone, false);
                break;
            }
        });
    };

    ShipMaker.prototype.getPlayerShip = function () {
        return playerShip;
    };

    ShipMaker.prototype.getEnemyShip = function () {
        return enemyShip;
    };

    ShipMaker.prototype.getAllShipsArray = function () {
        return allShips;
    };

    ShipMaker.prototype.getCreatedShipId = function () {
        return createdShipId;
    };
}

/**
*Static method factory
*@constructor
*/
ShipMaker.factory = function (type) {
    "use strict";
    let _constructor = type;
    let ship = null;

    if (typeof ShipMaker[_constructor] !== "function") {
        throw _constructor + ' does not exist';
    }

    if (typeof ShipMaker[_constructor].prototype.createShip !== "function") {
        ShipMaker[_constructor].prototype = new ShipMaker();
    }

    ship = new ShipMaker[_constructor]();
    return ship;
};

/**
*Definitions of specific constructors
*/
ShipMaker.Player = function () {
    "use strict";
    this.type = 'Player';
    this.name = 'You';
};

ShipMaker.Bot = function () {
    "use strict";
    this.type = 'Bot';
    this.name = 'Bot';
};
export default ShipMaker;