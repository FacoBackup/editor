import '../styles/globals.css'
import {Fabric, Modal} from "@f-ui/core";
import styles from '../styles/App.module.css'
import {useMemo, useState} from "react";
import "@fontsource/roboto";
import LoadProvider from "../editor/hook/LoadProvider";
import useLoading from "../editor/hook/useLoading";
import randomInRange from "../editor/utils/randomInRange";
import ThemeProvider from "../editor/hook/ThemeProvider";

function MyApp({Component, pageProps}) {
    const [dark, setDark] = useState(true)
    const load = useLoading(dark)


    return (
        <Fabric
            language={"en"} theme={dark ? 'dark' : "light"}
            className={[styles.wrapper, dark ? styles.dark : styles.light].join(' ')}
        >
            <ThemeProvider.Provider value={{dark, setDark}}>
            <LoadProvider.Provider value={load}>
                <Component {...pageProps} dark={dark}/>
            </LoadProvider.Provider>
            </ThemeProvider.Provider>
        </Fabric>
    )
}

export default MyApp

