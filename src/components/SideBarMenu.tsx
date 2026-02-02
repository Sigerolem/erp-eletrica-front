import { useEffect, useState } from "preact/hooks";
import { NavButton } from "@elements/NavButton";

interface Route {
  name: string;
  path: string;
  permissionNeeded?: number;
}

interface Props {
  routes: Route[];
}

export function SideBarMenu({ routes }: Props) {
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const permissions = localStorage.getItem("apiPermissions");

    const filtered = routes.filter((route) => {
      if (route.permissionNeeded === undefined) return true;
      if (!permissions) return false;
      return permissions[route.permissionNeeded] !== "-";
    });

    setFilteredRoutes(filtered);
  }, [routes]);

  return (
    <>
      {filteredRoutes.map((route) => (
        <NavButton
          key={route.path}
          name={route.name}
          path={route.path}
        />
      ))}
    </>
  );
}
