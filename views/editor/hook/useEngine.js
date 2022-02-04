import {useEffect, useMemo, useReducer, useRef, useState} from "react";
import {enableBasics} from "../../../services/engine/utils/utils";
import entityReducer, {ENTITY_ACTIONS} from "../../../services/engine/ecs/utils/entityReducer";
import PostProcessingSystem from "../../../services/engine/ecs/systems/PostProcessingSystem";
import DeferredSystem from "../../../services/engine/ecs/systems/DeferredSystem";
import TransformSystem from "../../../services/engine/ecs/systems/TransformSystem";
import PhysicsSystem from "../../../services/engine/ecs/systems/PhysicsSystem";
import ShadowMapSystem from "../../../services/engine/ecs/systems/ShadowMapSystem";
import PickSystem from "../../../services/engine/ecs/systems/PickSystem";
import Entity from "../../../services/engine/ecs/basic/Entity";
import Engine from "../../../services/engine/Engine";
import GridComponent from "../../../services/engine/ecs/components/GridComponent";
import parseEngineEntities from "../../../services/engine/utils/parseEngineEntities";


export default function useEngine(id, canExecutePhysicsAnimation) {
    const [canRender, setCanRender] = useState(true)
    const [gpu, setGpu] = useState()
    const [selectedElement, setSelectedElement] = useState(null)
    const [meshes, setMeshes] = useState([])
    const [materials, setMaterials] = useState([])

    // SETTINGS
    const [cameraType, setCameraType] = useState('spherical')
    const [resolutionMultiplier, setResolutionMultiplier] = useState(1)


    useEffect(() => {
        if (id) {
            const newGPU = document.getElementById(id + '-canvas').getContext('webgl2', {
                antialias: false,
                preserveDrawingBuffer: true
            })
            enableBasics(newGPU)
            setGpu(newGPU)
        }
    }, [id])

    const [entities, dispatchEntities] = useReducer(entityReducer, [])
    const [initialized, setInitialized] = useState(false)

    const renderer = useRef()
    let resizeObserver
    const renderingProps = useMemo(() => {
        return {

            canExecutePhysicsAnimation, meshes,
            selectedElement, setSelectedElement,
            materials, cameraType
        }
    }, [
    canExecutePhysicsAnimation,
        meshes, selectedElement,
        setSelectedElement, materials, cameraType
    ])

    useEffect(() => {
        if (initialized) {
            renderer.current.systems = [
                new DeferredSystem(gpu, resolutionMultiplier),
                new PostProcessingSystem(gpu, resolutionMultiplier)
            ]
        }
    }, [resolutionMultiplier])

    useEffect(() => {
        if (gpu && !initialized && id) {
            const gridEntity = new Entity(undefined, 'Grid')
            renderer.current = new Engine(id, gpu)
            renderer.current.systems = [
                new PhysicsSystem(),
                new TransformSystem(),
                new ShadowMapSystem(gpu),
                new PickSystem(gpu),
                new DeferredSystem(gpu, resolutionMultiplier),
                new PostProcessingSystem(gpu, resolutionMultiplier)
            ]
            setInitialized(true)

            dispatchEntities({type: ENTITY_ACTIONS.ADD, payload: gridEntity})
            dispatchEntities({
                type: ENTITY_ACTIONS.ADD_COMPONENT, payload: {
                    entityID: gridEntity.id,
                    data: new GridComponent(gpu)
                }
            })


            parseEngineEntities(renderingProps, entities, renderingProps.materials, renderingProps.meshes, renderer.current)
        } else if (gpu && id) {
            resizeObserver = new ResizeObserver(() => {
                if (gpu && initialized) {

                    renderer.current.camera.aspectRatio = gpu.canvas.width / gpu.canvas.height

                }
            })
            resizeObserver.observe(document.getElementById(id + '-canvas'))


            parseEngineEntities(renderingProps, entities, renderingProps.materials, renderingProps.meshes, renderer.current)
            if(!canRender)
                renderer.current?.stop()
            if (canRender && !renderer.current?.keep)
                renderer.current?.start(entities)
        }


        return () => {
            renderer.current?.stop()
        }
    }, [renderingProps, entities, gpu, id, canRender])


    return {
        resolutionMultiplier, setResolutionMultiplier,
        cameraType, setCameraType,
        entities, dispatchEntities,
        meshes, setMeshes,
        gpu, materials, setMaterials,
        selectedElement, setSelectedElement,
        canRender, setCanRender
    }
}
