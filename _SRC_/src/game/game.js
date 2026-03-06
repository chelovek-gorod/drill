import { startScene } from "../app/events";
import SceneManager, { SCENE_NAME } from "./scenes/SceneManager";

export function startGame() {
    new SceneManager()
    startScene( SCENE_NAME.Load )
}