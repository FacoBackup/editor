import PropTypes from "prop-types";
import styles from './styles/Mesh.module.css'

import Viewport from "../../components/viewport/Viewport";
import Controls from "./components/Controls";


import useVisualizer from "./hook/useVisualizer";
import ResizableBar from "../../components/resizable/ResizableBar";

export default function MeshVisualizer(props) {
    const engine = useVisualizer(true, true)

    return (
        <div className={styles.wrapper}>
            <div style={{width: '100%', height: '100%'}}><Viewport allowDrop={false} id={engine.id} engine={engine}/></div>
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