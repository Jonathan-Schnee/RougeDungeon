namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    enum JOB {
        IDLE, ATTACK, DIE, ROTATE
    }

    export class EnemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(EnemyStateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = EnemyStateMachine.get();
        private cmpBody: ƒ.ComponentRigidbody;

        constructor() {
            super();
            this.instructions = EnemyStateMachine.instructions; // setup instructions with the static set

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = EnemyStateMachine.transitDefault;
            setup.actDefault = EnemyStateMachine.actDefault;
            setup.setAction(JOB.IDLE, <ƒ.General>this.actIdle);
            setup.setAction(JOB.ROTATE, <ƒ.General>this.actRotate);
            setup.setAction(JOB.ATTACK, <ƒ.General>this.actAttack);
            setup.setAction(JOB.DIE, <ƒ.General>this.actDie);
            return setup;
        }

        private static transitDefault(_machine: EnemyStateMachine): void {
            //console.log("Transit to", _machine.stateNext);
        }

        private static async actDefault(_machine: EnemyStateMachine): Promise<void> {
            //console.log(JOB[_machine.stateCurrent]);
        }

        private static async actIdle(_machine: EnemyStateMachine): Promise<void> {
            _machine.node.mtxLocal.translateX(1 * ƒ.Loop.timeFrameReal / 1000);
            EnemyStateMachine.actDefault(_machine);
        }

        private static async actRotate(_machine: EnemyStateMachine): Promise<void> {
            _machine.node.mtxLocal.rotateY(180);
            _machine.node.getChildren().forEach(node => {node.mtxLocal.translateZ(-2 * Math.cos(_machine.node.mtxLocal.rotation.y * Math.PI  / 180))});
        
        }

        private static async actAttack(_machine: EnemyStateMachine): Promise<void> {
            _machine.node.mtxLocal.translateX(3 * ƒ.Loop.timeFrameReal / 1000);
        }

        private static async actDie(_machine: EnemyStateMachine): Promise<void> {
            await _machine.node.getChildren().forEach(node => node.removeComponent(node.getComponent(ƒ.ComponentRigidbody)));
            _machine.node.removeComponent(_machine.cmpBody);
            _machine.hndEvent("removeEvent");
            _machine.node.getParent().removeChild(_machine.node);
            _machine.node.removeComponent(_machine.node.getComponent(EnemyStateMachine));
        }


        // Activate the functions of this component as response to events
        private hndEvent = (_event: any): void => {
            let seeTrigger: ƒ.ComponentRigidbody;
            let dmgTrigger : ƒ.ComponentRigidbody;
            let kill;
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case ƒ.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);

                    break;
                case ƒ.EVENT.NODE_DESERIALIZED:
                    seeTrigger = this.node.getChildrenByName("SeeTrigger")[0].getComponent(ƒ.ComponentRigidbody);
                    dmgTrigger = this.node.getChildrenByName("DamageTrigger")[0].getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, (_event: ƒ.EventPhysics) => {
                        if (_event.cmpRigidbody.node.name == "Cart")
                            this.transit(JOB.DIE);
                    });
                    seeTrigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                        for(let t of seeTrigger.triggerings){
                            if(t.node.name == "Agent")
                                this.transit(JOB.ATTACK);
                        }
                    
                    });
                    dmgTrigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                        if (_event.cmpRigidbody.node.name == "Agent" && this.stateCurrent != JOB.DIE)
                                _event.cmpRigidbody.node.getComponent(ScriptAgent).removelife();
                        if(_event.cmpRigidbody.collisionGroup == ƒ.COLLISION_GROUP.GROUP_2){
                            this.transit(JOB.ROTATE);
                        }
                    });
                    dmgTrigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event: ƒ.EventPhysics) => {
                        if(_event.cmpRigidbody.collisionGroup == ƒ.COLLISION_GROUP.GROUP_2){
                            this.transit(JOB.IDLE);
                        }
                    });
                    let kill = this.node.addEventListener("killEvent", (_event: ƒ.EventPhysics) =>{
                        this.transit(JOB.DIE);
                    });
                    break;
                case "removeEvents":
                    this.cmpBody.removeEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER,(_event: ƒ.EventPhysics)=>{});
                    seeTrigger.removeEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER,(_event: ƒ.EventPhysics)=>{});
                    dmgTrigger.removeEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER,(_event: ƒ.EventPhysics)=>{});
                    this.removeEventListener("killEvent", (_event: ƒ.EventPhysics) =>{});
                    break;  
            }
        }

        private update = (_event: Event): void => {
            this.act();
        }
    }
}