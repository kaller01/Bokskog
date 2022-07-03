declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOKSKOG_PUBLIC: string;
            BOKSKOG_LOCAL: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }