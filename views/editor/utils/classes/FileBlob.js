import {WebWorker} from "./Worker";

export default class FileBlob {
    static loadAsString(file, binary) {
        const worker = new WebWorker()
        return worker.createExecution({file, binary: binary}, () => {
            self.addEventListener('message', e => {
                let reader = new FileReader();
                reader.addEventListener('load', event => {
                    self.postMessage(event.target.result)
                });
                if (e.data.binary)
                    reader.readAsBinaryString(e.data.file)
                else
                    reader.readAsText(e.data.file)
            })
        })
    }

    static loadAsJSON(file) {
        const worker = new WebWorker()
        return worker.createExecution(file, () => {
            self.addEventListener('message', event => {
                let reader = new FileReader();
                reader.addEventListener('load', event => {
                    self.postMessage(JSON.parse(event.target.result))
                });
                reader.readAsText(event.data)
            })
        })
    }
}