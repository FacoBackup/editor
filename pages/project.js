import {useContext, useEffect, useRef, useState} from "react";

import {Alert, ThemeContext} from "@f-ui/core";
import styles from '../styles/Project.module.css'

import {useRouter} from "next/router";

import Head from 'next/head'
import useSettings from "../views/editor/hook/useSettings";
import useEngine from "../views/editor/hook/useEngine";
import LoadProvider from "../views/editor/hook/LoadProvider";
import useSerializer from "../views/editor/hook/useSerializer";
import Database from "../components/db/Database";
import EVENTS from "../views/editor/utils/misc/EVENTS";
import Maker from "../views/editor/utils/classes/Maker";
import loadProject, {loadEntities} from "../views/editor/utils/parsers/loadProjectData";
import DatabaseProvider from "../components/db/DatabaseProvider";
import Editor from "../views/editor/Editor";


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
        if (database && id) {

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

            <Head>
                <title>{settings.projectName}</title>
            </Head>
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
