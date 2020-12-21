interface IScriptable extends IAsset {
    /**
     * A map of maps of unknown values.
     * The first map lists all events, the second one lists names of arguments in one event.
     */
    eventArguments: {
        [key: string]: {
            [key: string]: unknown
        }
    },
    eventArgumentsID: number
}
