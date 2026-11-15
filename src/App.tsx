import { BrowserRouter, Route, Routes } from "react-router"
import { Layout } from "./components/Layout.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"
import { HomePage } from "./pages/HomePage.tsx"
import { LessonPage } from "./pages/LessonPage.tsx"
import { NotFoundPage } from "./pages/NotFoundPage.tsx"
import { PracticePage } from "./pages/PracticePage.tsx"
import { ResultsPage } from "./pages/ResultsPage.tsx"
import { RulesPage } from "./pages/RulesPage.tsx"
import { ProgressProvider } from "./state/ProgressProvider.tsx"

export function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="reglas" element={<RulesPage />} />
            <Route path="phishing" element={<LessonPage />} />
            <Route path="phishing/practicar" element={<PracticePage />} />
            <Route path="phishing/resultado" element={<ResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
