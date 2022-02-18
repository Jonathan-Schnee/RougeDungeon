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
        private agentMesh : ƒ.ComponentMesh;
        private swordtrigger : ƒ.Node;

        constructor(agent : ƒ.Node, agentRB : ƒ.ComponentRigidbody){
            this.agent = agent;
            this.agentScript = this.agent.getComponent(ScriptAgent);
            this.agentRB = agentRB;
            this.agentdampT = agentRB.dampTranslation;
            this.agentMesh = this.agent.getComponent(ƒ.ComponentMesh);
            this.swordtrigger = this.agent.getChildrenByName("SwordTrigger")[0]

            window.addEventListener("click", this.agentScript.use);
        }

        public controlls(){
            this.isGrounded = false
            let direction = ƒ.Vector3.Y(-1)
            let agentTrans = this.agent.mtxWorld.translation.clone;
            agentTrans.x += (this.agentMesh.mtxPivot.scaling.x / 2 - 0.02) * - Math.cos(this.agentMesh.mtxPivot.rotation.y * Math.PI  / 180);
            let ray = ƒ.Physics.raycast(agentTrans, direction, 0.5, true, ƒ.COLLISION_GROUP.GROUP_2)
            if (ray.hit) {
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
              this.agentScript.changeItem(Items.Axe);
            }
            if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.TWO])){
              this.agentScript.changeItem(Items.Pickaxe);
            }
            if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.THREE])){
              this.agentScript.changeItem(Items.Sword);
            }
            if(ctrForward.getOutput() < 0){
              this.agentMesh.mtxPivot.rotation.y = 180;
              
              this.swordtrigger.mtxLocal.translation = new ƒ.Vector3(- (this.agentMesh.mtxPivot.scaling.x / 2 + this.swordtrigger.mtxLocal.scaling.x /2),0,1);
              
            }
            if(ctrForward.getOutput()>0){
              this.agentMesh.mtxPivot.rotation.y = 0;
              this.swordtrigger.mtxLocal.translation = new ƒ.Vector3((this.agentMesh.mtxPivot.scaling.x / 2 + this.swordtrigger.mtxLocal.scaling.x /2),0,1);
            }
        }
    }
}