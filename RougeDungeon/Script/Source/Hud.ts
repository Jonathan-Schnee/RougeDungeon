namespace Script {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    export class Hud extends ƒ.Mutable {
        private static controller: ƒui.Controller;
        private static instance: Hud;
        private static maxLife : number = 3;
        private static domHud :HTMLDivElement;

        private constructor() {
            super();
            Hud.domHud = document.querySelector("#HeartsFull");
            Hud.instance = this;
            Hud.controller = new ƒui.Controller(this, Hud.domHud);
            console.log("Hud-Controller", Hud.controller);
        }

        public static get(): Hud {
            return Hud.instance || new Hud();
        }

        public static life(life: number) {
            this.get();
            for(let h = 0; h < this.maxLife; h++){
                if(h < life){
                    Hud.domHud = Hud.controller.domElement.querySelector("#heartFull" + h);
                    Hud.domHud.style.opacity = "100%";
                }
                else{
                    Hud.domHud = Hud.controller.domElement.querySelector("#heartFull" + h);
                    Hud.domHud.style.opacity = "0%";
                }
            }

        }
        public static points(points : number) : void{
            this.get();
            let domPoints: HTMLInputElement = document.querySelector("input[key='Points']");
            if(points.toString().length < 7)
                domPoints.value = ('0000000' + points.toString()).substring(points.toString().length);
            else
                domPoints.value = "9999999";
        }

        public static chooseItems(activeItem : string){
            this.get();
            let domItems : HTMLDivElement = document.querySelector("#Items");
            let i : number = 0;
            for(let item of domItems.children){
                if(activeItem == item.id){
                    item.id = "active";
                }
                else{
                    item.id = Items[i]
                }
                i++;
            }
        }

        public static showMain(){         
            let dialog = document.querySelector("dialog");
        }

        protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
    }
}