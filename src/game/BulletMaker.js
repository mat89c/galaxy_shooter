/*global
    BABYLON
*/
import Helpers from './Helpers';

let bulletsArray = [];

/**
*Create bullets
*@factory
*/
function BulletMaker() {
    "use strict";

    BulletMaker.prototype.shoot = function () {
        let reloaded = false;
        let that = this;
        let _helpers = new Helpers();
        let ammoUI = null;

        if (typeof BulletMaker.oryginalBullet !== "object") {
            BulletMaker.oryginalBullet = BABYLON.Mesh.CreateSphere('oryginalBullet', 3, 0.75, this.scene);
            BulletMaker.oryginalBullet.convertToUnIndexedMesh();
        }

        /**
        *Explode bullet when hit
        */
        let explodeBullet = function (pos) {
            let particleSystem = new BABYLON.ParticleSystem("particlesBullet", 1000, that.scene);
            particleSystem.particleTexture = new BABYLON.Texture(_helpers.baseUrl() + '/assets/flare.png', that.scene);
            particleSystem.emitter = new BABYLON.Vector3(pos.x, pos.y, pos.z);
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
            particleSystem.minSize = 0.3;
            particleSystem.maxSize = 0.5;
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1;
            particleSystem.emitRate = 3000;
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

        /**
        *If ammunitions > 0 shoot, otherwise reload
        */
        if (this.currentAmmo > 0) {
            this.currentAmmo -= 1;

            if (!this.isBot) {
                ammoUI = document.getElementById('ammo');
                ammoUI.innerHTML = this.currentAmmo;
            }

            let bullet = BulletMaker.oryginalBullet.clone('bullet' + this.bulletId);
            bullet.myId = this.bulletId;
            bullet.shipId = this.shipId;
            this.bulletId += 1;
            bullet.scaling.z = 2;
            let startPos = this.ship.body.position;
            bullet.position = new BABYLON.Vector3(startPos.x, startPos.y, startPos.z);
            bullet.checkCollisions = true;
            bullet.rotationQuaternion = this.ship.body.rotationQuaternion;

            bulletsArray.push(bullet);

            let direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 1), this.ship.body.getWorldMatrix());
            direction.scaleInPlace(20);
            let i = 0;
            let j = bulletsArray.length;

            /**
            * If bullets is outsied the world, remove it
            */
            for (i = 0; i < j; i += 1) {
                if (bulletsArray[i] !== "undefined" && (bulletsArray[i].position.x > 4000 || bulletsArray[i].position.x < -4000 || bulletsArray[i].position.y > 4000 || bulletsArray[i].position.y < -4000 || bulletsArray[i].position.z > 4000 || bulletsArray[i].position.z < -4000)) {
                    if (bulletsArray[i] !== "undefined") {
                        /**
                        *Clear unused Babylon.js observables
                        */
                        this.scene.onBeforeRenderObservable.remove(this.observableBullets[bulletsArray[i].myId]);
                        let id = bulletsArray[i].myId;
                        delete this.observableBullets[id];
                        bulletsArray[i].visibility = false;
                        bulletsArray[i].dispose();

                        if (bulletsArray[i]._isDisposed) {
                            bulletsArray.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            this.observableBullets[this.bulletId - 1] = this.scene.onBeforeRenderObservable.add(function () {
                bullet.position.addInPlace(direction);
                i = 0;
                j = that.allShips.length;
                for (i = 0; i < j; i += 1) {
                    if (bullet.intersectsMesh(that.allShips[i].body, true) && that.allShips[i].body.visibility === 1) {
                        bullet.visibility = false;
                        bullet.checkCollisions = false;
                        explodeBullet(that.allShips[i].body.position);
                        that.allShips[i].reduceHP(bullet.shipId);
                    }
                }
            });
        } else {
            if (that.reloaded === false) {
                that.reloaded = true;
                /**
                *Reload time - 3s
                */
                setTimeout(function () {
                    that.reloaded = false;
                    that.currentAmmo = that.ammo;
                    if (!that.isBot) {
                        ammoUI.innerHTML = that.currentAmmo;
                    }

                }, 3000);
            }
        }
    };
}

/**
*Static method factory
*@constructor
*/
BulletMaker.factory = function (type, args) {
    "use strict";
    let _constructor = type;
    let bullet = null;

    if (typeof BulletMaker[_constructor] !== "function") {
        throw _constructor + ' does not exist';
    }

    if (typeof BulletMaker[_constructor].prototype.shoot !== "function") {
        BulletMaker[_constructor].prototype = new BulletMaker();
    }

    bullet = new BulletMaker[_constructor](args);
    return bullet;
};

/**
*Definitions of specific constructors
*/
BulletMaker.Laser = function (args) {
    "use strict";
    this.ammo = args.ammo;
    this.currentAmmo = args.ammo;
    this.scene = args.scene;
    this.ship = args.ship;
    this.shipId = args.shipId;
    this.allShips = args.allShips;
    this.isBot = args.isBot;
    this.observableBullets = {};
    this.bulletId = 0;
    this.reloaded = false;
};

export default BulletMaker;