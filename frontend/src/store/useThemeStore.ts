import { create } from "zustand";

type State = {
    theme: string;
}

type Action = {
    setTheme: (theme: State["theme"]) => void;
}


export const useThemeStore = create<State & Action>((set) => ({
    theme: localStorage.getItem("chat-theme") || "dark",

    setTheme: (theme: string) => {
        localStorage.setItem("chat-theme", theme);
        set({ theme })
    }

}))