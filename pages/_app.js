import '../styles/globals.css'
import {Fabric} from "@f-ui/core";
import styles from '../styles/App.module.css'
import {useState} from "react";
import "@fontsource/roboto";
import LoadProvider from "../editor/hook/LoadProvider";
import useLoading from "../editor/hook/useLoading";
import ThemeProvider from "../editor/hook/GlobalProvider";
import useGlobalOptions from "../editor/hook/useGlobalOptions";

function Global({Component, pageProps}) {

    const global = useGlobalOptions()
    const load = useLoading(global.dark, global.accentColor)


    return (
        <Fabric
            language={"en"}
            theme={global.dark ? 'dark' : "light"}
            accentColor={global.accentColor}
            className={[styles.wrapper, global.dark ? styles.dark : styles.light].join(' ')}
        >
            <ThemeProvider.Provider value={global}>
                <LoadProvider.Provider value={load}>
                    <Component {...pageProps} dark={global.dark}/>
                </LoadProvider.Provider>
            </ThemeProvider.Provider>
        </Fabric>
    )
}

export default Global

