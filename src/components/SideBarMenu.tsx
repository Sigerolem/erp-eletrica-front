import { useEffect, useState } from "preact/hooks";
import { NavButton } from "@elements/NavButton";
import { UserCard } from "src/elements/UserCard";

type Route = {
  name: string;
  path: string;
  permissionNeeded?: number;
};

interface Props {
  routes: Route[];
}

export function SideBarMenu({ routes }: Props) {
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  );

  useEffect(() => {
    const permissions = localStorage.getItem("apiPermissions");

    const filtered = routes.filter((route) => {
      if (route.permissionNeeded === undefined) return true;
      if (!permissions) return false;
      return permissions[route.permissionNeeded] !== "-";
    });

    setFilteredRoutes(filtered);
  }, [routes]);

  useEffect(() => {
    const handlePageLoad = () => {
      setCurrentPath(window.location.pathname);
    };

    document.addEventListener("astro:page-load", handlePageLoad);
    return () =>
      document.removeEventListener("astro:page-load", handlePageLoad);
  }, []);

  return (
    <>
      <UserCard />
      {filteredRoutes.map((route) => (
        <NavButton
          key={route.path}
          name={route.name}
          path={route.path}
          isSelected={currentPath === route.path}
        />
      ))}
    </>
  );
}
