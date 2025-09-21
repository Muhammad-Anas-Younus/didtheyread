import { Button } from "@/components/ui/button";
import React from "react";
import { logoutAction } from "../login/actions";

const Dashboard = () => {
  return (
    <div>
      Dashboard
      <form action={logoutAction}>
        <Button>Logout</Button>
      </form>
    </div>
  );
};

export default Dashboard;
