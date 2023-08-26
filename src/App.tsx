import { ReactNode } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CalculationsLog } from "./pages/CalculationsLog";
import { db, analytics } from "./firebase-connection";
import { Context } from "./Context";

function App() {
  const routes: ListedRoute[] = [
    {
      key: "calculos",
      title: "Cálculos Revisionais",
      path: "calculos/:uuid",
      component: <CalculationsLog />,
    },
  ];

  const contextValue = { db, analytics };

  return (
    <Context.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          {routes.map((r) => (
            <Route key={r.key} path={r.path} element={r.component} />
          ))}
        </Routes>
      </BrowserRouter>
    </Context.Provider>
  );
}

interface ListedRoute {
  key: string;
  title: string;
  path: string;
  component: ReactNode;
}
export default App;
