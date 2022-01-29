import {Alert, Button, Card, Masonry, Modal, TextField, ToolTip,} from "@f-ui/core";
import styles from '../styles/Home.module.css'
import {Dexie} from "dexie";
import {useEffect, useState} from "react";
import randomID from "../editor/utils/randomID";
import ContextMenu from "../editor/components/context/ContextMenu";
import {useRouter} from "next/router";
import initializeDatabase from "../editor/components/files/utils/initializeDatabase";


export default function Home(props) {
    const [db, setDb] = useState()
    const [projects, setProjects] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [alert, setAlert] = useState({})
    const router = useRouter()

    useEffect(() => {
        initializeDatabase('FS').then(r => {
            r[0].open()
            setDb(r[0])
            r[0].table('project').toArray().then(res => {
                setProjects(res.map(re => {
                    return {
                        ...re,
                        settings: JSON.parse(re.settings)
                    }
                }))
            })

        })
    }, [])

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
                        db?.table('project').add({
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
                        }).then(r => {
                            setAlert({
                                type: 'success',
                                message: 'Project created.'
                            })
                            db.table('project').toArray().then(r => {
                                setProjects(r.map(e => {
                                    return {id: e.id, settings: JSON.parse(e.settings)}
                                }))
                            })
                        })
                        setProjectName('')
                        setOpenModal(false)
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
                <Button className={styles.optionButton} variant={'outlined'} onClick={() => null}>
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
                        onClick: (node) => db?.table('project')
                            .delete(node.getAttribute('data-card'))
                            .then(r => {
                                setAlert({
                                    type: 'success',
                                    message: 'Project deleted.'
                                })
                                db.table('project').toArray().then(r => {
                                    setProjects(r.map(e => {
                                        return {id: e.id, settings: JSON.parse(e.settings)}
                                    }))
                                })
                            }),
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
