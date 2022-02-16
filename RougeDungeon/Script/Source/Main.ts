namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let agent: ƒ.Node;
  let agentRB: ƒ.ComponentRigidbody;
  let agentScript : ScriptAgent;

  let ground: ƒ.Node;
  let graph: ƒ.Graph;
  let randomSeed: number;
  let random: ƒ.Random;
  let generator: ƒ.Node;
  let controlls : Controls;
  let canvas: HTMLCanvasElement
  let cameraNode: ƒ.Node = new ƒ.Node("cameraNode");
  let cmpCamera = new ƒ.ComponentCamera();

  interface CamData {
    left : number,
    right : number,
    top :  number,
    bottom: number
  }

  export let camdata: CamData;

  window.addEventListener("load", <any>start);

  async function start(_event: CustomEvent): Promise<void> {
    await ƒ.Project.loadResourcesFromHTML();
    await loadData();
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

    generateCG(ground)
    agentRB = agent.getComponent(ƒ.ComponentRigidbody);
    agentRB.effectRotation = new ƒ.Vector3(0, 0, 0);

    cameraNode.addComponent(cmpCamera);
    cameraNode.addComponent(new ƒ.ComponentTransform());
    graph.addChild(cameraNode);

    canvas = document.querySelector("canvas");
    cmpCamera.projectOrthographic(-6 * window.innerWidth, 6* window.innerWidth, 6* window.innerHeight, -6* window.innerHeight);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    viewport.adjustingCamera = false

    controlls = new Controls(agent, agentRB)

    ƒ.AudioManager.default.listenTo(graph);
    ƒ.AudioManager.default.listenWith(graph.getComponent(ƒ.ComponentAudioListener));
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);
  
  }

  function update(_event: Event): void {
    cmpCamera.projectOrthographic( camdata.left * window.innerWidth, camdata.right * window.innerWidth, camdata.bottom * window.innerHeight, camdata.top * window.innerHeight);
    cameraNode.mtxLocal.translation = new ƒ.Vector3(agent.mtxLocal.translation.x, 0, 0)

    controlls.controlls();

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

  async function loadData(): Promise<void>{
    let rawCamData: Response = await fetch("Script/Source/CameraConfig.json");
    camdata = JSON.parse(await rawCamData.text());
  }

}