import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"

import { ThemeProvider } from "@/providers/theme-provider"
import { store } from "@/store/store"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
