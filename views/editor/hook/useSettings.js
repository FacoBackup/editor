import {useMemo, useState} from "react";

export default function useSettings() {
    const [projectCreationDate, setProjectCreationDate] = useState((new Date()).toDateString())
    const [projectName, setProjectName] = useState('New project')
    const [timestamp, setTimestamp] = useState(300000)
    const [fxaa, setFxaa] = useState(true)
    const [shadowMapping, setShadowMapping] = useState(true)
    const [lightCalculations, setLightCalculations] = useState(true)
    const [fov, setFov] = useState(1.57)
    const [fps, setFps] = useState(false)
    const [res, setRes] = useState(100)
    const [fullscreen, setFullscreen] = useState(false)
    const [viewPreferences, setViewPreferences] = useState(false)
    const [visibility, setVisibility] = useState({
        viewportOptions: true,
        scene: true,
        files: true
    })

    const savable = useMemo(() => {
        return {
            projectCreationDate,
            lightCalculations, shadowMapping, fxaa,
            timestamp, projectName, fov, fps,
            res, fullscreen, viewPreferences,
            visibility
        }
    }, [
        projectCreationDate,
        lightCalculations, shadowMapping, fxaa,
        timestamp, projectName, fov, fps,
        res, fullscreen, viewPreferences
    ])
    const load = (settings) => {
        setProjectCreationDate(settings.projectCreationDate)
        setLightCalculations(settings.lightCalculations)
        setShadowMapping(settings.shadowMapping)
        setFxaa(settings.fxaa)
        setTimestamp(settings.timestamp)
        setProjectName(settings.projectName)
        setFov(settings.fov)
        setFps(settings.fps)
        setRes(settings.res)
        if(settings.visibility)
        setVisibility(settings.visibility)
    }


    return {
        savable,
        load,

        visibility, setVisibility,

        projectCreationDate, setProjectCreationDate,

        lightCalculations, setLightCalculations,
        shadowMapping, setShadowMapping,
        fxaa, setFxaa,
        timestamp, setTimestamp,
        projectName, setProjectName,
        fov, setFov,
        fps, setFps,
        res, setRes,
        fullscreen, setFullscreen,
        viewPreferences, setViewPreferences
    }
}