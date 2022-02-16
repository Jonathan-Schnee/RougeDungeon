namespace Script{
    import ƒ = FudgeCore;
    let ctrForward : ƒ.Control = new ƒ.Control("Forward", 250, ƒ.CONTROL_TYPE.PROPORTIONAL);
    ctrForward.setDelay(10);
    export class Controls{

        private isGrounded: boolean;
        private agent : ƒ.Node;
        private agentRB : ƒ.ComponentRigidbody;
        private agentdampT : number;
        private agentScript : ScriptAgent; 

        constructor(agent : ƒ.Node, agentRB : ƒ.ComponentRigidbody){
            this.agent = agent;
            this.agentScript = this.agent.getComponent(ScriptAgent);
            this.agentRB = agentRB;
            this.agentdampT = agentRB.dampTranslation
        }

        public controlls(){
            this.isGrounded = false
            let direction = ƒ.Vector3.Y(-1)
            let agentTransL = this.agent.mtxWorld.translation.clone;
            agentTransL.x -= this.agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
            let rayL = ƒ.Physics.raycast(agentTransL, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2)
            let agentTransR = this.agent.mtxWorld.translation.clone;
            agentTransR.x += this.agent.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 - 0.02;
            let rayR = ƒ.Physics.raycast(agentTransR, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2)
            if (rayL.hit || rayR.hit) {
              this.agentRB.dampTranslation = this.agentdampT;
              this.isGrounded = true
            }
        
            let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT], [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]);
            ctrForward.setInput(forward);
            this.agentRB.applyForce(ƒ.Vector3.X(ctrForward.getOutput()));
        
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && this.isGrounded) {
              this.agentRB.setVelocity(new ƒ.Vector3(this.agentRB.getVelocity().x, 11, this.agentRB.getVelocity().z))
            }
        
            if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ONE])){
              this.agentScript.changeItem(items.Axe);
            }
            if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.TWO])){
              this.agentScript.changeItem(items.Pickaxe);
            }
            if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.THREE])){
              this.agentScript.changeItem(items.Sword);
            }
        }
    }
}