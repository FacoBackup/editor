import PropTypes from "prop-types";
import styles from './styles/Mesh.module.css'

import Viewport from "../../components/viewport/Viewport";
import Controls from "./components/Controls";


import useVisualizer, {initializeMesh} from "./hook/useVisualizer";
import ResizableBar from "../../components/resizable/ResizableBar";
import {useContext, useEffect} from "react";
import DatabaseProvider from "../../components/db/DatabaseProvider";
import LoadProvider from "../editor/hook/LoadProvider";
import EVENTS from "../editor/utils/misc/EVENTS";

export default function MeshVisualizer(props) {
    const engine = useVisualizer(false, false, false)
    const database = useContext(DatabaseProvider)
    const load = useContext(LoadProvider)
    useEffect(() => {
        if (engine.initialized) {
            load.pushEvent(EVENTS.LOADING_VIEWPORT)
            database.getFileWithBlob(props.file.fileID)
                .then(res => {
                    
                    load.finishEvent(EVENTS.LOADING_VIEWPORT)
                    initializeMesh(JSON.parse(decodeURI(res.blob)), engine.gpu, engine.id, res.name, engine.dispatchEntities, engine.setMeshes)
                })
        }
    }, [engine.initialized])
    return (
        <div className={styles.wrapper}>
            <div style={{width: '100%', height: '100%'}}><Viewport allowDrop={false} id={engine.id} engine={engine}/>
            </div>
            <ResizableBar type={'width'}/>
            <Controls engine={engine}/>
        </div>
    )
}
MeshVisualizer.propTypes = {
    file: PropTypes.shape({
        fileID: PropTypes.string,
        name: PropTypes.string,
        blob: PropTypes.any,
        type: PropTypes.string,
    }),
    setAlert: PropTypes.func
}