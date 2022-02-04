import JSZip from 'jszip'
import saveAs from 'file-saver'

export default class Maker {
    _canDownload = true

    make(id, settings, database, setAlert) {
        if (this._canDownload) {
            this._canDownload = false
            setAlert({
                type: 'info',
                message: 'Packaging data.'
            })
            let zip = new JSZip();
            let assetsFolder = zip.folder("assets")
            let promises = []
            promises.push(new Promise(r => {
                database.listFiles({project: id}).then(data => {
                    let withBlobs = data.map(d => {
                        return new Promise(resolve =>  database.getBlob(d.id).then(b => resolve({...d, blob: b})).catch(() => resolve()))
                    })

                    Promise.all(withBlobs).then(res => {
                        r({
                            data: res,
                            type: 'file'
                        })
                    })
                })
            }))
            promises.push(new Promise(r => {
                database.listEntities(id).then(data => {
                    r({
                        data: data,
                        type: 'entity'
                    })
                })
            }))

            Promise.all(promises).then(r => {
                r.forEach(data => {
                    switch (data.type) {
                        case 'file': {
                            data.data.forEach(d => {
                                assetsFolder.file(d.id + '.file', JSON.stringify(d))
                            })

                            break
                        }
                        case 'entity': {
                            data.data.forEach(d => {
                                assetsFolder.file(d.id + '.entity', JSON.stringify(d))
                            })
                            break
                        }
                        default:
                            break
                    }
                })

                zip.file(settings.projectName + '.project', JSON.stringify({
                    id, settings: settings.savable
                }));
                zip.generateAsync({type: "blob"}).then(function (content) {
                    saveAs(content, settings.projectName + ".projection");
                });
                setAlert({
                    type: 'success',
                    message: 'Compression successful'
                })
                this._canDownload = true
            })
        } else
            setAlert({
                type: 'error',
                message: 'Saving process in execution.'
            })
    }

    static parse(file) {
        let  promise
        let zip = new JSZip();

        try {
            promise = new Promise(resolve => {
                zip.loadAsync(file).then(decompressed => {
                    const files = Object.values(decompressed.files)
                    const foundEntities = files.filter(f => f.name.includes('.entity'))
                    const foundFiles = files.filter(f => f.name.includes('.file'))
                    let promises = [
                        new Promise(r => {
                            const pj = files.find(f => f.name.includes('.project'))
                            if(pj)
                                pj.async('string').then(res => r({
                                    data: res,
                                    type: 0
                                })).catch(() => r())
                            else
                                r()
                        })
                    ]


                    foundFiles.forEach(f => {
                        promises.push(new Promise(r => {
                            f.async('string').then(res => r({data: res, type: 1})).catch(() => r({}))
                        }))
                    })
                    foundEntities.forEach(f => {
                        promises.push(new Promise(r => {
                            f.async('string').then(res => r({data: res, type: 2})).catch(() => r({}))

                        }))
                    })

                 Promise.all(promises).then(res => {
                        resolve(res)
                    })
                })
            })
        } catch (r) {

            promise = new Promise(r => {
                r([])
            })
        }

        return promise
    }
}