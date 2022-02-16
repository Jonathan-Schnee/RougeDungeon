declare namespace Script {
    import ƒ = FudgeCore;
    class Controls {
        private isGrounded;
        private agent;
        private agentRB;
        private agentdampT;
        private agentScript;
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
    import ƒ = FudgeCore;
    class GameState extends ƒ.Mutable {
        private static controller;
        private static instance;
        private static maxLife;
        private static domHud;
        private constructor();
        static get(): GameState;
        static life(life: number): void;
        static points(points: number): void;
        static chooseitems(activeItem: string): void;
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
    enum items {
        "Axe" = 0,
        "Pickaxe" = 1,
        "Sword" = 2
    }
    class ScriptAgent extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        item: items;
        private agentRB;
        maxhealth: number;
        health: number;
        point: number;
        constructor();
        hndEvent: (_event: Event) => void;
        use: (_event: Event) => void;
        getRB(): void;
        removelife(): void;
        addlife(): void;
        points(): void;
        changeItem(i: items): void;
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
        constructor();
        mineStone(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ScriptTree extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        chopTree(): void;
    }
}
