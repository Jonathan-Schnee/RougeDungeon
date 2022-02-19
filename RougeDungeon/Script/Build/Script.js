"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    let ctrForward = new ƒ.Control("Forward", 250, 0 /* PROPORTIONAL */);
    ctrForward.setDelay(10);
    class Controls {
        isGrounded;
        agent;
        agentRB;
        agentdampT;
        agentScript;
        agentMesh;
        swordtrigger;
        constructor(agent, agentRB) {
            this.agent = agent;
            this.agentScript = this.agent.getComponent(Script.ScriptAgent);
            this.agentRB = agentRB;
            this.agentdampT = agentRB.dampTranslation;
            this.agentMesh = this.agent.getComponent(ƒ.ComponentMesh);
            this.swordtrigger = this.agent.getChildrenByName("SwordTrigger")[0];
            window.addEventListener("click", this.agentScript.use);
        }
        controlls() {
            this.isGrounded = false;
            let direction = ƒ.Vector3.Y(-1);
            let agentTrans = this.agent.mtxWorld.translation.clone;
            agentTrans.x += (this.agentMesh.mtxPivot.scaling.x / 2 - 0.02) * -Math.cos(this.agentMesh.mtxPivot.rotation.y * Math.PI / 180);
            let ray = ƒ.Physics.raycast(agentTrans, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2);
            if (ray.hit) {
                this.agentRB.dampTranslation = this.agentdampT;
                this.isGrounded = true;
            }
            let forward = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT], [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]);
            ctrForward.setInput(forward);
            this.agentRB.applyForce(ƒ.Vector3.X(ctrForward.getOutput()));
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && this.isGrounded) {
                this.agentRB.setVelocity(new ƒ.Vector3(this.agentRB.getVelocity().x, 11, this.agentRB.getVelocity().z));
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ONE])) {
                this.agentScript.changeItem(Script.Items.Axe);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.TWO])) {
                this.agentScript.changeItem(Script.Items.Pickaxe);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.THREE])) {
                this.agentScript.changeItem(Script.Items.Sword);
            }
            if (ctrForward.getOutput() < 0) {
                this.agentMesh.mtxPivot.rotation.y = 180;
                this.swordtrigger.mtxLocal.translation = new ƒ.Vector3(-(this.agentMesh.mtxPivot.scaling.x / 2 + this.swordtrigger.mtxLocal.scaling.x / 2), 0, 1);
            }
            if (ctrForward.getOutput() > 0) {
                this.agentMesh.mtxPivot.rotation.y = 0;
                this.swordtrigger.mtxLocal.translation = new ƒ.Vector3((this.agentMesh.mtxPivot.scaling.x / 2 + this.swordtrigger.mtxLocal.scaling.x / 2), 0, 1);
            }
        }
    }
    Script.Controls = Controls;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["ATTACK"] = 1] = "ATTACK";
        JOB[JOB["DIE"] = 2] = "DIE";
        JOB[JOB["ROTATE"] = 3] = "ROTATE";
    })(JOB || (JOB = {}));
    class EnemyStateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(EnemyStateMachine);
        static instructions = EnemyStateMachine.get();
        cmpBody;
        constructor() {
            super();
            this.instructions = EnemyStateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = EnemyStateMachine.transitDefault;
            setup.actDefault = EnemyStateMachine.actDefault;
            setup.setAction(JOB.IDLE, this.actIdle);
            setup.setAction(JOB.ROTATE, this.actRotate);
            setup.setAction(JOB.ATTACK, this.actAttack);
            setup.setAction(JOB.DIE, this.actDie);
            return setup;
        }
        static transitDefault(_machine) {
            //console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            //console.log(JOB[_machine.stateCurrent]);
        }
        static async actIdle(_machine) {
            _machine.node.mtxLocal.translateX(1 * ƒ.Loop.timeFrameReal / 1000);
            EnemyStateMachine.actDefault(_machine);
        }
        static async actRotate(_machine) {
            _machine.node.mtxLocal.rotateY(180);
            _machine.node.getChildren().forEach(node => { node.mtxLocal.translateZ(-2 * Math.cos(_machine.node.mtxLocal.rotation.y * Math.PI / 180)); });
        }
        static async actAttack(_machine) {
            _machine.node.mtxLocal.translateX(3 * ƒ.Loop.timeFrameReal / 1000);
        }
        static async actDie(_machine) {
            await _machine.node.getChildren().forEach(node => node.removeComponent(node.getComponent(ƒ.ComponentRigidbody)));
            _machine.node.removeComponent(_machine.cmpBody);
            _machine.hndEvent("removeEvent");
            _machine.node.getParent().removeChild(_machine.node);
            _machine.node.removeComponent(_machine.node.getComponent(EnemyStateMachine));
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            let seeTrigger;
            let dmgTrigger;
            let kill;
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    seeTrigger = this.node.getChildrenByName("SeeTrigger")[0].getComponent(ƒ.ComponentRigidbody);
                    dmgTrigger = this.node.getChildrenByName("DamageTrigger")[0].getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Cart")
                            this.transit(JOB.DIE);
                    });
                    seeTrigger.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        for (let t of seeTrigger.triggerings) {
                            if (t.node.name == "Agent")
                                this.transit(JOB.ATTACK);
                        }
                    });
                    dmgTrigger.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Agent" && this.stateCurrent != JOB.DIE)
                            _event.cmpRigidbody.node.getComponent(Script.ScriptAgent).removelife();
                        if (_event.cmpRigidbody.collisionGroup == ƒ.COLLISION_GROUP.GROUP_2) {
                            this.transit(JOB.ROTATE);
                        }
                    });
                    dmgTrigger.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                        if (_event.cmpRigidbody.collisionGroup == ƒ.COLLISION_GROUP.GROUP_2) {
                            this.transit(JOB.IDLE);
                        }
                    });
                    kill = this.node.addEventListener("killEvent", (_event) => {
                        this.transit(JOB.DIE);
                    });
                    break;
                case "removeEvents":
                    this.cmpBody.removeEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, (_event) => { });
                    seeTrigger.removeEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => { });
                    dmgTrigger.removeEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => { });
                    this.removeEventListener("killEvent", (_event) => { });
                    break;
            }
        };
        update = (_event) => {
            this.act();
        };
    }
    Script.EnemyStateMachine = EnemyStateMachine;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    class Hud extends ƒ.Mutable {
        static controller;
        static instance;
        static maxLife = 3;
        static domHud;
        constructor() {
            super();
            Hud.domHud = document.querySelector("#HeartsFull");
            Hud.instance = this;
            Hud.controller = new ƒui.Controller(this, Hud.domHud);
            console.log("Hud-Controller", Hud.controller);
        }
        static get() {
            return Hud.instance || new Hud();
        }
        static life(life) {
            this.get();
            for (let h = 0; h < this.maxLife; h++) {
                if (h < life) {
                    Hud.domHud = Hud.controller.domElement.querySelector("#heartFull" + h);
                    Hud.domHud.style.opacity = "100%";
                }
                else {
                    Hud.domHud = Hud.controller.domElement.querySelector("#heartFull" + h);
                    Hud.domHud.style.opacity = "0%";
                }
            }
        }
        static ownpoints(points) {
            this.get();
            let domPoints = document.querySelector("input[key='Points']");
            if (points.toString().length < 7)
                domPoints.value = ('0000000' + points.toString()).substring(points.toString().length);
            else
                domPoints.value = "9999999";
        }
        static fiendpoints(points) {
            this.get();
            let domPoints = document.querySelector("input[key='FriendPoints']");
            if (points.toString().length < 7)
                domPoints.value = ('0000000' + points.toString()).substring(points.toString().length);
            else
                domPoints.value = "9999999";
        }
        static chooseItems(activeItem) {
            this.get();
            let domItems = document.querySelector("#Items");
            let i = 0;
            for (let item of domItems.children) {
                if (activeItem == item.id) {
                    item.id = "active";
                }
                else {
                    item.id = Script.Items[i];
                }
                i++;
            }
        }
        static showMain() {
            let dialog = document.querySelector("dialog");
        }
        reduceMutator(_mutator) { }
    }
    Script.Hud = Hud;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let agent;
    let agentRB;
    let ground;
    let graph;
    let randomSeed;
    let random;
    let generator;
    let controlls;
    let canvas;
    let cameraNode = new ƒ.Node("cameraNode");
    let cmpCamera = new ƒ.ComponentCamera();
    let singlePlayer;
    let client;
    window.addEventListener("load", start);
    async function start(_event) {
        await ƒ.Project.loadResourcesFromHTML();
        await loadData();
        let single = document.getElementById("single");
        let client = document.getElementById("multi");
        single.addEventListener("click", function (_event) {
            let dialog = document.getElementById("question");
            dialog.hidden = true;
            dialog = document.getElementById("Hud");
            dialog.hidden = false;
            singlePlayer = true;
            init();
        });
        client.addEventListener("click", function (_event) {
            let dialog = document.getElementById("question");
            dialog.hidden = true;
            singlePlayer = false;
            multiplayer();
        });
    }
    async function multiplayer() {
        client = new Script.Multiplayer();
        await client.connectToServer();
        console.log(client.getID());
        let dialog = document.getElementById("question");
        dialog.hidden = true;
        dialog = document.getElementById("connecting");
        dialog.hidden = false;
        dialog.querySelector("h1").textContent = "Your ID: " + client.getID();
        let input = document.querySelector("input[key='ID']");
        dialog.addEventListener("keydown", function (_event) {
            if (_event.key == ƒ.KEYBOARD_CODE.ENTER) {
                client.setPatnerID(input.value);
                input.disabled = true;
                client.send("Eingegeben");
            }
        });
        let button = document.getElementById("play");
        button.addEventListener("click", function (event) {
            if (input.disabled && client.getMessage() == "Eingegeben") {
                dialog = document.getElementById("connecting");
                dialog.hidden = true;
                dialog = document.getElementById("FriendPoints");
                dialog.hidden = false;
                dialog = document.getElementById("Hud");
                dialog.hidden = false;
                init();
            }
        });
    }
    async function init() {
        graph = ƒ.Project.resources["Graph|2021-12-24T09:09:33.313Z|93679"];
        Script.Hud.showMain();
        randomSeed = 70;
        random = new ƒ.Random(randomSeed);
        agent = graph.getChildrenByName("Agent")[0];
        ground = graph.getChildrenByName("Ground")[0];
        generator = graph.getChildrenByName("Generator")[0];
        generator.getComponent(Script.ScriptGenerator).addTree(random);
        generator.getComponent(Script.ScriptGenerator).addStone(random);
        generateCG(ground, ƒ.COLLISION_GROUP.GROUP_2);
        agentRB = agent.getComponent(ƒ.ComponentRigidbody);
        agentRB.effectRotation = new ƒ.Vector3(0, 0, 0);
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new ƒ.ComponentTransform());
        graph.addChild(cameraNode);
        canvas = document.querySelector("canvas");
        cmpCamera.projectOrthographic(Script.camdata.left * window.innerWidth, Script.camdata.right * window.innerWidth, Script.camdata.bottom * window.innerHeight, Script.camdata.top * window.innerHeight);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        viewport.adjustingCamera = false;
        //viewport.camera.mtxPivot.rotateY(180);
        // viewport.camera.mtxPivot.rotateX(20);
        // viewport.camera.mtxPivot.translateZ(-30);
        controlls = new Script.Controls(agent, agentRB);
        ƒ.AudioManager.default.listenTo(graph);
        ƒ.AudioManager.default.listenWith(graph.getComponent(ƒ.ComponentAudioListener));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);
    }
    function update(_event) {
        cmpCamera.projectOrthographic(Script.camdata.left * window.innerWidth, Script.camdata.right * window.innerWidth, Script.camdata.bottom * window.innerHeight, Script.camdata.top * window.innerHeight);
        cameraNode.mtxLocal.translation = new ƒ.Vector3(agent.mtxLocal.translation.x, 0, 0);
        controlls.controlls();
        if (!singlePlayer)
            receiveData();
        viewport.draw();
        ƒ.AudioManager.default.update();
        ƒ.Physics.world.simulate(); // if physics is included and used
    }
    function generateCG(node, collisionGroup) {
        for (let n of node.getChildren()) {
            let nodeRB = n.getComponent(ƒ.ComponentRigidbody);
            nodeRB.collisionGroup = collisionGroup;
        }
    }
    async function loadData() {
        let rawCamData = await fetch("Script/Source/CameraConfig.json");
        Script.camdata = JSON.parse(await rawCamData.text());
        let rawSpawnData = await fetch("Script/Source/SpawnPercentage.json");
        Script.spawndata = JSON.parse(await rawSpawnData.text());
    }
    function sendData(message) {
        client.send(message);
    }
    Script.sendData = sendData;
    function receiveData() {
        let m = client.getMessage();
        if (/^\d+$/.test(m)) {
            Script.Hud.fiendpoints(Number(m));
        }
    }
})(Script || (Script = {}));
///<reference path="../../../Fudge/Net/Build/Client/FudgeClient.d.ts"/>
var Script;
///<reference path="../../../Fudge/Net/Build/Client/FudgeClient.d.ts"/>
(function (Script) {
    var ƒ = FudgeCore;
    var ƒClient = FudgeNet.FudgeClient;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let client = new ƒClient();
    // keep a list of known clients, updated with information from the server
    let _ownID;
    let _notmyID;
    let _message = "test";
    let _receivedmessage;
    class Multiplayer extends ƒ.Mutable {
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            let event = this.addEventListener("sendMessage", this.sendMessage);
        }
        async connectToServer() {
            let domServer = "wss://rougedungeon.herokuapp.com";
            try {
                client.connectToServer(domServer);
                // connect to a server with the given url
                await this.delay(1000);
                // document.forms[0].querySelector("button#login").removeAttribute("disabled");
                _ownID = client.id;
                // install an event listener to be called when a message comes in
                client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, this.receiveMessage);
            }
            catch (_error) {
                console.log(_error);
                console.log("Make sure, FudgeServer is running and accessable");
            }
        }
        delay(_milisec) {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, _milisec);
            });
        }
        async receiveMessage(_event) {
            if (_event instanceof MessageEvent) {
                let message = JSON.parse(_event.data);
                if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT) {
                    _receivedmessage = JSON.stringify(message.content.text);
                    _receivedmessage = _receivedmessage.replace(/['"]+/g, '');
                }
            }
        }
        send(message) {
            _message = message;
            this.dispatchEvent(new CustomEvent("sendMessage"));
        }
        sendMessage(_event) {
            let protocol = "wss";
            let message = _message;
            let ws = protocol == "wss";
            let receiver = _notmyID;
            if (receiver != "")
                // send the message to a specific client (target specified) via RTC (no route specified) or TCP (route = via server)
                client.dispatch({ route: ws ? FudgeNet.ROUTE.VIA_SERVER : undefined, idTarget: receiver, content: { text: message } });
        }
        getID() {
            return _ownID;
        }
        reduceMutator(_mutator) {
            //   // delete properties that should not be mutated
            //   // undefined properties and private fields (#) will not be included by default
        }
        setPatnerID(id) {
            _notmyID = id;
        }
        getMessage() {
            return _receivedmessage;
        }
    }
    Script.Multiplayer = Multiplayer;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let Items;
    (function (Items) {
        Items[Items["Axe"] = 0] = "Axe";
        Items[Items["Pickaxe"] = 1] = "Pickaxe";
        Items[Items["Sword"] = 2] = "Sword";
    })(Items = Script.Items || (Script.Items = {}));
    let Types;
    (function (Types) {
        Types[Types["Tree"] = 0] = "Tree";
        Types[Types["Stone"] = 1] = "Stone";
    })(Types = Script.Types || (Script.Types = {}));
    class ScriptAgent extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ScriptAgent);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        item;
        maxhealth = 3;
        health;
        point;
        actionTarget;
        actionType;
        swordTrigger;
        enemy;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.health = this.maxhealth;
            this.changeItem(Items.Axe);
            this.point = 0;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.swordTrigger = this.node.getChildrenByName("SwordTrigger")[0].getComponent(ƒ.ComponentRigidbody);
                    this.swordTrigger.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Enemy") {
                            this.enemy = _event.cmpRigidbody.node;
                        }
                    });
                    this.swordTrigger.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Enemy") {
                            this.enemy = null;
                        }
                    });
                    break;
            }
        };
        use = (_event) => {
            if (this.actionTarget != null) {
                if (this.item == Items.Axe && this.actionType == Types.Tree) {
                    this.points(1);
                    this.actionTarget.dispatchEvent(new CustomEvent("actionUse"));
                }
                if (this.item == Items.Pickaxe && this.actionType == Types.Stone) {
                    this.points(5);
                    this.actionTarget.dispatchEvent(new CustomEvent("actionUse"));
                }
            }
            if (this.enemy != null) {
                if (this.item == Items.Sword) {
                    this.points(10);
                    this.enemy.dispatchEvent(new CustomEvent("killEvent"));
                }
            }
        };
        removelife() {
            this.health = this.health - 1;
            Script.Hud.life(this.health);
        }
        addlife() {
            Script.Hud.life(this.maxhealth);
        }
        points(addpoint) {
            this.point += addpoint;
            Script.Hud.ownpoints(this.point);
            Script.sendData(this.point.toString());
        }
        changeItem(i) {
            if (this.item != i) {
                this.item = i;
                Script.Hud.chooseItems(Items[this.item]);
            }
        }
        action(_actionTarget, _actionType) {
            this.actionTarget = _actionTarget;
            this.actionType = _actionType;
        }
    }
    Script.ScriptAgent = ScriptAgent;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class ScriptGenerator extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ScriptGenerator);
        // Properties may be mutated by users in the editor via the automatically created user interface
        treePercentage;
        stonePercentage;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
        }
        addTree(random) {
            this.treePercentage = Script.spawndata.treePercent;
            let treeTexture = FudgeCore.Project.resources["Material|2022-02-17T16:32:32.889Z|93547"];
            let trees = this.node.getChildrenByName("Trees")[0];
            for (let tree of trees.getChildren()) {
                let scale = tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaling;
                let num = random.getRangeFloored(0, 101);
                if (num < this.treePercentage) {
                    let height = random.getRangeFloored(2, scale.y + 1);
                    tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(height / scale.y);
                    tree.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(255, 255, 255, 255);
                    tree.getComponent(ƒ.ComponentMaterial).material = treeTexture;
                    tree.getComponent(ƒ.ComponentMaterial).mtxPivot.scaleY(height);
                    tree.mtxLocal.translateY((height - scale.y) / 2);
                    let placeholderRB = new ƒ.Node("placeholderRB");
                    tree.appendChild(placeholderRB);
                    placeholderRB.addComponent(new ƒ.ComponentTransform);
                    placeholderRB.addComponent(new ƒ.ComponentRigidbody);
                    let treeRB = placeholderRB.getComponent(ƒ.ComponentRigidbody);
                    treeRB.typeBody = ƒ.BODY_TYPE.STATIC;
                    treeRB.initialization = ƒ.BODY_INIT.TO_PIVOT;
                    treeRB.isTrigger = true;
                    treeRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_3;
                    treeRB.mtxPivot.scaleY(height);
                    treeRB.mtxPivot.translateZ(1);
                    tree.dispatchEvent(new CustomEvent("addEvents"));
                }
                else {
                    trees.removeChild(tree);
                }
            }
        }
        addStone(random) {
            this.stonePercentage = Script.spawndata.stonePercent;
            let stones = this.node.getChildrenByName("Stones")[0];
            for (let stone of stones.getChildren()) {
                let num = random.getRangeFloored(0, 101);
                if (num < this.stonePercentage) {
                    stone.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(211, 211, 211, 255);
                    let placeholderRB = new ƒ.Node("placeholderRB");
                    stone.appendChild(placeholderRB);
                    placeholderRB.addComponent(new ƒ.ComponentTransform);
                    placeholderRB.addComponent(new ƒ.ComponentRigidbody);
                    let stoneRB = placeholderRB.getComponent(ƒ.ComponentRigidbody);
                    stoneRB.typeBody = ƒ.BODY_TYPE.STATIC;
                    stoneRB.initialization = ƒ.BODY_INIT.TO_PIVOT;
                    stoneRB.isTrigger = true;
                    stoneRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_4;
                    stoneRB.mtxPivot.scaleX(stone.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x);
                    stoneRB.mtxPivot.translateZ(1);
                    stone.dispatchEvent(new CustomEvent("addEvents"));
                }
                else {
                    stones.removeChild(stone);
                }
            }
        }
    }
    Script.ScriptGenerator = ScriptGenerator;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class ScriptStone extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ScriptStone);
        // Properties may be mutated by users in the editor via the automatically created user interface
        percentage = 3;
        cmpBody;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        action() {
            let stone = this.node;
            let stonemesh = stone.getComponent(ƒ.ComponentMesh);
            let stoneRB = stone.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
            let stoneWidth = stonemesh.mtxPivot.scaling.clone;
            stonemesh.mtxPivot.scaling = new ƒ.Vector3(stoneWidth.x - 0.2, stoneWidth.y, stoneWidth.z);
            if (stonemesh.mtxPivot.scaling.x < 1) {
                stoneRB.node.removeComponent(stoneRB);
                stone.getParent().removeChild(stone);
            }
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.node.addEventListener("addEvents", this.hndEvent);
                    this.node.addEventListener("actionUse", this.hndEvent);
                    break;
                case "addEvents":
                    this.cmpBody = this.node.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
                    console.log("2");
                    this.cmpBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Agent")
                            _event.cmpRigidbody.node.getComponent(Script.ScriptAgent).action(this.node, Script.Types.Stone);
                    });
                    this.cmpBody.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Agent")
                            _event.cmpRigidbody.node.getComponent(Script.ScriptAgent).action(null, null);
                    });
                    break;
                case "actionUse":
                    this.action();
            }
        };
    }
    Script.ScriptStone = ScriptStone;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class ScriptTree extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ScriptTree);
        cmpBody;
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        action() {
            let tree = this.node;
            let treemesh = tree.getComponent(ƒ.ComponentMesh);
            let treeRB = tree.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
            let treeheight = treemesh.mtxPivot.scaling.clone;
            treemesh.mtxPivot.scaling = new ƒ.Vector3(treeheight.x, treeheight.y - 1, treeheight.z);
            tree.mtxLocal.translateY(-0.5);
            tree.getComponent(ƒ.ComponentMaterial).mtxPivot.scaling = new ƒ.Vector2(treeheight.x, treeheight.y - 1);
            treeRB.node.mtxLocal.translateY(0.5);
            if (treemesh.mtxPivot.scaling.y == 0) {
                treeRB.node.removeComponent(treeRB);
                tree.getParent().removeChild(tree);
            }
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.node.addEventListener("addEvents", this.hndEvent);
                    this.node.addEventListener("actionUse", this.hndEvent);
                    break;
                case "addEvents":
                    this.cmpBody = this.node.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
                    console.log("1");
                    this.cmpBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Agent")
                            _event.cmpRigidbody.node.getComponent(Script.ScriptAgent).action(this.node, Script.Types.Tree);
                    });
                    this.cmpBody.addEventListener("TriggerLeftCollision" /* TRIGGER_EXIT */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Agent")
                            _event.cmpRigidbody.node.getComponent(Script.ScriptAgent).action(null, null);
                    });
                    break;
                case "actionUse":
                    this.action();
            }
        };
    }
    Script.ScriptTree = ScriptTree;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map