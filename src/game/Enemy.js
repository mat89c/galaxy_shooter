/*global
    BABYLON
*/

function Enemy(args) {
    "use strict";
    let ShipMaker = args.shipMaker;
    let helpers = args.helpers;
    let scene = args.scene;
    let BulletMaker = args.bulletMaker;
    let Explosions = args.explosions;
    let UI = args.userInterface;
    let enemyShipConfig = {
        speed: 2, // Bot speed
        hp: 3, // Lives
        ammo: 1, // Ammo
        zRot: 0,
        maxRotZ: 0.6,
        xRot: 0,
        maxRotX: 1.3
    };
    let currentHp = enemyShipConfig.hp;
    let currentSpeed = enemyShipConfig.speed;
    let enemyShipMovement = {
        left: false,
        right: false,
        up: false,
        down: false,
        fast: false,
        slow: false
    };
    
    let shipId = null;
    let respawn = false;
    /**
    *Wolrd bounds collision
    */
    let collisionDetected = false;
    /**
    *Is target found
    */
    let targetFound = false;
    /**
    *Target ship ID
    *If -1 => target not found
    */
    let targetId = -1;
    /**
    *If ship is aimed
    */
    let shipDetected = false;

    Enemy.prototype.create = function () {
        let shipFactory = ShipMaker.factory('Bot');
        shipFactory.createShip(scene, helpers);

        /**
        *Create shpere - aim
        *Used to find closest enemy ship and calculate angle between this ship and enemy
        *@return {Object}
        */
        let createAim = function () {
            let aim = BABYLON.Mesh.CreateSphere("aim", 1, 1, scene);
            aim.position = new BABYLON.Vector3(0, 4, 0);
            aim.rotationQuaternion = new BABYLON.Quaternion.Identity();
            aim.visibility = false;
            return aim;
        };

        /**
        * Raycasts (used here simple line instead babylon.js raycast)
        */
        let createRaycast = function (shipBody) {
            let raycast = BABYLON.Mesh.CreateLines("raycast", [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 0, 6000)
            ], scene);
            raycast.parent = shipBody;
            raycast.checkCollision = true;
            raycast.visibility = false;
            return raycast;
        };

        let initShipMovement = function (ship) {
            ship.body.translate(BABYLON.Axis.Z, currentSpeed, BABYLON.Space.LOCAL);
            ship.engine.translate(BABYLON.Axis.Z, currentSpeed, BABYLON.Space.LOCAL);
            ship.glass.translate(BABYLON.Axis.Z, currentSpeed, BABYLON.Space.LOCAL);

            if (enemyShipMovement.left) {
                ship.body.rotate(BABYLON.Axis.Y, -0.02, BABYLON.Space.WORLD);
                ship.engine.rotate(BABYLON.Axis.Y, -0.02, BABYLON.Space.WORLD);
                ship.glass.rotate(BABYLON.Axis.Y, -0.02, BABYLON.Space.WORLD);

                if (ship.body._rotationQuaternion.toEulerAngles().z < enemyShipConfig.maxRotZ) {
                    ship.body.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.Z, +0.05, BABYLON.Space.LOCAL);
                }
            } else {
                if (ship.body._rotationQuaternion) {
                    if (ship.body._rotationQuaternion.toEulerAngles().z < 0.03) {
                        ship.body.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.Z, +0.02, BABYLON.Space.LOCAL);
                    }
                }
            }

            if (enemyShipMovement.right) {
                ship.body.rotate(BABYLON.Axis.Y, +0.02, BABYLON.Space.WORLD);
                ship.engine.rotate(BABYLON.Axis.Y, +0.02, BABYLON.Space.WORLD);
                ship.glass.rotate(BABYLON.Axis.Y, +0.02, BABYLON.Space.WORLD);

                if (ship.body._rotationQuaternion.toEulerAngles().z > -enemyShipConfig.maxRotZ) {
                    ship.body.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.Z, -0.05, BABYLON.Space.LOCAL);
                }
            } else {
                if (ship.body._rotationQuaternion) {
                    if (ship.body._rotationQuaternion.toEulerAngles().z > 0.03) {
                        ship.body.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                        ship.engine.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                        ship.glass.rotate(BABYLON.Axis.Z, -0.02, BABYLON.Space.LOCAL);
                    }
                }
            }

            if (enemyShipMovement.bottom) {
                if (enemyShipConfig.xRot > -enemyShipConfig.maxRotX) {
                    enemyShipConfig.xRot = enemyShipConfig.xRot - 0.02;
                    ship.body.rotate(BABYLON.Axis.X, -0.02, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.X, -0.02, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.X, -0.02, BABYLON.Space.LOCAL);
                }
            }

            if (enemyShipMovement.top) {
                if (enemyShipConfig.xRot < enemyShipConfig.maxRotX) {
                    enemyShipConfig.xRot = enemyShipConfig.xRot + 0.02;
                    ship.body.rotate(BABYLON.Axis.X, +0.02, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.X, +0.02, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.X, +0.02, BABYLON.Space.LOCAL);
                }
            }
        };

        /**
        *When the ship approaches world bounds, turn back
        */
        let checkWorldBoundsCollision = function (ship) {
            if (ship.body.position.x < -3000 || ship.body.position.x > -1300) {
                enemyShipMovement.left = true;
                collisionDetected = true;
                setTimeout(function () {
                    enemyShipMovement.left = false;
                    collisionDetected = false;
                }, 2000);
            } else if (ship.body.position.z < -3000 || ship.body.position.z > -1300) {
                enemyShipMovement.left = true;
                collisionDetected = true;
                setTimeout(function () {
                    enemyShipMovement.left = false;
                    collisionDetected = false;
                }, 2000);
            }

            if (ship.body.position.y > 1800) {
                enemyShipMovement.top = true;
                collisionDetected = true;
                setTimeout(function () {
                    enemyShipMovement.top = false;
                    collisionDetected = false;
                }, 1000);
            }
            if (ship.body.position.y < -1800) {
                enemyShipMovement.bottom = true;
                collisionDetected = true;
                setTimeout(function () {
                    enemyShipMovement.bottom = false;
                    collisionDetected = false;
                }, 1000);
            }
        };

        /**
        *Find enemy ship
        *@return {Number} Enemy ship ID
        */
        let findTarget = function (ship, shipId, allShips, aim) {
            /**
            *Init value
            *Best distance between ship and target
            *Best angle between ship and target
            */
            let bestDistance = 9999;
            let bestAngle = 365;
            let bestShipByDistanceId = null;
            let bestShipByAngleId = null;

            /**
            *If number of ships is smaller than 2 => No enemy, no target
            */
            if (allShips.length < 2) {
                return -1;
            }
            let i = 0;
            let j = allShips.length;
            for (i = 0; i < j; i += 1) {
                if (i !== shipId && allShips[i]) {
                    let distance = BABYLON.Vector3.Distance(ship.body.position, allShips[i].body.position);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestShipByDistanceId = i;
                    }

                    let myAngle = ship.body.rotationQuaternion.toEulerAngles();
                    let degreesMyAngleY = ((myAngle.y) / (2 * Math.PI)) * 360;

                    aim.lookAt(allShips[i].body.position);
                    let targetAngle = aim.rotationQuaternion.toEulerAngles();
                    let degreesTargetAngleY = ((targetAngle.y) / (2 * Math.PI)) * 360;

                    if (degreesTargetAngleY < 0) {
                        degreesTargetAngleY += 180;
                    } else {
                        degreesTargetAngleY -= 180;
                    }

                    let angle = Math.abs(degreesMyAngleY - degreesTargetAngleY);

                    if (angle < bestAngle) {
                        bestAngle = angle;
                        bestShipByAngleId = i;
                    }
                }
            }

            if (bestShipByAngleId === bestShipByDistanceId && bestShipByDistanceId !== null && bestShipByDistanceId !== null) {
                targetFound = true;
                return bestShipByAngleId;
            } else {
                if (bestAngle < 120) {
                    targetFound = true;
                    return bestShipByAngleId;
                } else {
                    return bestShipByDistanceId;
                }
            }
        };
        /**
        *When the target was found, try to aim and shoot
        */
        let tryToAimAndKill = function (ship, allShips, aim, raycast, bulletFactory) {
            let target = allShips[targetId].body;
            aim.lookAt(target.position);
            let shipEuler = ship.body.rotationQuaternion.toEulerAngles();
            let aimEuler = aim.rotationQuaternion.toEulerAngles();
            let _bulletFactory = bulletFactory;

            let eulerToDegreesY = ((aimEuler.y) / (2 * Math.PI)) * 360;
            let eulerToDegreesX = ((aimEuler.x) / (2 * Math.PI)) * 360;

            if (eulerToDegreesY < 0) {
                eulerToDegreesY += 180;
            } else {
                eulerToDegreesY -= 180;
            }

            let shipEulerToDegreesY = ((shipEuler.y) / (2 * Math.PI)) * 360;
            let shipEulerToDegreesX = ((shipEuler.x) / (2 * Math.PI)) * 360;
            if (!collisionDetected && !shipDetected) {
                let angleDiffY = Math.abs(shipEulerToDegreesY - eulerToDegreesY);
                if (shipEulerToDegreesY > eulerToDegreesY && angleDiffY > 90) {
                    /**
                    *Try to find another target and turn left
                    */
                    targetId = -1;
                    targetFound = false;

                    enemyShipMovement.left = true;
                    setTimeout(function () {
                        enemyShipMovement.left = false;
                    }, 800);
                } else if (shipEulerToDegreesY < eulerToDegreesY && angleDiffY > 90) {
                    /**
                    *Try to find another target and turn right
                    */
                    targetId = -1;
                    targetFound = false;

                    enemyShipMovement.right = true;
                    setTimeout(function () {
                        enemyShipMovement.right = false;
                    }, 800);
                } else if (shipEulerToDegreesY > eulerToDegreesY && angleDiffY < 5) {
                    /**
                    * Focus aim on target Y axis
                    */
                    ship.body.rotate(BABYLON.Axis.Y, -0.005, BABYLON.Space.WORLD);
                    ship.engine.rotate(BABYLON.Axis.Y, -0.005, BABYLON.Space.WORLD);
                    ship.glass.rotate(BABYLON.Axis.Y, -0.005, BABYLON.Space.WORLD);
                } else if (shipEulerToDegreesY < eulerToDegreesY && angleDiffY < 5) {
                    /**
                    * Focus aim on target, Y axis
                    */
                    ship.body.rotate(BABYLON.Axis.Y, +0.005, BABYLON.Space.WORLD);
                    ship.engine.rotate(BABYLON.Axis.Y, +0.005, BABYLON.Space.WORLD);
                    ship.glass.rotate(BABYLON.Axis.Y, +0.005, BABYLON.Space.WORLD);
                } else if (shipEulerToDegreesY > eulerToDegreesY) {
                    /**
                    *Turn right
                    */
                    enemyShipMovement.left = true;
                    setTimeout(function () {
                        enemyShipMovement.left = false;
                    }, 600);
                } else if (shipEulerToDegreesY < eulerToDegreesY) {
                    /**
                    *Turn right
                    */
                    enemyShipMovement.right = true;
                    setTimeout(function () {
                        enemyShipMovement.right = false;
                    }, 600);
                }

                let angleDiffX = Math.abs(shipEulerToDegreesX > eulerToDegreesX);
                if (-1 * shipEulerToDegreesX > eulerToDegreesX && angleDiffX < 5 && ((shipEulerToDegreesY > eulerToDegreesY && angleDiffY < 5) || (shipEulerToDegreesY < eulerToDegreesY && angleDiffY < 5))) {
                    /**
                    * Focus aim on target, X axis
                    */
                    enemyShipConfig.xRot = enemyShipConfig.xRot + 0.001;
                    ship.body.rotate(BABYLON.Axis.X, +0.001, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.X, +0.001, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.X, +0.001, BABYLON.Space.LOCAL);
                } else if (-1 * shipEulerToDegreesX > eulerToDegreesX && angleDiffX < 5 && ((shipEulerToDegreesY > eulerToDegreesY && angleDiffY < 5) || (shipEulerToDegreesY < eulerToDegreesY && angleDiffY < 5))) {
                    /**
                    * Focus aim on target, X axis
                    */
                    enemyShipConfig.xRot = enemyShipConfig.xRot - 0.001;
                    ship.body.rotate(BABYLON.Axis.X, -0.001, BABYLON.Space.LOCAL);
                    ship.engine.rotate(BABYLON.Axis.X, -0.001, BABYLON.Space.LOCAL);
                    ship.glass.rotate(BABYLON.Axis.X, -0.001, BABYLON.Space.LOCAL);
                } else if (-1 * shipEulerToDegreesX > eulerToDegreesX) {
                    /**
                    * Fly up
                    */
                    enemyShipMovement.top = true;
                    setTimeout(function () {
                        enemyShipMovement.top = false;
                    }, 100);
                } else if (-1 * shipEulerToDegreesX < eulerToDegreesX) {
                    /**
                    * Fly bottom
                    */
                    enemyShipMovement.bottom = true;
                    setTimeout(function () {
                        enemyShipMovement.bottom = false;
                    }, 100);
                }
            }

            /**
            *If raycast collided with target and not respawn => shoot
            */
            if (raycast.intersectsMesh(target, true) && !respawn) {
                shipDetected = true;
                _bulletFactory.shoot();
            } else {
                shipDetected = false;
            }
        };

        /**
        *When ship respawn, hide his parts
        */
        let respawnShip = function (body, engine, glass) {
            respawn = true;
            /**
            *Hide ship
            */
            body.visibility = false;
            body.checkCollision = false;
            engine.visibility = false;
            glass.visibility = false;

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
            * Set new ship position
            */
            body.position = new BABYLON.Vector3(posX, posY, posZ);
            engine.position = new BABYLON.Vector3(posX, posY, posZ);
            glass.position = new BABYLON.Vector3(posX, posY, posZ);

            /**
            * Stop the ship
            */
            currentSpeed = 0;

            /**
            * Waint 4s for respawn
            */
            setTimeout(function () {
                /**
                * Reset ship hp
                */
                currentHp = enemyShipConfig.hp;
                respawn = false;
                /**
                * Show the ship
                */
                body.visibility = true;
                body.checkCollision = true;
                engine.visibility = true;
                glass.visibility = true;

                /**
                * Set ship speed
                */
                currentSpeed = enemyShipConfig.speed;
            }, 4000);
        };

        scene.executeWhenReady(function () {
            let ship = shipFactory.getEnemyShip();
            ship.body.rotationQuaternion = new BABYLON.Quaternion.Identity();
            shipId = shipFactory.getCreatedShipId();
            let allShips = shipFactory.getAllShipsArray();

            /**
            *Added new method for all ships
            *Its called when ship will be hitted by bullet
            */
            allShips[shipId].reduceHP = function (enemyShipId) {
                currentHp -= 1;
                if (currentHp < 1) {
                    UI.addKillToInfoPanel(allShips[enemyShipId].name, this.name);
                    respawnShip(this.body, this.engine, this.glass);
                    allShips[enemyShipId].kill += 1;
                    this.death += 1;
                }
            };
            let aim = createAim();
            let raycast = createRaycast(ship.body);
            let bulletFactoryArgs = {
                ammo: enemyShipConfig.ammo,
                scene: scene,
                ship: ship,
                shipId: shipId,
                allShips: allShips,
                isBot: true
            };
            let bulletFactory = BulletMaker.factory('Laser', bulletFactoryArgs);

            scene.onBeforeRenderObservable.add(function () {
                initShipMovement(ship);
                checkWorldBoundsCollision(ship);

                /**
                *Try to find target
                */
                if (!targetFound) {
                    targetId = findTarget(ship, shipId, allShips, aim);
                }

                /**
                *If target found, try to aim and kill
                */
                if (targetId !== -1) {
                    tryToAimAndKill(ship, allShips, aim, raycast, bulletFactory);
                }

                aim.position = ship.body.position;
            });
        });
    };
}

export default Enemy;