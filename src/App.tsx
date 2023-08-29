import { ReactNode } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Logs } from "./pages/Logs";
import { db, analytics } from "./firebase-connection";
import { Context } from "./Context";

function App() {
  const routes: ListedRoute[] = [
    {
      key: "calculos",
      title: "Cálculos Revisionais",
      path: "/:uuid",
      component: <Logs />,
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
