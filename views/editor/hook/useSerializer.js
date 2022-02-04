import {useCallback, useContext, useEffect, useState} from "react";

import LoadProvider from "./LoadProvider";
import EVENTS from "../utils/misc/EVENTS";

export default function useSerializer(engine, database, setAlert, settings, id) {
    const [savingAlert, setSavingAlert] = useState(false)
    const load = useContext(LoadProvider)
    let interval


    const saveEntities = () => {
        let promises = []
        engine.entities.forEach(e => {
            let blob = {...e.components}
            if (e.components.TransformComponent)
                blob.TransformComponent = {
                    scaling: e.components.TransformComponent.scaling,
                    rotation: e.components.TransformComponent.rotation,
                    translation: e.components.TransformComponent.translation
                }


            promises.push(new Promise((resolve) => {
                database
                    .updateEntity(e.id, {linkedTo: e.linkedTo, blob: JSON.stringify({...e, components: blob})})
                    .then(res => {
                        if (res === 0)
                            database.table('entity').add({
                                id: e.id, linkedTo: e.linkedTo, project: id, blob: JSON.stringify(e)
                            }).then(() => resolve()).catch(() => resolve())
                        else
                            resolve()
                    })
            }))
        })

        if (promises.length === 0)
            load.finishEvent(EVENTS.PROJECT_SAVE)
        return Promise.all(promises)
    }

    const saveSettings = useCallback((isLast) => {
        let promise = []

        if (database && id) {
            promise.push(new Promise((resolve) => {
                load.pushEvent(EVENTS.PROJECT_SAVE)
                setSavingAlert(false)
                setAlert({
                    type: 'info',
                    message: 'Saving project.'
                })

                const canvas = document.getElementById(id + '-canvas')

                database.table('project').update(id, {
                    id,
                    settings: JSON.stringify({
                        ...settings.savable,
                        preview: canvas.toDataURL()
                    })
                }).then(() => {
                    if (isLast) {
                        setAlert({
                            type: 'success',
                            message: 'Project saved.'
                        })
                        load.finishEvent(EVENTS.PROJECT_SAVE)
                    }
                    resolve()
                }).catch(() => resolve())
            }))
        }

        return Promise.all(promise)
    }, [settings, database, id])

    const save = useCallback(() => {
        let promise = []

        if (database && id)
            promise = [new Promise(resolve => {
                saveSettings(false).then(() => {
                    saveEntities().then(r => {
                        setAlert({
                            type: 'success',
                            message: 'Project saved.'
                        })
                        load.finishEvent(EVENTS.PROJECT_SAVE)
                        resolve()
                    }).catch(() => resolve())
                }).catch(() => resolve())
            })]

        return Promise.all(promise)
    }, [engine.entities, settings, database, id])

    useEffect(() => {
        interval = setInterval(save, settings.timestamp)
        return () => {
            clearInterval(interval)
        }
    }, [settings.timestamp, engine.entities])
    return {
        saveSettings,
        savingAlert,
        setSavingAlert,
        save,
    }
}