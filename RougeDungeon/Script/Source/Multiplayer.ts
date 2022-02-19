///<reference path="../../../Fudge/Net/Build/Client/FudgeClient.d.ts"/>
namespace Script {
    import ƒ = FudgeCore;
    import ƒClient = FudgeNet.FudgeClient;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    let client: ƒClient = new ƒClient();
    // keep a list of known clients, updated with information from the server
    let _ownID : string;
    let _notmyID : string;
    let _message : string = "test";
    let _receivedmessage : string;
    export class Multiplayer extends ƒ.Mutable{


        constructor() {
            super()
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            let event = this.addEventListener("sendMessage", this.sendMessage);
        }

        async connectToServer(): Promise<void> {
            let domServer: string = "ws://127.0.0.1:8081"; //wss://rougedungeon.herokuapp.com
            try {
                client.connectToServer(domServer);
                // connect to a server with the given url
                await this.delay(1000);
                // document.forms[0].querySelector("button#login").removeAttribute("disabled");
                _ownID = client.id;
                // install an event listener to be called when a message comes in
                client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, this.receiveMessage);
            } catch (_error) {
                console.log(_error);
                console.log("Make sure, FudgeServer is running and accessable");
            }
        }

        public delay(_milisec: number): Promise<void> {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, _milisec);
            });
        }
        async receiveMessage(_event: any): Promise<void> {
            if (_event instanceof MessageEvent) {
                let message: FudgeNet.Message = JSON.parse(_event.data);
                if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT){
                    _receivedmessage = JSON.stringify(message.content.text);
                    _receivedmessage = _receivedmessage.replace(/['"]+/g, '');
                }

            }
        }

        public send(message : string) {
            _message = message;
            this.dispatchEvent(new CustomEvent("sendMessage"));
        }
        public sendMessage(_event: Event): void {
            let protocol: string = "wss"
            let message: string = _message;
            let ws: boolean = protocol == "wss";
            let receiver: string = _notmyID;
            if(receiver != "")
                // send the message to a specific client (target specified) via RTC (no route specified) or TCP (route = via server)
                client.dispatch({ route: ws ? FudgeNet.ROUTE.VIA_SERVER : undefined, idTarget: receiver, content: { text: message } });

        }
        public getID(){
            return _ownID;
        }
        protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        }
        public setPatnerID(id : string){
            _notmyID = id;
        }
        public getMessage() : string{
            return _receivedmessage
        }
    }
}