/*global
    VirtualJoystick, window
*/

function UI() {
    "use strict";
    if (typeof UI.instance === "object") {
        return UI.instance;
    }
    UI.intance = this;

    let joystick;

    UI.prototype.addKillToInfoPanel = function (player1, player2) {
        let infoPanel = document.querySelector('.info-panel');
        if (infoPanel.children.length === 4) {
            infoPanel.removeChild(infoPanel.childNodes[0]);
            infoPanel.insertAdjacentHTML("beforeend", `<p>${player1} kill ${player2}</p>`);
        } else {
            infoPanel.insertAdjacentHTML("beforeend", `<p>${player1} kill ${player2}</p>`);
        }
    };

    UI.prototype.addSuicideToInfoPanel = function (player, isBot) {
        let infoPanel = document.querySelector('.info-panel');
        let i = isBot ? 'killed himself' : 'killed yourself';
        if (infoPanel.children.length === 4) {
            infoPanel.removeChild(infoPanel.childNodes[0]);
            infoPanel.insertAdjacentHTML("beforeend", `<p>${player} ${i}</p>`);
        } else {
            infoPanel.insertAdjacentHTML("beforeend", `<p>${player} ${i}</p>`);
        }
    };

    UI.prototype.showAlert = function () {
        let alert = document.querySelector('.alert');
        alert.classList.add('active');
    };

    UI.prototype.hideAlert = function () {
        let alert = document.querySelector('.alert');
        alert.classList.remove('active');
    };

    UI.prototype.showInterface = function () {
        let startBtn = document.getElementById('start');
        startBtn.classList.add('hide');
        let infoPanel = document.querySelector('.info-panel');
        infoPanel.classList.add('active');
        let hpBar = document.querySelector('.hpBar');
        hpBar.classList.add('active');
        let ammo = document.querySelector('.ammo-wrapper');
        ammo.classList.add('active');
        let power = document.querySelector('.power-wrapper');
        power.classList.add('active');
        let fps = document.querySelector('.fps-wrapper');
        fps.classList.add('active');
        let sidebar = document.querySelector('.sidebar');
        sidebar.classList.add('active');
    };

    UI.prototype.reduceHP = function () {
        let lives = document.querySelector('.lives');
        lives.removeChild(lives.lastChild);
    };

    UI.prototype.resetHP = function () {
        let lives = document.querySelector('.lives');
        lives.innerHTML = "";
        lives.insertAdjacentHTML('beforeend', `<span></span><span></span><span></span>`);
        console.log(lives.childNodes.length);
    };

    UI.prototype.closeSidebar = function () {
        let close = document.getElementById('close');
        close.addEventListener('click', function () {
            let sidebar = document.querySelector('.sidebar');
            sidebar.parentNode.removeChild(sidebar);
        }, false);
    };

    UI.prototype.initVirtualJoystick = function () {
        let baseY = window.innerHeight - 100;

        joystick = new VirtualJoystick({
            mouseSupport: true,
            limitStickTravel: true,
            stationaryBase: true,
            stickRadius: 50,
            baseX: 100,
            baseY: baseY
        });

        window.addEventListener('resize', function () {
            if(typeof joystick === "object") {
                baseY = window.innerHeight - 163;
                let joystickBase = document.getElementById('joystickBase');
                joystickBase.style.top = baseY + 'px';
            }
        });
    };

    UI.prototype.getVirtualJoystick = function () {
        return joystick;
    };
}

export default UI;