# RougeDungeon
- Author:           Jonathan Schnee
- Year and Season:  Winter 2021
- Semester:         6th
- Course:           Prima
- Docent:           [Prof. Jirka Dell´Oro-Friedl](https://github.com/JirkaDellOro)
- Link to Page:     [RougeDungeon](https://jonathan-schnee.github.io/RougeDungeon/RougeDungeon/index.html)
- Link to Source:   [Source Code](https://github.com/Jonathan-Schnee/RougeDungeon/tree/main/RougeDungeon)

## Checklist for the final assignment
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
| Nr | Criterion       | Explanation                                                                                                              |
|---:|-------------------|---------------------------------------------------------------------------------------------------------------------|
|  0 | Units and Positions | The coordinate system is the X-Y plane. All entities (Agent, Enemies) are 1 unit high. The graph is 3 dimensional but the camera is ortographic so it looks like 2D |
|  1 | Hierarchy         | |
|  2 | Editor            | The Ground, Agent, Tree, Stone, Enemies and Walls were made all in the editor. But the Trees and Stone are just placeholders for the real ones. This decision was made because I have a seed generation in the program that places the trees randomly with percentage and give them a random height. |
|  3 | Scriptcomponents  | I use the script components for almost every class. So trees, stones, a generation class for those two and for the agent. This has the advantage that on the one hand everything is modular and on the other hand the code is clearer because you can read it better if it is not 1000 lines long. |
|  4 | Extend            | I have the CustomComponents and the StateMachiene from the Fudgecore extended although the second belongs to the FudgeAid. I use these because they already predefine a lot and I only have to add a little.  |
|  5 | Sound             | For the sound, there is only background music. I know how to use sounds also for actions. But for this, the time was not enough because sound for me is very far down on the priority of a prototype.  |
|  6 | VUI               | The interface is very simple you have your hearts on the top left, your score on the top right and the currently selected item in the bottom center. (This appears larger than the others.)  |
|  7 | Event-System      | The event system was very useful for me. I used it mainly for triggers so you can interact with everything. |
|  8 | External Data     | There are 2 config files one for the camera settings (field of view) and the other is for the spawn percentage for trees and stones. |
|  9 | Light             | 2D don't have/need one  |
|  A | Physics           | Added rigidbodys and move with forces |
|  B | Net               | Added multiplayer but no synchonization of the points |
|  C | State Machines    | Using StateMachines for the enemies |
|  D | Animation         | - |