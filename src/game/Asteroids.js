/*global
    BABYLON
*/

/**
*Create Asteroids
*@constructor
*@singleton
*/
function Asteroids(scene, helpers) {
    "use strict";

    if (typeof Asteroids.instance === "object") {
        return Asteroids.instance;
    }
    Asteroids.instance = this;

    let _scene = scene;
    let _helpers = helpers;
    let asteroidsConfig = {
        num: 600, // Numbers of asteroids
        diameter: 10, // Diameter of asteroids
        rotation: 0.0001, // Asteroids rotation speed
        area: 850 // The size of the asteroids area
    };

    Asteroids.prototype.create = function () {
        let SPS = new BABYLON.SolidParticleSystem('SPS', _scene, {particleIntersection: true});
        let sphere = BABYLON.MeshBuilder.CreateSphere("s", {diameter: asteroidsConfig.diameter, segments: 3}, _scene);
        let positionFunction = function (particle) {
            let _particle = particle;
            let radiusTmp = Math.floor(Math.random() * asteroidsConfig.area) + 700;
            let radius = null;
            _particle.scale.x = Math.random() * 2 + 0.8;
            _particle.scale.y = Math.random() + 0.8;
            _particle.scale.z = Math.random() * 2 + 0.8;

            let rand = Math.random();
            let randomPosition = false;

            /**
            *Random asteroid position
            */
            if (rand > 0 && rand < 0.25) {
                radius = -radiusTmp;
            } else if (rand > 0.25 && rand < 0.5) {
                radius = radiusTmp;
            } else {
                radiusTmp = Math.floor(Math.random() * 5000) + (700);
                radius = -radiusTmp;
                randomPosition = true;
            }

            let angle = Math.random() * Math.PI * 2;
            _particle.position.x = Math.cos(angle) * radius;
            _particle.position.z = Math.sin(angle) * radius;

            if (randomPosition) {
                _particle.position.y = Math.floor(Math.random() * 3000) + (800);
            } else {
                _particle.position.y = Math.floor(Math.random() * 100) + (-100);
            }
            _particle.rotation.x = Math.random() * 3.5;
            _particle.rotation.y = Math.random() * 3.5;
            _particle.rotation.z = Math.random() * 3.5;

            let gray = 1.0 - Math.random() * 0.3;
            particle.color = new BABYLON.Color4(gray, gray, gray, 1);
        };
        let vertexFunction = function (vertex) {
            vertex.x *= Math.random() + 1;
            vertex.y *= Math.random() + 1;
            vertex.z *= Math.random() + 1;
        };

        /**
        *Create asteroid texture and material
        *@return {Object} Asteroid material
        */
        let createTexture = function () {
            let material = new BABYLON.StandardMaterial("asteroidMaterial", _scene);
            let texture = new BABYLON.Texture(_helpers.baseUrl() + '/assets/textures/asteroid.jpg', _scene);
            material.freeze();
            material.diffuseTexture = texture;
            material.specularTexture = texture;
            material.backFaceCulling = false;

            return material;
        };

        let rotateAsteroids = function () {
            let tmp = 0.0;
            _scene.onBeforeRenderObservable.add(function () {
                SPS.setParticles();
                SPS.mesh.rotation.y -= asteroidsConfig.rotation;
                SPS.mesh.position.y = Math.sin(tmp) * 2;
                tmp -= 0.02;
            });
        };

        SPS.addShape(sphere, asteroidsConfig.num, {positionFunction: positionFunction, vertexFunction: vertexFunction});
        sphere.dispose();

        let mesh = SPS.buildMesh();
        mesh.rotate(BABYLON.Axis.Z, +0.4, BABYLON.Space.WORLD);
        mesh.material = createTexture();

        SPS.setParticles();
        SPS.refreshVisibleSize();
        SPS.computeParticleTexture = false;
        //rotateAsteroids();
    };
}

export default Asteroids;