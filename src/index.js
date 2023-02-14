import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebaseConfig from './firebaseConfig.js'
import 'react-toastify/dist/ReactToastify.css';
import {createBrowserRouter, RouterProvider, Route,} from "react-router-dom";
import Home from './pages/home';
import Ragistration from './pages/registration';
import Login from './pages/login';
import store from './store';
import { Provider } from 'react-redux'
import ProfilePage from './pages/profile';
import ContactInfoPage from './pages/contactPage';

const router = createBrowserRouter(
  [
    {path: "/", element: <Home/>,},
    {path: "/registration", element: <Ragistration/>,},
    {path: "/login", element: <Login />,},
    {path: "/profile", element: <ProfilePage />,},
    {path: "/contact", element: <ContactInfoPage /> ,},
  ],
  );

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
       <RouterProvider router={router} />
      </Provider>  
    </React.StrictMode>
);

reportWebVitals();
