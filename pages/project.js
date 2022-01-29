import Editor from "../editor/Editor";
import useDB from "../editor/components/files/hooks/useDB";
import DatabaseProvider from '../editor/hook/DatabaseProvider'
import {useContext, useEffect, useRef, useState} from "react";
import useSettings from "../editor/hook/useSettings";
import Maker from "../editor/utils/Maker";
import loadProject, {loadEntities} from "../editor/utils/loadProjectData";
import useEngine from "../editor/core/useEngine";
import {Alert, ThemeContext} from "@f-ui/core";
import styles from '../styles/Project.module.css'
import useSerializer from "../editor/hook/useSerializer";
import {useRouter} from "next/router";


export default function Project() {
    const router = useRouter()
    const [executingAnimation, setExecutingAnimation] = useState(false)
    const [alert, setAlert] = useState({})
    const [id, setId] = useState()
    const settings = useSettings()
    const engine = useEngine(id, executingAnimation)

    const db = useDB('FS', 'Project', setAlert, id)
    const packageMaker = useRef()
    const theme = useContext(ThemeContext)
    const serializer = useSerializer(engine, db.db, setAlert, settings, id)
    const [projectLoaded, setProjectLoaded] = useState({
        project: false,
        data: false
    })
    useEffect(() => {
        if (router.isReady)
            setId(router.query.id)

    }, [router.isReady])
    useEffect(() => {

        if (db.ready) {
            if (!packageMaker.current)
                packageMaker.current = new Maker()

            loadProject(
                db.db,
                engine,
                settings,
                setAlert,
                router.query.id,
                () => router.push('/'), () => {
                    setProjectLoaded({
                        project: true,
                        data: false
                    })
                })
        }
    }, [db.ready])
    useEffect(() => {
        if (engine.gpu && projectLoaded.project && !projectLoaded.data)
            loadEntities(db.db, engine, id, () => {
                setProjectLoaded({
                    project: true,
                    data: true
                })
            })
    }, [engine.gpu, projectLoaded])
    return (
        <DatabaseProvider.Provider value={db.db}>
            <Alert
                open={alert.type !== undefined}
                handleClose={() => setAlert({})} variant={alert.type}
                delay={3500}>
                <div className={styles.alertContent} title={alert.message}>
                    {alert.message}
                </div>
            </Alert>
            <Editor

                {...serializer}
                executingAnimation={executingAnimation}
                setExecutingAnimation={setExecutingAnimation}
                theme={theme}

                databaseHook={db}
                packageMaker={packageMaker}
                engine={engine}
                setAlert={setAlert}
                settings={settings} id={id}/>
        </DatabaseProvider.Provider>)
}
