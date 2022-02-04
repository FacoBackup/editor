import '../styles/globals.css'
import {Fabric} from "@f-ui/core";
import styles from '../styles/App.module.css'
import "@fontsource/roboto";
import LoadProvider from "../views/editor/hook/LoadProvider";
import useGlobalOptions from "../views/editor/hook/useGlobalOptions";
import useLoading from "../components/loader/useLoading";
import ThemeProvider from "../views/editor/hook/ThemeProvider";


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

