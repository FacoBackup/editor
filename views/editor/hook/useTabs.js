import {useMemo} from "react";

import handlePackageSubmit from "../utils/handlers/handlePackageSubmit";
import MeshVisualizer from "../../mesh/MeshVisualizer";
import Material from "../../material/Material";


export default function useTabs(filesLoaded, currentTab, setCurrentTab, setFilesLoaded,database, setAlert){
    const handlePrototypeSubmit = (index, pack, file, close) => {

        handlePackageSubmit(pack, database, file.fileID, setAlert)
        if (close) {
            if ((currentTab) === index)
                setCurrentTab(filesLoaded.length - 1)
            setFilesLoaded(prev => {
                const newD = [...prev]
                newD.splice(index, 1)
                return newD
            })
        }
    }
    const mapFile= (file, index, children) => {
        return {
            canClose: true,
            icon: <span style={{fontSize: '1.2rem'}}
                        className={`material-icons-round`}>public</span>,
            handleClose: () => {
                if (index === (currentTab + 1))
                    setCurrentTab(filesLoaded.length)
                setFilesLoaded(prev => {
                    const newD = [...prev]
                    newD.splice(index, 1)
                    return newD
                })
            },
            open: file !== undefined,
            label: file?.name,

            children: children
        }
    }
    const materials = useMemo(() => {
        return filesLoaded.filter(f => f.type === 'material').map((file, index) => mapFile(file, index, (
            <Material
                workflow={'PBRMaterial'}
                setAlert={setAlert}
                submitPackage={(pack, close) =>handlePrototypeSubmit(index, pack, file, close)}
                file={JSON.parse(file.blob)}/>
        )))
    }, [filesLoaded])

    const meshes = useMemo(() => {
        return filesLoaded.filter(f => f.type === 'mesh').map((file, index) => mapFile(file, index, (
                <MeshVisualizer file={file} setAlert={setAlert}/>
            )))
        }, [filesLoaded])


    return {
        meshes,
        materials
    }

}