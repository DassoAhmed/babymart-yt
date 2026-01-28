import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Account from './pages/Account.tsx'
import Users from './pages/Users.tsx'
import Orders from './pages/Orders.tsx'
import Invoices from './pages/Invoices.tsx'
import Products from './pages/Products.tsx'
import Banners from './pages/Banners.tsx'
import Categories from './pages/categories.tsx'
import Brands from './pages/Brands.tsx'

const router = createBrowserRouter([

  { path:"login", element:<Login/> },
  { path:"register", element:<Register/> },
  { path:"/", element: <App />, children:[
    {
    index:true,
    path:"/dashboard",
    element: <Dashboard/>,
    },
    {
    index:true,
    path:"/dashboard/account",
    element: <Account/>,
    },
    {
    index:true,
    path:"/dashboard/users",
    element: <Users/>,
    },
    {
    index:true,
    path:"/dashboard/orders",
    element: <Orders/>,
    },
    {
    index:true,
    path:"/dashboard/invoices",
    element: <Invoices/>,
    },
    {
    index:true,
    path:"/dashboard/products",
    element: <Products/>,
    },
    {
    index:true,
    path:"/dashboard/banners",
    element: <Banners/>,
    },
    {
    index:true,
    path:"/dashboard/categories",
    element: <Categories/>,
    },
    {
    index:true,
    path:"/dashboard/brands",
    element: <Brands/>,
    },
] }]);

createRoot(document.getElementById('root')!).render(
<RouterProvider router={router} />
);
