import { Outlet } from "@remix-run/react";
import { useState } from "react";
import GridViewPanel from "~/components/grid_view_panel";

export default function ProfileResourcesRoute() {
    const [gridView, setGridView] = useState<boolean>(false);

    return <div>
        <GridViewPanel
            isGridView={gridView}
            setGridView={setGridView} />
        
        <Outlet />
    </div>;
}