/*global
    BABYLON
*/

/**
*@singleton
*/
function Player(args) {
    "use strict";

    if (typeof Player.instance === "object") {
        return Player.instance;
    }
    Player.intance = this;

    let ShipMaker = args.shipMaker;
    let helpers = args.helpers;
    let scene = args.scene;
    let BulletMaker = args.bulletMaker;
    let Explosions = args.explosions;
    let UI = args.userInterface;
    let joystick = UI.getVirtualJoystick();

    /**
    *Ship`s parameters
    */
    let playerShipConfig = {
        speed: 0, // Player speed
        hp: 3, //Player hp
        minSpeed: 0.54, // Minimum speed
        maxSpeed: 2.54, // Maximum speed
        acc: 0.03, // Acceleration
        ammo: 40
    };
    let powerUI = document.getElementById('power');
    let p = (playerShipConfig.speed / playerShipConfig.maxSpeed) * 100;
    powerUI.innerHTML = p.toFixed(0);

    let currentHp = playerShipConfig.hp;
    let shipId = null;
    let blockKeyboard = false;
    let respawn = false;
    let gunsight = null;

    Player.prototype.create = function () {
        let shipFactory = ShipMaker.factory('Player');
        shipFactory.createShip(scene, helpers);

        /**
        *@return {Object} camera Ship`s camera
        */
        let createShipCamera = function () {
            let camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 0, -10), scene);
            camera.radius = 25;
            camera.heightOffset = 4;
            camera.rotationOffset = 180;
            camera.ctype = 2;
            camera.cameraAcceleration = 0.08;
            camera.maxCameraSpeed = 10;
            return camera;
        };

        let createGunsight = function () {
            let circle = BABYLON.Mesh.CreatePlane("gunsight", 4, scene);
            let circlemat = new BABYLON.StandardMaterial("gunsightMaterial", scene);
            circlemat.emissiveTexture = new BABYLON.Texture(helpers.baseUrl() + "/assets/gunsight.png", scene);
            circlemat.opacityTexture = circlemat.emissiveTexture;
            circle.material = circlemat;
            circle.material.freeze();
            circle.renderingGroupId = 1;

            return circle;
        };

        let initKeyboard = function (inputMap) {
            scene.actionManager = new BABYLON.ActionManager(scene);
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }));
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }));
        };


        let shipMovementParms = {
            startAcc: 0.004,
            accLeft: 0.004,
            accRight: 0.004,
            maxAcc: 0.02,
            minAcc: 0.004,
            m: 0.06,
            startAccX: 0.003,
            accDown: 0.004,
            accTop: 0.004,
            maxAccX: 0.02,
            minAccX: 0.003,
            mX: 0.06,
            zRot: 0,
            maxRotZ: 0.6,
            xRot: 0,
            maxRotX: 1.3
        };

        let initMovement = function (inputMap, ship, shipId, allShips, bulletFactory) {
            if (!blockKeyboard) {

                let xKey = document.getElementById('X-Key');
                xKey.addEventListener('touchstart', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    inputMap[" "] = true;
                }, false);
                xKey.addEventListener('touchend', function () {
                    event.preventDefault();
                    event.stopPropagation();
                    inputMap[" "] = false;
                }, false);

                if (inputMap[" "]) {
                    bulletFactory.shoot();
                }

                let aKey = document.getElementById('A-Key');
                aKey.addEventListener('touchstart', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('kkk');
                    inputMap["a"] = true;
                }, false);
                aKey.addEventListener('touchend', function () {
                    event.preventDefault();
                    event.stopPropagation();
                    inputMap["a"] = false;
                }, false);

                if (inputMap['a']) {
                    if (playerShipConfig.speed < playerShipConfig.maxSpeed) {
                        playerShipConfig.speed += playerShipConfig.acc;
                        let val = (playerShipConfig.speed / playerShipConfig.maxSpeed) * 100;
                        powerUI.innerHTML = val.toFixed(0);
                    }
                }

                let zKey = document.getElementById('Z-Key');
                zKey.addEventListener('touchstart', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    inputMap["z"] = true;
                }, false);
                zKey.addEventListener('touchend', function () {
                    event.preventDefault();
                    event.stopPropagation();
                    inputMap["z"] = false;
                }, false);

                if (inputMap["z"]) {
                    if (playerShipConfig.speed > playerShipConfig.minSpeed) {
                        playerShipConfig.speed -= playerShipConfig.acc;
                        let val = (playerShipConfig.speed / playerShipConfig.maxSpeed) * 100;
                        powerUI.innerHTML = val.toFixed(0);
                    }
                }

                if (inputMap["ArrowLeft"] || joystick.left()) {
                    shipMovementParms.accRight = shipMovementParms.startAcc;
                    if (shipMovementParms.accLeft < shipMovementParms.maxAcc) {
                        shipMovementParms.accLeft += shipMovementParms.accLeft * shipMovementParms.m;
                    }
                    ship.body.rotate(BABYLON.Axis.Y, -shipMovementParms.accLeft, BABYLON.Space.WORLD);
                    ship.engine.rotate(BABYLON.Axis.Y, -shipMovementParms.accLeft, BABYLON.Space.WORLD);
                    ship.glass.rotate(BABYLON.Axis.Y, -shipMovementParms.accLeft, BABYLON.Space.WORLD);

                    if (ship.body._rotationQuaternion.toEulerAngles().z < shipMovementParms.maxRotZ) {
                        ship.body.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                    }
                } else {
                    if (shipMovementParms.accLeft > shipMovementParms.minAcc) {
                        shipMovementParms.accLeft = shipMovementParms.startAcc;
                    }
                }


                if (inputMap["ArrowRight"] || joystick.right()) {
                    shipMovementParms.accLeft = shipMovementParms.startAcc;
                    if (shipMovementParms.accRight < shipMovementParms.maxAcc) {
                        shipMovementParms.accRight += shipMovementParms.accRight * shipMovementParms.m;
                    }
                    ship.body.rotate(BABYLON.Axis.Y, +shipMovementParms.accRight, BABYLON.Space.WORLD);
                    ship.engine.rotate(BABYLON.Axis.Y, +shipMovementParms.accRight, BABYLON.Space.WORLD);
                    ship.glass.rotate(BABYLON.Axis.Y, +shipMovementParms.accRight, BABYLON.Space.WORLD);

                    if (ship.body._rotationQuaternion.toEulerAngles().z > -shipMovementParms.maxRotZ) {
                        ship.body.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                    }
                } else {
                    if (shipMovementParms.accRight > shipMovementParms.minAcc) {
                        shipMovementParms.accRight = shipMovementParms.startAcc;
                    }
                }

                if (inputMap["ArrowDown"] || joystick.down()) {
                    if (shipMovementParms.xRot > -shipMovementParms.maxRotX) {
                        shipMovementParms.accTop = shipMovementParms.startAccX;
                        if (shipMovementParms.accDown < shipMovementParms.maxAccX) {
                            shipMovementParms.accDown += shipMovementParms.accDown * shipMovementParms.mX;
                        }
                        shipMovementParms.xRot = shipMovementParms.xRot - shipMovementParms.accDown;

                        ship.body.rotate(BABYLON.Axis.X, -shipMovementParms.accDown, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.X, -shipMovementParms.accDown, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.X, -shipMovementParms.accDown, BABYLON.Space.LOCAL);
                    }
                } else {
                    if (shipMovementParms.accDown > shipMovementParms.minAccX) {
                        shipMovementParms.accDown -= shipMovementParms.accDown * 0.03;
                    }
                }

                if (inputMap["ArrowUp"] || joystick.up()) {
                    if (shipMovementParms.xRot < shipMovementParms.maxRotX) {
                        shipMovementParms.accDown = shipMovementParms.startAccX;

                        if (shipMovementParms.accTop < shipMovementParms.maxAccX) {
                            shipMovementParms.accTop += shipMovementParms.accTop * shipMovementParms.mX;
                        }

                        shipMovementParms.xRot = shipMovementParms.xRot + shipMovementParms.accTop;

                        ship.body.rotate(BABYLON.Axis.X, shipMovementParms.accTop, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.X, shipMovementParms.accTop, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.X, shipMovementParms.accTop, BABYLON.Space.LOCAL);
                    }
                } else {
                    if (shipMovementParms.accTop > shipMovementParms.minAccX) {
                        shipMovementParms.accTop -= shipMovementParms.accTop * 0.03;
                    }
                }
            }

            if (ship.body._rotationQuaternion) {
                if (ship.body._rotationQuaternion.toEulerAngles().z > 0.03) {
                    ship.body.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                }

                if (ship.body._rotationQuaternion.toEulerAngles().z < 0.03) {
                    ship.body.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                }
            }

            if (ship.body.position.x < -3700 || ship.body.position.x > -1400 || ship.body.position.y > 2700 || ship.body.position.y < -2700 || ship.body.position.z < -3700 || ship.body.position.z > -1400) {
                UI.showAlert();
            } else {
                UI.hideAlert();
            }

            if (ship.body.position.x < -4000 || ship.body.position.x > -1100 || ship.body.position.y > 3000 || ship.body.position.y < -3000 || ship.body.position.z < -4000 || ship.body.position.z > -1100) {
                if (!respawn) {
                    respawnShip(ship.body, ship.engine, ship.glass);
                    allShips[shipId].death += 1;
                    /**
                    *@param {String} Player
                    *@param {Boolean} is bot
                    */
                    UI.addSuicideToInfoPanel('You', false);
                }
            }
        };

        let respawnShip = function (body, engine, glass) {
            respawn = true;
            blockKeyboard = true;
            /**
            *Hide ship
            */
            body.visibility = false;
            body.checkCollision = false;
            engine.visibility = false;
            glass.visibility = false;
            gunsight.visibility = false;

            /**
            * Create explosion
            *@param {Object} Current ship position
            *@param {Object} Color of the ship
            */
            Explosions.create(body.position, body.material.diffuseColor);

            /**
            * Rand new ship position
            */
            let posX = -1 * Math.floor(Math.random() * (2000 - 1750 + 1) + 1750);
            let posY = Math.floor(Math.random() * (1600 - 1300 + 1) + 1300);
            let posZ = -1 * Math.floor(Math.random() * (2400 - 2300 + 1) + 2300);

            /**
            * Stop the ship
            */
            playerShipConfig.speed = 0;

            /**
            * Waint 4s for respawn
            */
            setTimeout(function () {
                /**
                * Set new ship position
                */
                body.position = new BABYLON.Vector3(posX, posY, posZ);
                engine.position = new BABYLON.Vector3(posX, posY, posZ);
                glass.position = new BABYLON.Vector3(posX, posY, posZ);
                /**
                * Reset ship hp
                */
                currentHp = playerShipConfig.hp;
                UI.resetHP();
                respawn = false;
                blockKeyboard = false;
                /**
                * Show the ship
                */
                body.visibility = true;
                body.checkCollision = true;
                engine.visibility = true;
                glass.visibility = true;
                gunsight.visibility = true;

                /**
                * Set ship speed
                */
                playerShipConfig.speed = playerShipConfig.maxSpeed;
            }, 4000);
        };

        /**
        * Wait for import ship
        */
        scene.executeWhenReady(function () {
            let ship = shipFactory.getPlayerShip();
            /**
            * Change camera
            */
            let shipCamera = createShipCamera();
            shipCamera.lockedTarget = ship.body;
            scene.activeCamera = shipCamera;
            shipId = shipFactory.getCreatedShipId();
            let allShips = shipFactory.getAllShipsArray();

            /**
            *Added new method for all ships
            *Its called when ship will be hitted by bullet
            */
            allShips[shipId].reduceHP = function (enemyShipId) {
                currentHp -= 1;
                UI.reduceHP();
                if (currentHp < 1) {
                    UI.addKillToInfoPanel(allShips[enemyShipId].name, this.name);
                    respawnShip(this.body, this.engine, this.glass);
                    allShips[enemyShipId].kill += 1;
                    this.death += 1;
                }
            };
            /**
            *Create gunsight
            */
            gunsight = createGunsight(ship.body);
            gunsight.parent = ship.body;
            gunsight.position.z = 120;

            let bulletFactoryArgs = {
                ammo: playerShipConfig.ammo,
                scene: scene,
                ship: ship,
                shipId: shipId,
                allShips: allShips,
                isBot: false
            };
            let bulletFactory = BulletMaker.factory('Laser', bulletFactoryArgs);
            /**
            * Init keyboard
            */
            let inputMap = {};
            initKeyboard(inputMap);

            scene.onBeforeRenderObservable.add(function () {
                ship.body.translate(BABYLON.Axis.Z, playerShipConfig.speed, BABYLON.Space.LOCAL);
                ship.engine.translate(BABYLON.Axis.Z, playerShipConfig.speed, BABYLON.Space.LOCAL);
                ship.glass.translate(BABYLON.Axis.Z, playerShipConfig.speed, BABYLON.Space.LOCAL);

                initMovement(inputMap, ship, shipId, allShips, bulletFactory);
            });
        });
    };
}

export default Player;