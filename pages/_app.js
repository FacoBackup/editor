import '../styles/globals.css'
import {Fabric} from "@f-ui/core";
import styles from '../styles/App.module.css'
import {useState} from "react";
import "@fontsource/roboto";

function MyApp({Component, pageProps}) {
    const [dark, setDark] = useState(true)

    return (
        <Fabric language={"en"} theme={dark ? 'dark' : "light"}
                className={[styles.wrapper, dark ? styles.dark : styles.light].join(' ')}>
            <Component {...pageProps} dark={dark} />
        </Fabric>
    )
}

export default MyApp
