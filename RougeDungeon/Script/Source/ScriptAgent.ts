namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  export enum items {
    "Axe",
    "Pickaxe",
    "Sword"
  }
  enum types {
    "Tree",
    "Stone"
  }
  export class ScriptAgent extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptAgent);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "CustomComponentScript added to ";
    public item : items;
    private agentRB: ƒ.ComponentRigidbody;
    public maxhealth :number = 3;
    public health : number;
    public point : number;
    constructor() {
      super();
      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      this.health = this.maxhealth;
      this.changeItem(items.Axe);

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {

      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Debug.log(this.message, this.node);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
      }
    }
    public use = (_event: Event): void => {
      let tree: ƒ.Node
      let stone : ƒ.Node;
      let type : types;
      if (this.agentRB.triggerings.length != 0) {
        for (let rb of this.agentRB.triggerings) {
          if (rb.collisionGroup == ƒ.COLLISION_GROUP.GROUP_3) {
            tree = rb.node.getParent();
            type = types.Tree;
          }
          if (rb.collisionGroup == ƒ.COLLISION_GROUP.GROUP_4) {
            stone = rb.node.getParent();
            type = types.Stone;
          }
        }
        if (this.item == items.Axe && type == types.Tree) {
          //Call Trigger from Tree and call the Method in the ScriptTree
          console.log("hit2");
          tree.getComponent(ScriptTree).chopTree();
        }
        
        if (this.item == items.Pickaxe&& type == types.Stone) {
          //Call Trigger from Tree and call the Method in the ScriptTree
          console.log("hit2");
          this.addlife();
          stone.getComponent(ScriptStone).mineStone();
        }
      }

      if (this.item == items.Sword) {
        //Call Trigger from Tree and call the Method in the ScriptTree
        console.log("hit3");
        this.removelife()
        this.points()
      }
    }
    public getRB(): void {
      this.agentRB = this.node.getComponent(ƒ.ComponentRigidbody);
    }
    public removelife() : void {
        this.health = this.health - 1;
        GameState.life(this.health);
    }
    public addlife() : void {
      GameState.life(this.maxhealth);
    }
    public points() : void {
      GameState.points(1);
    }
    public changeItem(i : items) : void{
      if(this.item != i){
        this.item = i;
        GameState.chooseitems(items[this.item])
      }

    }
  }
}
