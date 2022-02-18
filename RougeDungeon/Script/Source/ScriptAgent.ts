namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  export enum Items {
    "Axe",
    "Pickaxe",
    "Sword"
  }
  export enum Types {
    "Tree",
    "Stone"
  }
  export class ScriptAgent extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptAgent);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "CustomComponentScript added to ";
    public item: Items;
    public maxhealth: number = 3;
    public health: number;
    public point: number = 0;
    private actionTarget: ƒ.Node;
    private actionType : Types;
    private swordTrigger : ƒ.ComponentRigidbody;
    private enemy: ƒ.Node;
    constructor() {
      super();
      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      this.health = this.maxhealth;
      this.changeItem(Items.Axe);
      
      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
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
        case ƒ.EVENT.NODE_DESERIALIZED:
          this.swordTrigger = this.node.getChildrenByName("SwordTrigger")[0].getComponent(ƒ.ComponentRigidbody);
          this.swordTrigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event : ƒ.EventPhysics) =>{
            if(_event.cmpRigidbody.node.name == "Enemy"){
              this.enemy = _event.cmpRigidbody.node
            }
          })
          this.swordTrigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event : ƒ.EventPhysics) =>{
            if(_event.cmpRigidbody.node.name == "Enemy"){
              this.enemy = null;
            }
          })
          break;
      }
    }
    public use = (_event: Event): void => {
        if(this.actionTarget != null){
          if (this.item == Items.Axe && this.actionType == Types.Tree) {  
            this.points(1);   
            this.actionTarget.dispatchEvent(new CustomEvent("actionUse"));
          }
          if (this.item == Items.Pickaxe && this.actionType == Types.Stone) {
            this.points(5);
            this.actionTarget.dispatchEvent(new CustomEvent("actionUse"));
          }
        }
        if(this.enemy !=null){
          if (this.item == Items.Sword){
            this.points(10);
            this.enemy.dispatchEvent(new CustomEvent("killEvent"));
          }
        }
    }
    public removelife(): void {
      this.health = this.health - 1;
      Hud.life(this.health);
    }
    public addlife(): void {
      Hud.life(this.maxhealth);
    }
    public points(addpoint : number): void {
      this.point += addpoint;
      Hud.points(this.point);
    }
    public changeItem(i: Items): void {
      if (this.item != i) {
        this.item = i;
        Hud.chooseItems(Items[this.item])
      }
    }
    public action(_actionTarget : ƒ.Node, _actionType : Types){
      this.actionTarget = _actionTarget;
      this.actionType = _actionType;
    }
  }
}
