namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  

    export class ScriptTree extends ƒ.ComponentScript {
      // Register the script as component for use in the editor via drag&drop
      public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptTree);
      private cmpBody : ƒ.ComponentRigidbody;
      // Properties may be mutated by users in the editor via the automatically created user interface


      constructor() {
        super();
        // Don't start when running in editor
        if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;
        // Listen to this component being added to or removed from a node
        this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
      }

      public action(){
        let tree : ƒ.Node = this.node
        let treemesh = tree.getComponent(ƒ.ComponentMesh);
        let treeRB : ƒ.ComponentRigidbody = tree.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
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
      private hndEvent = (_event :Event) : void => {
        switch(_event.type){
          case ƒ.EVENT.NODE_DESERIALIZED:
            this.node.addEventListener("addEvents", this.hndEvent);
            this.node.addEventListener("actionUse", this.hndEvent);
            break;
          case "addEvents":
            this.cmpBody = this.node.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
            console.log("1");
            this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event : ƒ.EventPhysics) =>{
              if(_event.cmpRigidbody.node.name == "Agent")
              _event.cmpRigidbody.node.getComponent(ScriptAgent).action(this.node, Types.Tree);
            });
            this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event : ƒ.EventPhysics) =>{
              if(_event.cmpRigidbody.node.name == "Agent")
              _event.cmpRigidbody.node.getComponent(ScriptAgent).action(null, null);
            });
            break;
          case "actionUse":
            this.action();
        }
      }
    }
  }