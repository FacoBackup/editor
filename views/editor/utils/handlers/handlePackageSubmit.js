export default function handlePackageSubmit(pack, database, file, setAlert) {

    database
        .updateBlob(file, JSON.stringify(pack))
        .then(() => {
            setAlert({
                type: 'success',
                message: 'Saved'
            })
        }).catch(e => {
            console.log(e)
        setAlert({
            type: 'error',
            message: 'Error during saving process'
        })
    })
}