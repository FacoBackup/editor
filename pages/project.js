import Editor from "../editor/Editor";
import useDB from "../editor/components/files/hooks/useDB";
import DatabaseProvider from '../editor/components/db/DatabaseProvider'
import {useContext, useEffect, useRef, useState} from "react";
import useSettings from "../editor/hook/useSettings";
import Maker from "../editor/utils/Maker";
import loadProject, {loadEntities} from "../editor/utils/loadProjectData";
import useEngine from "../editor/core/useEngine";
import {Alert, ThemeContext} from "@f-ui/core";
import styles from '../styles/Project.module.css'
import useSerializer from "../editor/hook/useSerializer";
import {useRouter} from "next/router";
import Database from "../editor/components/db/Database";
import LoadProvider from "../editor/hook/LoadProvider";
import EVENTS from "../editor/utils/EVENTS";


export default function Project() {
    const router = useRouter()
    const [executingAnimation, setExecutingAnimation] = useState(false)
    const [alert, setAlert] = useState({})
    const [id, setId] = useState()
    const settings = useSettings()
    const engine = useEngine(id, executingAnimation)
    const [database, setDatabase] = useState()
    const load = useContext(LoadProvider)
    const packageMaker = useRef()
    const theme = useContext(ThemeContext)
    const serializer = useSerializer(engine, database, setAlert, settings, id)

    useEffect(() => {
        setDatabase(new Database('FS'))
    }, [])
    useEffect(() => {
        if (router.isReady)
            setId(router.query.id)

    }, [router.isReady])
    useEffect(() => {
        if (database && id ) {

            load.pushEvent(EVENTS.PROJECT_SETTINGS)
            load.pushEvent(EVENTS.PROJECT_DATA)
            if (!packageMaker.current)
                packageMaker.current = new Maker()

            loadProject(
                database,
                engine,
                settings,
                setAlert,
                id,
                () => router.push('/'),
                () => {

                    load.finishEvent(EVENTS.PROJECT_SETTINGS)
                })
        }
    }, [database, id])
    useEffect(() => {
        if (engine.gpu && database)
            loadEntities(database, engine, id, () => {

                load.finishEvent(EVENTS.PROJECT_DATA)
            })
    }, [engine.gpu])


    return (
        <DatabaseProvider.Provider value={database}>
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
                redirect={() => router.push('/')}
                executingAnimation={executingAnimation}
                setExecutingAnimation={setExecutingAnimation}
                theme={theme}
                packageMaker={packageMaker}
                engine={engine}
                setAlert={setAlert}
                settings={settings} id={id}/>
        </DatabaseProvider.Provider>)
}
