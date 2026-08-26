// App Component - Root Layout with NavBar and Toast

import { Outlet } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Toast } from './components/Toast';

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Toast />
    </>
  );
}

export default App;
