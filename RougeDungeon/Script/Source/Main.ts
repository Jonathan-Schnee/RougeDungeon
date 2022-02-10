namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;

  let ctrForward: ƒ.Control = new ƒ.Control("Forward", 250, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrForward.setDelay(10);

  let agent: ƒ.Node;
  let agentRB: ƒ.ComponentRigidbody;
  let agentScript : ScriptAgent;
  let isGrounded: boolean;
  let ground: ƒ.Node;
  let agentdampT: number;
  let graph: ƒ.Graph;
  let treeList: ƒ.Node;
  let stoneList: ƒ.Node;
  let randomSeed: number;
  let random: ƒ.Random;
  let generator: ƒ.Node;

  let canvas: HTMLCanvasElement

  let cameraNode: ƒ.Node = new ƒ.Node("cameraNode");
  let cmpCamera = new ƒ.ComponentCamera();

  window.addEventListener("load", <any>start);

  async function start(_event: CustomEvent): Promise<void> {
    await ƒ.Project.loadResourcesFromHTML();
    graph = <ƒ.Graph>ƒ.Project.resources["Graph|2021-12-24T09:09:33.313Z|93679"];

    randomSeed = 70;
    random = new ƒ.Random(randomSeed);

    agent = graph.getChildrenByName("Agent")[0];
    agent.getComponent(ScriptAgent).getRB();
    agentScript = agent.getComponent(ScriptAgent);
    window.addEventListener("click", agentScript.use);


    ground = graph.getChildrenByName("Ground")[0];

    generator = graph.getChildrenByName("Generator")[0];
    generator.getComponent(ScriptGenerator).addTree(random);
    generator.getComponent(ScriptGenerator).addStone(random);


    treeList = generator.getChildrenByName("Trees")[0];

    stoneList = generator.getChildrenByName("Stones")[0];

    generateCG(ground)
    agentRB = agent.getComponent(ƒ.ComponentRigidbody);
    agentRB.effectRotation = new ƒ.Vector3(0, 0, 0);
    agentdampT = agentRB.dampTranslation

    cameraNode.addComponent(cmpCamera);
    cameraNode.addComponent(new ƒ.ComponentTransform());
    graph.addChild(cameraNode);

    canvas = document.querySelector("canvas");
    cmpCamera.projectOrthographic(-6 * window.innerWidth/1000, 6* window.innerWidth/1000, 6* window.innerHeight/1000, -6* window.innerHeight/1000);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    viewport.adjustingCamera = false
    ƒ.AudioManager.default.listenTo(graph);
    ƒ.AudioManager.default.listenWith(graph.getComponent(ƒ.ComponentAudioListener));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    console.log(window.innerWidth/1000 + " " + window.innerHeight/1000)
    cmpCamera.projectOrthographic(-6 * window.innerWidth/1000, 6* window.innerWidth/1000, 6* window.innerHeight/1000, -6* window.innerHeight/1000);
    cameraNode.mtxLocal.translation = new ƒ.Vector3(agent.mtxLocal.translation.x, 0, 0)
    isGrounded = false
    let direction = ƒ.Vector3.Y(-1)
    let agentTransL = agent.mtxWorld.translation.clone;
    agentTransL.x -= agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
    let rayL = ƒ.Physics.raycast(agentTransL, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2)
    let agentTransR = agent.mtxWorld.translation.clone;
    agentTransR.x += agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
    let rayR = ƒ.Physics.raycast(agentTransR, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2)
    if (rayL.hit || rayR.hit) {
      agentRB.dampTranslation = agentdampT;
      isGrounded = true
    }

    let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT], [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]);
    ctrForward.setInput(forward);
    agentRB.applyForce(ƒ.Vector3.X(ctrForward.getOutput()));

    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && isGrounded) {
      agentRB.setVelocity(new ƒ.Vector3(agentRB.getVelocity().x, 11, agentRB.getVelocity().z))
    }

    if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ONE]) && agentScript.item != items.Axe){
      agentScript.item = items.Axe;
      console.log("1");
    }
    if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.TWO]) && agentScript.item != items.Pickaxe){
      agentScript.item = items.Pickaxe;
      console.log("2");
    }
    if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.THREE]) && agentScript.item != items.Sword){
      agentScript.item = items.Sword;
      console.log("3");
    }

    ƒ.Physics.world.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function generateCG(ground: ƒ.Node) {
    for (let g of ground.getChildren()) {
      let groundRB = g.getComponent(ƒ.ComponentRigidbody)
      groundRB.collisionGroup = ƒ.COLLISION_GROUP.GROUP_2
    }
  }
}