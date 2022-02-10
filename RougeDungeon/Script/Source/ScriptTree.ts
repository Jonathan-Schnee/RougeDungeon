namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
  

    export class ScriptTree extends ƒ.ComponentScript {
      // Register the script as component for use in the editor via drag&drop
      public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptTree);
      // Properties may be mutated by users in the editor via the automatically created user interface


      constructor() {
        super();
  
        // Don't start when running in editor
        if (ƒ.Project.mode == ƒ.MODE.EDITOR)
          return;
  
        // Listen to this component being added to or removed from a node
      }

      public chopTree(){
        let tree : ƒ.Node = this.node
        let treemesh = tree.getComponent(ƒ.ComponentMesh);
        let treeRB : ƒ.ComponentRigidbody = tree.getChildrenByName("placeholderRB")[0].getComponent(ƒ.ComponentRigidbody);
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
  }