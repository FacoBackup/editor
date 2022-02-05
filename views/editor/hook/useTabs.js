import {useMemo} from "react";

import MeshVisualizer from "../../mesh/MeshVisualizer";
import Material from "../../material/Material";
import resizeImageToPreview from "../../files/utils/parsers/resizeImageToPreview";


export default function useTabs(filesLoaded, currentTab, setCurrentTab, setFilesLoaded, database, setAlert) {
    const mapFile = (file, index, children) => {
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
                submitPackage={(previewImage, pack, close) => {
                    database.updateFile(file.fileID, {previewImage: previewImage})
                    database
                        .updateBlob(file.fileID, JSON.stringify(pack))
                        .then(() => {
                            setAlert({
                                type: 'success',
                                message: 'Saved'
                            })
                        }).catch(e => {
                        setAlert({
                            type: 'error',
                            message: 'Error during saving process'
                        })
                    })

                    if (close) {
                        if ((currentTab) === index)
                            setCurrentTab(filesLoaded.length - 1)
                        setFilesLoaded(prev => {
                            const newD = [...prev]
                            newD.splice(index, 1)
                            return newD
                        })
                    }
                }}
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