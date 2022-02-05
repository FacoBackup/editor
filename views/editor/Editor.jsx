import {useContext, useEffect, useMemo, useRef, useState} from "react";

import {Alert} from "@f-ui/core";

import handleDrop from "./utils/handlers/handleDrop";
import useTabs from "./hook/useTabs";
import getOptions from "./utils/getOptions";
import PropTypes from "prop-types";
import useControl from "./hook/useControl";
import DatabaseProvider from "../../components/db/DatabaseProvider";
import QuickAccessProvider from "../../components/db/QuickAccessProvider";
import Preferences from "../../components/preferences/Preferences";
import GlobalOptions from "../../components/options/GlobalOptions";
import styles from './styles/Editor.module.css'
import useQuickAccess from "../../components/db/useQuickAccess";
import ViewportOptions from "../../components/viewport/ViewportOptions";
import Viewport from "../../components/viewport/Viewport";
import ResizableBar from "../../components/resizable/ResizableBar";
import Scene from "../scene/Scene";
import Tabs from "../../components/tabs/Tabs";
import Explorer from "../files/Explorer";

export default function Editor(props) {

    const fullscreenRef = useRef()
    const database = useContext(DatabaseProvider)

    const handleFullscreen = e => {
        if (!document.fullscreenElement)
            props.settings.setFullscreen(false)
    }
    useEffect(() => {
        if (props.settings.fullscreen) {
            fullscreenRef.current?.requestFullscreen()
            document.addEventListener('fullscreenchange', handleFullscreen)
        } else if (document.fullscreenElement)
            document.exitFullscreen().catch()

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreen)
        }
    }, [props.settings.fullscreen])
    useControl(props.engine, props.save, props.settings)

    const [filesLoaded, setFilesLoaded] = useState([])
    const [currentTab, setCurrentTab] = useState(0)

    useEffect(() => {
        if (filesLoaded.length > 0)
            setCurrentTab(filesLoaded.length)
    }, [filesLoaded])

    const fallbackOptions = useMemo(() => {
        return getOptions(
            props.executingAnimation,
            props.setExecutingAnimation,
            props.engine,
            props.save)
    }, [props])

    const {
        meshes,

        materials
    } = useTabs(
        filesLoaded,
        currentTab,
        setCurrentTab,
        setFilesLoaded,
        database,
        props.setAlert
    )

    const files = useQuickAccess(props.id)


    return (
        <QuickAccessProvider.Provider value={files}>

            <div className={styles.wrapper}>
                <Preferences settings={props.settings} serializer={props.serializer}/>
                <GlobalOptions
                    downloadProject={() => {
                        props.packageMaker.current.make(props.id, props.settings, database, props.setAlert, props.load)
                    }}
                    settings={props.settings}
                    redirect={props.redirect}
                    save={props.save}
                />
                <Alert
                    open={props.savingAlert}

                    handleClose={() => props.setSavingAlert(false)}
                    onClick={() => props.save()} variant={'info'}
                    delay={5000}>
                    Saving project (2 min).
                </Alert>

                <Tabs
                    fallbackOptions={fallbackOptions}
                    onBeforeSwitch={(newTab) => {
                        if(newTab === 0)
                            props.engine.setCanRender(true)
                        else
                            props.engine.setCanRender(false)
                    }}
                    tab={currentTab} setTab={setCurrentTab}
                    tabs={[
                        {
                            open: true,
                            icon: <span
                                style={{fontSize: '1.2rem'}}
                                className={`material-icons-round`}>video_settings</span>,
                            label: 'Viewport',
                            children: (
                                <div className={styles.viewportWrapper}>

                                    <div
                                        ref={fullscreenRef}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            overflow: 'hidden'
                                        }}>
                                        {props.settings.visibility.viewportOptions ?
                                            <ViewportOptions engine={props.engine} hook={props.settings} id={props.id}/>
                                            :
                                            null}

                                        <Viewport
                                            id={props.id}
                                            engine={props.engine}
                                            allowDrop={true}
                                            handleDrop={event => handleDrop(event, database, props.engine, props.setAlert)}
                                        />
                                    </div>
                                    {props.settings.visibility.scene ?
                                        <>
                                            <ResizableBar type={'width'}/>
                                            <Scene
                                                executingAnimation={props.executingAnimation}
                                                hierarchy={props.engine.hierarchy}
                                                setAlert={props.setAlert}
                                                engine={props.engine}
                                            />
                                        </> : null}

                                </div>
                            )
                        },
                        ...materials,
                        ...meshes,

                    ]}
                />

                {props.settings.visibility.files ?
                    <Explorer
                        setAlert={props.setAlert}
                        currentTab={currentTab}
                        label={'Explorer'} id={props.id}
                        openEngineFile={(fileID, fileName) => {

                            if (!filesLoaded.find(file => file.fileID === fileID)) {
                                database.getFileWithBlob(fileID).then(res => {
                                    setFilesLoaded(prev => [...prev, {
                                        blob: res.blob,
                                        name: fileName,
                                        fileID: fileID,
                                        type: res.type
                                    }])
                                })
                            }
                        }}
                    />
                    :
                    null}


            </div>
        </QuickAccessProvider.Provider>
    )
}

Editor.propTypes = {
    redirect: PropTypes.func.isRequired,
    executingAnimation: PropTypes.bool.isRequired,
    setExecutingAnimation: PropTypes.func.isRequired,
    setAlert: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    engine: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    packageMaker: PropTypes.object.isRequired,

    savingAlert: PropTypes.bool.isRequired,
    setSavingAlert: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
}
