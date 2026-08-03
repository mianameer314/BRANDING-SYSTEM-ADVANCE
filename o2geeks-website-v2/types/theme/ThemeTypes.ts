export type ThemeTypes = {
    name: string;
    dark: boolean;
    variables?: object;
    colors: {
        primary?: string;
        secondary?:string;
        gray?:string;
        white?:string;
        muted?:string;
        lightgray?:string;
        dark?:string;
        surface?:string;
        darkgray?:string;
        accent?:string;
    };
};
