namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class ScriptGenerator extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ScriptGenerator);
    // Properties may be mutated by users in the editor via the automatically created user interface
    private treePercentage: number;
    private stonePercentage: number;
    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;
      // Listen to this component being added to or removed from a node
    }
    public addTree(random: ƒ.Random): void {      
      this.treePercentage = spawndata.treePercent;
      let treeTexture : ƒ.Material = <ƒ.Material>FudgeCore.Project.resources["Material|2022-02-17T16:32:32.889Z|93547"];
      let trees: ƒ.Node = this.node.getChildrenByName("Trees")[0];
      for (let tree of trees.getChildren()) {
        let scale = tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaling;
        let num = random.getRangeFloored(0, 101);
        if (num < this.treePercentage) {
          let height = random.getRangeFloored(2, scale.y + 1)
          tree.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(height / scale.y);
          tree.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(255,255,255,255)
          tree.getComponent(ƒ.ComponentMaterial).material = treeTexture;
          tree.getComponent(ƒ.ComponentMaterial).mtxPivot.scaleY(height);
          tree.mtxLocal.translateY((height - scale.y) / 2);
          let placeholderRB: ƒ.Node = new ƒ.Node("placeholderRB");
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
          tree.dispatchEvent(new CustomEvent("addEvents"))
        }
        else {
          trees.removeChild(tree);
        }
      }
    }
    public addStone(random: ƒ.Random): void {
      this.stonePercentage = spawndata.stonePercent;
      let stones: ƒ.Node = this.node.getChildrenByName("Stones")[0];
      for (let stone of stones.getChildren()) {
        let num = random.getRangeFloored(0, 101);
        if (num < this.stonePercentage) {
          stone.getComponent(ƒ.ComponentMaterial).clrPrimary.setBytesRGBA(211, 211, 211, 255)
          let placeholderRB: ƒ.Node = new ƒ.Node("placeholderRB");
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
          stone.dispatchEvent(new CustomEvent("addEvents"))
        }
        else {
          stones.removeChild(stone);
        }
      }
    }
  }
}