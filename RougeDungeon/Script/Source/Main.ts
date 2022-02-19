namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let agent: ƒ.Node;
  let agentRB: ƒ.ComponentRigidbody;

  let ground: ƒ.Node;
  let graph: ƒ.Graph;
  let randomSeed: number;
  let random: ƒ.Random;
  let generator: ƒ.Node;
  let controlls : Controls;
  let canvas: HTMLCanvasElement
  let cameraNode: ƒ.Node = new ƒ.Node("cameraNode");
  let cmpCamera = new ƒ.ComponentCamera();
  let singlePlayer : boolean;
  let client : Multiplayer;

  interface CamData {
    left : number,
    right : number,
    top :  number,
    bottom: number
  }

  export let camdata: CamData;

  interface SpawnData {
    treePercent : number,
    stonePercent : number
  }
  export let spawndata: SpawnData;

  window.addEventListener("load", <any>start);

  async function start(_event: CustomEvent) : Promise<void> {
    await ƒ.Project.loadResourcesFromHTML();
    await loadData();
    let single = document.getElementById("single");
    let client = document.getElementById("multi");
    single.addEventListener("click", function(_event){
      let dialog = document.getElementById("question");
      dialog.hidden = true;
      dialog = document.getElementById("Hud");
      dialog.hidden = false;
      singlePlayer = true;
      init();
    });
   client.addEventListener("click", function(_event){
      let dialog = document.getElementById("question");
      dialog.hidden = true;
      singlePlayer = false;
      multiplayer();
    });  

  }
  async function multiplayer(){
    client = new Multiplayer();
    await client.connectToServer();
    console.log(client.getID());
    let dialog = document.getElementById("question");
    dialog.hidden = true;
    dialog = document.getElementById("connecting");
    dialog.hidden = false;
    dialog.querySelector("h1").textContent = "Your ID: " + client.getID();
    let input : HTMLInputElement = document.querySelector("input[key='ID']");
    dialog.addEventListener("keydown", function(_event){
      if(_event.key == ƒ.KEYBOARD_CODE.ENTER){
        client.setPatnerID(input.value)
        input.disabled = true
        client.send("Eingegeben")
      }
    })
    let button = document.getElementById("play")
    button.addEventListener("click", function(event){
      if(input.disabled && client.getMessage() == "Eingegeben"){
        dialog = document.getElementById("connecting");
        dialog.hidden = true;
        dialog = document.getElementById("FriendPoints");
        dialog.hidden = false;
        dialog = document.getElementById("Hud");
        dialog.hidden = false;
        init();
      }
    })
  }

  async function init(): Promise<void> {
    graph = <ƒ.Graph>ƒ.Project.resources["Graph|2021-12-24T09:09:33.313Z|93679"];
    Hud.showMain()
    randomSeed = 70;
    random = new ƒ.Random(randomSeed);

    agent = graph.getChildrenByName("Agent")[0];

    ground = graph.getChildrenByName("Ground")[0];
    generator = graph.getChildrenByName("Generator")[0];
    generator.getComponent(ScriptGenerator).addTree(random);
    generator.getComponent(ScriptGenerator).addStone(random);

    generateCG(ground, ƒ.COLLISION_GROUP.GROUP_2);
    agentRB = agent.getComponent(ƒ.ComponentRigidbody);
    agentRB.effectRotation = new ƒ.Vector3(0, 0, 0);

    cameraNode.addComponent(cmpCamera);
    cameraNode.addComponent(new ƒ.ComponentTransform());
    graph.addChild(cameraNode);

    canvas = document.querySelector("canvas");
    cmpCamera.projectOrthographic( camdata.left * window.innerWidth, camdata.right * window.innerWidth, camdata.bottom * window.innerHeight, camdata.top * window.innerHeight);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    viewport.physicsDebugMode = ƒ.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    viewport.adjustingCamera = false
    //viewport.camera.mtxPivot.rotateY(180);
    // viewport.camera.mtxPivot.rotateX(20);
    // viewport.camera.mtxPivot.translateZ(-30);
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
    
    receiveData();

    viewport.draw();
    ƒ.AudioManager.default.update();
    ƒ.Physics.world.simulate();  // if physics is included and used
  }

  function generateCG(node: ƒ.Node, collisionGroup : ƒ.COLLISION_GROUP) {
    for (let n of node.getChildren()) {
      let nodeRB = n.getComponent(ƒ.ComponentRigidbody)
      nodeRB.collisionGroup = collisionGroup;
    }
  }

  async function loadData(): Promise<void>{
    let rawCamData: Response = await fetch("Script/Source/CameraConfig.json");
    camdata = JSON.parse(await rawCamData.text());

    let rawSpawnData: Response = await fetch("Script/Source/SpawnPercentage.json");
    spawndata = JSON.parse(await rawSpawnData.text());
  }
  export function sendData(message : string){
    client.send(message);
  }
  function receiveData(){
    let m = client.getMessage();
    if(/^\d+$/.test(m)){
      Hud.fiendpoints(Number(m))
    }
  }
}