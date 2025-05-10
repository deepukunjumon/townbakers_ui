import React from "react";
import MainLayout from "../components/MainLayout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import InventoryIcon from "@mui/icons-material/Inventory";
import FormatListBulletedAddIcon from "@mui/icons-material/FormatListBulletedAdd";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const BranchLayout = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      icon: <DashboardIcon />,
      label: "Dashboard",
      onClick: () => navigate("/branch/dashboard"),
    },
    {
      label: "Employees",
      icon: <PeopleIcon />,
      children: [
        {
          icon: <PersonAddAltRoundedIcon />,
          label: "Add Employee",
          onClick: () => navigate(ROUTES.BRANCH.CREATE_EMPLOYEE),
        },
        {
          icon: <PeopleAltRoundedIcon />,
          label: "Branch Employees",
          onClick: () => navigate(ROUTES.BRANCH.LIST_EMPLOYEES),
        },
      ],
    },
    {
      label: "Stocks",
      icon: <InventoryIcon />,
      children: [
        {
          icon: <FormatListBulletedAddIcon />,
          label: "Add Stock",
          onClick: () => navigate(ROUTES.BRANCH.ADD_STOCK),
        },
        {
          icon: <WysiwygIcon />,
          label: "View Stocks",
          onClick: () => navigate(ROUTES.BRANCH.VIEW_STOCKS),
        },
      ],
    },
    {
      label: "Orders",
      icon: <InventoryIcon />,
      children: [
        {
          icon: <FormatListBulletedAddIcon />,
          label: "Create Order",
          onClick: () => navigate(ROUTES.BRANCH.CREATE_ORDER),
        },
      ],
    },
  ];

  return (
    <MainLayout menuItems={menuItems}>
      <Outlet />
    </MainLayout>
  );
};

export default BranchLayout;
