namespace Script {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    export class GameState extends ƒ.Mutable {
        private static controller: ƒui.Controller;
        private static instance: GameState;
        private static maxLife : number = 3;
        private static point : string;
        private static domHud :HTMLDivElement;

        private constructor() {
            super();
            GameState.domHud = document.querySelector("#HeartsFull");
            GameState.instance = this;
            GameState.controller = new ƒui.Controller(this, GameState.domHud);
            console.log("Hud-Controller", GameState.controller);
        }

        public static get(): GameState {
            return GameState.instance || new GameState();
        }

        public static life(life: number) {
            this.get();
            for(let h = 0; h < this.maxLife; h++){
                if(h < life){
                    GameState.domHud = GameState.controller.domElement.querySelector("#heartFull" + h);
                    GameState.domHud.style.opacity = "100%";
                }
                else{
                    GameState.domHud = GameState.controller.domElement.querySelector("#heartFull" + h);
                    GameState.domHud.style.opacity = "0%";
                }
            }

        }
        public static points(points : number){
            let domPoints: HTMLInputElement = document.querySelector("input[key='Points']")
            if(points.toString().length < 7)
                domPoints.value = ('0000000' + points.toString()).substring(points.toString().length);
            else
                domPoints.value = "9999999";
        }
        protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
    }
}