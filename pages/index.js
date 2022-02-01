import {Alert, Button, Card, Masonry, Modal, TextField, ToolTip,} from "@f-ui/core";
import styles from '../styles/Home.module.css'
import {Dexie} from "dexie";
import React, {useContext, useEffect, useRef, useState} from "react";
import randomID from "../editor/utils/randomID";
import ContextMenu from "../editor/components/context/ContextMenu";
import {useRouter} from "next/router";
import initializeDatabase from "../editor/components/files/utils/initializeDatabase";
import Database from "../editor/components/db/Database";
import useDB from "../editor/components/files/hooks/useDB";
import LoadProvider from "../editor/hook/LoadProvider";
import EVENTS from "../editor/utils/EVENTS";
import Maker from "../editor/utils/Maker";


export default function Home(props) {

    const [projects, setProjects] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [alert, setAlert] = useState({})
    const router = useRouter()
    const [database, setDatabase] = useState()
    const load = useContext(LoadProvider)
    const uploadRef = useRef()

    useEffect(() => {
        load.pushEvent(EVENTS.PROJECT_LIST)
        setDatabase(new Database('FS'))
    }, [])
    const refresh = () => {
        database?.listProject()
            .then(res => {

                setProjects(res.map(re => {
                    return {
                        ...re,
                        settings:JSON.parse(re.settings)
                    }
                }))
                load.finishEvent(EVENTS.PROJECT_LIST)
            })
    }
    useEffect(() => {

        if (database)
            refresh()
    }, [database])

    return (
        <div className={styles.wrapper}>
            <Alert open={alert.type !== undefined} variant={alert.type} handleClose={() => setAlert({})}>
                <div style={{color: 'var(--fabric-color-primary)'}}>
                    {alert.message}
                </div>
            </Alert>
            <Modal open={openModal} handleClose={() => {
                setProjectName('')
                setOpenModal(false)
            }} className={styles.modal}>
                <TextField
                    handleChange={e => setProjectName(e.target.value)}
                    label={'Project name'}
                    placeholder={'Project name'}
                    value={projectName}/>
                <Button
                    variant={'filled'}
                    disabled={projectName === ''}
                    className={styles.submitButton}
                    onClick={() => {

                        const newData = {
                            id: randomID(),
                            settings: JSON.stringify({
                                projectCreationDate: (new Date()).toDateString(),
                                showFPS: false,
                                lightCalculations: true,
                                shadowMapping: true,
                                fxaa: true,
                                timestamp: 300000,
                                projectName: projectName
                            })
                        }

                        database?.postProject(newData)
                            .then(r => {

                                setAlert({
                                    type: 'success',
                                    message: 'Project created.'
                                })
                                setProjects(prev => {
                                    return [...prev, newData]
                                })
                                setProjectName('')
                                setOpenModal(false)
                            })
                    }}>
                    Create project
                </Button>
            </Modal>
            <div className={styles.options}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logo}>
                        <img src={'./LOGO.png'} alt={'logo'}/>
                    </div>
                    <div className={styles.logoTitle}>
                        Projection Engine
                    </div>
                </div>

                <Button
                    className={styles.optionButton}
                    variant={'outlined'}
                    onClick={() => setOpenModal(true)}>
                    New project
                </Button>
                <input style={{display: 'none'}}
                       type={'file'}
                       accept={['.projection']}
                       onChange={f => {
                           load.pushEvent(EVENTS.PROJECT_IMPORT)
                           Maker.parse(f.target.files[0], database)
                               .then((res) => {
                                   let promises = []

                                   res.forEach(data => {
                                       const parsed = JSON.parse(data.data)
                                       if (data.type === 0)
                                           promises.push(new Promise(resolve => {
                                               database?.postProject({id: parsed.id, settings: JSON.stringify(parsed.settings)}).then(() => resolve()).catch(() => resolve())
                                           }))
                                       else if (data.type === 1)
                                           promises.push(new Promise(resolve => {
                                               database?.postFileWithBlob(parsed, parsed.blob).then(() => resolve()).catch(() => resolve())
                                           }))
                                       else if (data.type === 2)
                                           promises.push(new Promise(resolve => database?.postEntity(parsed).then(() => resolve()).catch(() => resolve())))
                                   })

                                   Promise.all(promises).then(() => {
                                       load.finishEvent(EVENTS.PROJECT_IMPORT)
                                       refresh()
                                   })
                               })
                           f.target.value = ''
                       }}
                       ref={uploadRef}/>
                <Button
                    className={styles.optionButton}
                    variant={'outlined'}
                    onClick={() => uploadRef.current.click()}>
                    Load project
                </Button>

                <div className={styles.footer}>
                    <Button className={styles.footerButton} variant={"outlined"}>
                        <a href={'https://github.com/projection-engine'} target="_blank" className={styles.footerIcon}
                        >
                            <img src={'./github/' + (!props.dark ? 'dark' : 'light') + '.svg'} alt={'github'}/>
                        </a>
                        <ToolTip align={'middle'} justify={'end'}>
                            Projection engine on github
                        </ToolTip>
                    </Button>
                </div>
            </div>
            <div className={styles.masonryWrapper}>
                <h1 className={styles.masonryTitle}>
                    Your projects
                </h1>
                <ContextMenu triggers={['data-card']} options={[
                    {
                        requiredTrigger: 'data-card',

                        label: 'Open project',
                        onClick: (node) => router.push('/project?id=' + node.getAttribute('data-card')),
                        icon: <span className={'material-icons-round'}>open_in_new</span>
                    },
                    {
                        requiredTrigger: 'data-card',

                        label: 'Delete project',
                        onClick: (node) => {
                            const id = node.getAttribute('data-card')
                            load.pushEvent(EVENTS.PROJECT_DELETE)
                            database.deleteProject(id)
                                .then(() => {
                                    setAlert({
                                        type: 'success',
                                        message: 'Project deleted.'
                                    })
                                    setProjects(prev => {
                                        return prev.filter(p => p.id !== id)
                                    })
                                    load.finishEvent(EVENTS.PROJECT_DELETE)
                                })
                        },
                        icon: <span className={'material-icons-round'}>delete</span>
                    }
                ]}>
                    {projects.length > 0 ?
                        <Masonry width={'100%'}>
                            {projects.map((p, i) => (

                                <Card
                                    attributes={{
                                        'data-card': p.id
                                    }}
                                    onClick={() => router.push('/project?id=' + p.id)} className={styles.card}>
                                    <div style={{maxWidth: '100%', overflow: 'hidden'}}>
                                        <img
                                            className={styles.preview}
                                            src={p.settings.preview ? p.settings.preview : './LOGO.png'}
                                            alt={'preview'}
                                        />
                                        {p.settings.projectName}
                                    </div>
                                </Card>

                            ))}
                        </Masonry>
                        :
                        <div className={styles.empty}>
                            <span className={'material-icons-round'} style={{fontSize: '5rem'}}>folder</span>
                            Nothing here.
                        </div>
                    }
                </ContextMenu>
            </div>

        </div>
    )
}
