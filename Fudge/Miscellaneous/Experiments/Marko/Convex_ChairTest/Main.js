"use strict";
var FudgeExperiments_Marko_ConvexColliderThroughWelding;
(function (FudgeExperiments_Marko_ConvexColliderThroughWelding) {
    var f = FudgeCore;
    // In a Test there could be about 100 Chairs and still maintain 15+ FPS, resulting in 600 RB's and 500 Joints calculated per Frame.
    //Fudge Basic Variables
    window.addEventListener("load", init);
    const app = document.querySelector("canvas"); // The html element where the scene is drawn to
    let viewPort; // The scene visualization
    let hierarchy; // You're object scene tree
    let fps;
    const times = [];
    let fpsDisplay = document.querySelector("h2#FPS");
    //Physical Objects
    let bodies = new Array(); // Array of all physical objects in the scene to have a quick reference
    let noChairs = 0;
    //Setting Variables
    //Function to initialize the Fudge Scene with a camera, light, viewport and PHYSCIAL Objects
    function init(_event) {
        hierarchy = new f.Node("Scene"); //create the root Node where every object is parented to. Should never be changed
        //PHYSICS - Basic Plane and Cube
        //Creating a physically static ground plane for our physics playground. A simple scaled cube but with physics type set to static
        bodies[0] = createCompleteNode("Ground", new f.Material("Ground", f.ShaderFlat, new f.CoatColored(new f.Color(0.2, 0.2, 0.2, 1))), new f.MeshCube(), 0, f.BODY_TYPE.STATIC);
        bodies[0].mtxLocal.scale(new f.Vector3(14, 0.3, 14)); //Scale the body with it's standard ComponentTransform
        bodies[0].mtxLocal.rotateX(3, true); //Give it a slight rotation so the physical objects are sliding, always from left when it's after a scaling
        hierarchy.appendChild(bodies[0]); //Add the node to the scene by adding it to the scene-root
        spawnChair();
        //Standard Fudge Scene Initialization - Creating a directional light, a camera and initialize the viewport
        let cmpLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new f.Vector3(0.5, -1, -0.8)); //Set light direction
        hierarchy.addComponent(cmpLight);
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.clrBackground = f.Color.CSS("GREY");
        cmpCamera.mtxPivot.translate(new f.Vector3(2, 3.5, 17)); //Move camera far back so the whole scene is visible
        cmpCamera.mtxPivot.lookAt(f.Vector3.ZERO()); //Set the camera matrix so that it looks at the center of the scene
        viewPort = new f.Viewport(); //Creating a viewport that is rendered onto the html canvas element
        viewPort.initialize("Viewport", hierarchy, cmpCamera, app); //initialize the viewport with the root node, camera and canvas
        //PHYSICS - Start using physics by telling the physics the scene root object. Physics will recalculate every transform and initialize
        f.Physics.adjustTransforms(hierarchy);
        f.Physics.settings.debugDraw = true;
        app.addEventListener("mousedown", () => { spawnChair(); });
        //Important start the game loop after starting physics, so physics can use the current transform before it's first iteration
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update); //Tell the game loop to call the update function on each frame
        f.Loop.start(); //Stard the game loop
    }
    //Function to animate/update the Fudge scene, commonly known as gameloop
    function update() {
        f.Physics.world.simulate(); //PHYSICS - Simulate physical changes each frame, parameter to set time between frames
        measureFPS();
        viewPort.draw(); // Draw the current Fudge Scene to the canvas
    }
    // Function to quickly create a node with multiple needed FudgeComponents, including a physics component
    function createCompleteNode(_name, _material, _mesh, _mass, _physicsType, _group = f.COLLISION_GROUP.DEFAULT, _colType = f.COLLIDER_TYPE.CUBE) {
        //Standard Fudge Node Creation
        let node = new f.Node(_name); //Creating the node
        let cmpMesh = new f.ComponentMesh(_mesh); //Creating a mesh for the node
        let cmpMaterial = new f.ComponentMaterial(_material); //Creating a material for the node
        let cmpTransform = new f.ComponentTransform(); //Transform holding position/rotation/scaling of the node
        let cmpRigidbody = new f.ComponentRigidbody(_mass, _physicsType, _colType, _group); //Adding a physical body component to use physics
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        node.addComponent(cmpRigidbody); // <-- best practice to add physics component last
        return node;
    }
    function spawnChair() {
        let rngHeight = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        let spawnHeight = rngHeight(8, 20);
        noChairs++;
        //Creating a chair, base + back + 4 legs
        let base = createCompleteNode("Base", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        base.mtxLocal.translate(new f.Vector3(0, 3.5 + spawnHeight, 0));
        base.mtxLocal.scale(new f.Vector3(1, 0.2, 1));
        hierarchy.appendChild(base);
        let back = createCompleteNode("Back", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC);
        back.mtxLocal.translate(new f.Vector3(0.4, 4 + spawnHeight, 0));
        back.mtxLocal.scale(new f.Vector3(0.2, 1, 1));
        hierarchy.appendChild(back);
        let weldingJoint = new f.ComponentJointWelding(base.getComponent(f.ComponentRigidbody), back.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        let leg = createCompleteNode("Leg_BL", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(0.4, 3 + spawnHeight, 0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        hierarchy.appendChild(leg);
        weldingJoint = new f.ComponentJointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_BR", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(0.4, 3 + spawnHeight, -0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        hierarchy.appendChild(leg);
        weldingJoint = new f.ComponentJointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_FR", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(-0.4, 3 + spawnHeight, -0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        hierarchy.appendChild(leg);
        weldingJoint = new f.ComponentJointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        leg = createCompleteNode("Leg_FR", new f.Material("Cube", f.ShaderFlat, new f.CoatColored(new f.Color(0.75, 0.8, 0.75, 1))), new f.MeshCube(), 1, f.BODY_TYPE.DYNAMIC, f.COLLISION_GROUP.GROUP_2);
        leg.mtxLocal.translate(new f.Vector3(-0.4, 3 + spawnHeight, 0.4));
        leg.mtxLocal.scale(new f.Vector3(0.2, 0.8, 0.2));
        hierarchy.appendChild(leg);
        weldingJoint = new f.ComponentJointWelding(base.getComponent(f.ComponentRigidbody), leg.getComponent(f.ComponentRigidbody));
        back.addComponent(weldingJoint);
        f.Physics.adjustTransforms(hierarchy); // Important! You need to at least adjust Transforms for the parts of the chair
    }
    function measureFPS() {
        window.requestAnimationFrame(() => {
            const now = performance.now();
            while (times.length > 0 && times[0] <= now - 1000) {
                times.shift();
            }
            times.push(now);
            fps = times.length;
            fpsDisplay.textContent = `FPS: ${fps.toString()} / Chairs: ${noChairs} / Bodies: ${f.Physics.world.getBodyList().length}`;
        });
    }
})(FudgeExperiments_Marko_ConvexColliderThroughWelding || (FudgeExperiments_Marko_ConvexColliderThroughWelding = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQVUsbURBQW1ELENBd0o1RDtBQXhKRCxXQUFVLG1EQUFtRDtJQUN6RCxJQUFPLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFckIsbUlBQW1JO0lBRW5JLHVCQUF1QjtJQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sR0FBRyxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsK0NBQStDO0lBQ2hILElBQUksUUFBb0IsQ0FBQyxDQUFDLDBCQUEwQjtJQUNwRCxJQUFJLFNBQWlCLENBQUMsQ0FBQywyQkFBMkI7SUFDbEQsSUFBSSxHQUFXLENBQUM7SUFDaEIsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQzNCLElBQUksVUFBVSxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRy9ELGtCQUFrQjtJQUNsQixJQUFJLE1BQU0sR0FBYSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsdUVBQXVFO0lBQzNHLElBQUksUUFBUSxHQUFXLENBQUMsQ0FBQztJQUV6QixtQkFBbUI7SUFJbkIsNEZBQTRGO0lBQzVGLFNBQVMsSUFBSSxDQUFDLE1BQWE7UUFFdkIsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlGQUFpRjtRQUVsSCxnQ0FBZ0M7UUFDaEMsZ0lBQWdJO1FBQ2hJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFF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SUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0ssSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksWUFBWSxHQUE0QixJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUMxSixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWhDLElBQUksR0FBRyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdk0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFD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QUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtZQUM5QixNQUFNLEdBQUcsR0FBVyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdEMsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtnQkFDL0MsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2pCO1lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUNuQixVQUFVLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxjQUFjLFFBQVEsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUM3SCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFHTCxDQUFDLEVBeEpTLG1EQUFtRCxLQUFuRCxtREFBbUQsUUF3SjVEIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEZ1ZGdlRXhwZXJpbWVudHNfTWFya29fQ29udmV4Q29sbGlkZXJUaHJvdWdoV2VsZGluZyB7XG4gICAgaW1wb3J0IGYgPSBGdWRnZUNvcmU7XG5cbiAgICAvLyBJbiBhIFRlc3QgdGhlcmUgY291bGQgYmUgYWJvdXQgMTAwIENoYWlycyBhbmQgc3RpbGwgbWFpbnRhaW4gMTUrIEZQUywgcmVzdWx0aW5nIGluIDYwMCBSQidzIGFuZCA1MDAgSm9pbnRzIGNhbGN1bGF0ZWQgcGVyIEZyYW1lLlxuXG4gICAgLy9GdWRnZSBCYXNpYyBWYXJpYWJsZXNcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgaW5pdCk7XG4gICAgY29uc3QgYXBwOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJjYW52YXNcIik7IC8vIFRoZSBodG1sIGVsZW1lbnQgd2hlcmUgdGhlIHNjZW5lIGlzIGRyYXduIHRvXG4gICAgbGV0IHZpZXdQb3J0OiBmLlZpZXdwb3J0OyAvLyBUaGUgc2NlbmUgdmlzdWFsaXphdGlvblxuICAgIGxldCBoaWVyYXJjaHk6IGYuTm9kZTsgLy8gWW91J3JlIG9iamVjdCBzY2VuZSB0cmVlXG4gICAgbGV0IGZwczogbnVtYmVyO1xuICAgIGNvbnN0IHRpbWVzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBmcHNEaXNwbGF5OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJoMiNGUFNcIik7XG5cblxuICAgIC8vUGh5c2ljYWwgT2JqZWN0c1xuICAgIGxldCBib2RpZXM6IGYuTm9kZVtdID0gbmV3IEFycmF5KCk7IC8vIEFycmF5IG9mIGFsbCBwaHlzaWNhbCBvYmplY3RzIGluIHRoZSBzY2VuZSB0byBoYXZlIGEgcXVpY2sgcmVmZXJlbmNlXG4gICAgbGV0IG5vQ2hhaXJzOiBudW1iZXIgPSAwO1xuXG4gICAgLy9TZXR0aW5nIFZhcmlhYmxlc1xuXG5cblxuICAgIC8vRnVuY3Rpb24gdG8gaW5pdGlhbGl6ZSB0aGUgRnVkZ2UgU2NlbmUgd2l0aCBhIGNhbWVyYSwgbGlnaHQsIHZpZXdwb3J0IGFuZCBQSFlTQ0lBTCBPYmplY3RzXG4gICAgZnVuY3Rpb24gaW5pdChfZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG5cbiAgICAgICAgaGllcmFyY2h5ID0gbmV3IGYuTm9kZShcIlNjZW5lXCIpOyAvL2NyZWF0ZSB0aGUgcm9vdCBOb2RlIHdoZXJlIGV2ZXJ5IG9iamVjdCBpcyBwYXJlbnRlZCB0by4gU2hvdWxkIG5ldmVyIGJlIGNoYW5nZWRcblxuICAgICAgICAvL1BIWVNJQ1MgLSBCYXNpYyBQbGFuZSBhbmQgQ3ViZVxuICAgICAgICAvL0NyZWF0aW5nIGEgcGh5c2ljYWxseSBzdGF0aWMgZ3JvdW5kIHBsYW5lIGZvciBvdXIgcGh5c2ljcyBwbGF5Z3JvdW5kLiBBIHNpbXBsZSBzY2FsZWQgY3ViZSBidXQgd2l0aCBwaHlzaWNzIHR5cGUgc2V0IHRvIHN0YXRpY1xuICAgICAgICBib2RpZXNbMF0gPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJHcm91bmRcIiwgbmV3IGYuTWF0ZXJpYWwoXCJHcm91bmRcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjIsIDAuMiwgMC4yLCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAwLCBmLlBIWVNJQ1NfVFlQRS5TVEFUSUMpO1xuICAgICAgICBib2RpZXNbMF0ubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygxNCwgMC4zLCAxNCkpOyAvL1NjYWxlIHRoZSBib2R5IHdpdGggaXQncyBzdGFuZGFyZCBDb21wb25lbnRUcmFuc2Zvcm1cbiAgICAgICAgYm9kaWVzWzBdLm10eExvY2FsLnJvdGF0ZVgoMywgdHJ1ZSk7IC8vR2l2ZSBpdCBhIHNsaWdodCByb3RhdGlvbiBzbyB0aGUgcGh5c2ljYWwgb2JqZWN0cyBhcmUgc2xpZGluZywgYWx3YXlzIGZyb20gbGVmdCB3aGVuIGl0J3MgYWZ0ZXIgYSBzY2FsaW5nXG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChib2RpZXNbMF0pOyAvL0FkZCB0aGUgbm9kZSB0byB0aGUgc2NlbmUgYnkgYWRkaW5nIGl0IHRvIHRoZSBzY2VuZS1yb290XG5cbiAgICAgICAgc3Bhd25DaGFpcigpO1xuXG4gICAgICAgIC8vU3RhbmRhcmQgRnVkZ2UgU2NlbmUgSW5pdGlhbGl6YXRpb24gLSBDcmVhdGluZyBhIGRpcmVjdGlvbmFsIGxpZ2h0LCBhIGNhbWVyYSBhbmQgaW5pdGlhbGl6ZSB0aGUgdmlld3BvcnRcbiAgICAgICAgbGV0IGNtcExpZ2h0OiBmLkNvbXBvbmVudExpZ2h0ID0gbmV3IGYuQ29tcG9uZW50TGlnaHQobmV3IGYuTGlnaHREaXJlY3Rpb25hbChmLkNvbG9yLkNTUyhcIldISVRFXCIpKSk7XG4gICAgICAgIGNtcExpZ2h0Lm10eFBpdm90Lmxvb2tBdChuZXcgZi5WZWN0b3IzKDAuNSwgLTEsIC0wLjgpKTsgLy9TZXQgbGlnaHQgZGlyZWN0aW9uXG4gICAgICAgIGhpZXJhcmNoeS5hZGRDb21wb25lbnQoY21wTGlnaHQpO1xuXG4gICAgICAgIGxldCBjbXBDYW1lcmE6IGYuQ29tcG9uZW50Q2FtZXJhID0gbmV3IGYuQ29tcG9uZW50Q2FtZXJhKCk7XG4gICAgICAgIGNtcENhbWVyYS5jbHJCYWNrZ3JvdW5kID0gZi5Db2xvci5DU1MoXCJHUkVZXCIpO1xuICAgICAgICBjbXBDYW1lcmEubXR4UGl2b3QudHJhbnNsYXRlKG5ldyBmLlZlY3RvcjMoMiwgMy41LCAxNykpOyAvL01vdmUgY2FtZXJhIGZhciBiYWNrIHNvIHRoZSB3aG9sZSBzY2VuZSBpcyB2aXNpYmxlXG4gICAgICAgIGNtcENhbWVyYS5tdHhQaXZvdC5sb29rQXQoZi5WZWN0b3IzLlpFUk8oKSk7IC8vU2V0IHRoZSBjYW1lcmEgbWF0cml4IHNvIHRoYXQgaXQgbG9va3MgYXQgdGhlIGNlbnRlciBvZiB0aGUgc2NlbmVcblxuICAgICAgICB2aWV3UG9ydCA9IG5ldyBmLlZpZXdwb3J0KCk7IC8vQ3JlYXRpbmcgYSB2aWV3cG9ydCB0aGF0IGlzIHJlbmRlcmVkIG9udG8gdGhlIGh0bWwgY2FudmFzIGVsZW1lbnRcbiAgICAgICAgdmlld1BvcnQuaW5pdGlhbGl6ZShcIlZpZXdwb3J0XCIsIGhpZXJhcmNoeSwgY21wQ2FtZXJhLCBhcHApOyAvL2luaXRpYWxpemUgdGhlIHZpZXdwb3J0IHdpdGggdGhlIHJvb3Qgbm9kZSwgY2FtZXJhIGFuZCBjYW52YXNcblxuICAgICAgICAvL1BIWVNJQ1MgLSBTdGFydCB1c2luZyBwaHlzaWNzIGJ5IHRlbGxpbmcgdGhlIHBoeXNpY3MgdGhlIHNjZW5lIHJvb3Qgb2JqZWN0LiBQaHlzaWNzIHdpbGwgcmVjYWxjdWxhdGUgZXZlcnkgdHJhbnNmb3JtIGFuZCBpbml0aWFsaXplXG4gICAgICAgIGYuUGh5c2ljcy5hZGp1c3RUcmFuc2Zvcm1zKGhpZXJhcmNoeSk7XG4gICAgICAgIGYuUGh5c2ljcy5zZXR0aW5ncy5kZWJ1Z0RyYXcgPSB0cnVlO1xuICAgICAgICBhcHAuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoKSA9PiB7IHNwYXduQ2hhaXIoKTsgfSk7XG5cbiAgICAgICAgLy9JbXBvcnRhbnQgc3RhcnQgdGhlIGdhbWUgbG9vcCBhZnRlciBzdGFydGluZyBwaHlzaWNzLCBzbyBwaHlzaWNzIGNhbiB1c2UgdGhlIGN1cnJlbnQgdHJhbnNmb3JtIGJlZm9yZSBpdCdzIGZpcnN0IGl0ZXJhdGlvblxuICAgICAgICBmLkxvb3AuYWRkRXZlbnRMaXN0ZW5lcihmLkVWRU5ULkxPT1BfRlJBTUUsIHVwZGF0ZSk7IC8vVGVsbCB0aGUgZ2FtZSBsb29wIHRvIGNhbGwgdGhlIHVwZGF0ZSBmdW5jdGlvbiBvbiBlYWNoIGZyYW1lXG4gICAgICAgIGYuTG9vcC5zdGFydCgpOyAvL1N0YXJkIHRoZSBnYW1lIGxvb3BcbiAgICB9XG5cbiAgICAvL0Z1bmN0aW9uIHRvIGFuaW1hdGUvdXBkYXRlIHRoZSBGdWRnZSBzY2VuZSwgY29tbW9ubHkga25vd24gYXMgZ2FtZWxvb3BcbiAgICBmdW5jdGlvbiB1cGRhdGUoKTogdm9pZCB7XG4gICAgICAgIGYuUGh5c2ljcy53b3JsZC5zaW11bGF0ZSgpOyAvL1BIWVNJQ1MgLSBTaW11bGF0ZSBwaHlzaWNhbCBjaGFuZ2VzIGVhY2ggZnJhbWUsIHBhcmFtZXRlciB0byBzZXQgdGltZSBiZXR3ZWVuIGZyYW1lc1xuICAgICAgICBtZWFzdXJlRlBTKCk7XG4gICAgICAgIHZpZXdQb3J0LmRyYXcoKTsgLy8gRHJhdyB0aGUgY3VycmVudCBGdWRnZSBTY2VuZSB0byB0aGUgY2FudmFzXG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gcXVpY2tseSBjcmVhdGUgYSBub2RlIHdpdGggbXVsdGlwbGUgbmVlZGVkIEZ1ZGdlQ29tcG9uZW50cywgaW5jbHVkaW5nIGEgcGh5c2ljcyBjb21wb25lbnRcbiAgICBmdW5jdGlvbiBjcmVhdGVDb21wbGV0ZU5vZGUoX25hbWU6IHN0cmluZywgX21hdGVyaWFsOiBmLk1hdGVyaWFsLCBfbWVzaDogZi5NZXNoLCBfbWFzczogbnVtYmVyLCBfcGh5c2ljc1R5cGU6IGYuUEhZU0lDU19UWVBFLCBfZ3JvdXA6IGYuUEhZU0lDU19HUk9VUCA9IGYuUEhZU0lDU19HUk9VUC5ERUZBVUxULCBfY29sVHlwZTogZi5DT0xMSURFUl9UWVBFID0gZi5DT0xMSURFUl9UWVBFLkNVQkUpOiBmLk5vZGUge1xuICAgICAgICAvL1N0YW5kYXJkIEZ1ZGdlIE5vZGUgQ3JlYXRpb25cbiAgICAgICAgbGV0IG5vZGU6IGYuTm9kZSA9IG5ldyBmLk5vZGUoX25hbWUpOyAvL0NyZWF0aW5nIHRoZSBub2RlXG4gICAgICAgIGxldCBjbXBNZXNoOiBmLkNvbXBvbmVudE1lc2ggPSBuZXcgZi5Db21wb25lbnRNZXNoKF9tZXNoKTsgLy9DcmVhdGluZyBhIG1lc2ggZm9yIHRoZSBub2RlXG4gICAgICAgIGxldCBjbXBNYXRlcmlhbDogZi5Db21wb25lbnRNYXRlcmlhbCA9IG5ldyBmLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCk7IC8vQ3JlYXRpbmcgYSBtYXRlcmlhbCBmb3IgdGhlIG5vZGVcbiAgICAgICAgbGV0IGNtcFRyYW5zZm9ybTogZi5Db21wb25lbnRUcmFuc2Zvcm0gPSBuZXcgZi5Db21wb25lbnRUcmFuc2Zvcm0oKTsgIC8vVHJhbnNmb3JtIGhvbGRpbmcgcG9zaXRpb24vcm90YXRpb24vc2NhbGluZyBvZiB0aGUgbm9kZVxuICAgICAgICBsZXQgY21wUmlnaWRib2R5OiBmLkNvbXBvbmVudFJpZ2lkYm9keSA9IG5ldyBmLkNvbXBvbmVudFJpZ2lkYm9keShfbWFzcywgX3BoeXNpY3NUeXBlLCBfY29sVHlwZSwgX2dyb3VwKTsgLy9BZGRpbmcgYSBwaHlzaWNhbCBib2R5IGNvbXBvbmVudCB0byB1c2UgcGh5c2ljc1xuXG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcE1lc2gpO1xuICAgICAgICBub2RlLmFkZENvbXBvbmVudChjbXBNYXRlcmlhbCk7XG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcFRyYW5zZm9ybSk7XG4gICAgICAgIG5vZGUuYWRkQ29tcG9uZW50KGNtcFJpZ2lkYm9keSk7IC8vIDwtLSBiZXN0IHByYWN0aWNlIHRvIGFkZCBwaHlzaWNzIGNvbXBvbmVudCBsYXN0XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNwYXduQ2hhaXIoKSB7XG4gICAgICAgIGxldCBybmdIZWlnaHQgPSAobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgICAgICAgICAgIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzcGF3bkhlaWdodCA9IHJuZ0hlaWdodCg4LCAyMCk7XG4gICAgICAgIG5vQ2hhaXJzKys7XG5cbiAgICAgICAgLy9DcmVhdGluZyBhIGNoYWlyLCBiYXNlICsgYmFjayArIDQgbGVnc1xuICAgICAgICBsZXQgYmFzZSA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkJhc2VcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC43NSwgMC44LCAwLjc1LCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDKTtcbiAgICAgICAgYmFzZS5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLCAzLjUgKyBzcGF3bkhlaWdodCwgMCkpO1xuICAgICAgICBiYXNlLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMSwgMC4yLCAxKSk7XG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChiYXNlKTtcblxuICAgICAgICBsZXQgYmFjayA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkJhY2tcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC43NSwgMC44LCAwLjc1LCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDKTtcbiAgICAgICAgYmFjay5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLjQsIDQgKyBzcGF3bkhlaWdodCwgMCkpO1xuICAgICAgICBiYWNrLm10eExvY2FsLnNjYWxlKG5ldyBmLlZlY3RvcjMoMC4yLCAxLCAxKSk7XG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChiYWNrKTtcbiAgICAgICAgbGV0IHdlbGRpbmdKb2ludDogZi5Db21wb25lbnRKb2ludFdlbGRpbmcgPSBuZXcgZi5Db21wb25lbnRKb2ludFdlbGRpbmcoYmFzZS5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpLCBiYWNrLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkpO1xuICAgICAgICBiYWNrLmFkZENvbXBvbmVudCh3ZWxkaW5nSm9pbnQpO1xuXG4gICAgICAgIGxldCBsZWcgPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJMZWdfQkxcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC43NSwgMC44LCAwLjc1LCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMik7XG4gICAgICAgIGxlZy5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygwLjQsIDMgKyBzcGF3bkhlaWdodCwgMC40KSk7XG4gICAgICAgIGxlZy5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDAuMiwgMC44LCAwLjIpKTtcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGxlZyk7XG5cbiAgICAgICAgd2VsZGluZ0pvaW50ID0gbmV3IGYuQ29tcG9uZW50Sm9pbnRXZWxkaW5nKGJhc2UuZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KSwgbGVnLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkpO1xuICAgICAgICBiYWNrLmFkZENvbXBvbmVudCh3ZWxkaW5nSm9pbnQpO1xuXG4gICAgICAgIGxlZyA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkxlZ19CUlwiLCBuZXcgZi5NYXRlcmlhbChcIkN1YmVcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjc1LCAwLjgsIDAuNzUsIDEpKSksIG5ldyBmLk1lc2hDdWJlKCksIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8yKTtcbiAgICAgICAgbGVnLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKDAuNCwgMyArIHNwYXduSGVpZ2h0LCAtMC40KSk7XG4gICAgICAgIGxlZy5tdHhMb2NhbC5zY2FsZShuZXcgZi5WZWN0b3IzKDAuMiwgMC44LCAwLjIpKTtcbiAgICAgICAgaGllcmFyY2h5LmFwcGVuZENoaWxkKGxlZyk7XG5cbiAgICAgICAgd2VsZGluZ0pvaW50ID0gbmV3IGYuQ29tcG9uZW50Sm9pbnRXZWxkaW5nKGJhc2UuZ2V0Q29tcG9uZW50KGYuQ29tcG9uZW50UmlnaWRib2R5KSwgbGVnLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSkpO1xuICAgICAgICBiYWNrLmFkZENvbXBvbmVudCh3ZWxkaW5nSm9pbnQpO1xuXG4gICAgICAgIGxlZyA9IGNyZWF0ZUNvbXBsZXRlTm9kZShcIkxlZ19GUlwiLCBuZXcgZi5NYXRlcmlhbChcIkN1YmVcIiwgZi5TaGFkZXJGbGF0LCBuZXcgZi5Db2F0Q29sb3JlZChuZXcgZi5Db2xvcigwLjc1LCAwLjgsIDAuNzUsIDEpKSksIG5ldyBmLk1lc2hDdWJlKCksIDEsIGYuUEhZU0lDU19UWVBFLkRZTkFNSUMsIGYuUEhZU0lDU19HUk9VUC5HUk9VUF8yKTtcbiAgICAgICAgbGVnLm10eExvY2FsLnRyYW5zbGF0ZShuZXcgZi5WZWN0b3IzKC0wLjQsIDMgKyBzcGF3bkhlaWdodCwgLTAuNCkpO1xuICAgICAgICBsZWcubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygwLjIsIDAuOCwgMC4yKSk7XG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChsZWcpO1xuXG4gICAgICAgIHdlbGRpbmdKb2ludCA9IG5ldyBmLkNvbXBvbmVudEpvaW50V2VsZGluZyhiYXNlLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSksIGxlZy5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpKTtcbiAgICAgICAgYmFjay5hZGRDb21wb25lbnQod2VsZGluZ0pvaW50KTtcblxuICAgICAgICBsZWcgPSBjcmVhdGVDb21wbGV0ZU5vZGUoXCJMZWdfRlJcIiwgbmV3IGYuTWF0ZXJpYWwoXCJDdWJlXCIsIGYuU2hhZGVyRmxhdCwgbmV3IGYuQ29hdENvbG9yZWQobmV3IGYuQ29sb3IoMC43NSwgMC44LCAwLjc1LCAxKSkpLCBuZXcgZi5NZXNoQ3ViZSgpLCAxLCBmLlBIWVNJQ1NfVFlQRS5EWU5BTUlDLCBmLlBIWVNJQ1NfR1JPVVAuR1JPVVBfMik7XG4gICAgICAgIGxlZy5tdHhMb2NhbC50cmFuc2xhdGUobmV3IGYuVmVjdG9yMygtMC40LCAzICsgc3Bhd25IZWlnaHQsIDAuNCkpO1xuICAgICAgICBsZWcubXR4TG9jYWwuc2NhbGUobmV3IGYuVmVjdG9yMygwLjIsIDAuOCwgMC4yKSk7XG4gICAgICAgIGhpZXJhcmNoeS5hcHBlbmRDaGlsZChsZWcpO1xuXG4gICAgICAgIHdlbGRpbmdKb2ludCA9IG5ldyBmLkNvbXBvbmVudEpvaW50V2VsZGluZyhiYXNlLmdldENvbXBvbmVudChmLkNvbXBvbmVudFJpZ2lkYm9keSksIGxlZy5nZXRDb21wb25lbnQoZi5Db21wb25lbnRSaWdpZGJvZHkpKTtcbiAgICAgICAgYmFjay5hZGRDb21wb25lbnQod2VsZGluZ0pvaW50KTtcbiAgICAgICAgZi5QaHlzaWNzLmFkanVzdFRyYW5zZm9ybXMoaGllcmFyY2h5KTsgLy8gSW1wb3J0YW50ISBZb3UgbmVlZCB0byBhdCBsZWFzdCBhZGp1c3QgVHJhbnNmb3JtcyBmb3IgdGhlIHBhcnRzIG9mIHRoZSBjaGFpclxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1lYXN1cmVGUFMoKTogdm9pZCB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm93OiBudW1iZXIgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICAgIHdoaWxlICh0aW1lcy5sZW5ndGggPiAwICYmIHRpbWVzWzBdIDw9IG5vdyAtIDEwMDApIHtcbiAgICAgICAgICAgICAgICB0aW1lcy5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGltZXMucHVzaChub3cpO1xuICAgICAgICAgICAgZnBzID0gdGltZXMubGVuZ3RoO1xuICAgICAgICAgICAgZnBzRGlzcGxheS50ZXh0Q29udGVudCA9IGBGUFM6ICR7ZnBzLnRvU3RyaW5nKCl9IC8gQ2hhaXJzOiAke25vQ2hhaXJzfSAvIEJvZGllczogJHtmLlBoeXNpY3Mud29ybGQuZ2V0Qm9keUxpc3QoKS5sZW5ndGh9YFxuICAgICAgICB9KTtcbiAgICB9XG5cblxufSJdfQ==