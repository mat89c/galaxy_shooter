import Helpers from './Helpers';
import BabylonScene from './BabylonScene';
import Asteroids from './Asteroids';
import ShipMaker from './ShipMaker';
import BulletMaker from './BulletMaker';
import Explosions from './Explosions';
import Player from './Player';
import Enemy from './Enemy';
import UI from './UI';

function Game() {
    "use strict";

    let helpers = new Helpers();
    let babylonScene = new BabylonScene();
    let _scene = babylonScene.getScene();
    let asteroids = new Asteroids(_scene, helpers);
    let explosions = new Explosions(helpers, _scene);
    let shipMaker = ShipMaker;
    let userInterface = new UI();
    let shipArgs = {
        shipMaker: shipMaker,
        scene: _scene,
        helpers: helpers,
        bulletMaker: BulletMaker,
        explosions: explosions,
        userInterface: userInterface
    };

    /**
    *Number of bots
    */
    let bots = 5;
    let i = 0;
    for (i = 0; i < bots; i += 1) {
        let enemy = new Enemy(shipArgs);
        enemy.create();
    }

    babylonScene.createLights();
    babylonScene.createSkyboxAndEarth(helpers);
    babylonScene.createCamera();
    babylonScene.onResizeEvent();

    asteroids.create();

    window.onload = function () {

        let startBtn = document.getElementById('start');
        startBtn.addEventListener('click', function () {
            userInterface.initVirtualJoystick();
            let player = new Player(shipArgs);
            player.create();
            userInterface.showInterface();
            userInterface.closeSidebar();
        }, false);
    };
}

export default Game;