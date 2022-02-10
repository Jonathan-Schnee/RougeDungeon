"use strict";
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
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let ctrForward = new ƒ.Control("Forward", 250, 0 /* PROPORTIONAL */);
    ctrForward.setDelay(10);
    let agent;
    let agentRB;
    let agentScript;
    let isGrounded;
    let ground;
    let agentdampT;
    let graph;
    let treeList;
    let stoneList;
    let randomSeed;
    let random;
    let generator;
    let canvas;
    let cameraNode = new ƒ.Node("cameraNode");
    let cmpCamera = new ƒ.ComponentCamera();
    window.addEventListener("load", start);
    async function start(_event) {
        await ƒ.Project.loadResourcesFromHTML();
        graph = ƒ.Project.resources["Graph|2021-12-24T09:09:33.313Z|93679"];
        randomSeed = 70;
        random = new ƒ.Random(randomSeed);
        agent = graph.getChildrenByName("Agent")[0];
        agent.getComponent(Script.ScriptAgent).getRB();
        agentScript = agent.getComponent(Script.ScriptAgent);
        window.addEventListener("click", agentScript.use);
        ground = graph.getChildrenByName("Ground")[0];
        generator = graph.getChildrenByName("Generator")[0];
        generator.getComponent(Script.ScriptGenerator).addTree(random);
        generator.getComponent(Script.ScriptGenerator).addStone(random);
        treeList = generator.getChildrenByName("Trees")[0];
        stoneList = generator.getChildrenByName("Stones")[0];
        generateCG(ground);
        agentRB = agent.getComponent(ƒ.ComponentRigidbody);
        agentRB.effectRotation = new ƒ.Vector3(0, 0, 0);
        agentdampT = agentRB.dampTranslation;
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new ƒ.ComponentTransform());
        graph.addChild(cameraNode);
        canvas = document.querySelector("canvas");
        cmpCamera.projectOrthographic(-6 * window.innerWidth / 1000, 6 * window.innerWidth / 1000, 6 * window.innerHeight / 1000, -6 * window.innerHeight / 1000);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        viewport.adjustingCamera = false;
        ƒ.AudioManager.default.listenTo(graph);
        ƒ.AudioManager.default.listenWith(graph.getComponent(ƒ.ComponentAudioListener));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        console.log(window.innerWidth / 1000 + " " + window.innerHeight / 1000);
        cmpCamera.projectOrthographic(-6 * window.innerWidth / 1000, 6 * window.innerWidth / 1000, 6 * window.innerHeight / 1000, -6 * window.innerHeight / 1000);
        cameraNode.mtxLocal.translation = new ƒ.Vector3(agent.mtxLocal.translation.x, 0, 0);
        isGrounded = false;
        let direction = ƒ.Vector3.Y(-1);
        let agentTransL = agent.mtxWorld.translation.clone;
        agentTransL.x -= agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
        let rayL = ƒ.Physics.raycast(agentTransL, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2);
        let agentTransR = agent.mtxWorld.translation.clone;
        agentTransR.x += agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
        let rayR = ƒ.Physics.raycast(agentTransR, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2);
        if (rayL.hit || rayR.hit) {
            agentRB.dampTranslation = agentdampT;
            isGrounded = true;
        }
        let forward = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT], [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]);
        ctrForward.setInput(forward);
        agentRB.applyForce(ƒ.Vector3.X(ctrForward.getOutput()));
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && isGrounded) {
            agentRB.setVelocity(new ƒ.Vector3(agentRB.getVelocity().x, 11, agentRB.getVelocity().z));
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ONE]) && agentScript.item != Script.items.Axe) {
            agentScript.item = Script.items.Axe;
            console.log("1");
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.TWO]) && agentScript.item != Script.items.Pickaxe) {
            agentScript.item = Script.items.Pickaxe;
            console.log("2");
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.THREE]) && agentScript.item != Script.items.Sword) {
            agentScript.item = Script.items.Sword;
            console.log("3");
        }
        ƒ.Physics.world.simulate(); // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function generateCG(ground) {
        for (let g of ground.getChildren()) {
            let groundRB = g.getComponent(ƒ.ComponentRigidbody);
            groundRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2;
        }
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let items;
    (function (items) {
        items[items["Axe"] = 0] = "Axe";
        items[items["Pickaxe"] = 1] = "Pickaxe";
        items[items["Sword"] = 2] = "Sword";
    })(items = Script.items || (Script.items = {}));
    let types;
    (function (types) {
        types[types["Tree"] = 0] = "Tree";
        types[types["Stone"] = 1] = "Stone";
    })(types || (types = {}));
    class ScriptAgent extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(ScriptAgent);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        item = items.Axe;
        agentRB;
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
        use = (_event) => {
            let tree;
            let treeRB;
            let stone;
            let stoneRB;
            let type;
            if (this.agentRB.triggerings.length != 0) {
                for (let rb of this.agentRB.triggerings) {
                    if (rb.collisionGroup == ƒ.COLLISION_GROUP.GROUP_3) {
                        tree = rb.node.getParent();
                        treeRB = rb;
                        type = types.Tree;
                    }
                    if (rb.collisionGroup == ƒ.COLLISION_GROUP.GROUP_4) {
                        stone = rb.node.getParent();
                        stoneRB = rb;
                        type = types.Stone;
                    }
                }
                if (this.item == items.Axe && type == types.Tree) {
                    //Call Trigger from Tree and call the Method in the ScriptTree
                    console.log("hit2");
                    tree.getComponent(Script.ScriptTree).chopTree();
                }
                if (this.item == items.Pickaxe && type == types.Stone) {
                    //Call Trigger from Tree and call the Method in the ScriptTree
                    console.log("hit2");
                    stone.getComponent(Script.ScriptStone).mineStone();
                }
            }
            if (this.item == items.Sword) {
                //Call Trigger from Tree and call the Method in the ScriptTree
                console.log("hit3");
            }
        };
        getRB() {
            this.agentRB = this.node.getComponent(ƒ.ComponentRigidbody);
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
        treePercentage = 65;
        stonePercentage = 65;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
        }
        addTree(random) {
            let trees = this.node.getChildrenByName("Trees")[0];
            for (let tree of trees.getChildren()) {
                let scale = tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaling;
                let num = random.getRangeFloored(0, 101);
                if (num < this.treePercentage) {
                    tree.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(155, 103, 60, 255);
                    let height = random.getRangeFloored(2, scale.y + 1);
                    tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(height / scale.y);
                    tree.mtxLocal.translateY((height - scale.y) / 2);
                    tree.addComponent(new Script.ScriptTree);
                    let placeholderRB = new ƒ.Node("placeholderRB");
                    tree.appendChild(placeholderRB);
                    placeholderRB.addComponent(new ƒ.ComponentTransform);
                    placeholderRB.addComponent(new ƒ.ComponentRigidbody);
                    let treeRB = placeholderRB.getComponent(ƒ.ComponentRigidbody);
                    treeRB.typeBody = ƒ.BODY_TYPE.KINEMATIC;
                    treeRB.initialization = ƒ.BODY_INIT.TO_PIVOT;
                    treeRB.isTrigger = true;
                    treeRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_3;
                    treeRB.mtxPivot.scaleY(height);
                    treeRB.mtxPivot.translateZ(1);
                }
                else {
                    trees.removeChild(tree);
                }
            }
        }
        addStone(random) {
            let stones = this.node.getChildrenByName("Stones")[0];
            for (let stone of stones.getChildren()) {
                let num = random.getRangeFloored(0, 101);
                if (num < this.stonePercentage) {
                    stone.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(211, 211, 211, 255);
                    stone.addComponent(new Script.ScriptStone);
                    let placeholderRB = new ƒ.Node("placeholderRB");
                    stone.appendChild(placeholderRB);
                    placeholderRB.addComponent(new ƒ.ComponentTransform);
                    placeholderRB.addComponent(new ƒ.ComponentRigidbody);
                    let stoneRB = placeholderRB.getComponent(ƒ.ComponentRigidbody);
                    stoneRB.typeBody = ƒ.BODY_TYPE.KINEMATIC;
                    stoneRB.initialization = ƒ.BODY_INIT.TO_PIVOT;
                    stoneRB.isTrigger = true;
                    stoneRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_4;
                    stoneRB.mtxPivot.scaleX(stone.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x);
                    stoneRB.mtxPivot.translateZ(1);
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
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
        }
        mineStone() {
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
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
        }
        chopTree() {
            let tree = this.node;
            let treemesh = tree.getComponent(ƒ.ComponentMesh);
            let treeRB = tree.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
            let treeheight = treemesh.mtxPivot.scaling.clone;
            treemesh.mtxPivot.scaling = new ƒ.Vector3(treeheight.x, treeheight.y - 1, treeheight.z);
            tree.mtxLocal.translateY(-0.5);
            treeRB.node.mtxLocal.translateY(0.5);
            if (treemesh.mtxPivot.scaling.y == 0) {
                treeRB.node.removeComponent(treeRB);
                tree.getParent().removeChild(tree);
            }
        }
    }
    Script.ScriptTree = ScriptTree;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map