declare namespace Script {
    import ƒ = FudgeCore;
    class Controls {
        private isGrounded;
        private agent;
        private agentRB;
        private agentdampT;
        private agentScript;
        private agentMesh;
        private swordtrigger;
        constructor(agent: ƒ.Node, agentRB: ƒ.ComponentRigidbody);
        controlls(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        IDLE = 0,
        ATTACK = 1,
        DIE = 2,
        ROTATE = 3
    }
    export class EnemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private cmpBody;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actDefault;
        private static actIdle;
        private static actRotate;
        private static actAttack;
        private static actDie;
        private hndEvent;
        private update;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Hud extends ƒ.Mutable {
        private static controller;
        private static instance;
        private static maxLife;
        private static domHud;
        private constructor();
        static get(): Hud;
        static life(life: number): void;
        static points(points: number): void;
        static chooseItems(activeItem: string): void;
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
declare namespace Script {
    interface CamData {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }
    export let camdata: CamData;
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    enum Items {
        "Axe" = 0,
        "Pickaxe" = 1,
        "Sword" = 2
    }
    enum Types {
        "Tree" = 0,
        "Stone" = 1
    }
    class ScriptAgent extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        item: Items;
        maxhealth: number;
        health: number;
        point: number;
        private actionTarget;
        private actionType;
        private swordTrigger;
        private enemy;
        constructor();
        hndEvent: (_event: Event) => void;
        use: (_event: Event) => void;
        removelife(): void;
        addlife(): void;
        points(): void;
        changeItem(i: Items): void;
        action(_actionTarget: ƒ.Node, _actionType: Types): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ScriptGenerator extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private treePercentage;
        private stonePercentage;
        constructor();
        addTree(random: ƒ.Random): void;
        addStone(random: ƒ.Random): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ScriptStone extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        percentage: number;
        private cmpBody;
        constructor();
        action(): void;
        private hndEvent;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ScriptTree extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private cmpBody;
        constructor();
        action(): void;
        private hndEvent;
    }
}
