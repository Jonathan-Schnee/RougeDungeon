namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  

    export class ScriptStone extends ƒ.ComponentScript {
      // Register the script as component for use in the editor via drag&drop
      public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptStone);
      // Properties may be mutated by users in the editor via the automatically created user interface
      public percentage: number = 3;


      constructor() {
        super();
  
        // Don't start when running in editor
        if (ƒ.Project.mode == ƒ.MODE.EDITOR)
          return;
  
        // Listen to this component being added to or removed from a node
      }
      public mineStone() : void {
        let stone : ƒ.Node = this.node
        let stonemesh = stone.getComponent(ƒ.ComponentMesh);
        let stoneRB : ƒ.ComponentRigidbody = stone.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
        let stoneWidth = stonemesh.mtxPivot.scaling.clone;
        stonemesh.mtxPivot.scaling = new ƒ.Vector3(stoneWidth.x - 0.2, stoneWidth.y, stoneWidth.z);
        if (stonemesh.mtxPivot.scaling.x < 1) {
          stoneRB.node.removeComponent(stoneRB);
          stone.getParent().removeChild(stone);
        }
      }
    }
  }